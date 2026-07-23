document.addEventListener('DOMContentLoaded', () => {
    const session = JSON.parse(localStorage.getItem('crm_session'));
    if (!session) return;

    let users = JSON.parse(localStorage.getItem('crm_users')) || [];
    let currentUser = users.find(u => u.email === session.email);

    if (!currentUser) return;

    // P5.1 - პროფილის ინფორმაციის რენდერი
    const profileInfoBlock = document.getElementById('profileInfoBlock');
    
    const renderProfileHeader = () => {
        const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        profileInfoBlock.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1.5rem;">
                <div style="width: 60px; height: 60px; background: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold;">
                    ${initials}
                </div>
                <div>
                    <h2>${currentUser.fullName}</h2>
                    <p style="color: var(--text-secondary);">${currentUser.email} • ${currentUser.company || ''}</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem; color: var(--text-secondary);">Member since ${new Date(currentUser.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        `;
    };
    renderProfileHeader();

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

    // ფორმების ინექცია DOM-ში (Skeletons-ის ნაცვლად)
    const formsContainer = document.querySelectorAll('.panel');
    
    // Edit Profile (P5.2)
    formsContainer[1].innerHTML = `
        <h3>Edit Profile</h3>
        <form id="editProfileForm" style="margin-top: 1rem;" novalidate>
            <div style="margin-bottom: 1rem;">
                <input type="text" id="editName" value="${currentUser.fullName}" placeholder="Full Name" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <input type="text" id="editCompany" value="${currentUser.company || ''}" placeholder="Company" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px;">
            </div>
            <button type="submit" style="padding: 0.75rem 1.5rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">Save Changes</button>
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

    // Change Password (P5.3)
    formsContainer[2].innerHTML = `
        <h3>Change Password</h3>
        <form id="changePasswordForm" style="margin-top: 1rem;" novalidate>
            <div style="margin-bottom: 1rem;">
                <input type="password" id="currentPass" placeholder="Current Password" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <input type="password" id="newPass" placeholder="New Password" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px;" required>
            </div>
            <div style="margin-bottom: 1rem;">
                <input type="password" id="confirmNewPass" placeholder="Confirm New Password" style="width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px;" required>
            </div>
            <button type="submit" style="padding: 0.75rem 1.5rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">Change Password</button>
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

        if (isValid) {
            currentUser.password = newInput.value;
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            users[userIndex] = currentUser;
            localStorage.setItem('crm_users', JSON.stringify(users));
            
            e.target.reset();
            window.showToast('Password changed ✓', 'success');
        }
    });

    // P5.4 - Reset CRM Data
    const resetDataBtn = document.getElementById('resetDataBtn');
    resetDataBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all CRM data? This will clear all clients and reload the default API data.')) {
            localStorage.removeItem('crm_clients');
            window.location.href = 'clients.html'; // გადავამისამართოთ clients.html-ზე, სადაც თავიდან ჩაიტვირთება 
        }
    });
});