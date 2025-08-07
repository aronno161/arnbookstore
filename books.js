document.addEventListener('DOMContentLoaded', () => {
    const books = getBooks();
    
    // For index.html (Featured Books)
    const featuredBooksContainer = document.getElementById('featured-books-grid');
    if (featuredBooksContainer) {
        const featuredBooks = books.slice(0, 3); // Get top 3
        renderBookGrid(featuredBooks, featuredBooksContainer);
    }

    // For books.html (All Books)
    const allBooksContainer = document.getElementById('all-books-grid');
    const searchInput = document.getElementById('search-input');
    if (allBooksContainer) {
        renderBookGrid(books, allBooksContainer);

        // JS-based search filter
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredBooks = books.filter(book => 
                book.title.toLowerCase().includes(searchTerm) || 
                book.author.toLowerCase().includes(searchTerm)
            );
            renderBookGrid(filteredBooks, allBooksContainer);
        });
    }
});

function renderBookGrid(books, container) {
    container.innerHTML = '';
    if (books.length === 0) {
        container.innerHTML = '<p>No books found.</p>';
        return;
    }
    books.forEach(book => {
        const bookCard = `
            <div class="book-card">
                <a href="book.html?id=${book.id}">
                    <img src="${book.coverImage}" alt="${book.title}">
                </a>
                <div class="book-card-content">
                    <h3>${book.title}</h3>
                    <p>by ${book.author}</p>
                    <p class="price">$${book.price.toFixed(2)}</p>
                    <a href="book.html?id=${book.id}" class="btn btn-secondary">View Details</a>
                </div>
            </div>
        `;
        container.innerHTML += bookCard;
    });
}