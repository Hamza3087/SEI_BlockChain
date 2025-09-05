import { Header } from 'common/components';
import { useFmtMsg } from 'modules/intl';
import { useState } from 'react';
import {
  CompletedSubmissions,
  ModeSelector,
  WaitingSubmissions,
} from './components';

export const PlantSubmissions: React.FC = () => {
  const fmtMsg = useFmtMsg();

  const [showOffline, setShowOffline] = useState(false);

  return (
    <div className='space-y-5'>
      <Header text={fmtMsg('submissions')} />
      <ModeSelector offline={showOffline} onToggleOffline={setShowOffline} />
      {showOffline ? <WaitingSubmissions /> : <CompletedSubmissions />}
    </div>
  );
};
