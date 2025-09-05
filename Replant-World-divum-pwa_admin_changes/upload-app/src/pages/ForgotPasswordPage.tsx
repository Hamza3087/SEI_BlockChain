import { Button, Header, Section } from 'common/components';
import { useFmtMsg } from 'modules/intl';
import { Layout } from 'modules/layout';
import { useNavigate } from 'react-router-dom';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const fmtMsg = useFmtMsg();

  const goBack = () => navigate(-1);

  return (
    <Layout>
      <Section actions={<Button onClick={goBack}>{fmtMsg('back')}</Button>}>
        <Header onBack={goBack} text={fmtMsg('forgotYourPassword')} />
        <p className='mt-5 text-center'>
          {fmtMsg('contactCoordinatorAndAskForLink')}
        </p>
      </Section>
    </Layout>
  );
};
