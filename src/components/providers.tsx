
"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}

      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        duration={3500}
        theme="system"
      />
    </ThemeProvider>
  );
}
