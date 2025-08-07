// --- Wait for the DOM to be fully loaded before running scripts ---
document.addEventListener('DOMContentLoaded', () => {
    // Function to inject the header and set up its interactive elements
    setupHeader();

    // Function to inject the footer
    setupFooter();
});


// --- Dynamic Header Setup ---
function setupHeader() {
    const header = document.querySelector('header');
    if (!header) return; // Exit if no header element found on the page

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

    // 1. Define Navigation Links based on Login State
    let navLinks = `
        <li><a href="index.html">Home</a></li>
        <li><a href="books.html">Books</a></li>
        <li><a href="admin.html">Admin</a></li>
    `;

    if (currentUser) {
        // If a user is logged in, show their name and a logout button
        navLinks += `
            <li style="color: #555; font-weight: 500;">Hi, ${currentUser.name.split(' ')[0]}</li>
            <li><a href="#" id="logout-btn" class="btn">Logout</a></li>
        `;
    } else {
        // If no user is logged in, show the sign-in button
        navLinks += `
            <li><a href="signin.html" class="btn">Sign In</a></li>
        `;
    }

    // 2. Inject the Complete Header HTML structure
    header.innerHTML = `
        <div class="container">
            <a href="index.html" class="logo">ARN Book Store</a>
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
    
    // 3. Add Event Listeners for the interactive elements we just created
    const nav = document.querySelector('nav');
    const hamburger = document.querySelector('.hamburger-menu');

    // Event listener for the hamburger menu button
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');
            hamburger.classList.toggle('active');
        });
    }

    // Event listener for the logout button (it only exists if a user is logged in)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            alert('You have been logged out.');
            window.location.href = 'index.html'; // Redirect to home page
        });
    }
}


// --- Footer Setup ---
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


// --- Shared Book Data Management ---
// This function can be called by any other script (books.js, admin.js, etc.)
function getBooks() {
    const books = localStorage.getItem('books');
    if (books) {
        // If books exist in localStorage, parse and return them
        return JSON.parse(books);
    } else {
        // If localStorage is empty, create sample data and store it
        const sampleBooks = [
            {
                id: 1,
                title: 'The Midnight Library',
                author: 'Matt Haig',
                price: 15.99,
                description: 'A dazzling novel about all the choices that go into a life well lived. Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.',
                coverImage: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1602190253l/52578297.jpg',
                pdfLink: 'ebooks/sample-ebook.pdf' // Relative path
            },
            {
                id: 2,
                title: 'Atomic Habits',
                author: 'James Clear',
                price: 12.50,
                description: 'An easy and proven way to build good habits and break bad ones. Atomic Habits will reshape the way you think about progress and success, and give you the tools and strategies you need to transform your habits.',
                coverImage: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1535115320l/40121378._SY475_.jpg',
                pdfLink: 'ebooks/sample-ebook.pdf'
            },
            {
                id: 3,
                title: 'The Psychology of Money',
                author: 'Morgan Housel',
                price: 18.00,
                description: 'Timeless lessons on wealth, greed, and happiness. Doing well with money isn’t necessarily about what you know. It’s about how you behave. And behavior is hard to teach, even to really smart people.',
                coverImage: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1588636942l/41881472.jpg',
                pdfLink: 'ebooks/sample-ebook.pdf'
            },
             {
                id: 4,
                title: 'Project Hail Mary',
                author: 'Andy Weir',
                price: 22.99,
                description: 'A lone astronaut. An impossible mission. An ally he never imagined. Project Hail Mary is a tale of discovery, speculation, and survival to rival The Martian—while taking us to places it never dreamed of going.',
                coverImage: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1597950553l/54493401.jpg',
                pdfLink: 'ebooks/sample-ebook.pdf'
            }
        ];
        // Save the sample data to localStorage for future visits
        localStorage.setItem('books', JSON.stringify(sampleBooks));
        return sampleBooks;
    }
}