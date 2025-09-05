import {
  Alert,
  Button,
  Header,
  Input,
  Loader,
  LoaderBox,
  Summary,
  SummaryItem,
} from 'common/components';
import { LocationOn } from 'common/icons';
import { CountriesAutocomplete } from 'modules/countries';
import { Layout } from 'modules/layout';

export const ComponentTestpage: React.FC = () => {
  return (
    <Layout navigation>
      <div className='flex flex-col gap-3'>
        <Alert text={'Test error alert'} severity={'error'} />
        <Alert text={'Test success alert'} severity={'success'} />
        <Button onClick={() => {}}>Test xl primary</Button>
        <Button isLoading onClick={() => {}}>
          Test xl primary load
        </Button>
        <Button type='secondary' onClick={() => {}}>
          Test xl secondary
        </Button>
        <Button size={'sm'} onClick={() => {}}>
          Test sm primary
        </Button>
        <Button size={'sm'} type='secondary' onClick={() => {}}>
          Test sm secondary
        </Button>
        <Input
          Icon={LocationOn}
          label={'Header test'}
          placeholder={'Test placeholder'}
          onChange={() => {}}
        />
        <Input
          Icon={LocationOn}
          placeholder={'Test placeholder'}
          onChange={() => {}}
          value='Testowa wartość'
        />
        <CountriesAutocomplete
          options={[
            { id: 1, name: 'Polska' },
            { id: 1, name: 'Czechy' },
            { id: 1, name: 'Chiny' },
          ]}
          onChange={() => {}}
        />
        <Header
          text={'Test header'}
          onBack={() => {
            console.log('test back');
          }}
        />
        <Header text={'Test header without back'} />
        <Loader />
        <LoaderBox />
        <Summary>
          <SummaryItem>
            <span>label 1</span>
            <span>value 1</span>
          </SummaryItem>
          <SummaryItem>
            <span>label 2</span>
            <span>value 2</span>
          </SummaryItem>
          <SummaryItem>
            <span>label 3</span>
            <span>value 3</span>
          </SummaryItem>
        </Summary>
      </div>
    </Layout>
  );
};
