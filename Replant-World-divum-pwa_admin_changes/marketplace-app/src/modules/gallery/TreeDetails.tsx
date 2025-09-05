import { useFmtMsg } from 'modules/intl';
import { AbbreviateWithCopy, ReadOnlyField } from 'common/components';
import { Tree } from './types';

type TreeDetailsProps = {
  tree: Tree;
};

export function TreeDetails({ tree }: TreeDetailsProps) {
  const fmtMsg = useFmtMsg();

  return (
    <div className='flex flex-col gap-8 sm:flex-row items-center'>
      <img
        src={tree.image}
        alt={tree.common_name}
        className='w-64 rounded-lg'
      />
      <div className='flex flex-col w-full'>
        <ReadOnlyField
          label={fmtMsg('botanicalName')}
          value={tree.botanical_name}
        />
        <ReadOnlyField label={fmtMsg('commonName')} value={tree.common_name} />
        <ReadOnlyField
          label={fmtMsg('iucnStatus')}
          value={fmtMsg(`iucnStatus.${tree.iucn_status}`)}
        />
        <ReadOnlyField label={fmtMsg('country')} value={tree.country} />
        <ReadOnlyField
          label={fmtMsg('location')}
          value={`${tree.latitude}, ${tree.longitude}`}
        />
        <ReadOnlyField label={fmtMsg('captureDate')} value={tree.created_at} />
        <ReadOnlyField label={fmtMsg('sponsoredBy')} value={tree.sponsor} />
        <ReadOnlyField
          label={fmtMsg('nftCollection')}
          value={<AbbreviateWithCopy value={tree.nft_collection} />}
        />
        <ReadOnlyField label={fmtMsg('nftId')} value={`#${tree.nft_id}`} />
        <ReadOnlyField
          label={fmtMsg('plantingOrganizationCommunity')}
          value={tree.planting_organization}
        />
        <ReadOnlyField label={fmtMsg('planter')} value={tree.planter} />
        <ReadOnlyField
          label={fmtMsg('plantingCost')}
          value={`$${tree.planting_cost_usd}`}
        />
      </div>
    </div>
  );
}
