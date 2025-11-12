import { toast as sonnerToast } from "sonner";

/**
 * useToast hook - wrapper around sonner toast
 * Provides a consistent API for showing toast notifications
 */
export function useToast() {
  const toast = ({ title, description, variant, ...props }) => {
    // Map variant to sonner toast types
    const toastType = variant === "destructive" ? "error" : "success";
    
    // If variant is default or not specified, use normal toast
    if (!variant || variant === "default") {
      return sonnerToast(title, {
        description,
        ...props,
      });
    }
    
    // Use the appropriate sonner toast type
    return sonnerToast[toastType](title, {
      description,
      ...props,
    });
  };

  const dismiss = (toastId) => {
    sonnerToast.dismiss(toastId);
  };

  return {
    toast,
    dismiss,
  };
} 