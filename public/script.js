// WhatsApp number
const whatsappNumber = "+919310065542";

// Global variables
let booksData = [];
let filteredBooks = [];
let currentPage = 1;
const booksPerPage = 8;
let currentView = "grid";
let cart = JSON.parse(localStorage.getItem("bookCart")) || [];

// DOM Elements
const categorySelect = document.getElementById("category");
const authorSelect = document.getElementById("author");
const priceRange = document.getElementById("price-range");
const priceDisplay = document.getElementById("price-display");
const sortOption = document.getElementById("sort-option");
const bookListContainer = document.getElementById("book-list");
const bookCountElement = document.getElementById("book-count");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const pageNumbersContainer = document.getElementById("page-numbers");
const filterToggleButton = document.getElementById("filter-toggle");
const controlsElement = document.querySelector(".controls");
const viewToggleButton = document.getElementById("view-toggle");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-btn");
const featuredBooksContainer = document.getElementById("featured-books");
const cartIcon = document.querySelector(".cart-icon");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartButton = document.getElementById("close-cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotalAmount = document.getElementById("cart-total-amount");
const checkoutButton = document.getElementById("checkout-btn");
const bookModal = document.getElementById("book-modal");
const modalOverlay = document.getElementById("modal-overlay");
const closeModalButton = document.getElementById("close-modal");
const modalBookDetails = document.getElementById("modal-book-details");
const mobileToggle = document.querySelector(".mobile-toggle");
const navLinks = document.querySelector(".nav-links");
const newsletterForm = document.getElementById("newsletter-form");

// Initialize the application
function init() {
  fetchBooks();
  setupEventListeners();
  setupMobileMenu();
  updateCartCount(); // Initialize cart count on page load
}

// Fetch books from API
async function fetchBooks() {
  try {
    const response = await fetch("/api/books");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    booksData = await response.json();
    setupCategoryFilter();
    setupAuthorFilter();
    displayFeaturedBooks();
    updateBookDisplay();
  } catch (error) {
    console.error("Error fetching books:", error);
    bookListContainer.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load books. Please try refreshing the page.</p>
      </div>
    `;
  }
}

// Set up event listeners
function setupEventListeners() {
  categorySelect.addEventListener("change", updateBookDisplay);
  authorSelect.addEventListener("change", updateBookDisplay);
  sortOption.addEventListener("change", updateBookDisplay);

  priceRange.addEventListener("input", () => {
    priceDisplay.textContent = `$0 - $${priceRange.value}`;
    updateBookDisplay();
  });

  prevPageButton.addEventListener("click", goToPrevPage);
  nextPageButton.addEventListener("click", goToNextPage);

  filterToggleButton.addEventListener("click", () =>
    controlsElement.classList.toggle("active")
  );
  viewToggleButton.addEventListener("click", toggleView);

  searchButton.addEventListener("click", performSearch);
  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") performSearch();
  });

  cartIcon.addEventListener("click", openCart);
  closeCartButton.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);
  checkoutButton.addEventListener("click", checkout);

  closeModalButton.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);

  newsletterForm.addEventListener("submit", handleNewsletterSubmit);

  // Add event listener for reset filters button
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "reset-filters") {
      resetFilters();
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".controls") && !e.target.closest("#filter-toggle")) {
      controlsElement.classList.remove("active");
    }
  });
}

// Setup mobile menu
function setupMobileMenu() {
  mobileToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    const icon = mobileToggle.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-times");
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      navLinks.classList.contains("active") &&
      !e.target.closest(".nav-links") &&
      !e.target.closest(".mobile-toggle")
    ) {
      navLinks.classList.remove("active");
      const icon = mobileToggle.querySelector("i");
      if (icon.classList.contains("fa-times")) {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    }
  });
}

// Set up category filter dropdown
function setupCategoryFilter() {
  const allGenres = booksData.flatMap((book) => book.genres);
  const uniqueGenres = ["all", ...new Set(allGenres)].sort();

  // Clear existing options
  categorySelect.innerHTML = "";

  // Add options ensuring "all" is selected by default
  uniqueGenres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre === "all" ? "All Categories" : genre;
    option.selected = genre === "all"; // Set "all" as selected
    categorySelect.appendChild(option);
  });
}

// Set up author filter dropdown
function setupAuthorFilter() {
  const authors = [
    "all",
    ...new Set(booksData.map((book) => book.author)),
  ].sort();

  // Clear existing options
  authorSelect.innerHTML = "";

  // Add options ensuring "all" is selected by default
  authors.forEach((author) => {
    const option = document.createElement("option");
    option.value = author;
    option.textContent = author === "all" ? "All Authors" : author;
    option.selected = author === "all"; // Set "all" as selected
    authorSelect.appendChild(option);
  });
}

// Display featured books section
function displayFeaturedBooks() {
  // Get 5 random books with high ratings (> 4) as featured if possible
  let highRatedBooks = booksData.filter((book) => book.rating > 4);
  if (highRatedBooks.length < 5) {
    // If not enough high-rated books, supplement with random books
    highRatedBooks = [
      ...highRatedBooks,
      ...booksData
        .filter((book) => book.rating <= 4)
        .sort(() => 0.5 - Math.random())
        .slice(0, 5 - highRatedBooks.length),
    ];
  }

  const featuredBooks = highRatedBooks
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);

  featuredBooksContainer.innerHTML = featuredBooks
    .map(
      (book) => `
      <div class="book-card">
        <div class="book-cover">
          <img src="${book.coverImage}" alt="${book.title}" loading="lazy">
        </div>
        <div class="book-info">
          <h3>${book.title}</h3>
          <p class="author">by ${book.author}</p>
          <span class="category-badge">${book.genres[0]}</span>
          <div class="book-footer">
            <p class="price">$${book.price.toFixed(2)}</p>
            <button class="add-to-cart-btn" data-id="${
              book.id
            }" aria-label="Add to cart">
              <i class="fas fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  // Add event listeners to the generated elements
  addFeaturedBooksEventListeners();
}

// Add event listeners to featured books
function addFeaturedBooksEventListeners() {
  featuredBooksContainer.querySelectorAll(".book-card").forEach((card) => {
    const addToCartBtn = card.querySelector(".add-to-cart-btn");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(parseInt(addToCartBtn.dataset.id));
      });
    }

    card.addEventListener("click", () => {
      const bookId = parseInt(
        card.querySelector(".add-to-cart-btn")?.dataset.id
      );
      if (bookId) {
        openBookDetails(bookId);
      }
    });
  });
}

