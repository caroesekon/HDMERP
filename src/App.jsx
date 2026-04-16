import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HubAuthProvider } from './context/HubAuthContext';
import AppRoutes from './routes/AppRoutes';
import systemService from './services/systemService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  useEffect(() => {
    systemService.getSettings().catch(() => {});
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <HubAuthProvider>
          <AppRoutes />
        </HubAuthProvider>
      </QueryClientProvider>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </BrowserRouter>
  );
}

export default App;