import { Tree } from './types';

type TreeDetailsProps = {
  tree: Tree;
  onClick: () => void;
};

export function TreeTile(props: TreeDetailsProps) {
  return (
    <div
      className='flex flex-col bg-teal-200 dark:bg-teal-700 rounded-xl overflow-hidden cursor-pointer max-w-[320px] w-full'
      onClick={props.onClick}
    >
      <div
        style={{ backgroundImage: `url(${props.tree.image})` }}
        className='h-72 bg-cover'
      />
      <div className='p-4'>
        <div className='font-bold'>{props.tree.botanical_name}</div>
        <div className='text-sm'>{props.tree.common_name}</div>
        <div className='flex justify-between items-center'>
          <span className='text-xs text-teal-650'>#{props.tree.nft_id}</span>
          <span className='text-2xl font-bold'>
            {props.tree.planting_cost_usd} USD
          </span>
        </div>
      </div>
    </div>
  );
}
