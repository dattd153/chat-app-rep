import axios from 'axios';

const GATEWAY_URL = 'http://localhost:3000';

const testPhase2 = async () => {
  console.log('--- 🧪 Phase 2: Core Services E2E Verification ---');

  try {
    // 1. Register User A
    console.log('\n[1] Registering User A...');
    const regA = await axios.post(`${GATEWAY_URL}/api/auth/register`, {
      email: 'userA@example.com',
      password: 'password123',
      name: 'Alice Wonder'
    });
    console.log('✅ User A Registered:', regA.data.data.userId);
    const tokenA = regA.data.data.accessToken;

    // 2. Login User A
    console.log('\n[2] Logging in User A...');
    const loginA = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
      email: 'userA@example.com',
      password: 'password123'
    });
    console.log('✅ User A Logged In. AccessToken received.');

    // 3. Get My Profile (Auth through Gateway)
    console.log('\n[3] Fetching Alice\'s Profile via Gateway...');
    const profileA = await axios.get(`${GATEWAY_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log('✅ Profile Data:', JSON.stringify(profileA.data.data, null, 2));

    // 4. Register User B
    console.log('\n[4] Registering User B...');
    const regB = await axios.post(`${GATEWAY_URL}/api/auth/register`, {
      email: 'userB@example.com',
      password: 'password123',
      name: 'Bob Builder'
    });
    console.log('✅ User B Registered:', regB.data.data.userId);
    const idB = regB.data.data.userId;

    // 5. Search for Bob
    console.log('\n[5] Alice searching for "Bob"...');
    const search = await axios.get(`${GATEWAY_URL}/api/users/search?q=Bob`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log('✅ Search results:', search.data.data.length, 'users found.');

    // 6. Send Friend Request
    console.log('\n[6] Alice sending friend request to Bob...');
    await axios.post(`${GATEWAY_URL}/api/users/friends/request`, 
      { userId: idB },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    console.log('✅ Friend Request Sent successfully!');

    console.log('\n--- 🎊 All Phase 2 Tests Passed! ---');
    console.log('Hệ thống đã sẵn sàng cho Phase 3: Messaging.');

  } catch (err: any) {
    console.error('\n❌ Test Failed!');
    if (err.response) {
      console.error('Error Details:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
  }
};

testPhase2();
