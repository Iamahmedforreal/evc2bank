// Simple API test script
// Run with: node test-api.js
// Make sure your server is running first

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

let userToken = '';
let adminToken = '';
let userId = '';

async function testAPI() {
    try {
        console.log(' Starting API Tests...\n');

        // 1. Register and login user
        console.log(' Testing User Registration and Login...');
        const userRegister = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                phone: '1111111111',
                password: 'test123',
                role: 'user'
            })
        });
        
        if (userRegister.ok) {
            console.log(' User registered successfully');
        } else {
            console.log(' User might already exist');
        }

        const userLogin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '1111111111',
                password: 'test123'
            })
        });

        if (userLogin.ok) {
            const userData = await userLogin.json();
            userToken = userData.token;
            userId = userData.user.id;
            console.log(' User login successful');
        } else {
            console.log(' User login failed');
            return;
        }

        // 2. Register and login admin
        console.log(' Testing Admin Registration and Login...');
        const adminRegister = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Admin',
                lastName: 'User',
                phone: '2222222222',
                password: 'admin123',
                role: 'admin'
            })
        });

        if (adminRegister.ok) {
            console.log(' Admin registered successfully');
        } else {
            console.log('  Admin might already exist');
        }

        const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '2222222222',
                password: 'admin123'
            })
        });

        if (adminLogin.ok) {
            const adminData = await adminLogin.json();
            adminToken = adminData.token;
            console.log(' Admin login successful');
        } else {
            console.log(' Admin login failed');
            return;
        }

        // 3. Check initial wallet balance
        console.log(' Testing Wallet Balance Check...');
        const balanceCheck = await fetch(`${BASE_URL}/transactions/balance/me`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        if (balanceCheck.ok) {
            const balance = await balanceCheck.json();
            console.log(' Balance check successful:', balance);
        } else {
            console.log(' Balance check failed');
        }

        // 4. Test EVC to Bank transfer (should fail due to insufficient funds)
        console.log(' Testing EVC to Bank Transfer (should fail - insufficient funds)...');
        const evcToBankFail = await fetch(`${BASE_URL}/transactions/evc-to-bank`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}` 
            },
            body: JSON.stringify({ amount: 100 })
        });

        const evcToBankFailResult = await evcToBankFail.json();
        if (evcToBankFail.status === 400) {
            console.log(' Insufficient funds validation working:', evcToBankFailResult.message);
        } else {
            console.log(' Insufficient funds validation failed');
        }

        // 5. Test transaction history
        console.log(' Testing Transaction History...');
        const history = await fetch(`${BASE_URL}/transactions/history/me`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });

        if (history.ok) {
            const transactions = await history.json();
            console.log(' Transaction history retrieved:', transactions.length, 'transactions');
        } else {
            console.log(' Transaction history failed');
        }

        console.log(' Basic API tests completed!');
        console.log(' Next steps:');
        console.log('1. Use Postman with the provided test cases');
        console.log('2. Add funds to wallet using admin API');
        console.log('3. Test transfers with sufficient balance');
        
    } catch (error) {
        console.error(' Test failed:', error.message);
    }
}

testAPI();
