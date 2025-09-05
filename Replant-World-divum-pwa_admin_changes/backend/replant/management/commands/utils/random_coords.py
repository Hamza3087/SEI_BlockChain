import bisect
import logging
import random
from pathlib import Path

import opensimplex
from PIL import Image

from replant.clustering import Point

logger = logging.getLogger(__name__)


def randomize_latlon(lat: float, lon: float, spread: float) -> Point:
    lat_offset = (random.random() - 0.5) * spread
    lon_offset = (random.random() - 0.5) * spread
    return max(-90, min(90, lat + lat_offset)), max(-180, min(180, lon + lon_offset))


def get_green_mask() -> tuple[Image.Image, list[float]]:
    logger.info("Building green areas mask...")
    image_path = Path(__file__).parent.parent / "assets" / "blue-marble.png"
    image = Image.open(image_path)
    data = image.getdata()
    green_mask: list[float] = []
    for i, color in enumerate(data):
        g = color[1]
        y = i // image.width
        equator_distance = abs(y - image.height / 2) / image.height
        is_green = (
            g > sum(color) / 3 + 80 * equator_distance
            and g < 90 - 50 * equator_distance
        )
        green_mask.append(1 - equator_distance if is_green else 0)
    return image, green_mask


def save_green_areas(image: Image.Image, green_mask: list[float]):
    # This function is not used but can be handy for debugging purposes. Seeing the image is the best way to examine the data.
    logger.info("Saving green areas image...")
    to_save = [(0, int(255 * value), 0) for value in green_mask]
    output_image = Image.new("RGB", image.size)
    output_image.putdata(to_save)
    image_path = Path(__file__).parent.parent / "assets" / "green-areas.png"
    output_image.save(image_path)


def apply_noise(image: Image.Image, data: list[float]) -> list[float]:
    logger.info("Applying noise...")
    noise_params = [
        (0.02, 5.0),
        (0.05, 7.0),
        (0.2, 4.0),
        (0.5, -3.0),
    ]
    noise = CompoundNoise(noise_params, seed=1)

    result: list[float] = []
    for i, value in enumerate(data):
        if value == 0:
            result.append(0)
            continue

        x = i % image.width
        y = i // image.width

        value *= noise.at(x, y)
        value = max(0, value - 0.5) * 2
        result.append(value)

    logger.info("Noise applied.")

    return result


class PointRoller:
    def __init__(self, weights: list[float], points: list[Point]):
        assert len(weights) == len(points)

        self.points = points
        self.sum_of_weights = 0.0
        self.weights_acc = []
        for weight in weights:
            self.sum_of_weights += weight
            self.weights_acc.append(self.sum_of_weights)

    def roll(self) -> Point:
        roulette_roll = random.random() * self.sum_of_weights
        index = bisect.bisect(self.weights_acc, roulette_roll)
        return self.points[index]


class CompoundNoise:
    def __init__(self, params: list[tuple[float, float]], seed: int):
        self.params = params
        self.noises = [opensimplex.OpenSimplex(seed) for _ in params]
        self.total = sum(param[1] for param in params)

    def at(self, x: float, y: float) -> float:
        noise_value = 0
        for i, noise in enumerate(self.noises):
            scale, intensity = self.params[i]
            noise_value += noise.noise2(x * scale, y * scale) * intensity
        return (noise_value + self.total) / self.total / 2


def get_point_roller(max_positions=0):
    image, green_mask = get_green_mask()
    green_mask = apply_noise(image, green_mask)
    points = [
        image_coords_to_latlon(image, *image_index_to_image_coords(image, i))
        for i in range(len(green_mask))
    ]

    roller = PointRoller(weights=green_mask, points=points)

    if max_positions:
        points = [roller.roll() for _ in range(max_positions)]
        weights = [random.random() for _ in points]
        roller = PointRoller(weights=weights, points=points)

    return roller


def image_index_to_image_coords(image, index: int):
    return (index % image.width), index // image.width


def image_coords_to_latlon(image: Image.Image, x: float, y: float) -> Point:
    lon = (x / image.width - 0.5) * 180 / (image.height / image.width)
    lat = (-y / image.height + 0.5) * 180

    assert lon >= -180 and lon <= 180 and lat >= -90 and lat <= 90
    return lat, lon
