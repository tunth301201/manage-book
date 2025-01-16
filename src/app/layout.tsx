'use client';

import * as React from 'react';
import type { Viewport } from 'next';

import '@/styles/global.css';

import { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const ReactQueryDevtoolsProduction = React.lazy(() =>
    import('@tanstack/react-query-devtools/build/modern/production.js').then((d) => ({
      default: d.ReactQueryDevtools,
    }))
  );

  const queryClient = new QueryClient();

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider>
            <UserProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </UserProvider>
          </LocalizationProvider>
          <Suspense fallback={null}>
            <ReactQueryDevtoolsProduction />
          </Suspense>
        </QueryClientProvider>
      </body>
    </html>
  );
}
