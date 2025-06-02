"use client";

import type { ReactNode } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from 'next-themes';
import { ProjectProvider } from "@/contexts/project-context";


export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <ProjectProvider>
          {children}
          <Toaster />
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
