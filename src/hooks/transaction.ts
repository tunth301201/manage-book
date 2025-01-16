import { queryKey } from '@/constants';
import {
  createBorrowForm,
  deleteBorrowForm,
  getBorrowForm,
  updateBorrowFormInfo,
} from '@/services/endPoints/transaction';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Api, Params, ReactQuery } from '@/types';

// export const useCreateBook = () => {
//   return useMutation({
//     mutationFn: async (book: Book) => {
//       await new Promise((resolve) => setTimeout(resolve, 1000)); // fake API call
//       return Promise.resolve();
//     },
//     onMutate: (newBookInfo: Book) => {
//       queryClient.setQueryData(
//         ['books'],
//         (prevBooks: any) =>
//           [
//             ...prevBooks,
//             {
//               ...newBookInfo,
//               book_id: (Math.random() + 1).toString(36).substring(7), // Generate random ID
//             },
//           ] as Book[]
//       );
//     },
//   });
// };
export const useCreateBorrowForm = () => {
  return useMutation<Api.TransactionApi.CreateResponse, unknown, any>({
    mutationKey: [queryKey.borrow_form.CREATE_BORROW_FORM],
    mutationFn: (data: Api.TransactionApi.CreateParams) => createBorrowForm(data),
  });
};

export const useGetBorrowForms = (params?: Params.QueryBorrowForm, options?: ReactQuery.Options) => {
  return useQuery<Api.GetTransactionList.Response>({
    queryKey: [queryKey.borrow_form.GET_BORROW_FORM_LIST, params],
    queryFn: () => getBorrowForm(params),
    ...options,
  });
};

export const useUpdateBorrowForm = () => {
  return useMutation<Api.UpdateTransactionInfo.Response, unknown, Api.UpdateTransactionInfo.Request>({
    mutationKey: [queryKey.borrow_form.UPDATE_BORROW_FORM_INFO],
    mutationFn: (params) => updateBorrowFormInfo(params),
  });
};

export const useDeleteBorrowForm = () => {
  return useMutation<boolean, unknown, number>({
    mutationKey: [queryKey.borrow_form.DELETE_BORROW_FORM],
    mutationFn: (id) => deleteBorrowForm(id),
  });
};
