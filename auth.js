document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const signinForm = document.getElementById('signin-form');

    // --- Helper function to get users from localStorage ---
    const getUsers = () => {
        return JSON.parse(localStorage.getItem('users')) || [];
    };

    // --- Sign Up Logic ---
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value; // In a real app, hash this!

            const users = getUsers();

            // Check if user already exists
            const userExists = users.some(user => user.email === email);
            if (userExists) {
                alert('An account with this email already exists.');
                return;
            }

            // Add new user
            users.push({ name, email, password });
            localStorage.setItem('users', JSON.stringify(users));

            alert('Sign up successful! Please sign in.');
            window.location.href = 'signin.html';
        });
    }

    // --- Sign In Logic ---
    if (signinForm) {
        signinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Use sessionStorage to keep user logged in for the session
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                alert(`Welcome back, ${user.name}!`);
                window.location.href = 'index.html';
            } else {
                alert('Invalid email or password.');
            }
        });
    }
});