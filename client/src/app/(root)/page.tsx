import React from 'react'
import BookOverview from '../Components/BookOverview'
import BookList from '../Components/BookList'
import { books } from "./books.js"

const Home = () => <>
  <BookOverview {...books[0]} />
  <BookList
    title='Popular Books'
    books={books}
    containerClassName='mt-28'
  />
</>

export default Home