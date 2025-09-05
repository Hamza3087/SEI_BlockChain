import { useQuery } from '@tanstack/react-query';
import { ReactElement, useState } from 'react';
import { IconX, Loader, Modal } from 'common/components';
import { TreeDetails } from 'modules/gallery';
import { PIN_SCALE, PIN_TINT } from './const';
import { getTreeDetails } from './api';
import { TreePoint } from './types';
import { usePixiMap, useSelectedTree } from './hooks';

type SelectedTreeProps = {
  tree: TreePoint;
};

export function SelectedTree({ tree }: SelectedTreeProps) {
  const { data: treeDetails } = useQuery({
    queryKey: ['trees', tree.nft_id],
    queryFn: () => getTreeDetails(tree.nft_id),
  });

  const [detailsVisible, setDetailsVisible] = useState(false);

  const pixiMap = usePixiMap();
  const { setSelectedTree } = useSelectedTree();

  function close() {
    if (pixiMap.selectedSprite) {
      pixiMap.selectedSprite.scale.set(PIN_SCALE);
      pixiMap.selectedSprite.tint = PIN_TINT;
      pixiMap.utils.getRenderer().render(pixiMap.container);
    }
    setSelectedTree(null);
    pixiMap.selectedSprite = null;
  }

  let content: ReactElement;
  if (!treeDetails) {
    content = <Loader />;
  } else {
    content = (
      <>
        <div className='mb-3 flex justify-between items-center'>
          <div className='my-2 text-xl'>{treeDetails.common_name}</div>
          <span className='text-3xl cursor-pointer' onClick={close}>
            <IconX className='w-6 h-6' />
          </span>
        </div>

        <img
          src={treeDetails.image}
          alt={treeDetails.common_name}
          className='w-44 rounded-lg mb-4'
        />

        <button
          className='px-6 py-2 rounded-md bg-green-300 dark:bg-teal-700'
          onClick={() => setDetailsVisible(true)}
        >
          Show details
        </button>

        {detailsVisible && (
          <Modal
            title={treeDetails.botanical_name}
            subtitle={treeDetails.common_name}
            onClose={() => setDetailsVisible(false)}
          >
            <TreeDetails tree={treeDetails} />
          </Modal>
        )}
      </>
    );
  }

  return (
    // Need the z-index to be higher than Leaflet
    <div className='absolute top-10 right-10 bg-teal-100 dark:bg-teal-900 rounded-2xl p-5 z-[1000] flex flex-col'>
      {content}
    </div>
  );
}
