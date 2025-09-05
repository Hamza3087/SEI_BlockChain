import { useQueryClient } from '@tanstack/react-query';
import { Button } from 'common/components';
import { useFmtMsg } from 'modules/intl';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '.';

export const Logout: React.FC = () => {
  const fmtMsg = useFmtMsg();

  const navigate = useNavigate();

  const logoutMutation = useLogoutMutation();

  const queryClient = useQueryClient();

  const logOut = async () => {
    if (logoutMutation.isPending) {
      return;
    }
    await logoutMutation.mutateAsync({});
    queryClient.removeQueries(); // remove all queries
    navigate('/login');
  };

  return (
    <Button
      isLoading={logoutMutation.isPending}
      type='secondary'
      onClick={logOut}
    >
      {fmtMsg('logOut')}
    </Button>
  );
};
