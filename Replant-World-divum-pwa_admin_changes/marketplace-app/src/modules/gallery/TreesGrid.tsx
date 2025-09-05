import { Modal } from 'common/components';
import { useState } from 'react';
import { Tree } from './types';
import { TreeTile } from './TreeTile';
import { TreeDetails } from '.';

type TreesGridProps = {
  trees: Tree[];
};

export function TreesGrid({ trees }: TreesGridProps) {
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);

  return (
    <>
      <div
        className='grid grid-cols-4 gap-4 justify-center'
        style={{ gridTemplateColumns: 'repeat(auto-fill, 250px)' }}
      >
        {trees.map((tree) => (
          <TreeTile
            tree={tree}
            onClick={() => setSelectedTree(tree)}
            key={tree.nft_id}
          />
        ))}
      </div>
      {selectedTree && (
        <Modal
          title={selectedTree.botanical_name}
          subtitle={selectedTree.common_name}
          onClose={() => setSelectedTree(null)}
        >
          <TreeDetails tree={selectedTree} />
        </Modal>
      )}
    </>
  );
}
