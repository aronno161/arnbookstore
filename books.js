document.addEventListener('DOMContentLoaded', () => {
    const books = getBooks();
    
    // --- Helper function to check login state ---
    const isUserLoggedIn = () => sessionStorage.getItem('currentUser') !== null;
    
    // --- Renders book cards (no changes here) ---
    function renderBookGrid(books, container) {
        container.innerHTML = '';
        if (books.length === 0) {
            container.innerHTML = '<p>No books found.</p>';
            return;
        }
        books.forEach(book => {
            const bookCard = `
                <div class="book-card">
                    <a href="/book.html?id=${book.id}" class="book-details-link">
                        <img src="${book.coverImage}" alt="${book.title}">
                    </a>
                    <div class="book-card-content">
                        <h3>${book.title}</h3>
                        <p>by ${book.author}</p>
                        <p class="price">৳${book.price.toFixed(2)}</p>
                        <!-- The link now has a class for our JS to find -->
                        <a href="/book.html?id=${book.id}" class="btn btn-secondary book-details-link">View Details</a>
                    </div>
                </div>
            `;
            container.innerHTML += bookCard;
        });
    }
    
    // --- Logic for index.html (Featured Books) ---
    const featuredBooksContainer = document.getElementById('featured-books-grid');
    if (featuredBooksContainer) {
        renderBookGrid(books.slice(0, 3), featuredBooksContainer);
    }
    
    // --- Logic for books.html (All Books) ---
    const allBooksContainer = document.getElementById('all-books-grid');
    if (allBooksContainer) {
        renderBookGrid(books, allBooksContainer);
        // Search filter remains the same
        document.getElementById('search-input').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm) || b.author.toLowerCase().includes(searchTerm));
            renderBookGrid(filteredBooks, allBooksContainer);
        });
    }
    
    // --- NEW: Event Delegation to handle all "View Details" clicks ---
    document.body.addEventListener('click', (e) => {
        // Check if a "book-details-link" was clicked
        if (e.target.matches('.book-details-link')) {
            e.preventDefault(); // Stop the link from navigating immediately
            
            if (isUserLoggedIn()) {
                // If logged in, proceed to the link's destination
                window.location.href = e.target.href;
            } else {
                // If not logged in, show an alert and redirect to sign in
                alert('Please sign in to view book details and make a purchase.');
                window.location.href = '/signin.html';
            }
        }
    });
});