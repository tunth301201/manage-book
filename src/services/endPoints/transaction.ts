import { DEFAULT_QUERY_PARAMS } from '@/constants';
import axios from 'axios';

import { Api, Params } from '@/types';

import AxiosInstance from './networking';

const END_POINT = '/api/transactions';

export const createBorrowForm = async (
  data: Api.TransactionApi.CreateParams
): Promise<Api.TransactionApi.CreateResponse> => {
  const url = `${END_POINT}`;
  return await AxiosInstance.post(url, JSON.stringify(data), {
    cancelToken: axios.CancelToken.source().token,
  });
};

export const getBorrowForm = async (
  params: Params.QueryBorrowForm = DEFAULT_QUERY_PARAMS
): Promise<Api.GetTransactionList.Response> => {
  const url = END_POINT;
  return await AxiosInstance.get(url, {
    cancelToken: axios.CancelToken.source().token,
    params: params,
  });
};

export const updateBorrowFormInfo = async ({
  id,
  data,
}: Api.UpdateTransactionInfo.Request): Promise<Api.UpdateTransactionInfo.Response> => {
  const url = END_POINT + `/${id}`;
  return await AxiosInstance.put(url, data, {
    cancelToken: axios.CancelToken.source().token,
  });
};

export const deleteBorrowForm = async (id: number): Promise<boolean> => {
  const url = END_POINT + `/${id}`;
  return await AxiosInstance.delete(url, {
    cancelToken: axios.CancelToken.source().token,
  });
};
