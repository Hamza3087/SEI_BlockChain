import { abbreviateNumber } from 'js-abbreviation-number';
import { DivIcon } from 'leaflet';
import { memo } from 'react';
import { Marker, useMap } from 'react-leaflet';
import { TreesCluster } from './types';

export type MapMarkerProps = {
  cluster: TreesCluster;
  relativeSize: number;
};

function _ClusterMarker({ cluster, relativeSize }: MapMarkerProps) {
  const map = useMap();

  const scale = relativeSize * 1.2 + 0.8;

  const formattedNumber = abbreviateNumber(cluster.number_of_trees, 0);

  const cssClasses =
    'absolute flex items-center justify-center rounded-2xl bg-white p-1 border-2 border-green-200 bg-green-100 h-6 text-black';
  const icon = new DivIcon({
    html: `<div class="${cssClasses}" style="transform: scale(${scale})"><img src="tree_icon.png" class="h-3 mr-1"><span>${formattedNumber}</span></div>`,
  });

  const position: [number, number] = [cluster.latitude, cluster.longitude];

  function onClick() {
    map.setZoomAround(position, (cluster.zoom + 1) * 2, {
      animate: true,
    });
  }

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{ click: onClick }}
    />
  );
}

export const ClusterMarker = memo(_ClusterMarker);
