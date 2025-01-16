import { ReactQuery } from "@/types";

export const DEFAULT_QUERY_PARAMS = {
  page: 1,
  page_size: 10,
};

export const DEFAULT_REFETCH_OPTIONS: ReactQuery.Options = {
  refetchOnMount: 'always',
  refetchOnWindowFocus: 'always',
};