// Filter and sort books
function filterAndSortBooks() {
  const category = categorySelect.value;
  const author = authorSelect.value;
  const maxPrice = parseInt(priceRange.value);
  const sortBy = sortOption.value;
  const searchQuery = searchInput.value.toLowerCase().trim();

  filteredBooks = booksData.filter((book) => {
    if (category !== "all" && !book.genres.includes(category)) return false;
    if (author !== "all" && book.author !== author) return false;
    if (book.price > maxPrice) return false;

    if (searchQuery) {
      return (
        book.title.toLowerCase().includes(searchQuery) ||
        book.author.toLowerCase().includes(searchQuery) ||
        book.genres.some((g) => g.toLowerCase().includes(searchQuery)) ||
        (book.description &&
          book.description.toLowerCase().includes(searchQuery))
      );
    }
    return true;
  });

  // Sort the filtered books
  sortBooks(sortBy);

  // Update book count display
  bookCountElement.textContent = filteredBooks.length;
}

// Sort books based on selected option
function sortBooks(sortBy) {
  switch (sortBy) {
    case "name-asc":
      filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "name-desc":
      filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "low-to-high":
      filteredBooks.sort((a, b) => a.price - b.price);
      break;
    case "high-to-low":
      filteredBooks.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      filteredBooks.sort((a, b) => b.year - a.year);
      break;
    case "none":
      // Default to rating if "Recommended" is selected
      filteredBooks.sort((a, b) => b.rating - a.rating);
      break;
  }
}

