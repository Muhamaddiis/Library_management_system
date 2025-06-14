export interface Book {
    ID: number;
    title: string;
    author: string;
    genre: string;
    description: string;
    availability: boolean;
    image: string;
    
}

export interface TestBook {
    id: string,
    title: string,
    author: string,
    genre: string,
    rating: number,
    total_copies: number,
    available_copies: number,
    description: string,
    color: string,
    coverUrl: string,
    summary: string
    isLoanedBook?: boolean
}

export interface User {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user';
  }

export interface Fine {
    id: number;
    user_id: number;
    book_id: number;
    fine_amount: number;
    fine_date: string;
    status: "Paid" | "Unpaid"
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