document.addEventListener('DOMContentLoaded', () => {
    const ordersList = document.getElementById('orders-list');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        ordersList.innerHTML = '<h3>Please <a href="/signin.html">sign in</a> to view your orders.</h3>';
        return;
    }
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || typeof database === 'undefined') {
        ordersList.innerHTML = '<h3 style="color:red;">Error: Cannot connect to the database.</h3>';
        console.error("Firebase is not initialized.");
        return;
    }
    
    const ordersRef = database.ref('orders');
    
    // This query now works because you added the index in the Firebase Rules
    ordersRef.orderByChild('userEmail').equalTo(currentUser.email).on('value', (snapshot) => {
        ordersList.innerHTML = ''; // Clear the "Loading..." message
        
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const order = childSnapshot.val();
                
                const orderCard = document.createElement('div');
                orderCard.className = 'order-card';
                
                let statusInfo;
                if (order.status === 'Approved') {
                    statusInfo = `<a href="${order.bookPdfLink}" class="btn btn-primary" download>Download eBook</a>`;
                } else if (order.status === 'Rejected') {
                    statusInfo = `<p>Status: <strong style="color: red;">${order.status}</strong></g></p>`;
                } else { // 'Pending'
                    statusInfo = `<p>Status: <strong style="color: orange;">${order.status}</strong> (Under Review)</p>`;
                }
                
                orderCard.innerHTML = `
                    <h4>${order.bookTitle}</h4>
                    <p><strong>Transaction ID:</strong> ${order.trxId}</p>
                    ${statusInfo}
                `;
                ordersList.appendChild(orderCard);
            });
        } else {
            // This message now correctly displays if the user has no orders
            ordersList.innerHTML = '<p>You have not placed any orders yet.</p>';
        }
    }, (error) => {
        // This will catch any permission errors if they happen
        console.error("Firebase read failed: ", error);
        ordersList.innerHTML = '<p style="color:red;">Error: Could not retrieve your orders. Please check permissions.</p>';
    });
});