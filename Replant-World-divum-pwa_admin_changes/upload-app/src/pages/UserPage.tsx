// import { Header } from 'common/components';
import {  useAuthRequired } from 'modules/auth'; // Logout
// import { useFmtMsg } from 'modules/intl';
// import { Layout } from 'modules/layout';
// import { User } from 'modules/user/User';
// import { Profile } from './Profile';

export const UserPage: React.FC = () => {
  useAuthRequired();

  // const fmtMsg = useFmtMsg();

  return (
    <div className='space-y-5'>
      {/* <Header text={fmtMsg('yourAccount')} /> */}
      {/* <User /> */}
      {/* <Logout /> */}
      {/* <Profile/> */}
    </div>
  );
};
