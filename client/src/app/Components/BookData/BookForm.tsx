import React, { useState } from "react";

interface AddBookFormProps {
  onClose: () => void;
}

const BookForm = ({ onClose }: AddBookFormProps) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    description: "",
    availability: true,
    image: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Book added successfully!");
        setFormData({
          title: "",
          author: "",
          genre: "",
          description: "",
          availability: true,
          image: "",
        });
        onClose();
      } else {
        const error = await response.json();
        console.error("Error:", error);
        alert("Failed to add the book.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the book.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 border rounded bg-stone-50">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="border p-2 rounded"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          className="border p-2 rounded"
          value={formData.author}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="genre"
          placeholder="Genre"
          className="border p-2 rounded"
          value={formData.genre}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          className="border p-2 rounded"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>
        <select
          name="availability"
          className="border p-2 rounded"
          value={formData.availability ? "true" : "false"}
          onChange={handleChange}
          required
        >
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <input
          type="url"
          name="image"
          placeholder="Image URL"
          className="border p-2 rounded"
          value={formData.image}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default BookForm;