// Update book display with filters
function updateBookDisplay() {
  filterAndSortBooks();
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  currentPage = Math.min(currentPage, totalPages || 1);
  updatePagination(totalPages);
  displayBooks(currentPage);
}

// Display books for current page
function displayBooks(page) {
  const startIndex = (page - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const booksToDisplay = filteredBooks.slice(startIndex, endIndex);

  bookListContainer.className = `book-container ${currentView}-view`;

  if (booksToDisplay.length) {
    bookListContainer.innerHTML = booksToDisplay
      .map(
        (book) => `
        <div class="book-card">
          <div class="book-cover">
            <img src="${book.coverImage}" alt="${book.title}" loading="lazy">
          </div>
          <div class="book-info">
            <h3>${book.title}</h3>
            <p class="author">by ${book.author}</p>
            <span class="category-badge">${book.genres[0]}</span>
            <p class="summary">${
              book.description
                ? book.description.substring(0, 100) + "..."
                : "No description available."
            }</p>
            <div class="book-footer">
              <div class="pricing">
                <p class="price">$${book.price.toFixed(2)}</p>
                <button class="view-details-btn" data-id="${
                  book.id
                }" aria-label="View details">
                  <i class="fas fa-eye"></i> Details
                </button>
              </div>
              <div class="book-actions">
                <button class="add-to-cart-btn" data-id="${
                  book.id
                }" aria-label="Add to cart">
                  <i class="fas fa-cart-plus"></i> Add
                </button>
                <button class="buy-btn" data-id="${
                  book.id
                }" aria-label="Buy now">
                  <i class="fab fa-whatsapp"></i> Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  } else {
    bookListContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <p>No books found matching your criteria.</p>
        <button id="reset-filters" class="reset-btn">Reset Filters</button>
      </div>
    `;
  }

  // Add event listeners to book cards
  addBookCardEventListeners();
}

// Add event listeners to book cards
function addBookCardEventListeners() {
  bookListContainer.querySelectorAll(".book-card").forEach((card) => {
    const viewDetailsBtn = card.querySelector(".view-details-btn");
    const addToCartBtn = card.querySelector(".add-to-cart-btn");
    const buyBtn = card.querySelector(".buy-btn");

    if (viewDetailsBtn) {
      viewDetailsBtn.addEventListener("click", () => {
        openBookDetails(parseInt(viewDetailsBtn.dataset.id));
      });
    }

    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        addToCart(parseInt(addToCartBtn.dataset.id));
      });
    }

    if (buyBtn) {
      buyBtn.addEventListener("click", () => {
        const bookId = parseInt(buyBtn.dataset.id);
        const book = booksData.find((b) => b.id === bookId);
        if (book) buyNow(book);
      });
    }
  });
}

// Update pagination controls
function updatePagination(totalPages) {
  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage === totalPages || totalPages === 0;
  pageNumbersContainer.innerHTML = "";

  if (totalPages <= 5) {
    // Show all page numbers if 5 or fewer
    for (let i = 1; i <= totalPages; i++) {
      addPageNumberButton(i);
    }
  } else {
    // Show a subset of page numbers with ellipsis for many pages
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);

    // Always show first page
    if (start > 1) {
      addPageNumberButton(1);
      if (start > 2) {
        pageNumbersContainer.innerHTML +=
          '<span class="page-ellipsis">...</span>';
      }
    }

    // Show current range
    for (let i = start; i <= end; i++) {
      addPageNumberButton(i);
    }

    // Always show last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pageNumbersContainer.innerHTML +=
          '<span class="page-ellipsis">...</span>';
      }
      addPageNumberButton(totalPages);
    }
  }
}

