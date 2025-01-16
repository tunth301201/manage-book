'use client';

import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_REFETCH_OPTIONS } from '@/constants';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import {
  MaterialReactTable,
  useMaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
} from 'material-react-table';

import './style.css';

import { useCreateBorrowForm, useDeleteBorrowForm, useGetBorrowForms, useUpdateBorrowForm } from '@/hooks/transaction';

export default function BorrowBookTable() {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'book_id',
        header: 'Book Id',
        enableEditing: false,
        size: 80,
        enableHiding: true,
      },
      {
        accessorKey: 'book_title',
        header: 'Title',
        enableEditing: false,
      },
      {
        accessorKey: 'book_authors',
        header: 'Author',
        Cell: ({ cell }) => (cell.getValue() as any[])?.map((author) => `${author}`).join(', '),
      },
      {
        accessorKey: 'due_date',
        header: 'Overdue',
        enableEditing: false,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableEditing: false,
        Cell: ({ cell }) => {
          const colorStatus: any = {
            Borrowed: '',
            Overdue: 'red',
            Returned: 'green',
            'Returned Late': 'yellow',
          };
          const status = cell.getValue() ?? ('' as typeof colorStatus);
          return (
            <Typography color={colorStatus?.[status]} fontSize={'14px'}>
              {status}
            </Typography>
          );
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

  const transformResponseData = (response: any) => response?.data?.data?.items || [];

  const {
    data: rawData,
    isLoading,
    isError,
    refetch: refetchBorrowForms,
  } = useGetBorrowForms(
    {
      page: pagination.current,
      page_size: pagination.pageSize,
      keyword,
    },
    DEFAULT_REFETCH_OPTIONS
  );

  const handleChangePagination = (event: React.ChangeEvent<unknown>, page: number) => {
    setPagination((prev) => ({ ...prev, current: page }));
  };

  const fetchedBorrowForms = transformResponseData(rawData);

  //call CREATE hook
  const { mutateAsync: createBorrowForm, isPending: isCreatingBorrowForm } = useCreateBorrowForm();

  //call UPDATE hook
  const { mutateAsync: updateBorrowForm, isPending: isUpdatingBorrowForm } = useUpdateBorrowForm();

  //call DELETE hook
  const { mutateAsync: deleteBorrowForm, isPending: isDeletingBorrowForm } = useDeleteBorrowForm();

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<any>) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      deleteBorrowForm(row.original.id);
      refetchBorrowForms();
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedBorrowForms,
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
      const [formValues, setFormValues] = useState<{
        book_id: string;
        borrow_date: Dayjs;
        return_date: Dayjs;
        issue: string | null;
        borrow_info: string | null;
      }>({
        book_id: '',
        borrow_date: dayjs(),
        return_date: dayjs(),
        issue: '',
        borrow_info: '',
      });

      const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

      const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: any; value: unknown }>) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({
          ...prev,
          [name]: value,
        }));
      };

      const validateBorrow = (borrowData: any) => ({
        book_id: !borrowData.book_id ? 'Book ID is required' : '',
        borrow_date: !borrowData.borrow_date ? 'Borrow date is required' : '',
        borrow_info: !borrowData.borrow_info ? 'Borrow user info is required' : '',
      });

      const handleSaveBorrow = async () => {
        const errors = validateBorrow(formValues);
        if (Object.values(errors).some((error) => error)) {
          setValidationErrors(errors);
          return;
        }

        const payload = {
          book_id: formValues.book_id,
          borrow_date: formValues.borrow_date.format('YYYY-MM-DD'),
          issue: formValues.issue,
          borrow_info: formValues.borrow_info,
          manager_id: 3,
        };

        await createBorrowForm(payload);
        refetchBorrowForms();

        table.setCreatingRow(null);
      };

      useEffect(() => {
        const newReturnDate = formValues.borrow_date.add(7, 'day');
        setFormValues((prev) => ({
          ...prev,
          return_date: newReturnDate,
        }));
      }, [formValues.borrow_date]);

      return (
        <>
          <DialogTitle variant="h5">Create Borrow Form</DialogTitle>
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

            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
                width: '100%',
              }}
            >
              {/* Borrow Date */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Borrow Date"
                  value={formValues.borrow_date}
                  onChange={(newValue: any) => setFormValues({ ...formValues, borrow_date: newValue })}
                  disablePast
                  sx={{
                    flex: 1,
                  }}
                />

                <DatePicker
                  label="Expected Return Date"
                  value={formValues.return_date}
                  disabled
                  sx={{
                    flex: 1,
                  }}
                />
              </LocalizationProvider>
            </Stack>

            {/* Issue */}
            <TextField
              label="Issue"
              name="issue"
              value={formValues.issue}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
              error={!!validationErrors.issue}
              helperText={validationErrors.issue}
            />

            {/* Borrow Info */}
            <TextField
              label="Borrow Info"
              rows={5}
              multiline
              placeholder="Borrow Info"
              name="borrow_info"
              value={formValues.borrow_info || ''}
              onChange={handleChange}
              style={{ width: '100%' }}
              error={!!validationErrors.borrow_info}
              helperText={validationErrors.borrow_info}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => table.setCreatingRow(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveBorrow}>
              Save
            </Button>
          </DialogActions>
        </>
      );
    },
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => {
      const oldFormData = row?.original;

      const [formValues, setFormValues] = useState({
        book_id: oldFormData?.book_id || '',
        book_title: oldFormData?.book_title || '',
        borrow_date: dayjs(oldFormData?.borrow_date || new Date()),
        return_date: dayjs(oldFormData?.return_date || new Date()),
        issue: oldFormData?.issue || '',
        borrow_info: oldFormData?.borrow_info || '',
      });

      const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

      const handleChange = (event: React.ChangeEvent<HTMLInputElement | { name?: any; value: unknown }>) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({
          ...prev,
          [name]: value,
        }));
      };

      const validateBorrow = (borrowData: any) => ({
        issue: !borrowData.issue ? 'Issue cannot be empty' : '',
        return_date: !borrowData.return_date ? 'Return date is required' : '',
      });

      const handleSaveBorrow = async () => {
        const errors = validateBorrow(formValues);
        if (Object.values(errors).some((error) => error)) {
          setValidationErrors(errors);
          return;
        }

        const payload: any = {
          book_id: formValues.book_id,
          borrow_date: formValues.borrow_date.format('YYYY-MM-DD'),
          return_date: formValues.return_date.format('YYYY-MM-DD'),
          issue: formValues.issue,
          borrow_info: formValues.borrow_info,
          manager_id: 3,
        };

        await updateBorrowForm({ id: row?.original?.id, data: payload });
        refetchBorrowForms();

        table.setEditingRow(null);
      };

      return (
        <>
          <DialogTitle variant="h5">Edit Borrow Form</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', pt: '10px !important' }}>
            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
                width: '100%',
              }}
            >
              {/* Book ID (Read-only) */}
              <TextField
                label="Book ID"
                name="book_id"
                value={formValues.book_id}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                disabled
              />

              {/* Book Title (Read-only) */}
              <TextField
                label="Book Title"
                name="book_title"
                value={formValues.book_title}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                disabled
              />
            </Stack>

            <Stack
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
                width: '100%',
              }}
            >
              {/* Borrow Date (Read-only) */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Borrow Date"
                  value={formValues.borrow_date}
                  disabled
                  // @ts-ignore
                  renderInput={(params: any) => <TextField {...params} fullWidth />}
                  sx={{
                    flex: 1,
                  }}
                />
              </LocalizationProvider>

              <DatePicker
                label="Return Date"
                value={formValues.return_date}
                onChange={(newValue: any) => setFormValues({ ...formValues, return_date: newValue })}
                // @ts-ignore
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    fullWidth
                    error={!!validationErrors.return_date}
                    helperText={validationErrors.return_date}
                  />
                )}
                disablePast
                sx={{
                  flex: 1,
                }}
              />
            </Stack>

            {/* Issue */}
            <TextField
              label="Issue"
              name="issue"
              value={formValues.issue}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
              error={!!validationErrors.issue}
              helperText={validationErrors.issue}
            />

            {/* Borrow Info (Read-only) */}
            <TextField
              label="Borrow Info"
              name="issue"
              value={formValues.borrow_info}
              InputProps={{
                readOnly: true,
              }}
              multiline
              rows={5}
              fullWidth
              disabled
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => table.setEditingRow(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveBorrow}>
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
        Create Borrow Form
      </Button>
    ),
    state: {
      isLoading: isLoading,
      isSaving: isCreatingBorrowForm || isUpdatingBorrowForm || isDeletingBorrowForm,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
    enablePagination: false,
    enableBottomToolbar: false,
    enableColumnFilters: false,
    enableFilters: false,
    enableColumnOrdering: false,
    enableColumnFilterModes: false,
    enableColumnActions: false,
    initialState: { columnVisibility: {} },
  });

  // handle filter status
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  const handleChangeStatus = (selected: string) => {
    setSelectedStatus((prevSelectedStatus) => {
      if (prevSelectedStatus.includes(selected)) {
        return prevSelectedStatus.filter((status) => status !== selected);
      } else {
        return [...prevSelectedStatus, selected];
      }
    });
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Stack
        sx={{
          display: 'flex',
          gap: '1rem',
          flexDirection: 'row',
        }}
      >
        {/* Search bar */}
        <Paper
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
          variant="outlined"
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Enter book id, title or author name..."
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

        <Stack>
          <Button
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            sx={{
              height: '100%',
            }}
            variant="outlined"
          >
            <FilterAltIcon />
            Status ({selectedStatus?.length})
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
            sx={{
              marginTop: '10px',
            }}
          >
            <MenuItem value="Borrowed" onClick={() => handleChangeStatus('Borrowed')}>
              <Checkbox checked={selectedStatus.includes('Borrowed')} />
              <ListItemText primary="Borrowed" />
            </MenuItem>
            <MenuItem value="Overdue" onClick={() => handleChangeStatus('Overdue')}>
              <Checkbox checked={selectedStatus.includes('Overdue')} />
              <ListItemText primary="Overdue" />
            </MenuItem>
            <MenuItem value="Returned" onClick={() => handleChangeStatus('Returned')}>
              <Checkbox checked={selectedStatus.includes('Returned')} />
              <ListItemText primary="Returned" />
            </MenuItem>
            <MenuItem value="Returned Late" onClick={() => handleChangeStatus('Returned Late')}>
              <Checkbox checked={selectedStatus.includes('Returned Late')} />
              <ListItemText primary="Returned Late" />
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      {/* Table */}
      <MaterialReactTable table={table} />

      {/* Page */}
      <Pagination
        count={2}
        page={pagination.current}
        onChange={handleChangePagination}
        sx={{
          alignSelf: 'end',
        }}
      />
    </>
  );
}
