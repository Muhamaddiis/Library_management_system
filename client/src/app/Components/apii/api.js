const baseUrl = "http://localhost:8000";

const fetchData = async (endpoint, options = {}) => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        redirect: 'follow' 
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
    }
    console.log(response);
    
    return response.json();
};

export const deleteBook = (id) => fetchData(`/books/${id}`, { method: "DELETE" });

export const updateBook = (id, data) => fetchData(`/books/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });




  
  export const fetchBooks = () => fetchData("/books");
  export const fetchUsers = () => fetchData("/users");
  export const fetchFines = () => fetchData("/fines");
  export const fetchBorrowings = () => fetchData("/borrowings");
  