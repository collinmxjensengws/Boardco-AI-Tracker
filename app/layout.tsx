import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BoardCo AI Training Tracker',
  description: 'Track AI training progress for the BoardCo & Mark\'s Marine teams — Spring 2026',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
