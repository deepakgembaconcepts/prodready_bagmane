
// Use Node 22 fetch
const API_URL = 'http://localhost:3001/api';

async function testHelpdesk() {
    console.log('--- 1. Login ---');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@bagmane.com', password: 'password123' })
    });

    if (!loginRes.ok) {
        console.error('Login failed:', await loginRes.text());
        return;
    }
    const { accessToken } = await loginRes.json();
    console.log('Got Token:', accessToken ? 'YES' : 'NO');

    console.log('\n--- 2. Fetch Valid Master Data ---');

    // 1. Get Categories
    const catRes = await fetch(`${API_URL}/escalation/categories`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
    const categories = await catRes.json();
    const category = categories[0];
    console.log('Selected Category:', category);

    // 2. Get SubCategories
    const subCatRes = await fetch(`${API_URL}/escalation/subcategories/${encodeURIComponent(category)}`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
    const subCategories = await subCatRes.json();
    const subCategory = subCategories[0];
    console.log('Selected SubCategory:', subCategory);

    // 3. Get Issues
    const issueRes = await fetch(`${API_URL}/escalation/issues/${encodeURIComponent(category)}/${encodeURIComponent(subCategory)}`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
    const issues = await issueRes.json();
    const issue = issues[0];
    console.log('Selected Issue:', issue);

    console.log('\n--- 3. Create Ticket ---');
    const ticketPayload = {
        title: `Issue with ${subCategory}`,
        description: `Detailed description of ${issue}`,
        priority: 'P1',
        category,
        subCategory,
        issue
    };

    const createRes = await fetch(`${API_URL}/helpdesk/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(ticketPayload)
    });

    if (!createRes.ok) {
        console.error('Create Ticket Failed:', await createRes.text());
    } else {
        const { data: ticket } = await createRes.json();
        console.log('Ticket Created:', ticket.ticketId);

        console.log('\n--- 4. Check Escalation Status ---');
        const statusRes = await fetch(`${API_URL}/helpdesk/tickets/${ticket.ticketId}/escalation-status`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log('Escalation Status:', await statusRes.json());

        console.log('\n--- 5. Attempt Escalation ---');
        const escalateRes = await fetch(`${API_URL}/helpdesk/tickets/${ticket.ticketId}/escalate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        console.log('Escalate Result:', await escalateRes.json());

        console.log('\n--- 6. Transition to WIP ---');
        const transRes = await fetch(`${API_URL}/helpdesk/tickets/${ticket.ticketId}/transition`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ newStatus: 'WIP' })
        });
        console.log('Transition Result:', await transRes.json());
    }
}

testHelpdesk();
