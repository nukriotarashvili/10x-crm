document.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('crm_session'));
    if (!session) return;

    let users = JSON.parse(localStorage.getItem('crm_users')) || [];
    let currentUser = users.find(u => u.email === session.email);

    if (!currentUser) return;

    const profileInfoBlock = document.getElementById('profileInfoBlock');
    const editProfilePanel = document.getElementById('editProfilePanel');
    const changePasswordPanel = document.getElementById('changePasswordPanel');

    const renderProfileHeader = () => {
        const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        profileInfoBlock.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">${initials}</div>
                <div>
                    <h2>${currentUser.fullName}</h2>
                    <p class="profile-meta">${currentUser.email} • ${currentUser.company || ''}</p>
                    <p class="profile-since">Member since ${new Date(currentUser.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `;
    };
    renderProfileHeader();

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

    editProfilePanel.innerHTML = `
        <h3>Edit Profile</h3>
        <form id="editProfileForm" class="profile-form" novalidate>
            <div class="form-group">
                <input type="text" id="editName" value="${currentUser.fullName}" placeholder="Full Name" required>
            </div>
            <div class="form-group">
                <input type="text" id="editCompany" value="${currentUser.company || ''}" placeholder="Company">
            </div>
            <button type="submit" class="btn-primary">Save Changes</button>
        </form>
    `;

    document.getElementById('editProfileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors(e.target);
        const nameInput = document.getElementById('editName');
        const companyInput = document.getElementById('editCompany');

        if (nameInput.value.trim().length < 3) {
            showError(nameInput, 'Full name must be at least 3 characters');
            return;
        }

        currentUser.fullName = nameInput.value.trim();
        currentUser.company = companyInput.value.trim();

        const userIndex = users.findIndex(u => u.id === currentUser.id);
        users[userIndex] = currentUser;
        localStorage.setItem('crm_users', JSON.stringify(users));

        renderProfileHeader();
        window.showToast('Profile updated ✓', 'success');
    });

    changePasswordPanel.innerHTML = `
        <h3>Change Password</h3>
        <form id="changePasswordForm" class="profile-form" novalidate>
            <div class="form-group">
                <input type="password" id="currentPass" placeholder="Current Password" required>
            </div>
            <div class="form-group">
                <input type="password" id="newPass" placeholder="New Password" required>
            </div>
            <div class="form-group">
                <input type="password" id="confirmNewPass" placeholder="Confirm New Password" required>
            </div>
            <button type="submit" class="btn-primary">Change Password</button>
        </form>
    `;

    document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors(e.target);

        const currentInput = document.getElementById('currentPass');
        const newInput = document.getElementById('newPass');
        const confirmInput = document.getElementById('confirmNewPass');

        let isValid = true;

        if (currentInput.value !== currentUser.password) {
            showError(currentInput, 'Current password is incorrect');
            isValid = false;
        }

        const passRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
        if (!passRegex.test(newInput.value)) {
            showError(newInput, 'Password must be at least 8 characters and contain a letter and a number');
            isValid = false;
        } else if (newInput.value === currentInput.value) {
            showError(newInput, 'New password must be different from the current one');
            isValid = false;
        }

        if (newInput.value !== confirmInput.value) {
            showError(confirmInput, 'Passwords do not match');
            isValid = false;
        }

        if (!isValid) return;

        currentUser.password = newInput.value;
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        users[userIndex] = currentUser;
        localStorage.setItem('crm_users', JSON.stringify(users));

        e.target.reset();
        window.showToast('Password changed ✓', 'success');
    });

    document.getElementById('resetDataBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all CRM data? This will clear all clients and reload the default API data.')) {
            localStorage.removeItem('crm_clients');
            window.location.href = 'clients.html';
        }
    });
});
