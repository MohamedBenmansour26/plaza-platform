import { RouterProvider } from 'react-router';
import { AppProvider } from './context/AppContext';
import { router } from './routes';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AppProvider>
      <div className="max-w-[375px] mx-auto bg-white min-h-screen shadow-2xl">
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </div>
    </AppProvider>
  );
}
