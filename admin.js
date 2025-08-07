document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const loginSection = document.getElementById('admin-login');
    const panelSection = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const bookForm = document.getElementById('book-form');
    const bookListTable = document.getElementById('book-list-table');
    const formTitle = document.getElementById('form-title');
    const bookIdInput = document.getElementById('book-id');
    const coverImageFileInput = document.getElementById('coverImageFile');
    const pdfFileInput = document.getElementById('pdfFile');
    const coverPreview = document.getElementById('cover-preview');
    
    // --- Constants ---
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'password123';
    
    // --- Initial State Check: Is the admin already logged in? ---
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        showPanel();
    }
    
    // --- Login Form Handler ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        if (username === ADMIN_USER && password === ADMIN_PASS) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            showPanel();
        } else {
            alert('Invalid credentials');
        }
    });
    
    // --- Helper function to display the admin panel ---
    function showPanel() {
        loginSection.style.display = 'none';
        panelSection.style.display = 'block';
        renderBookTable();
    }
    
    // --- Helper function to read a file as a Base64 Data URL ---
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    // --- Event listener for cover image preview ---
    coverImageFileInput.addEventListener('change', () => {
        const file = coverImageFileInput.files[0];
        if (file) {
            readFileAsDataURL(file).then(dataUrl => {
                coverPreview.src = dataUrl;
                coverPreview.style.display = 'block';
            }).catch(error => {
                console.error("Error reading image file:", error);
                coverPreview.style.display = 'none';
            });
        }
    });
    
    // --- Main Book Form Handler (for Adding and Editing) ---
    bookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = bookIdInput.value;
        const isEditing = !!id;
        
        const coverFile = coverImageFileInput.files[0];
        const pdfFile = pdfFileInput.files[0];
        
        // --- UPDATED FILE SIZE LIMITS ---
        const MAX_IMAGE_SIZE_MB = 5;
        const MAX_PDF_SIZE_MB = 35; // Updated to 35MB
        const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
        const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;
        
        // Strict file size validation
        if (coverFile && coverFile.size > MAX_IMAGE_SIZE_BYTES) {
            alert(`Error: The cover image must be under ${MAX_IMAGE_SIZE_MB}MB.`);
            return;
        }
        if (pdfFile && pdfFile.size > MAX_PDF_SIZE_BYTES) {
            alert(`Error: The PDF file must be under ${MAX_PDF_SIZE_MB}MB.`);
            return;
        }
        
        if (!isEditing && (!coverFile || !pdfFile)) {
            alert('Please select both a cover image and a PDF file.');
            return;
        }
        
        try {
            if (pdfFile && pdfFile.size > 2 * 1024 * 1024) {
                if (!confirm(`Warning: The selected PDF is large (${(pdfFile.size / 1024 / 1024).toFixed(1)}MB) and may slow down the browser. Continue?`)) {
                    return;
                }
            }
            
            let coverImageData = null;
            if (coverFile) {
                coverImageData = await readFileAsDataURL(coverFile);
            }
            
            let pdfData = null;
            if (pdfFile) {
                pdfData = await readFileAsDataURL(pdfFile);
            }
            
            let books = getBooks();
            let bookData = {
                title: e.target.title.value,
                author: e.target.author.value,
                price: parseFloat(e.target.price.value),
                description: e.target.description.value,
            };
            
            if (isEditing) {
                const existingBook = books.find(b => b.id === parseInt(id));
                bookData.id = parseInt(id);
                bookData.coverImage = coverImageData || existingBook.coverImage;
                bookData.pdfLink = pdfData || existingBook.pdfLink;
                
                books = books.map(b => b.id === parseInt(id) ? bookData : b);
            } else {
                bookData.id = Date.now();
                bookData.coverImage = coverImageData;
                bookData.pdfLink = pdfData;
                books.push(bookData);
            }
            
            // --- NEW: Specific try...catch for localStorage to handle QuotaExceededError ---
            try {
                localStorage.setItem('books', JSON.stringify(books));
            } catch (storageError) {
                // This error is almost always because the storage limit was exceeded.
                if (storageError.name === 'QuotaExceededError' || storageError.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    alert('Error: Could not save book. The selected files are too large for the browser\'s storage limit (typically 5-10MB). Please use smaller files.');
                } else {
                    alert('An unexpected error occurred while saving the book.');
                }
                console.error('Storage Error:', storageError);
                return; // Stop execution
            }
            
            // This code only runs if saving was successful
            bookForm.reset();
            coverPreview.style.display = 'none';
            bookIdInput.value = '';
            formTitle.textContent = 'Add New Book';
            coverImageFileInput.required = true;
            pdfFileInput.required = true;
            
            renderBookTable();
            
        } catch (fileReadError) {
            // This outer catch block will now mostly handle errors from the FileReader itself.
            console.error('File Reading Error:', fileReadError);
            alert('There was an error reading the files. Please ensure they are not corrupted and try again.');
        }
    });
    
    // --- Table Event Delegation for Edit and Delete buttons (Unchanged) ---
    document.querySelector('.admin-book-table').addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        
        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this book?')) {
                let books = getBooks();
                books = books.filter(book => book.id !== parseInt(id));
                localStorage.setItem('books', JSON.stringify(books));
                renderBookTable();
            }
        }
        
        if (target.classList.contains('edit-btn')) {
            const books = getBooks();
            const bookToEdit = books.find(book => book.id === parseInt(id));
            if (bookToEdit) {
                formTitle.textContent = 'Edit Book';
                bookIdInput.value = bookToEdit.id;
                bookForm.title.value = bookToEdit.title;
                bookForm.author.value = bookToEdit.author;
                bookForm.price.value = bookToEdit.price;
                bookForm.description.value = bookToEdit.description;
                coverPreview.src = bookToEdit.coverImage;
                coverPreview.style.display = 'block';
                coverImageFileInput.required = false;
                pdfFileInput.required = false;
                window.scrollTo(0, 0);
            }
        }
    });
    
    // --- Function to render the list of books in the table (Unchanged) ---
    function renderBookTable() {
        const books = getBooks();
        bookListTable.innerHTML = '';
        books.forEach(book => {
            const row = `
                <tr>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>$${book.price.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-secondary edit-btn" data-id="${book.id}">Edit</button>
                        <button class="btn btn-danger delete-btn" data-id="${book.id}">Delete</button>
                    </td>
                </tr>
            `;
            bookListTable.innerHTML += row;
        });
    }
});