const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');


if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, role: 'user', isActive: true })
            });

            const data = await response.json();

            if (response.ok) {
                registerMessage.style.color = 'green';
                registerMessage.textContent = 'Registration successful! Redirecting to login...';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                registerMessage.style.color = 'red';
                registerMessage.textContent = data?.message || 'Registration failed!';
            }
        } catch (error) {
            console.error('Error registering:', error);
            registerMessage.style.color = 'red';
            registerMessage.textContent = 'Failed to register. Try again later.';
        }
    });
}


const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');


if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (!data.user.isActive) {
                    loginMessage.style.color = 'red';
                    loginMessage.textContent = 'Your account has been banned. Contact support.';
                    return;
                }

                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.accessToken);

                loginMessage.style.color = 'green';
                loginMessage.textContent = 'Login successful! Redirecting...';

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                loginMessage.style.color = 'red';
                loginMessage.textContent = data?.message || 'Invalid email or password!';
            }
        } catch (error) {
            console.error('Error logging in:', error);
            loginMessage.style.color = 'red';
            loginMessage.textContent = 'Failed to login. Try again later.';
        }
    });
}
