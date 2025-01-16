import { DEFAULT_QUERY_PARAMS } from '@/constants';
import axios from 'axios';

import { Api, Params } from '@/types';

import AxiosInstance from './networking';

const END_POINT = '/api/books';

export const createBook = async (data: Api.BookApi.CreateParams): Promise<Api.BookApi.CreateResponse> => {
  const url = `${END_POINT}`;
  return await AxiosInstance.post(url, JSON.stringify(data), {
    cancelToken: axios.CancelToken.source().token,
  });
};

export const getBooks = async (params: Params.QueryBook = DEFAULT_QUERY_PARAMS): Promise<Api.GetBookList.Response> => {
  const url = END_POINT;
  return await AxiosInstance.get(url, {
    cancelToken: axios.CancelToken.source().token,
    params: params,
  });
};

export const updateBookInfo = async ({
  id,
  data,
}: Api.UpdateBookInfo.Request): Promise<Api.UpdateBookInfo.Response> => {
  const url = END_POINT + `/${id}`;
  return await AxiosInstance.put(url, data, {
    cancelToken: axios.CancelToken.source().token,
  });
};

export const deleteBook = async (id: number): Promise<boolean> => {
  const url = END_POINT + `/${id}`;
  return await AxiosInstance.delete(url, {
    cancelToken: axios.CancelToken.source().token,
  });
};

export const getAuthors = async (): Promise<Api.GetAuthorList.Response> => {
  const url = '/api/authors';
  return await AxiosInstance.get(url, {
    cancelToken: axios.CancelToken.source().token,
  });
};

export const getCategories = async (): Promise<Api.GetCategoryList.Response> => {
  const url = '/api/categories';
  return await AxiosInstance.get(url, {
    cancelToken: axios.CancelToken.source().token,
  });
};
