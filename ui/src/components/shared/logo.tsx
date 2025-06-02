import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export function Logo({ className, iconSize = 28, textSize = "text-2xl" }: LogoProps) {
  return (
    <Link href="/dashboard" className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-75"></div>
        <div className="relative bg-background rounded-lg p-1.5">
          <BrainCircuit size={iconSize} className="text-primary" />
        </div>
      </div>
      <h1 className={`font-headline font-bold ${textSize} text-primary`}>
        ACCENDIA
      </h1>
    </Link>
  );
}
