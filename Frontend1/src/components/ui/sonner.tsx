import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      closeButton
      duration={2000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#051024] group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-white/70",
          actionButton:
            "group-[.toast]:bg-yellow-400 group-[.toast]:text-black",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-white/70 hover:group-[.toast]:text-white hover:group-[.toast]:bg-white/10 border-white/10",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };