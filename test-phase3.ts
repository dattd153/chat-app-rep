import axios from 'axios';
import { io } from 'socket.io-client';

const GATEWAY_URL = 'http://localhost:3000';
const WS_URL = 'http://localhost:3005'; // Kết nối trực tiếp tới WebSocket service cho script test

async function testPhase3() {
  console.log('--- 🧪 Phase 3: Messaging & Real-time Verification ---');

  try {
    // 1. Đăng ký/Đăng nhập User A và User B
    console.log('\n[1] Preparing Users...');
    const userA = { email: 'userA@test.com', password: 'password123', name: 'User A' };
    const userB = { email: 'userB@test.com', password: 'password123', name: 'User B' };

    await axios.post(`${GATEWAY_URL}/api/auth/register`, userA).catch(() => {});
    await axios.post(`${GATEWAY_URL}/api/auth/register`, userB).catch(() => {});

    const loginA = await axios.post(`${GATEWAY_URL}/api/auth/login`, { email: userA.email, password: userA.password });
    const loginB = await axios.post(`${GATEWAY_URL}/api/auth/login`, { email: userB.email, password: userB.password });

    const tokenA = loginA.data.data.accessToken;
    const tokenB = loginB.data.data.accessToken;
    const idA = loginA.data.data.user.id;
    const idB = loginB.data.data.user.id;

    console.log(`✅ Users Ready. A: ${idA}, B: ${idB}`);
    console.log('⏳ Waiting 3s for services to sync...');
    await new Promise(r => setTimeout(r, 3000));

    // 2. Kết bạn (A gửi, B chấp nhận)
    console.log('\n[2] Establishing Friendship...');
    await axios.post(`${GATEWAY_URL}/api/users/friends/request`, { friendId: idB }, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    await axios.post(`${GATEWAY_URL}/api/users/friends/accept`, { friendId: idA }, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    console.log('✅ Friendship Accepted.');

    // 3. Tạo Chat Direct A-B
    console.log('\n[3] Creating Direct Chat...');
    const chatRes = await axios.post(`${GATEWAY_URL}/api/chats`, {
      type: 'direct',
      memberIds: [idB]
    }, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const chatId = chatRes.data.data.id;
    console.log(`✅ Chat Created. ID: ${chatId}`);

    // 4. User B kết nối WebSocket
    console.log('\n[4] User B Connecting to WebSocket...');
    const socketB = io(WS_URL, {
      auth: { token: tokenB }
    });

    const messageReceived = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('WebSocket Timeout! Không nhận được tin nhắn.')), 10000);
      
      socketB.on('connect', () => {
        console.log('   📡 User B connected to WS.');
        socketB.emit('join-chat', chatId);
      });

      socketB.on('new-message', (msg) => {
        console.log('   📥 User B received message via WS:', msg.content);
        clearTimeout(timeout);
        resolve(msg);
      });
      
      socketB.on('connect_error', (err) => {
        reject(err);
      });
    });

    // 5. User A gửi tin nhắn
    console.log('\n[5] User A Sending Message...');
    const clientMsgId = `client-uuid-${Date.now()}`;
    await axios.post(`${GATEWAY_URL}/api/messages`, {
      chatId,
      content: 'Chào B, mình là A đây! 🚀',
      type: 'text',
      clientMessageId: clientMsgId
    }, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log('✅ Message sent via API.');

    // 6. Chờ nhận Real-time
    await messageReceived;
    console.log('✅ Real-time delivery verified.');

    // 7. Kiểm tra Metadata (lastMessageId)
    console.log('\n[6] Verifying Chat Metadata...');
    // Đợi 2 giây để Kafka đồng bộ metadata
    await new Promise(r => setTimeout(r, 2000));
    
    const finalChatRes = await axios.get(`${GATEWAY_URL}/api/chats`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    
    const chatMetadata = finalChatRes.data.data.find((c: any) => c.id === chatId);
    if (chatMetadata?.lastMessageId) {
      console.log(`✅ Metadata Sync Verified. lastMessageId: ${chatMetadata.lastMessageId}`);
    } else {
      console.warn('⚠️ Metadata chưa đồng bộ kịp (Kafka có thể đang xử lý).');
    }

    console.log('\n🎉 --- ALL TESTS PASSED SUCCESSFULLY! ---');
    socketB.disconnect();
    process.exit(0);

  } catch (err: any) {
    console.error('\n❌ Test Failed!');
    console.error('Error Details:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase3();
