import { queryKey } from '@/constants';
import { createBook, deleteBook, getAuthors, getBooks, getCategories, updateBookInfo } from '@/services/endPoints/book';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Api, Params, ReactQuery } from '@/types';

export const useCreateBook = () => {
  return useMutation<Api.BookApi.CreateResponse, unknown, any>({
    mutationKey: [queryKey.book.CREATE_BOOK],
    mutationFn: (data: Api.BookApi.CreateParams) => createBook(data),
  });
};

export const useGetBooks = (params?: Params.QueryBook, options?: ReactQuery.Options) => {
  return useQuery<Api.GetBookList.Response>({
    queryKey: [queryKey.book.GET_BOOK_LIST, params],
    queryFn: () => getBooks(params),
    ...options,
  });
};

export const useUpdateBook = () => {
  return useMutation<Api.UpdateBookInfo.Response, unknown, Api.UpdateBookInfo.Request>({
    mutationKey: [queryKey.book.UPDATE_BOOK_INFO],
    mutationFn: (params) => updateBookInfo(params),
  });
};

export const useDeleteBook = () => {
  return useMutation<boolean, unknown, number>({
    mutationKey: [queryKey.book.DELETE_BOOK],
    mutationFn: (id) => deleteBook(id),
  });
};

export const useGetAuthors = () => {
  return useQuery<Api.GetAuthorList.Response>({
    queryKey: [queryKey.author.GET_AUTHOR_LIST],
    queryFn: () => getAuthors(),
  });
};

export const useGetCategories = () => {
  return useQuery<Api.GetCategoryList.Response>({
    queryKey: [queryKey.category.GET_CATEGORY_LIST],
    queryFn: () => getCategories(),
  });
};
