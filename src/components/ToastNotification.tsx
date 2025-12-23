import { toast, Toaster } from 'react-hot-toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info, Loader2, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface ToastProps {
  t: any;
  message: string;
  type: ToastType;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    style: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/50 dark:border-emerald-800 dark:text-emerald-200",
    iconColor: "text-emerald-600 dark:text-emerald-400"
  },
  error: {
    icon: AlertCircle,
    style: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-200",
    iconColor: "text-red-600 dark:text-red-400"
  },
  warning: {
    icon: AlertTriangle,
    style: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/50 dark:border-amber-800 dark:text-amber-200",
    iconColor: "text-amber-600 dark:text-amber-400"
  },
  info: {
    icon: Info,
    style: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:border-blue-800 dark:text-blue-200",
    iconColor: "text-blue-600 dark:text-blue-400"
  },
  loading: {
    icon: Loader2,
    style: "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800/90 dark:border-gray-700 dark:text-gray-200",
    iconColor: "text-blue-600 dark:text-blue-400"
  },
};

// Reusable Toast Component
const CustomToast = ({ t, message, type }: ToastProps) => {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`${
        t.visible 
          ? 'animate-enter opacity-100 translate-y-0' 
          : 'animate-leave opacity-0 -translate-y-10'
      } flex items-center space-x-3 px-6 py-3 rounded-lg shadow-lg border transition-all duration-500 ease-out transform pointer-events-auto ${config.style}`}
      style={{ minWidth: '300px' }}
    >
      {/* Icon Section */}
      <div className="shrink-0">
        <Icon className={`w-5 h-5 ${config.iconColor} ${type === 'loading' ? 'animate-spin' : ''}`} />
      </div>

      {/* Message Section */}
      <div className="flex-1">
        <span className="font-medium text-sm">
          {message}
        </span>
      </div>

      {type !== 'loading' && (
        <button
          onClick={() => toast.dismiss(t.id)}
          className="shrink-0 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Exported Helper Object
export const notify = {
  success: (message: string) =>
    toast.custom((t) => <CustomToast t={t} message={message} type="success" />, { duration: 3000 }),

  error: (message: string) =>
    toast.custom((t) => <CustomToast t={t} message={message} type="error" />, { duration: 3000 }),

  warning: (message: string) =>
    toast.custom((t) => <CustomToast t={t} message={message} type="warning" />, { duration: 3000 }),

  info: (message: string) =>
    toast.custom((t) => <CustomToast t={t} message={message} type="info" />, { duration: 3000 }),

  loading: (message: string) =>
    toast.custom((t) => <CustomToast t={t} message={message} type="loading" />, { duration: Infinity }),

  dismiss: (toastId?: string) => toast.dismiss(toastId),
};

// --- Toast Container ---
export const ToastContainer = () => (
  <Toaster
    position="top-right"
    reverseOrder={false}
    gutter={12}
    containerClassName="!z-[9999]"
  />
);