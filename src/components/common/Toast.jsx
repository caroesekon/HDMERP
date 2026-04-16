// This is a wrapper for react-hot-toast, just re-export or custom
import { Toaster, toast } from 'react-hot-toast';

export const showToast = {
  success: (message) => toast.success(message, { duration: 3000 }),
  error: (message) => toast.error(message, { duration: 4000 }),
  loading: (message) => toast.loading(message),
  dismiss: () => toast.dismiss(),
  promise: (promise, messages) => toast.promise(promise, messages)
};

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        style: {
          background: '#fff',
          color: '#1f2937',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          borderRadius: '0.5rem',
          padding: '12px 16px',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
      }}
    />
  );
}