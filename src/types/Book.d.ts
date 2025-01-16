declare namespace Book {
  interface Base {
    id: string;
    title: string;
    cover?: string;
    published_year?: number;
    copies_available: number;
    short_description?: string;
    book_id: string;
  }
}
