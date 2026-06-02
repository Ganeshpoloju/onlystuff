import React from 'react';
import ReactDOM from 'react-dom/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import App from './App';
import { queryClient } from './lib/queryClient';
import './index.css';

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'onlystuff-query-cache',
  throttleTime: 1000,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 24 * 60 * 60 * 1000,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            const key = query.queryKey[0];
            const skip = ['notifications', 'chat', 'conversations'];
            return !skip.includes(key) && query.state.status === 'success';
          },
        },
      }}
    >
      <App />
    </PersistQueryClientProvider>
  </React.StrictMode>
);
