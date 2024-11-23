import '@/css/style.css';

import { Metadata } from 'next';
import Script from 'next/script';
import React from 'react';
import ProvidersWrapper from './providers';

export const metadata: Metadata = {
  title: 'Caelium Dashboard',
  description: 'An internal monitoring platform for real-time activity tracking, log management, and streamlined system oversight.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,150,0,0'
        />
      </head>
      <body suppressHydrationWarning={true}>
        <ProvidersWrapper>{children}</ProvidersWrapper>
        <Script src='https://kit.fontawesome.com/c75f557ffd.js' crossOrigin='anonymous'></Script>
      </body>
    </html>
  );
}
