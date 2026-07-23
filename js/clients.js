document.addEventListener('DOMContentLoaded', () => {
    let clientsState = [];
    let activeFilter = 'All';

    const clientsContainer = document.getElementById('clientsContainer');
    const addClientBtn = document.getElementById('addClientBtn');
    const addClientModal = document.getElementById('addClientModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const addClientForm = document.getElementById('addClientForm');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    const loadClients = async () => {
        const storedClients = localStorage.getItem('crm_clients');

        if (storedClients) {
            clientsState = JSON.parse(storedClients);
            applyFiltersAndRender();
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
                    dealValue: Math.floor(Math.random() * 9500) + 500,
                    notes: [],
                    createdAt: new Date().toISOString()
                }));

                saveState();
                applyFiltersAndRender();
            } catch (error) {
                clientsContainer.innerHTML = `
                    <div class="error-state">
                        Could not load clients. Check your connection and try again.
                        <br><br>
                        <button type="button" onclick="window.location.reload()">Retry</button>
                    </div>`;
            }
        }
    };

    const saveState = () => {
        localStorage.setItem('crm_clients', JSON.stringify(clientsState));
    };

    const applyFiltersAndRender = () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const sortValue = sortSelect.value;

        let filtered = [...clientsState];

        if (activeFilter !== 'All') {
            filtered = filtered.filter(client => client.status === activeFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(client =>
                client.name.toLowerCase().includes(searchTerm) ||
                client.email.toLowerCase().includes(searchTerm) ||
                (client.company && client.company.toLowerCase().includes(searchTerm))
            );
        }

        if (sortValue === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortValue === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortValue === 'value') {
            filtered.sort((a, b) => b.dealValue - a.dealValue);
        }

        renderClients(filtered);
    };

    const renderClients = (clientsArray) => {
        clientsContainer.innerHTML = '';

        if (clientsArray.length === 0) {
            clientsContainer.innerHTML = '<div class="loading-state">No clients found.</div>';
            return;
        }

        clientsArray.forEach(client => {
            const card = document.createElement('div');
            card.className = 'client-card';
            card.setAttribute('data-id', client.id);

            const formattedValue = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
            }).format(client.dealValue);
            const statusClass = client.status.toLowerCase();

            card.innerHTML = `
                <img src="${client.image || 'https://dummyjson.com/icon/default/128'}" alt="${client.name}">
                <div class="info">
                    <h3>${client.name}</h3>
                    <p>${client.company || 'No Company'} • ${client.email}</p>
                    <p class="deal-value">${formattedValue}</p>
                </div>
                <div>
                    <span class="badge ${statusClass}">${client.status}</span>
                </div>
                <button type="button" class="delete-btn" data-id="${client.id}">Delete</button>
            `;

            clientsContainer.appendChild(card);
        });
    };

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
        input.addEventListener('input', function () {
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

        if (!isValid) return;

        const newClient = {
            name,
            email,
            phone,
            company: companyInput.value.trim(),
            dealValue,
            status: statusInput.value,
            notes: [],
            createdAt: new Date().toISOString(),
            image: 'https://dummyjson.com/icon/new/128'
        };

        try {
            const response = await fetch('https://dummyjson.com/users/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClient)
            });

            const data = await response.json();
            newClient.id = data.id || Date.now();

            clientsState.unshift(newClient);
            saveState();
            applyFiltersAndRender();
            closeModal();
            window.showToast('Client added ✓', 'success');
        } catch (error) {
            window.showToast('Error adding client', 'error');
        }
    });

    clientsContainer.addEventListener('click', async (e) => {
        if (!e.target.classList.contains('delete-btn')) return;

        e.stopPropagation();
        const clientId = e.target.getAttribute('data-id');

        if (!confirm('Delete this client? This cannot be undone.')) return;

        try {
            await fetch(`https://dummyjson.com/users/${clientId}`, {
                method: 'DELETE'
            });

            clientsState = clientsState.filter(c => c.id.toString() !== clientId.toString());
            saveState();
            applyFiltersAndRender();
            window.showToast('Client deleted ✓', 'success');
        } catch (error) {
            window.showToast('Error deleting client', 'error');
        }
    });

    searchInput.addEventListener('input', applyFiltersAndRender);
    sortSelect.addEventListener('change', applyFiltersAndRender);

    document.querySelectorAll('.filters .chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filters .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeFilter = chip.dataset.status;
            applyFiltersAndRender();
        });
    });

    loadClients();
});
