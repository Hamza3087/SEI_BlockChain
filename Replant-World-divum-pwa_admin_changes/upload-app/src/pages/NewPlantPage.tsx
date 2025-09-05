import { useAuthRequired } from 'modules/auth';
import { Layout } from 'modules/layout';
import { NewPlant } from 'modules/new-plant';

export const NewPlantPage: React.FC = () => {
  useAuthRequired();

  return (
    <Layout>
      <NewPlant />
    </Layout>
  );
};
