'use client';

import { useMemo, useState } from 'react';
import { DEFAULT_REFETCH_OPTIONS } from '@/constants';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputBase,
  InputLabel,
  ListItemText,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef, type MRT_Row } from 'material-react-table';
import { useSnackbar } from 'notistack';

import { Api } from '@/types';
import {
  useCreateBook,
  useDeleteBook,
  useGetAuthors,
  useGetBooks,
  useGetCategories,
  useUpdateBook,
} from '@/hooks/books';

import './style.css';

export default function BooksTable() {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'book_id',
        header: 'Book Id',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'title',
        header: 'Title',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.title,
          helperText: validationErrors?.title,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              title: undefined,
            }),
        },
      },
      {
        accessorKey: 'short_description',
        header: 'Short Description',
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors?.short_description,
          helperText: validationErrors?.short_description,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              short_description: undefined,
            }),
        },
      },
      {
        accessorKey: 'authors',
        header: 'Author',
        Cell: ({ cell }) =>
          (cell.getValue() as any[])?.map((author) => `${author.first_name} ${author.last_name}`).join(', '),
        muiEditTextFieldProps: {
          type: 'select',
          required: true,
          error: !!validationErrors?.author,
          helperText: validationErrors?.author,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              author: undefined,
            }),
        },
      },
      {
        accessorKey: 'categories',
        header: 'Category',
        Cell: ({ cell }) => (cell.getValue() as any[])?.map((category) => category.name).join(', '),
        muiEditTextFieldProps: {
          type: 'select',
          required: true,
          error: !!validationErrors?.category,
          helperText: validationErrors?.category,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              category: undefined,
            }),
        },
      },
      {
        accessorKey: 'published_year',
        header: 'Published Year',
      },
      {
        accessorKey: 'copies_available',
        header: 'Quantity',
        muiEditTextFieldProps: {
          type: 'number',
          required: true,
          error: !!validationErrors?.quantity,
          helperText: validationErrors?.quantity,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              quantity: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  //call READ hook
  const [tmpKeyword, setTmpKeyword] = useState('');
  const [keyword, setKeyword] = useState('');

  const resetSearch = () => {
    setTmpKeyword('');
    setKeyword('');
  };

  const handleSearch = () => {
    setKeyword(tmpKeyword);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const transformResponseBookData = (response: any) => response?.data?.data?.books || [];
  const transformResponseData = (response: any) => response?.data?.data || [];

  const {
    data: rawData,
    isLoading,
    isError,
    refetch: refetchBooks,
  } = useGetBooks(
    {
      page: pagination.current,
      page_size: pagination.pageSize,
      keyword,
    },
    DEFAULT_REFETCH_OPTIONS
  );

  const { data: authorData } = useGetAuthors();

  const { data: categoryData } = useGetCategories();

  const handleChangePagination = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination((prev) => ({ ...prev, current: page }));
  };

  const fetchedBooks = transformResponseBookData(rawData);
  const listAuthor = transformResponseData(authorData);
  const listCategory = transformResponseData(categoryData);

  const { enqueueSnackbar } = useSnackbar();

  //call CREATE hook
  const { mutateAsync: createBook, isPending: isCreatingBook } = useCreateBook();

  //call UPDATE hook
  const { mutateAsync: updateBook, isPending: isUpdatingBook } = useUpdateBook();

  //call DELETE hook
  const { mutateAsync: deleteBook, isPending: isDeletingBook } = useDeleteBook();

  //DELETE action
  const openDeleteConfirmModal = async (row: MRT_Row<any>) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const res = await deleteBook(row.original.id);

        if (res?.data?.response_code == 400) {
          enqueueSnackbar('Delete book failed!', { variant: 'error', autoHideDuration: 3000 });
        } else {
          enqueueSnackbar('Delete book successfully!', { variant: 'success', autoHideDuration: 3000 });
        }

        refetchBooks();
      } catch (e) {
        enqueueSnackbar('Delete book failed!', { variant: 'error', autoHideDuration: 3000 });
      }
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedBooks,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => row.book_id,
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onEditingRowCancel: () => setValidationErrors({}),
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => {
      const [formValues, setFormValues] = useState({
        book_id: '',
        title: '',
        short_description: '',
        authors: [],
        categories: [],
        copies_available: 0,
        published_year: 0,
      });

      const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

      const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: any; value: unknown }>) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({
          ...prev,
          [name]: value,
        }));
      };

      const handleSaveBook = async () => {
        const errors = validateBook(formValues);
        if (Object.values(errors).some((error) => error)) {
          setValidationErrors(errors);
          return;
        }

        const payload: Api.BookApi.CreateParams = {
          book_id: formValues.book_id,
          title: formValues.title,
          short_description: formValues?.short_description,
          copies_available: formValues.copies_available,
          cover: '',
          published_year: formValues.published_year,
          authors: formValues.authors,
          categories: formValues.categories,
        };

        try {
          const res = await createBook(payload);

          if (res?.data?.response_code == 400) {
            enqueueSnackbar('Create book fail!', { variant: 'error', autoHideDuration: 3000 });
          } else {
            enqueueSnackbar('Create book successfully!', { variant: 'success', autoHideDuration: 3000 });
          }

          refetchBooks();
        } catch (e) {
          enqueueSnackbar('Create book fail!', { variant: 'error', autoHideDuration: 3000 });
        }

        table.setCreatingRow(null);
      };

      const validateBook = (book: any) => ({
        book_id: !book.book_id ? 'Book ID is required' : '',
        title: !book.title ? 'Title is required' : '',
        short_description: !book.short_description ? 'Short description is required' : '',
        authors: book.authors.length === 0 ? 'At least one author is required' : '',
        categories: book.categories.length === 0 ? 'At least one category is required' : '',
        quantity: book.quantity < 0 ? 'Quantity must be 0 or greater' : '',
        publish_year: book.publish_year < 0 ? 'Quantity must be 0 or greater' : '',
      });

      return (
        <>
          <DialogTitle variant="h5">Create New Book</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', pt: '10px !important' }}>
            {/* Book ID */}
            <TextField
              label="Book ID"
              name="book_id"
              value={formValues.book_id}
              onChange={handleChange}
              fullWidth
              error={!!validationErrors.book_id}
              helperText={validationErrors.book_id}
            />

            {/* Title */}
            <TextField
              label="Title"
              name="title"
              value={formValues.title}
              onChange={handleChange}
              fullWidth
              error={!!validationErrors.title}
              helperText={validationErrors.title}
            />

            {/* Short Description */}
            <TextField
              label="Short Description"
              name="short_description"
              value={formValues.short_description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              error={!!validationErrors.short_description}
              helperText={validationErrors.short_description}
            />

            {/* Authors (Multi-select) */}
            <FormControl fullWidth error={!!validationErrors.authors}>
              <InputLabel>Authors</InputLabel>
              <Select
                label="Authors"
                multiple
                name="authors"
                value={formValues.authors}
                // @ts-ignore
                onChange={handleChange}
                renderValue={(selected) =>
                  selected
                    .map((authorId) => {
                      const findAuthor = listAuthor?.find((author: any) => author?.id === authorId);
                      return `${findAuthor?.first_name} ${findAuthor?.last_name}`;
                    })
                    .join(', ')
                }
              >
                {listAuthor?.map((author: any) => (
                  <MenuItem key={author.id} value={author.id}>
                    <Checkbox
                      // @ts-ignore
                      checked={formValues.authors.includes(author?.id)}
                    />
                    <ListItemText primary={`${author.first_name} ${author.last_name}`} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validationErrors.authors}</FormHelperText>
            </FormControl>

            {/* Categories (Multi-select) */}
            <FormControl fullWidth error={!!validationErrors.categories}>
              <InputLabel>Categories</InputLabel>
              <Select
                label="Categories"
                multiple
                name="categories"
                value={formValues.categories}
                // @ts-ignore
                onChange={handleChange}
                renderValue={(selected) =>
                  selected
                    .map((categoryId) => listCategory?.find((category: any) => category?.id === categoryId)?.name)
                    .join(', ')
                }
              >
                {listCategory?.map((category: any) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Checkbox
                      // @ts-ignore
                      checked={formValues?.categories?.includes(category.id)}
                    />
                    <ListItemText primary={category.name} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validationErrors.categories}</FormHelperText>
            </FormControl>

            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
              }}
            >
              {/* Publish year */}
              <TextField
                label="Publish Year"
                name="published_year"
                value={formValues.published_year}
                onChange={handleChange}
                type="number"
                fullWidth
              />

              {/* Quantity */}
              <TextField
                label="Quantity"
                name="copies_available"
                value={formValues.copies_available}
                onChange={handleChange}
                type="number"
                fullWidth
                error={!!validationErrors.quantity}
                helperText={validationErrors.quantity}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => table.setCreatingRow(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveBook}>
              Save
            </Button>
          </DialogActions>
        </>
      );
    },
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => {
      const oldBookData = row?.original;
      const [formValues, setFormValues] = useState({
        book_id: oldBookData?.book_id || '',
        title: oldBookData?.title || '',
        short_description: oldBookData?.short_description || '',
        authors: oldBookData?.authors?.map((author: any) => author?.id) || [],
        categories: oldBookData?.categories?.map((category: any) => category?.id) || [],
        copies_available: oldBookData?.copies_available || 0,
        published_year: oldBookData?.published_year || 0,
      });

      const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

      const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: any; value: unknown }>) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({
          ...prev,
          [name]: value,
        }));
      };

      const handleSaveBook = async () => {
        const errors = validateBook(formValues);
        if (Object.values(errors).some((error) => error)) {
          setValidationErrors(errors);
          return;
        }

        const payload: Api.BookApi.CreateParams = {
          book_id: formValues.book_id,
          title: formValues.title,
          short_description: formValues?.short_description,
          copies_available: formValues.copies_available,
          cover: '',
          published_year: formValues.published_year,
          authors: formValues.authors,
          categories: formValues.categories,
        };

        try {
          const res = await updateBook({
            id: oldBookData.id,
            data: payload,
          });

          if (res?.data?.response_code == 400) {
            enqueueSnackbar('Edit book fail!', { variant: 'error', autoHideDuration: 3000 });
          } else {
            enqueueSnackbar('Edit book successfully!', { variant: 'success', autoHideDuration: 3000 });
          }

          refetchBooks();
        } catch (e) {
          enqueueSnackbar('Edit book fail!', { variant: 'error', autoHideDuration: 3000 });
        }

        table.setEditingRow(null);
      };

      const validateBook = (book: any) => ({
        book_id: !book.book_id ? 'Book ID is required' : '',
        title: !book.title ? 'Title is required' : '',
        short_description: !book.short_description ? 'Short description is required' : '',
        authors: book.authors.length === 0 ? 'At least one author is required' : '',
        categories: book.categories.length === 0 ? 'At least one category is required' : '',
        quantity: book.quantity < 0 ? 'Quantity must be 0 or greater' : '',
        publish_year: book.publish_year < 0 ? 'Quantity must be 0 or greater' : '',
      });

      return (
        <>
          <DialogTitle variant="h5">Edit Book</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', pt: '10px !important' }}>
            {/* Book ID */}
            <TextField
              label="Book ID"
              name="book_id"
              value={formValues.book_id}
              onChange={handleChange}
              fullWidth
              error={!!validationErrors.book_id}
              helperText={validationErrors.book_id}
              disabled // Disable since it's not editable
            />

            {/* Title */}
            <TextField
              label="Title"
              name="title"
              value={formValues.title}
              onChange={handleChange}
              fullWidth
              error={!!validationErrors.title}
              helperText={validationErrors.title}
            />

            {/* Short Description */}
            <TextField
              label="Short Description"
              name="short_description"
              value={formValues.short_description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              error={!!validationErrors.short_description}
              helperText={validationErrors.short_description}
            />

            {/* Authors (Multi-select) */}
            <FormControl fullWidth error={!!validationErrors.authors}>
              <InputLabel>Authors</InputLabel>
              <Select
                label="Authors"
                multiple
                name="authors"
                value={formValues.authors}
                // @ts-ignore
                onChange={handleChange}
                renderValue={(selected: any) =>
                  selected
                    .map((authorId: any) => {
                      const findAuthor = listAuthor?.find((author: any) => author?.id === authorId);
                      return `${findAuthor?.first_name} ${findAuthor?.last_name}`;
                    })
                    .join(', ')
                }
              >
                {listAuthor?.map((author: any) => (
                  <MenuItem key={author?.id} value={author?.id}>
                    <Checkbox checked={formValues?.authors?.includes(author?.id)} />
                    <ListItemText primary={author?.name} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validationErrors.authors}</FormHelperText>
            </FormControl>

            {/* Categories (Multi-select) */}
            <FormControl fullWidth error={!!validationErrors.categories}>
              <InputLabel>Categories</InputLabel>
              <Select
                label="Categories"
                multiple
                name="categories"
                value={formValues.categories}
                // @ts-ignore
                onChange={handleChange}
                renderValue={(selected) =>
                  selected
                    .map((categoryId: any) => listCategory?.find((category: any) => category?.id === categoryId)?.name)
                    .join(', ')
                }
              >
                {listCategory?.map((category: any) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Checkbox checked={formValues.categories.includes(category.id)} />
                    <ListItemText primary={category.name} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{validationErrors.categories}</FormHelperText>
            </FormControl>

            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
              }}
            >
              {/* Publish year */}
              <TextField
                label="Publish Year"
                name="published_year"
                value={formValues.published_year}
                onChange={handleChange}
                type="number"
                fullWidth
              />

              {/* Quantity */}
              <TextField
                label="Quantity"
                name="copies_available"
                value={formValues.copies_available}
                onChange={handleChange}
                type="number"
                fullWidth
                error={!!validationErrors.quantity}
                helperText={validationErrors.quantity}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => table.setEditingRow(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveBook}>
              Save
            </Button>
          </DialogActions>
        </>
      );
    },
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        Create New Book
      </Button>
    ),
    state: {
      isLoading: isLoading,
      isSaving: isCreatingBook || isUpdatingBook || isDeletingBook,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
    enablePagination: false,
    enableBottomToolbar: false,
    enableColumnFilters: false,
    enableFilters: false,
    enableColumnActions: false,
    initialState: {
      columnVisibility: {
        book_id: true,
        title: true,
        short_description: false,
        authors: true,
        categories: true,
        copies_available: true,
        published_year: true,
      },
    },
  });

  return (
    <>
      {/* Search bar */}
      <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search Book by title or author name..."
          value={tmpKeyword}
          onChange={(e) => {
            setTmpKeyword(e.target.value);
            if (!e.target.value) {
              resetSearch();
            }
          }}
        />
        <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleSearch}>
          <SearchIcon />
        </IconButton>
      </Paper>

      {/* Table */}
      <MaterialReactTable table={table} />

      {/* Page */}
      {rawData?.data?.data?.total_page > 0 && (
        <Pagination
          count={rawData?.data?.data?.total_page}
          page={pagination.current}
          onChange={handleChangePagination}
          sx={{
            alignSelf: 'end',
          }}
        />
      )}
    </>
  );
}
