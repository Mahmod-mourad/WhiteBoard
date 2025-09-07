import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'donezo WhiteBoard',
  description: 'A collaborative whiteboard for your creative process.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        ) : (
          <div className="p-4">
            <h1 className="text-red-500">Environment Variables Not Loaded</h1>
            <pre className="mt-4 p-4 bg-gray-100 rounded">
              {JSON.stringify({
                NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
                NODE_ENV: process.env.NODE_ENV,
              }, null, 2)}
            </pre>
          </div>
        )}
      </body>
    </html>
  );
}
