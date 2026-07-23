// P0.1 - Auth Guard (წვდომის კონტროლი)
const checkAuth = () => {
    const session = localStorage.getItem('crm_session');
    const path = window.location.pathname;
    const isPublicPage = path.endsWith('index.html') || path.endsWith('signup.html') || path === '/' || path.endsWith('10x-crm/'); 

    if (!session && !isPublicPage) {
        window.location.href = 'index.html';
    } else if (session && isPublicPage) {
        window.location.href = 'dashboard.html';
    }
};

// ვუშვებთ დაუყოვნებლივ
checkAuth();

// P0.2 & P0.3 - გლობალური ნავიგაცია, Logout, თემა
document.addEventListener('DOMContentLoaded', () => {
    // თემის დაყენება
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('crm_theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const newTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            localStorage.setItem('crm_theme', newTheme);
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('crm_session');
            window.location.href = 'index.html';
        });
    }

    // ლოგოზე დაჭერით მთავარზე დაბრუნება
    const logoBrand = document.getElementById('logoBrand');
    if (logoBrand) {
        logoBrand.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
});

// P0.4 - შეტყობინებების სტანდარტი (Toast)
window.showToast = (message, type = 'success') => {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        document.body.appendChild(toast);
    }
    toast.className = `toast ${type} show`;
    toast.textContent = message;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
};