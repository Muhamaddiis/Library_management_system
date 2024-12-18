export interface Book {
    id: number;
    title: string;
    author: string;
    genre: string;
    description: string;
    availability: boolean;
    image: string;
    
}

export interface User {
    id: number;
    name: string;
}

export interface Fine {
    id: number;
    user_id: number;
    book_id: number;
    fine_amount: number;
    fine_date: string;
}
  
export interface Borrowing {
    id: number;
    user_id: number;
    book_id: number;
    borrow_date: string;
    return_date?: string | null;
    due_date: string;
    renewed: boolean;
    
}