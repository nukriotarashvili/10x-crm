document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const liveClock = document.getElementById('liveClock');
    const dashboardPanel = document.getElementById('dashboardContent');
    if (!dashboardPanel) return;

    // P3.1 - მისალმება
    const session = JSON.parse(localStorage.getItem('crm_session'));
    if (session) {
        const users = JSON.parse(localStorage.getItem('crm_users')) || [];
        const user = users.find(u => u.email === session.email);
        if (user) {
            const firstName = user.fullName.split(' ')[0];
            welcomeMessage.textContent = `Welcome back, ${firstName}!`;
        }
    }

    // P3.1 - ცოცხალი საათი
    setInterval(() => {
        const now = new Date();
        liveClock.textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    }, 1000);

    // მონაცემების ჩატვირთვა (თუ ცარიელია, ვიწერთ API-დან P3.5)
    let clients = JSON.parse(localStorage.getItem('crm_clients'));
    if (!clients) {
        try {
            const response = await fetch('https://dummyjson.com/users?limit=30');
            const data = await response.json();
            clients = data.users.map(u => ({
                id: u.id,
                name: `${u.firstName} ${u.lastName}`,
                phone: u.phone,
                email: u.email,
                company: u.company.name,
                image: u.image,
                status: 'Lead',
                dealValue: Math.floor(Math.random() * 9500) + 500,
                notes: [],
                createdAt: new Date().toISOString()
            }));
            localStorage.setItem('crm_clients', JSON.stringify(clients));
        } catch (error) {
            dashboardPanel.innerHTML = '<div style="color: var(--error-color);">Failed to load stats.</div>';
            return;
        }
    }

    // P3.2 - სტატისტიკის ბარათების გამოთვლა
    const totalClients = clients.length;
    const activeDeals = clients.filter(c => c.status !== 'Won' && c.status !== 'Lost').length;
    
    const wonRevenue = clients
        .filter(c => c.status === 'Won')
        .reduce((sum, c) => sum + c.dealValue, 0);
    const formattedRevenue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(wonRevenue);

    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const newThisWeek = clients.filter(c => new Date(c.createdAt).getTime() >= sevenDaysAgo).length;

    // P3.3 & P3.4 - Pipeline და ბოლო 5 კლიენტი
    const pipeline = clients.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, { Lead: 0, Contacted: 0, Won: 0, Lost: 0 });

    const recentClients = [...clients]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    // რენდერი
    dashboardPanel.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px;">
                <h4 style="color: var(--text-secondary);">Total Clients</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${totalClients}</p>
            </div>
            <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px;">
                <h4 style="color: var(--text-secondary);">Active Deals</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${activeDeals}</p>
            </div>
            <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px;">
                <h4 style="color: var(--text-secondary);">Won Revenue</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: var(--success-color);">${formattedRevenue}</p>
            </div>
            <div style="padding: 1rem; background: var(--bg-color); border-radius: 8px;">
                <h4 style="color: var(--text-secondary);">New This Week</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${newThisWeek}</p>
            </div>
        </div>

        <div style="margin-bottom: 2rem;">
            <h3>Pipeline Overview</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">
                Lead: ${pipeline.Lead} | Contacted: ${pipeline.Contacted} | Won: ${pipeline.Won} | Lost: ${pipeline.Lost}
            </p>
        </div>

        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3>Recent Clients</h3>
                <a href="clients.html" style="font-size: 0.9rem;">View all clients &rarr;</a>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${recentClients.length > 0 ? recentClients.map(c => `
                    <div style="display: flex; justify-content: space-between; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 4px;">
                        <span><strong>${c.name}</strong> (${c.company || 'No Company'})</span>
                        <span><span style="font-size: 0.8rem; padding: 2px 6px; border-radius: 10px; background: #eee; margin-right: 10px;">${c.status}</span> ${new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                `).join('') : '<p>No clients yet.</p>'}
            </div>
        </div>
    `;
});