import { UseQueryOptions } from "@tanstack/react-query"

declare namespace ReactQuery {
  type Options = Omit<
    UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    "queryKey" | "queryFn"
  >
}
