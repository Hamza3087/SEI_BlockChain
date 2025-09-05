import Router from './route/Index';
import ThemeProvider from './layout/provider/Theme';
import { Provider } from 'react-redux';
import store from './store/index';
import LoadingSpinner from './pages/components/LoadingSpinner';
import ToastNotification from './components/ToastNotification';

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastNotification />
        <LoadingSpinner />
        <Router />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
