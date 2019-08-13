import React, {lazy, Suspense} from 'react';
import ReactDOM from 'react-dom';
import {FullPageSpinner} from './components/Spinner';

const App = lazy(() => import('./App'));

ReactDOM.render(
  <Suspense fallback={<FullPageSpinner />}>
    <App />
  </Suspense>,
  document.getElementById('root'),
);
