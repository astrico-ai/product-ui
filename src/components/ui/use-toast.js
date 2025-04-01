import { useToast } from "@/hooks/use-toast";

export { useToast };

export function toast(props) {
  const { toast } = useToast();
  return toast(props);
} 