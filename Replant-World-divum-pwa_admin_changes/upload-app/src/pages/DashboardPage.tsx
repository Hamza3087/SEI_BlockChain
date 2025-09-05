import { useAuthRequired } from 'modules/auth';
// import { Dashboard } from 'modules/dashboard';
// import { Layout } from 'modules/layout';
import { User } from './User';

export const DashboardPage: React.FC = () => {
  useAuthRequired();

  return (
    // <Layout navigation>
     <User /> 
    //  {/* <Dashboard /> 
    // </Layout>  */}
  );
};
