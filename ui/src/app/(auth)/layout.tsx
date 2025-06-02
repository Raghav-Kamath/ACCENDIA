import type { ReactNode } from 'react';
import { Logo } from '@/components/shared/logo';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <Logo iconSize={40} textSize="text-4xl" />
      </div>
      <main className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
