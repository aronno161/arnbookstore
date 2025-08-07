document.addEventListener('DOMContentLoaded', () => {
    setupHeader();
    setupFooter();
});

function setupHeader() {
    const header = document.querySelector('header');
    if (!header) return;
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    let navLinks = `
        <li><a href="/index.html">Home</a></li>
        <li><a href="/books.html">Books</a></li>
        <li><a href="/admin.html">Admin</a></li>
    `;

    if (currentUser) {
        navLinks += `
            <li style="color: #555; font-weight: 500;">Hi, ${currentUser.name.split(' ')[0]}</li>
            <li><a href="#" id="logout-btn" class="btn">Logout</a></li>
        `;
    } else {
        navLinks += `
            <li><a href="/signin.html" class="btn">Sign In</a></li>
        `;
    }

    header.innerHTML = `
        <div class="container">
            <a href="/index.html" class="logo">ARN Book Store</a>
        </div>
        <button class="hamburger-menu" aria-label="Toggle navigation">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <nav>
            <ul>
                ${navLinks}
            </ul>
        </nav>
    `;
    
    const nav = document.querySelector('nav');
    const hamburger = document.querySelector('.hamburger-menu');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            hamburger.classList.toggle('active');
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            alert('You have been logged out.');
            window.location.href = '/index.html';
        });
    }
}

function setupFooter() {
    const footer = document.querySelector('footer');
    if (footer) {
        footer.innerHTML = `
            <div class="container">
                <p>&copy; ${new Date().getFullYear()} ARN Book Store. All Rights Reserved.</p>
            </div>
        `;
    }
}

function getBooks() {
    const books = localStorage.getItem('books');
    if (books) {
        return JSON.parse(books);
    } else {
        const sampleBooks = [
            {
                id: 1,
                title: 'The Midnight Library',
                author: 'Matt Haig',
                price: 15.99,
                description: 'A dazzling novel about all the choices that go into a life well lived. Between life and death there is a library...',
                coverImage: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1602190253l/52578297.jpg',
                pdfLink: '/ebooks/sample-ebook.pdf' // CORRECTED PATH
            },
            {
                id: 2,
                title: 'Atomic Habits',
                author: 'James Clear',
                price: 12.50,
                description: 'An easy and proven way to build good habits and break bad ones...',
                coverImage: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1535115320l/40121378._SY475_.jpg',
                pdfLink: '/ebooks/sample-ebook.pdf' // CORRECTED PATH
            },
        ];
        localStorage.setItem('books', JSON.stringify(sampleBooks));
        return sampleBooks;
    }
}
