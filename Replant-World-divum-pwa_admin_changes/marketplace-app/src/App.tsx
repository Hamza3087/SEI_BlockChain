import { Footer } from 'common/components/Footer';
import { IntlProvider } from 'modules/intl';
import { QueryClientProvider } from 'modules/query';
import { GalleryPage, MapPage } from 'pages';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <QueryClientProvider>
      <IntlProvider>
        <div id='root-scroll' className='w-screen h-screen overflow-y-auto'>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<GalleryPage />} />
              <Route path='/map' element={<MapPage />} />
            </Routes>
          </BrowserRouter>
          <Footer />
        </div>
      </IntlProvider>
    </QueryClientProvider>
  );
};

export default App;
