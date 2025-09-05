import {
  Camera,
  CameraLine,
  Forest,
  ForestLine,
  Home,
  HomeLine,
  Person,
  PersonLine,
} from 'common/icons';
import { useOfflineStore } from 'modules/offline';
import { NavigationButton } from './components';

export const NavigationBar: React.FC = () => {
  const offlineStore = useOfflineStore();

  return (
    <div
      className={
        'w-full h-12 py-2.5 px-5 flex items-center justify-around bg-teal-700 rounded-full shadow-md'
      }
    >
      <NavigationButton Icon={HomeLine} IconActive={Home} path='/dashboard' />
      <NavigationButton
        Icon={ForestLine}
        IconActive={Forest}
        path='/submissions'
        showBadge={offlineStore.totalCount > 0}
      />
      <NavigationButton
        Icon={CameraLine}
        IconActive={Camera}
        path='/new-plant'
      />
      <NavigationButton Icon={PersonLine} IconActive={Person} path='/user' />
    </div>
  );
};
