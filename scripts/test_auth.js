// Node 18+ has global fetch


async function testAuth() {
    const loginUrl = 'http://localhost:3001/api/auth/login';
    const assetsUrl = 'http://localhost:3001/api/masters/assets?limit=2';

    console.log('--- 1. Testing Login ---');
    try {
        const loginRes = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@bagmane.com',
                password: 'Bagmane@123'
            })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', loginRes.status, await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        console.log('Login successful!');
        console.log('User:', loginData.user.email);
        console.log('Token:', loginData.accessToken ? 'RECEIVED' : 'MISSING');

        const token = loginData.accessToken;

        console.log('\n--- 2. Testing Protected Endpoint (Assets) ---');
        const assetsRes = await fetch(assetsUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!assetsRes.ok) {
            console.error('Assets fetch failed:', assetsRes.status, await assetsRes.text());
            return;
        }

        const assetsData = await assetsRes.json(); // Wait, server returns { data: [...] }
        console.log('Assets fetch successful!');
        console.log('Total Assets:', assetsData.total);
        console.log('First Asset ID:', assetsData.data[0]?.id);

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testAuth();
