import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Metadata } from 'next';
import * as React from 'react';

import BooksTable from '@/components/dashboard/books/books-table';
import { config } from '@/config';

export const metadata = { title: `Books | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Books</Typography>
        </Stack>
      </Stack>
      <BooksTable />
    </Stack>
  );
}


