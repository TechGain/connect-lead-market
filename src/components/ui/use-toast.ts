
import { toast } from "sonner";

export { toast };

// Re-export useToast for backward compatibility
export const useToast = () => {
  return {
    toast
  };
};
