export namespace Api {
  namespace BookApi {
    interface CreateParams {
      book_id: string;
      title: string;
      short_description?: string;
      copies_available: number;
      cover?: string;
      published_year?: number;
      authors: number[];
      categories: number[];
    }

    interface CreateResponse {
      data: any;
    }
  }

  namespace GetBookList {
    interface Response {
      data: any[];
    }
  }

  namespace UpdateBookInfo {
    interface Request {
      id: string;
      data: BookApi.CreateParams;
    }
    interface Response {
      data: any;
    }
  }

  namespace TransactionApi {
    interface CreateParams {
      borrow_date: Date;
      return_date?: Date;
      book_id: number;
      manager_id: number;
      borrow_info: string;
      issue?: string;
    }

    interface CreateResponse {
      data: any;
    }
  }

  namespace GetTransactionList {
    interface Response {
      data: any[];
    }
  }

  namespace UpdateTransactionInfo {
    interface Request {
      id: string;
      data: TransactionApi.CreateParams;
    }
    interface Response {
      data: any;
    }
  }

  namespace GetAuthorList {
    interface Response {
      data: any[]
    }
  }

  namespace GetCategoryList {
    interface Response {
      data: any[]
    }
  }

}
