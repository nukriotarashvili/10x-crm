document.addEventListener('DOMContentLoaded', () => {
    let clientsState = [];
    const clientsContainer = document.getElementById('clientsContainer');
    const addClientBtn = document.getElementById('addClientBtn');
    const addClientModal = document.getElementById('addClientModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const addClientForm = document.getElementById('addClientForm');

    // --- P4.2 ჩატვირთვა (API ან localStorage) ---
    const loadClients = async () => {
        const storedClients = localStorage.getItem('crm_clients');
        
        if (storedClients) {
            clientsState = JSON.parse(storedClients);
            renderClients(clientsState);
        } else {
            try {
                const response = await fetch('https://dummyjson.com/users?limit=30');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                
                clientsState = data.users.map(user => ({
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    phone: user.phone,
                    email: user.email,
                    company: user.company.name,
                    image: user.image,
                    status: 'Lead',
                    dealValue: Math.floor(Math.random() * 9500) + 500, // 500-10000
                    notes: [],
                    createdAt: new Date().toISOString()
                }));
                
                saveState();
                renderClients(clientsState);
            } catch (error) {
                clientsContainer.innerHTML = `
                    <div style="text-align: center; color: var(--error-color); padding: 2rem;">
                        Could not load clients. Check your connection and try again.
                        <br><br>
                        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; cursor: pointer;">Retry</button>
                    </div>`;
            }
        }
    };

    // --- State-ის შენახვა (ოქროს ციკლის ნაწილი) ---
    const saveState = () => {
        localStorage.setItem('crm_clients', JSON.stringify(clientsState));
    };

    // --- P4.3 სიის რენდერი ---
    const renderClients = (clientsArray) => {
        clientsContainer.innerHTML = '';
        
        if (clientsArray.length === 0) {
            clientsContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No clients found.</div>';
            return;
        }

        clientsArray.forEach(client => {
            const card = document.createElement('div');
            card.className = 'client-card';
            card.setAttribute('data-id', client.id);
            
            // Format Currency
            const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(client.dealValue);
            const statusClass = client.status.toLowerCase();

            card.innerHTML = `
                <img src="${client.image || 'https://dummyjson.com/icon/default/128'}" alt="${client.name}">
                <div class="info">
                    <h3>${client.name}</h3>
                    <p>${client.company || 'No Company'} • ${client.email}</p>
                    <p style="color: var(--success-color); font-weight: bold;">${formattedValue}</p>
                </div>
                <div>
                    <span class="badge ${statusClass}">${client.status}</span>
                </div>
                <button class="delete-btn" data-id="${client.id}">Delete</button>
            `;

            clientsContainer.appendChild(card);
        });
    };

    // --- P4.4 Add Client მოდალის მართვა და ვალიდაცია ---
    addClientBtn.addEventListener('click', () => {
        addClientModal.style.display = 'flex';
    });

    const closeModal = () => {
        addClientModal.style.display = 'none';
        addClientForm.reset();
        clearErrors(addClientForm);
    };

    closeModalBtn.addEventListener('click', closeModal);
    addClientModal.addEventListener('click', (e) => {
        if (e.target === addClientModal) closeModal();
    });

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

    document.querySelectorAll('#addClientForm input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('input-error');
            const next = this.nextElementSibling;
            if (next && next.classList.contains('error-text')) next.remove();
        });
    });

    addClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors(addClientForm);
        let isValid = true;

        const nameInput = document.getElementById('clientName');
        const emailInput = document.getElementById('clientEmail');
        const phoneInput = document.getElementById('clientPhone');
        const companyInput = document.getElementById('clientCompany');
        const valueInput = document.getElementById('clientDealValue');
        const statusInput = document.getElementById('clientStatus');

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const phone = phoneInput.value.trim();
        const dealValue = parseFloat(valueInput.value);

        if (name.length < 3) {
            showError(nameInput, 'Name must be at least 3 characters');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else if (clientsState.some(c => c.email.toLowerCase() === email)) {
            showError(emailInput, 'A client with this email already exists');
            isValid = false;
        }

        if (phone.length > 0 && phone.length < 6) {
            showError(phoneInput, 'Phone number looks too short');
            isValid = false;
        }

        if (isNaN(dealValue) || dealValue <= 0) {
            showError(valueInput, 'Deal value must be a positive number');
            isValid = false;
        }

        if (isValid) {
            const newClient = {
                name: name,
                email: email,
                phone: phone,
                company: companyInput.value.trim(),
                dealValue: dealValue,
                status: statusInput.value,
                notes: [],
                createdAt: new Date().toISOString(),
                image: 'https://dummyjson.com/icon/new/128' // Default avatar
            };

            try {
                // იმიტირებული POST რიქვესთი (P4.4)
                const response = await fetch('https://dummyjson.com/users/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newClient)
                });
                
                const data = await response.json();
                newClient.id = data.id || Date.now(); // DummyJSON-მა შეიძლება არ დააბრუნოს უნიკალური ID
                
                clientsState.unshift(newClient); // ვამატებთ მასივის თავში
                saveState();
                renderClients(clientsState);
                closeModal();
                window.showToast('Client added ✓', 'success');
                
            } catch (error) {
                window.showToast('Error adding client', 'error');
            }
        }
    });

    // --- P4.5 წაშლა (Event Delegation) ---
    clientsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            e.stopPropagation(); // რომ ბარათზე დაჭერამ არ იმუშაოს
            const clientId = e.target.getAttribute('data-id');
            
            if (confirm("Delete this client? This cannot be undone.")) {
                try {
                    // იმიტირებული DELETE (P4.5)[cite: 1]
                    await fetch(`https://dummyjson.com/users/${clientId}`, {
                        method: 'DELETE',
                    });
                    
                    // 404 რომც დაბრუნდეს DummyJSON-დან ჩვენი დამატებულისთვის, მაინც ვშლით ლოკალურად
                    clientsState = clientsState.filter(c => c.id.toString() !== clientId.toString());
                    saveState();
                    renderClients(clientsState);
                    window.showToast('Client deleted ✓', 'success');
                } catch (error) {
                    window.showToast('Error deleting client', 'error');
                }
            }
        }
    });

    // საწყისი ჩატვირთვა
    loadClients();
});