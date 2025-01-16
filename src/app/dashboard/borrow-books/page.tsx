import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { config } from '@/config';
import BorrowBookTable from '@/components/dashboard/borrow-books/borrow-books-table';

export const metadata = { title: `Books | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Book Borrowing History</Typography>
        </Stack>
      </Stack>
      <BorrowBookTable />
    </Stack>
  );
}
