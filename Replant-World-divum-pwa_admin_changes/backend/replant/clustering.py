import logging
import math
import time
from collections import Counter, defaultdict

from django.db import models
from sklearn import cluster as sci_cluster

from replant.models import Nft, TreesCluster

logger = logging.getLogger(__name__)

TREE_ZOOM = 9

Point = tuple[float, float]


def cluster_trees(
    initial_n_clusters=100,
    initial_min_distance=25,
    expand_n_clusters=20,
    min_distance_multiplier=0.24,
    max_zoom=TREE_ZOOM - 1,
):
    t0 = time.time()

    logger.info("Clearing old clusters...")
    TreesCluster.objects.all().delete()

    logger.info("Fetching trees data...")
    items = fetch_trees_data()
    if not items:
        logger.warn("No trees data.")
        return

    logger.info("Finding initial clusters...")
    clusters, labels, counter = _cluster(
        n_clusters=initial_n_clusters,
        items=items,
        zoom=1,
        min_distance=initial_min_distance,
    )

    logger.info("Expanding clusters...")
    _expand_clusters(
        clusters=clusters,
        labels=labels,
        items=items,
        counter=counter,
        zoom=2,
        max_zoom=max_zoom,
        min_distance=initial_min_distance * min_distance_multiplier,
        min_distance_multiplier=min_distance_multiplier,
        expand_n_clusters=expand_n_clusters,
    )

    t1 = time.time()
    logger.info(f"Done in {t1 - t0:.2f}s")


def fetch_trees_data():
    return Nft.objects.annotate(
        lat_float=models.functions.Cast("latitude", output_field=models.FloatField()),
        lon_float=models.functions.Cast("longitude", output_field=models.FloatField()),
    ).values_list("lat_float", "lon_float")


def _expand_clusters(
    clusters: list[Point],
    labels: list[int],
    items: list[Point],
    counter: dict[int, int],
    zoom: int,
    max_zoom: int,
    min_distance: float,
    min_distance_multiplier: float,
    expand_n_clusters: int,
):
    if _get_max_distance(items) < min_distance:
        # This is an optimization that let's up skip k-means clustering if all the items are close enough to each other. As trees are highly concentrated in a relatively few planting areas, this greatly reduces the time required to process all items.
        _save_clusters_to_db(clusters, list(counter.values()), zoom=zoom)

        if zoom < max_zoom:
            _expand_clusters(
                clusters,
                labels,
                items,
                counter,
                zoom=zoom + 1,
                max_zoom=max_zoom,
                min_distance=min_distance * min_distance_multiplier,
                min_distance_multiplier=min_distance_multiplier,
                expand_n_clusters=expand_n_clusters,
            )
        return

    # Recursively generate sub-clusters for each cluster until max_zoom is achieved.
    for i in range(len(clusters)):
        # Progress tracking for recursive algorithms can be quirky :(
        if zoom == 2:
            logger.info(f"Cluster {i + 1} / {len(clusters)}...")

        next_items = _get_items_with_label(items, labels, label=-i - 1)

        if not next_items:
            return

        next_clusters, next_labels, next_counter = _cluster(
            n_clusters=min(expand_n_clusters, len(next_items)),
            items=next_items,
            zoom=zoom,
            min_distance=min_distance,
        )

        if zoom < max_zoom:
            _expand_clusters(
                clusters=next_clusters,
                labels=next_labels,
                items=next_items,
                counter=next_counter,
                zoom=zoom + 1,
                max_zoom=max_zoom,
                min_distance=min_distance * min_distance_multiplier,
                min_distance_multiplier=min_distance_multiplier,
                expand_n_clusters=expand_n_clusters,
            )


def _get_items_with_label(
    items: list[Point],
    labels: list[int],
    label: int,
):
    return [items[i] for i, item_label in enumerate(labels) if item_label == label]


