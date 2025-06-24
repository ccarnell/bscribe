// Replace your /app/layout.tsx with this updated version

import { Metadata } from 'next';
import Footer from '@/components/ui/Footer';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from '@/components/ui/Toasts/toaster';
import { PropsWithChildren, Suspense } from 'react';
import { getURL } from '@/utils/helpers';
import { SpeedInsights } from "@vercel/speed-insights/next"
import 'styles/main.css';


const title = 'Totally not AI-generated. Laugh until you\'re crying, or cry until you\'re laughing.';
const description = 'No Bullsh*t purchase has ever made me want to get my life back together more.';

export const metadata: Metadata = {
  metadataBase: new URL(getURL()),
  icons: {
      icon: '/favicon.ico',
  },
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
    type: 'website',
    url: getURL(),
  },
  twitter: {
    card: 'summary_large_image',
    title: title,
    description: description,
  },
  keywords: [
    'satirical self-help',
    'funny self-help books', 
    'AI generated books',
    'parody self-improvement',
    'comedy ebooks',
    'fake self-help'
  ]
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="bg-black">
        <Navbar />
        <main
          id="skip"
          className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
        >
          {children}
          <SpeedInsights />
        </main>
        <Footer />
        <Suspense>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}