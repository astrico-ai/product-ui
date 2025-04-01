import { useEffect, useState } from "react";
import { toast as sonnerToast } from "sonner";

const TOAST_LIMIT = 1;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const toastTimeouts = new Map();

  useEffect(() => {
    return () => {
      toastTimeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const toast = ({ title, description, action, ...props }) => {
    const toastId = Math.random().toString(36).substring(7);

    if (toastTimeouts.has(toastId)) {
      clearTimeout(toastTimeouts.get(toastId));
    }

    const timeout = setTimeout(() => {
      setToasts((state) => ({
        toasts: state.toasts.filter((t) => t.id !== toastId),
      }));
    }, 5000);

    toastTimeouts.set(toastId, timeout);

    setToasts((state) => ({
      toasts: [action, ...state.toasts].slice(0, TOAST_LIMIT),
    }));

    sonnerToast({
      title,
      description,
      ...props,
    });

    return toastId;
  };

  const dismiss = (toastId) => {
    setToasts((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === toastId ? { ...t, open: false } : t
      ),
    }));
  };

  return {
    toast,
    dismiss,
  };
} 