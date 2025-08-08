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
    const coverImageURLInput = document.getElementById('coverImageURL');
    const uploadStatus = document.getElementById('uploadStatus');
    const orderRequestsTbody = document.getElementById('order-requests-tbody'); // For the new table
    
    // --- Constants ---
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = '@Ronna$161815131';
    const IMGBB_API_KEY = '86d74497d9872a20d5a4e97bfe42e9af';
    
    // --- Initial State Check: Is the admin already logged in? ---
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        showPanel();
    }
    
    // --- Login Form Handler ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (e.target.username.value === ADMIN_USER && e.target.password.value === ADMIN_PASS) {
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
        loadOrderRequests(); // Load order requests when panel is shown
    }
    
    // --- Automatic Cover Image Upload Logic ---
    coverImageFileInput.addEventListener('change', () => {
        const file = coverImageFileInput.files[0];
        if (!file) return;
        if (!IMGBB_API_KEY || IMGBB_API_KEY === 'PASTE_YOUR_API_KEY_HERE') {
            alert('Error: ImgBB API Key is not set in admin.js. Please contact the developer.');
            return;
        }
        uploadStatus.textContent = 'Uploading...';
        uploadStatus.style.color = '#555';
        coverImageFileInput.disabled = true;
        const formData = new FormData();
        formData.append('image', file);
        fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    coverImageURLInput.value = result.data.url;
                    uploadStatus.textContent = `✅ Upload successful!`;
                    uploadStatus.style.color = 'green';
                } else { throw new Error(result.error.message); }
            })
            .catch(error => {
                uploadStatus.textContent = `❌ Upload failed: ${error.message}`;
                uploadStatus.style.color = 'red';
            })
            .finally(() => { coverImageFileInput.disabled = false; });
    });
    
    // --- Main Book Form Handler ---
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!coverImageURLInput.value && !bookIdInput.value) {
            alert('Please wait for the cover image to finish uploading.');
            return;
        }
        const id = bookIdInput.value;
        const bookData = {
            id: id ? parseInt(id) : Date.now(),
            title: bookForm.title.value,
            author: bookForm.author.value,
            price: parseFloat(bookForm.price.value),
            description: bookForm.description.value,
            coverImage: coverImageURLInput.value,
            pdfLink: bookForm.pdfLink.value
        };
        let books = getBooks();
        if (id) {
            const bookToEdit = books.find(b => b.id === parseInt(id));
            if (bookData.coverImage === "") bookData.coverImage = bookToEdit.coverImage;
            books = books.map(book => book.id === parseInt(id) ? bookData : book);
        } else { books.push(bookData); }
        localStorage.setItem('books', JSON.stringify(books));
        bookForm.reset();
        uploadStatus.textContent = 'Select an image to automatically upload and get a link.';
        uploadStatus.style.color = '#555';
        formTitle.textContent = 'Add New Book';
        renderBookTable();
    });
    
    // --- Book Table Event Delegation (Edit/Delete) ---
    document.querySelector('#book-list-table').addEventListener('click', (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this book?')) {
                let books = getBooks().filter(book => book.id !== parseInt(id));
                localStorage.setItem('books', JSON.stringify(books));
                renderBookTable();
            }
        }
        if (target.classList.contains('edit-btn')) {
            const bookToEdit = getBooks().find(book => book.id === parseInt(id));
            if (bookToEdit) {
                formTitle.textContent = 'Edit Book';
                bookIdInput.value = bookToEdit.id;
                bookForm.title.value = bookToEdit.title;
                bookForm.author.value = bookToEdit.author;
                bookForm.price.value = bookToEdit.price;
                bookForm.description.value = bookToEdit.description;
                coverImageURLInput.value = bookToEdit.coverImage;
                bookForm.pdfLink.value = bookToEdit.pdfLink;
                uploadStatus.textContent = 'To change the cover, select a new image file.';
                window.scrollTo(0, 0);
            }
        }
    });
    
    // --- Render Book Table function ---
    function renderBookTable() {
        const books = getBooks();
        bookListTable.innerHTML = '';
        books.forEach(book => {
            bookListTable.innerHTML += `
                <tr>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>৳${book.price.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-secondary edit-btn" data-id="${book.id}">Edit</button>
                        <button class="btn btn-danger delete-btn" data-id="${book.id}">Delete</button>
                    </td>
                </tr>`;
        });
    }
    
    // --- NEW: Function to load and display order requests from Firebase ---
    function loadOrderRequests() {
        const ordersRef = database.ref('orders');
        ordersRef.orderByChild('status').equalTo('Pending').on('value', (snapshot) => {
            orderRequestsTbody.innerHTML = ''; // Clear old list
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const orderId = childSnapshot.key;
                    const order = childSnapshot.val();
                    orderRequestsTbody.innerHTML += `
                        <tr>
                            <td>${order.userEmail}</td>
                            <td>${order.bookTitle}</td>
                            <td>${order.trxId}</td>
                            <td>
                                <button class="btn btn-primary approve-btn" data-id="${orderId}">Approve</button>
                                <button class="btn btn-danger reject-btn" data-id="${orderId}">Reject</button>
                            </td>
                        </tr>`;
                });
            } else {
                orderRequestsTbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No pending orders.</td></tr>';
            }
        });
    }
    
    // --- NEW: Event listener for the order request table buttons ---
    orderRequestsTbody.addEventListener('click', (e) => {
        const orderId = e.target.dataset.id;
        if (!orderId) return;
        
        if (e.target.classList.contains('approve-btn')) {
            // Update the status in Firebase
            database.ref('orders/' + orderId).update({ status: 'Approved' })
                .then(() => console.log(`Order ${orderId} approved.`))
                .catch(err => console.error("Could not approve order:", err));
        }
        
        if (e.target.classList.contains('reject-btn')) {
            // Update the status in Firebase
            database.ref('orders/' + orderId).update({ status: 'Rejected' })
                .then(() => console.log(`Order ${orderId} rejected.`))
                .catch(err => console.error("Could not reject order:", err));
        }
    });
});