/**
 * Phase 5 Test Script: Robust E2E Notification Test
 */

const GATEWAY_URL = 'http://localhost:3000';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testPhase5() {
  console.log('🚀 Starting Robust Phase 5 Test...');

  try {
    const timestamp = Date.now();

    // --- STEP 1: Register User A ---
    console.log('\n--- Step 1: Registering User A ---');
    const resA = await fetch(`${GATEWAY_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `user-a-${timestamp}@test.com`, password: 'password123', name: 'User A' })
    });
    
    const regA: any = await resA.json();
    console.log('DEBUG [Step 1 Response]:', JSON.stringify(regA, null, 2));

    if (!resA.ok || !regA.success || !regA.data || !regA.data.userId) {
      console.error('❌ Registration A Failed. Check if auth-service is running and DB is ready.');
      throw new Error(`Step 1 failed with status ${resA.status}`);
    }
    const userA_id = regA.data.userId;
    const tokenA = regA.data.accessToken;
    console.log(`User A registered with ID: ${userA_id}`);

    // --- STEP 2: Register User B ---
    console.log('--- Step 2: Registering User B ---');
    const resB = await fetch(`${GATEWAY_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `user-b-${timestamp}@test.com`, password: 'password123', name: 'User B' })
    });
    
    const regB: any = await resB.json();
    console.log('DEBUG [Step 2 Response]:', JSON.stringify(regB, null, 2));

    if (!resB.ok || !regB.success || !regB.data || !regB.data.userId) {
      console.error('❌ Registration B Failed.');
      throw new Error(`Step 2 failed with status ${resB.status}`);
    }
    const userB_id = regB.data.userId;
    console.log(`User B registered with ID: ${userB_id}`);

    // Wait 3s for user sync across services
    console.log('Waiting 3s for user sync...');
    await delay(3000);

    // --- STEP 3: Create a real Chat ---
    console.log('--- Step 3: Creating a direct chat between A and B ---');
    const resChat = await fetch(`${GATEWAY_URL}/api/chats`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${tokenA}`, 
        'x-user-id': userA_id 
      },
      body: JSON.stringify({ type: 'direct', memberIds: [userB_id] })
    });
    
    const chatJson: any = await resChat.json();
    console.log('DEBUG [Step 3 Response]:', JSON.stringify(chatJson, null, 2));

    if (!resChat.ok || !chatJson.success || !chatJson.data) {
      throw new Error(`Step 3 failed with status ${resChat.status}`);
    }
    const chatId = chatJson.data.id || chatJson.data._id; // Fallback to id then _id
    console.log(`Chat created with ID: ${chatId}`);

    // --- STEP 4: Send Message ---
    console.log('\n--- Step 4: User A sends message to User B ---');
    const resMsg = await fetch(`${GATEWAY_URL}/api/messages`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${tokenA}`, 
        'x-user-id': userA_id 
      },
      body: JSON.stringify({ chatId, content: 'Hello User B!', type: 'text', clientMessageId: `msg-${timestamp}` })
    });
    
    if (!resMsg.ok) {
      const resMsgJson = await resMsg.json();
      console.error('DEBUG [Step 4 Error]:', JSON.stringify(resMsgJson, null, 2));
      throw new Error(`Step 4 failed with status ${resMsg.status}`);
    }

    console.log('Message sent. Waiting for notification processing (5s)...');
    await delay(5000);

    // --- STEP 5: Check Notifications for User B ---
    console.log(`Checking notifications for User B (${userB_id})...`);
    const resNotifB = await fetch(`${GATEWAY_URL}/api/notifications`, {
      headers: { 'x-user-id': userB_id }
    });
    
    const dataNotifB: any = await resNotifB.json();
    console.log('DEBUG [Step 5 Response]:', JSON.stringify(dataNotifB, null, 2));
    const notificationsB = dataNotifB.data;

    if (notificationsB && notificationsB.length > 0) {
      console.log('✅ Success: User B received notification!');
      console.log('Last Notification:', notificationsB[0].content);
    } else {
      console.log('❌ Failed: User B did not receive notification.');
    }

    // --- STEP 6: Friend Request Notification ---
    console.log('\n--- Step 6: User B sends friend request to User A ---');
    const resFR = await fetch(`${GATEWAY_URL}/api/users/friends/request`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'x-user-id': userB_id 
      },
      body: JSON.stringify({ friendId: userA_id })
    });
    
    if (!resFR.ok) {
      const frErr = await resFR.json();
      console.error('DEBUG [Step 6 Error]:', JSON.stringify(frErr, null, 2));
    } else {
      console.log('Friend request sent. Waiting 5s...');
      await delay(5000);

      console.log(`Checking notifications for User A (${userA_id})...`);
      const resNotifA = await fetch(`${GATEWAY_URL}/api/notifications`, {
        headers: { 'x-user-id': userA_id }
      });
      const dataNotifA: any = await resNotifA.json();
      console.log('DEBUG [Step 6 Notification Check]:', JSON.stringify(dataNotifA, null, 2));

      if (dataNotifA.data && dataNotifA.data.some((n: any) => n.type === 'friend_request')) {
        console.log('✅ Success: User A received friend request notification!');
      } else {
        console.log('❌ Failed: User A did not receive friend request notification.');
      }
    }

    console.log('\n🏁 Phase 5 Test Completed.');

  } catch (err: any) {
    console.error('💥 Test Error:', err.message);
  }
}

testPhase5();
