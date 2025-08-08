document.addEventListener('DOMContentLoaded', () => {
    const paymentContainer = document.querySelector('.payment-container');
    const isUserLoggedIn = sessionStorage.getItem('currentUser') !== null;
    
    if (!isUserLoggedIn) {
        paymentContainer.innerHTML = `
            <h1 class="section-title">Access Denied</h1>
            <p style="text-align:center;">You must be <a href="/signin.html">signed in</a> to access the payment page.</p>
        `;
        return;
    }
    
    // --- YOUR DISCORD DETAILS ARE NOW INTEGRATED ---
    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1403276663478812763/QjdRIwnM0gduzyF1fxYHK-CMNOhfciCCSO9-cVsBNzkaAYaBKoYr0T_esAevTL0lYadY';
    const YOUR_DISCORD_USER_ID = '1403272889829953576';
    
    const params = new URLSearchParams(window.location.search);
    const bookId = parseInt(params.get('id'));
    
    if (typeof firebase === 'undefined' || typeof database === 'undefined') {
        paymentContainer.innerHTML = '<h1 class="section-title">Error: Could not connect to the database.</h1>';
        return;
    }
    
    const books = getBooks();
    const book = books.find(b => b.id === bookId);
    
    if (book) {
        const bookInfoContainer = document.getElementById('selected-book-info');
        const instructionsSection = document.getElementById('manual-payment-instructions');
        const trxIdFormSection = document.getElementById('trxid-form-section');
        const trxIdForm = document.getElementById('trxid-form');
        const proceedBtn = document.getElementById('proceed-to-verify-btn');
        const submitBtn = trxIdForm.querySelector('button[type="submit"]');
        
        bookInfoContainer.innerHTML = `
            <h2>${book.title}</h2>
            <p>by ${book.author}</p>
            <h3>Amount to Send: ৳${book.price.toFixed(2)} BDT</h3>
        `;
        
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.number).then(() => {
                    btn.textContent = 'Copied!';
                    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
                });
            });
        });
        
        proceedBtn.addEventListener('click', () => {
            instructionsSection.style.display = 'none';
            trxIdFormSection.style.display = 'block';
        });
        
        trxIdForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            const trxIdInput = document.getElementById('trxid');
            const userEmailInput = document.getElementById('email');
            
            if (trxIdInput.value.trim().length < 5) {
                alert('Please enter a valid Transaction ID.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit for Verification';
                return;
            }
            
            const newOrder = {
                userEmail: userEmailInput.value.trim(),
                bookId: book.id,
                bookTitle: book.title,
                bookPrice: book.price,
                bookPdfLink: book.pdfLink,
                trxId: trxIdInput.value.trim(),
                status: 'Pending',
                timestamp: new Date().toISOString()
            };
            
            // 1. Save the new order to Firebase
            database.ref('orders').push(newOrder)
                .then(() => {
                    // 2. If Firebase save is successful, send notification to Discord
                    sendDiscordNotification(newOrder);
                    
                    // 3. Show confirmation message to the user
                    paymentContainer.innerHTML = `
                        <h1 class="section-title">✅ Order Submitted!</h1>
                        <p style="text-align:center;">
                            Thank you! Your order is now pending approval.
                            <br><br>
                            You can check its status in the 
                            <a href="/orders.html"><strong>Your Orders</strong></a> section.
                        </p>
                    `;
                })
                .catch((error) => {
                    alert('Error: Could not submit your order. Please try again.');
                    console.error('Firebase Error:', error);
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit for Verification';
                });
        });
        
    } else {
        paymentContainer.innerHTML = '<h1 class="section-title">Error: Book not found.</h1>';
    }
    
    // --- Function to send a formatted message to Discord ---
    function sendDiscordNotification(order) {
        if (!DISCORD_WEBHOOK_URL) {
            console.warn('Discord Webhook URL is not set.');
            return;
        }
        
        const discordPayload = {
            // This content field will create a PING notification for you
            content: `<@${YOUR_DISCORD_USER_ID}>, you have a new order!`,
            username: "ARN Book Store Bot",
            avatar_url: "https://i.imgur.com/4M34hi2.png",
            embeds: [{
                title: "🔔 New Order Request!",
                color: 16761095, // Orange
                fields: [
                    { name: "Book Title", value: order.bookTitle, inline: true },
                    { name: "Price", value: `৳${order.bookPrice.toFixed(2)}`, inline: true },
                    { name: "Customer Email", value: order.userEmail, inline: false },
                    { name: "Transaction ID", value: `\`${order.trxId}\``, inline: false }
                ],
                footer: { text: `Order submitted at ${new Date(order.timestamp).toLocaleString()}` }
            }]
        };
        
        fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordPayload)
        }).catch(error => {
            console.error('Failed to send Discord notification:', error);
        });
    }
});