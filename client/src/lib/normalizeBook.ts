import { Book, TestBook } from "../app/Types/types"

export const normalizeBook = (book: Book): TestBook => ({
  id: book.ID.toString(),
  title: book.title,
  author: book.author,
  genre: book.genre,
  description: book.description,
  rating: 4.5,
  total_copies: 1,
  available_copies: book.availability ? 1 : 0,
  color: '#facc15',
  coverUrl: book.image,
  summary: book.description,
})
