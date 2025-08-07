document.addEventListener('DOMContentLoaded', () => {
    const bookInfoContainer = document.getElementById('selected-book-info');
    const paymentWidget = document.getElementById('ruoantorpay-widget');
    const paymentSuccessContainer = document.getElementById('payment-success');

    const params = new URLSearchParams(window.location.search);
    const bookId = parseInt(params.get('id'));

    const books = getBooks();
    const book = books.find(b => b.id === bookId);

    if (book) {
        // Display book info
        bookInfoContainer.innerHTML = `
            <h2>${book.title}</h2>
            <p>by ${book.author}</p>
            <h3>Price: $${book.price.toFixed(2)}</h3>
        `;

        // Simulate RuoAntorPay integration
        paymentWidget.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const method = e.target.textContent;
                paymentWidget.innerHTML = `<p>Processing payment with ${method}... Please wait.</p>`;

                // Simulate a 3-second payment processing time
                setTimeout(() => {
                    paymentWidget.style.display = 'none';
                    paymentSuccessContainer.style.display = 'block';
                    paymentSuccessContainer.innerHTML = `
                        <h3>✅ Payment Successful!</h3>
                        <p>Thank you for your purchase. You can now download your eBook.</p>
                        <a href="${book.pdfLink}" class="btn btn-primary" download>Download "${book.title}"</a>
                    `;
                }, 3000);
            }
        });

    } else {
        bookInfoContainer.innerHTML = '<p>Book not found. Please go back to the book list.</p>';
        paymentWidget.style.display = 'none';
    }
});