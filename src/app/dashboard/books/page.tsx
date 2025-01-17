'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SnackbarProvider } from 'notistack';

import BooksTable from '@/components/dashboard/books/books-table';

export default function Page(): React.JSX.Element {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" spacing={3}>
          <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
            <Typography variant="h4">Books</Typography>
          </Stack>
        </Stack>
        <BooksTable />
      </Stack>
    </SnackbarProvider>
  );
}
