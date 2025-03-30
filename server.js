const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(cors()); // Enable CORS for cross-origin requests

// Serve books from books.json with dynamic price calculation
app.get("/api/books", (req, res) => {
  fs.readFile("books.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading books.json:", err);
      return res.status(500).json({ error: "Failed to load books data" });
    }
    try {
      const books = JSON.parse(data);
      // Add a default price if not present (e.g., $1 per 50 pages)
      const booksWithPrice = books.map((book) => ({
        ...book,
        price: book.price || Math.ceil(book.pages / 50) * 1, // Example pricing logic
      }));
      res.json(booksWithPrice);
    } catch (parseError) {
      console.error("Error parsing books.json:", parseError);
      res.status(500).json({ error: "Invalid books data format" });
    }
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: "Resource not found" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
