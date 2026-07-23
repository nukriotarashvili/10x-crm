document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // ველის შეცდომის ჩვენება (P0.4)
    const showError = (input, message) => {
        input.classList.add('input-error');
        let errorDisplay = input.nextElementSibling;
        if (!errorDisplay || !errorDisplay.classList.contains('error-text')) {
            errorDisplay = document.createElement('span');
            errorDisplay.className = 'error-text';
            input.parentNode.insertBefore(errorDisplay, input.nextSibling);
        }
        errorDisplay.textContent = message;
    };

    const clearErrors = (form) => {
        form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        form.querySelectorAll('.error-text').forEach(el => el.remove());
    };

    // ბონუსი: ველში ჩაწერისას ცოცხლად გასუფთავება
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('input-error');
            const next = this.nextElementSibling;
            if (next && next.classList.contains('error-text')) {
                next.remove();
            }
        });
    });

    let users = JSON.parse(localStorage.getItem('crm_users')) || [];

    // SIGN UP LOGIC (P1)
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors(signupForm);
            let isValid = true;

            const nameInput = document.getElementById('signupName');
            const emailInput = document.getElementById('signupEmail');
            const companyInput = document.getElementById('signupCompany');
            const passwordInput = document.getElementById('signupPassword');
            const confirmPasswordInput = document.getElementById('signupConfirmPassword');

            const name = nameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // ვალიდაციის წესები P1.2
            if (name.length < 3) {
                showError(nameInput, 'Full name must be at least 3 characters');
                isValid = false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            } else if (users.some(u => u.email === email)) {
                showError(emailInput, 'An account with this email already exists');
                isValid = false;
            }

            const passRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
            if (!passRegex.test(password)) {
                showError(passwordInput, 'Password must be at least 8 characters and contain a letter and a number');
                isValid = false;
            }

            if (password !== confirmPassword || password === '') {
                showError(confirmPasswordInput, 'Passwords do not match');
                isValid = false;
            }

            // P1.3 წარმატებული რეგისტრაცია
            if (isValid) {
                const newUser = {
                    id: Date.now(),
                    fullName: name,
                    email: email,
                    company: companyInput.value.trim(),
                    password: password, 
                    createdAt: new Date().toISOString()
                };
                users.push(newUser);
                localStorage.setItem('crm_users', JSON.stringify(users));
                
                window.showToast('Account created successfully! Please log in.', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        });
    }

    // LOGIN LOGIC (P2)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors(loginForm);
            
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            
            let isValid = true;
            
            if(!email) {
                showError(emailInput, 'Email is required');
                isValid = false;
            }
            if(!password) {
                showError(passwordInput, 'Password is required');
                isValid = false;
            }

            if(isValid) {
                // ვეძებთ მომხმარებელს და ვადარებთ პაროლს P2.2
                const user = users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    const session = {
                        userId: user.id,
                        email: user.email,
                        loginAt: new Date().toISOString()
                    };
                    localStorage.setItem('crm_session', JSON.stringify(session));
                    window.location.href = 'dashboard.html';
                } else {
                    // განზოგადებული შეცდომა უსაფრთხოებისთვის (P2.2)
                    let genError = loginForm.querySelector('.generic-error');
                    if(!genError) {
                        genError = document.createElement('div');
                        genError.className = 'error-text generic-error';
                        genError.style.textAlign = 'center';
                        genError.style.marginBottom = '15px';
                        loginForm.insertBefore(genError, loginForm.querySelector('button'));
                    }
                    genError.textContent = 'Invalid email or password';
                }
            }
        });
    }
});