// Add page number button to pagination
function addPageNumberButton(pageNum) {
  const pageButton = document.createElement("div");
  pageButton.classList.add("page-number");
  if (pageNum === currentPage) {
    pageButton.classList.add("active");
  }
  pageButton.textContent = pageNum;
  pageButton.addEventListener("click", () => goToPage(pageNum));
  pageNumbersContainer.appendChild(pageButton);
}

// Pagination functions
function goToPage(page) {
  currentPage = page;
  updateBookDisplay();
  window.scrollTo({
    top: bookListContainer.offsetTop - 100,
    behavior: "smooth",
  });
}

function goToPrevPage() {
  if (currentPage > 1) goToPage(currentPage - 1);
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  if (currentPage < totalPages) goToPage(currentPage + 1);
}

// Reset all filters
function resetFilters() {
  categorySelect.value = "all";
  authorSelect.value = "all";
  priceRange.value = 50;
  priceDisplay.textContent = "$0 - $50";
  sortOption.value = "none";
  searchInput.value = "";
  currentPage = 1;
  updateBookDisplay();
}

// Toggle view between grid and list
function toggleView() {
  currentView = currentView === "grid" ? "list" : "grid";
  viewToggleButton.innerHTML = `<i class="fas fa-${
    currentView === "grid" ? "th" : "list"
  }"></i>`;
  updateBookDisplay();
}

// Search functionality
function performSearch() {
  currentPage = 1; // Reset to first page when searching
  updateBookDisplay();
}

// Cart functions
function openCart() {
  cartSidebar.classList.add("active");
  cartOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
  updateCartDisplay();
}

function closeCart() {
  cartSidebar.classList.remove("active");
  cartOverlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

function addToCart(bookId) {
  const book = booksData.find((b) => b.id === bookId);
  if (!book) return;

  const existingItem = cart.find((item) => item.id === bookId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: book.id,
      title: book.title,
      coverImage: book.coverImage,
      price: book.price,
      quantity: 1,
    });
  }

  // Save cart to local storage
  saveCartToLocalStorage();

  showNotification(`${book.title} added to cart`);
  updateCartCount();
  updateCartDisplay();
}

function saveCartToLocalStorage() {
  localStorage.setItem("bookCart", JSON.stringify(cart));
}

function updateCartCount() {
  const cartCount = document.querySelector(".cart-count");
  if (cartCount) {
    cartCount.textContent = cart.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }
}

function updateCartDisplay() {
  if (cart.length) {
    cartItemsContainer.innerHTML = cart
      .map(
        (item) => `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.coverImage}" alt="${item.title}" loading="lazy">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-item-quantity">
              <button class="quantity-btn decrease" data-id="${
                item.id
              }" aria-label="Decrease quantity">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-btn increase" data-id="${
                item.id
              }" aria-label="Increase quantity">+</button>
              <button class="cart-item-remove" data-id="${
                item.id
              }" aria-label="Remove from cart">Remove</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  } else {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-cart"></i>
        <p>Your cart is empty</p>
      </div>
    `;
  }

  // Add event listeners to cart items
  addCartItemEventListeners();

  // Update cart total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalAmount.textContent = `$${total.toFixed(2)}`;

  // Update checkout button state
  checkoutButton.disabled = cart.length === 0;
}

// Add event listeners to cart items
function addCartItemEventListeners() {
  cartItemsContainer.querySelectorAll(".cart-item").forEach((item) => {
    const decreaseBtn = item.querySelector(".decrease");
    const increaseBtn = item.querySelector(".increase");
    const removeBtn = item.querySelector(".cart-item-remove");

    if (decreaseBtn) {
      decreaseBtn.addEventListener("click", () => {
        updateItemQuantity(parseInt(decreaseBtn.dataset.id), -1);
      });
    }

    if (increaseBtn) {
      increaseBtn.addEventListener("click", () => {
        updateItemQuantity(parseInt(increaseBtn.dataset.id), 1);
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        removeFromCart(parseInt(removeBtn.dataset.id));
      });
    }
  });
}

function updateItemQuantity(bookId, change) {
  const item = cart.find((i) => i.id === bookId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    removeFromCart(bookId);
  } else {
    saveCartToLocalStorage();
    updateCartCount();
    updateCartDisplay();
  }
}

function removeFromCart(bookId) {
  cart = cart.filter((item) => item.id !== bookId);
  saveCartToLocalStorage();
  updateCartCount();
  updateCartDisplay();
}

function checkout() {
  if (!cart.length) {
    showNotification("Your cart is empty!");
    return;
  }

  const orderDetails = cart
    .map(
      (item) =>
        `${item.title} (Qty: ${item.quantity}) - $${(
          item.price * item.quantity
        ).toFixed(2)}`
    )
    .join("\n");
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = `Hello, I'd like to order:\n${orderDetails}\nTotal: $${total.toFixed(
    2
  )}`;

  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    "_blank"
  );

  // Clear cart after checkout
  cart = [];
  saveCartToLocalStorage();
  updateCartCount();
  updateCartDisplay();
  closeCart();

  showNotification("Your order has been placed!");
}

