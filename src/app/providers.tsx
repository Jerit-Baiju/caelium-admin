'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

const ProvidersWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <main>
      <AuthProvider>{children}</AuthProvider>
    </main>
  );
};

export default ProvidersWrapper;
