import { get } from 'modules/api';
import { Tree } from 'modules/gallery';
import { TreePoint, TreesCluster } from './types';

export function getTreeDetails(nftId: number) {
  return get<Tree>(`nfts/${nftId}`).then((response) => response.data);
}

export type Tile = {
  index: number;
};

export function getTreePoints(params: Tile) {
  return get<TreePoint[]>('tree-points', { params }).then(
    (response) => response.data
  );
}

export type TileWithZoom = Tile & {
  zoom: number;
};

export function getTreesClusters(params: TileWithZoom) {
  return get<TreesCluster[]>('tree-clusters', { params }).then(
    (response) => response.data
  );
}
