import { Call, Groups, LocationOn, Person } from 'common/icons';
import { useUser } from '.';

export const User: React.FC = () => {
  const { data: user } = useUser();

  return (
    <div className='text-base space-y-5'>
      <div className='flex gap-2 items-center'>
        <Person
          overrideColor
          pathClassName='fill-gray-500'
          svgClassName='w-6 h-6 opacity-80'
        />
        <span>{user?.username}</span>
      </div>
      <div className='flex gap-2 items-center'>
        <Call
          overrideColor
          pathClassName='fill-gray-500'
          svgClassName='w-6 h-6 opacity-80'
        />
        <span>{user?.phone_number}</span>
      </div>
      <div className='flex gap-2 items-center'>
        <Groups
          overrideColor
          pathClassName='fill-gray-500'
          svgClassName='w-6 h-6 opacity-80'
        />
        <span>{user?.planting_organization?.name}</span>
      </div>
      <div className='flex gap-2 items-center'>
        <LocationOn
          overrideColor
          pathClassName='fill-gray-500'
          svgClassName='w-6 h-6 opacity-80'
        />
        <span>{user?.country?.name}</span>
      </div>
    </div>
  );
};
