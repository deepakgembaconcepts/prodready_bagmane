
const API_URL = 'http://localhost:3001/api';

async function testPermit() {
    console.log('--- 1. Login ---');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@bagmane.com', password: 'password123' })
    });
    const { accessToken } = await loginRes.json();

    console.log('--- 2. Create Permit ---');
    const permitData = {
        type: 'Hot Work',
        description: 'Welding in Basement 1',
        location: 'Basement 1',
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 3600000).toISOString()
    };

    const createRes = await fetch(`${API_URL}/workpermits`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(permitData)
    });

    if (!createRes.ok) {
        console.error('Create Failed:', await createRes.text());
        return;
    }

    const { data: permit } = await createRes.json();
    console.log('Permit Created:', permit.permitId, permit.status);

    console.log('--- 3. Finalize/Approve Permit ---');
    const finalizeRes = await fetch(`${API_URL}/workpermits/${permit.permitId}/finalize`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    console.log('Finalize Result:', await finalizeRes.json());
}

testPermit();
