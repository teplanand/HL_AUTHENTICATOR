// hooks/useToast.ts (Custom hook for toast notifications)
import { toast, ToastOptions } from "react-toastify";

export const useToast = () => {
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    options?: ToastOptions
  ) => {
    const defaultOptions: ToastOptions = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    };

    const toastOptions = { ...defaultOptions, ...options };

    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, toastOptions);
        break;
      case "warning":
        toast.warning(message, toastOptions);
        break;
      default:
        toast.info(message, toastOptions);
    }
  };

  return { showToast };
};
