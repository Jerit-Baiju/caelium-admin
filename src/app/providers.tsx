'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { ReactNode } from 'react';

const ProvidersWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <main>
      <AuthProvider>
        <WebSocketProvider>{children}</WebSocketProvider>
      </AuthProvider>
    </main>
  );
};

export default ProvidersWrapper;