def _cluster(
    n_clusters: int,
    items: list[Point],
    zoom: int,
    min_distance: float,
):
    # We try to achieve multiple goals with the algorithm:
    # - clusters can't overlap each other on the map
    # - both small and large clusters must be represented and not ignored
    # - clusters must be semi-equally distanced from each other assuming uniform distribution of items
    # - the algorithm must be fast

    # The solution uses a two-step algorithm.
    # In the first step we use k-means. It is a fast algorithm but generates a lot of overlapping clusters for large n_clusters or completely ignores small but distant clusters for small n_clusters. We aim to generate lot's of redundant clusters in this step.
    # In the second step we merge the redundant clusters with an algorithm that respects minimal distance between clusters so that markers on the map don't overlap each other.

    # First step.
    model = sci_cluster.MiniBatchKMeans(n_clusters=max(1, min(n_clusters, len(items))))
    model = model.fit(items)

    clusters = list(model.cluster_centers_)
    labels = list(model.labels_)
    counter = Counter(sorted(model.labels_))

    # Second step.
    clusters, labels, counter = _merge_close_clusters(
        clusters, labels, counter, min_distance=min_distance
    )

    # Remove centroids with no items. It can happen with MiniBatchKMeans.
    for i in reversed(range(len(clusters))):
        if not counter.get(i):
            clusters.pop(i)
            if i in counter:
                del counter[i]

    _save_clusters_to_db(clusters, list(counter.values()), zoom=zoom)

    return clusters, labels, counter


def _merge_close_clusters(
    clusters: list[Point],
    labels: list[int],
    counter: dict[int, int],
    min_distance: float,
):
    label_by_cluster = {id(cluster): i for i, cluster in enumerate(clusters)}
    merged_clusters: list[Point] = []
    new_labels = list(labels)
    new_counter: dict[int, int] = defaultdict(int)
    while clusters:
        cluster = clusters[len(clusters) - 1]
        to_merge = []
        # TODO: Don't compare with self in first iteration
        for i in reversed(range(len(clusters))):
            other_cluster = clusters[i]
            if _distance(cluster, other_cluster) < min_distance:
                clusters.pop(i)
                label = label_by_cluster[id(other_cluster)]
                # Assign a new label to items. The label of merged clusters is negative to differentiate from the original clusters.
                for k in range(len(new_labels)):
                    if new_labels[k] == label:
                        new_labels[k] = -len(merged_clusters) - 1
                weight = counter[label]
                if weight:
                    to_merge.append((other_cluster, weight))
                    new_counter[len(merged_clusters)] += weight

        if to_merge:
            cluster = _merge_clusters(to_merge)
            merged_clusters.append(cluster)
    return merged_clusters, new_labels, new_counter


def _merge_clusters(clusters: list[tuple[Point, int]]) -> Point:
    lat = 0.0
    lon = 0.0
    total_weight = 0
    for cluster, weight in clusters:
        total_weight += weight
        lat += cluster[0] * weight
        lon += cluster[1] * weight
    lat /= total_weight
    lon /= total_weight
    return lat, lon


def _get_max_distance(points: list[Point]):
    p1 = points[0]
    max_distance = 0.0
    for p2 in points[1:]:
        d = _distance(p1, p2)
        if d > max_distance:
            max_distance = d
    return max_distance


def _distance(p1: Point, p2: Point) -> float:
    return math.sqrt(
        (p2[0] - p1[0]) * (p2[0] - p1[0]) + (p2[1] - p1[1]) * (p2[1] - p1[1])
    )


def _save_clusters_to_db(
    centroids: list[Point],
    counts: list[int],
    zoom: int,
):
    assert len(centroids) == len(counts)
    clusters: list[TreesCluster] = []
    for centroid, count in zip(centroids, counts):
        latitude = max(-90, min(90, centroid[0]))
        longitude = max(-180, min(180, centroid[1]))
        cluster = TreesCluster(
            latitude=latitude,
            longitude=longitude,
            number_of_trees=count,
            zoom=zoom,
            tile_index=_get_tile_index(
                latitude=latitude, longitude=longitude, zoom=zoom
            ),
        )
        clusters.append(cluster)
    TreesCluster.objects.bulk_create(clusters)


def _get_tile_index(latitude: float, longitude: float, zoom: int) -> int:
    grid_size = int(4 ** (max(0, zoom - 1)))
    tile_size = 360 / grid_size
    y = int((latitude + 90) / tile_size)
    x = int((longitude + 180) / tile_size)
    return y * grid_size + x


def get_tree_tile_index(latitude: float, longitude: float):
    return _get_tile_index(latitude, longitude, zoom=TREE_ZOOM)