// Book details modal
function openBookDetails(bookId) {
  const book = booksData.find((b) => b.id === bookId);
  if (!book) return;

  modalBookDetails.innerHTML = `
    <div class="modal-book-image">
      <img src="${book.coverImage}" alt="${book.title}" loading="lazy">
    </div>
    <div class="modal-book-info">
      <h2>${book.title}</h2>
      <p class="author">by ${book.author}</p>
      <p class="category">${book.genres.join(", ")}</p>
      <p class="description">${
        book.description || "No description available."
      }</p>
      <p>Year: ${book.year} | Pages: ${book.pages} | Rating: ${
    book.rating
  }/5</p>
      <p class="price">$${book.price.toFixed(2)}</p>
      <div class="modal-action-buttons">
        <button class="modal-add-to-cart" data-id="${
          book.id
        }" aria-label="Add to cart">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>
        <button class="modal-buy-now" data-id="${book.id}" aria-label="Buy now">
          <i class="fab fa-whatsapp"></i> Buy Now
        </button>
      </div>
    </div>
  `;

  bookModal.classList.add("active");
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";

  // Add event listeners to modal buttons
  const addToCartBtn = modalBookDetails.querySelector(".modal-add-to-cart");
  const buyNowBtn = modalBookDetails.querySelector(".modal-buy-now");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      addToCart(book.id);
    });
  }

  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      buyNow(book);
    });
  }
}

function closeModal() {
  bookModal.classList.remove("active");
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

// Buy now via WhatsApp
function buyNow(book) {
  const message = `Hello, I want to buy "${book.title}" by ${
    book.author
  } for $${book.price.toFixed(2)}. Please assist me!`;

  window.open(
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

// Notification system
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((n) => n.remove());

  document.body.appendChild(notification);

  // Apply styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #28a745;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 1001;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease forwards, fadeOut 0.3s ease 2s forwards;
  `;

  // Auto-remove after 2.5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  }, 2500);
}

// Newsletter subscription
function handleNewsletterSubmit(event) {
  event.preventDefault();
  const emailInput = newsletterForm.querySelector("input[type='email']");
  const email = emailInput.value.trim();

  if (email && validateEmail(email)) {
    showNotification("Thank you for subscribing!");
    newsletterForm.reset();
  } else {
    showNotification("Please enter a valid email address.");
    emailInput.focus();
  }
}

// Email validation function
function validateEmail(email) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// CSS for notification animation
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;
document.head.appendChild(style);

// Add error handling for page load
window.addEventListener("error", function (e) {
  console.error("Page Error:", e.message);
  // Optionally show user-friendly error
  showNotification("Something went wrong. Please refresh the page.");
});

// Start the app
document.addEventListener("DOMContentLoaded", init);
