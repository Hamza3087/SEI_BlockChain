import { useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useMemo, useState } from 'react';
import { useThrottle } from '@uidotdev/usehooks';
import { MapTreePoints } from './MapTreePoints';
import { MapTreesClusters } from './MapTreesClusters';
import { MAX_MARKERS_ZOOM } from './const';
import { TileWithZoom } from './api';

export function MapMarkers() {
  const map = useMap();
  const [mapZoom, setMapZoom] = useState(map.getZoom());
  const [mapBounds, setMapBounds] = useState(map.getBounds());
  const [moveMapBounds, setMoveMapBounds] = useState(mapBounds);
  const throttledMoveMapBounds = useThrottle(moveMapBounds, 500);

  useEffect(() => {
    setMapBounds(throttledMoveMapBounds);
  }, [throttledMoveMapBounds]);

  const markerZoom = useMemo(
    () => Math.min(MAX_MARKERS_ZOOM, Math.floor(mapZoom / 2)),
    [mapZoom]
  );

  const markerTiles = useMemo<TileWithZoom[]>(() => {
    const gridSize = 4 ** (markerZoom - 1);
    const tileSize = 360 / gridSize;
    const minX = Math.floor(Math.max(0, mapBounds.getWest() + 180) / tileSize);
    const maxX =
      Math.ceil(Math.min(360, mapBounds.getEast() + 180) / tileSize) - 1;
    const minY = Math.ceil((mapBounds.getSouth() + 90) / tileSize) - 1;
    const maxY = Math.floor((mapBounds.getNorth() + 90) / tileSize);
    const tiles: TileWithZoom[] = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const index = y * gridSize + x;
        tiles.push({ index, zoom: markerZoom });
      }
    }

    return tiles;
  }, [markerZoom, mapBounds]);

  useMapEvents({
    zoom: () => {
      setMapZoom(map.getZoom());
      setMapBounds(map.getBounds());
    },
    move: () => {
      setMoveMapBounds(map.getBounds());
    },
  });

  return (
    <>
      <MapTreePoints tiles={markerTiles} />
      <MapTreesClusters tiles={markerTiles} />
    </>
  );
}
