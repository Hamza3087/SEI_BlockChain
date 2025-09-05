import { useAuthRequired } from 'modules/auth';
import { Layout } from 'modules/layout';
import { PlantSubmissions } from 'modules/plants';

export const PlantSubmissionsPage: React.FC = () => {
  useAuthRequired();

  return (
    <Layout navigation>
      <PlantSubmissions />
    </Layout>
  );
};
