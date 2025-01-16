export declare namespace Params {
  interface QueryBook {
    title?: string;
    author?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    order?: string;
    keyword?: string
  }

  interface QueryBorrowForm {
    status?: string;
    page?: number;
    page_size?: number;
    sort_by?: string;
    order?: string;
    keyword?: string
    status?: string
  }
}
