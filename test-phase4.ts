import axios from 'axios';
import { io } from 'socket.io-client';
import { SocketEvents } from './packages/shared/src/index.ts';

const GATEWAY_URL = 'http://localhost:3000';
const WS_URL = 'http://localhost:3005'; 

async function testPhase4() {
  console.log('--- 🧪 Phase 4: Real-time System Verification ---');

  try {
    // 1. Đăng nhập User A và User B (Sử dụng user từ Phase 3)
    console.log('\n[1] Logging in Users...');
    const userA = { email: 'userA@test.com', password: 'password123' };
    const userB = { email: 'userB@test.com', password: 'password123' };

    const loginA = await axios.post(`${GATEWAY_URL}/api/auth/login`, userA);
    const loginB = await axios.post(`${GATEWAY_URL}/api/auth/login`, userB);

    const tokenA = loginA.data.data.accessToken;
    const tokenB = loginB.data.data.accessToken;
    const idA = loginA.data.data.user.id;
    const idB = loginB.data.data.user.id;

    console.log(`✅ Users Authenticated. A: ${idA}, B: ${idB}`);

    // Lấy chatId có sẵn
    const chatsA = await axios.get(`${GATEWAY_URL}/api/chats`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    
    if (!chatsA.data.data || chatsA.data.data.length === 0) {
      throw new Error('Không tìm thấy chat room. Vui lòng chạy test-phase3.ts trước.');
    }
    const chatId = chatsA.data.data[0].id;
    console.log(`✅ Verifying in Chat ID: ${chatId}`);

    // 2. Kết nối WebSocket
    console.log('\n[2] Connecting to WebSocket & Testing Presence...');
    const socketB = io(WS_URL, { auth: { token: tokenB } });
    
    // User B đợi thông báo A online
    const userAOnline = new Promise((resolve) => {
      socketB.on(SocketEvents.USER_ONLINE, (data) => {
        if (data.userId === idA) {
          console.log('   🟢 User B received: User A is now Online');
          resolve(true);
        }
      });
    });

    // Bây giờ User A kết nối
    const socketA = io(WS_URL, { auth: { token: tokenA } });
    await userAOnline;
    console.log('✅ Presence Verification Passed.');

    // 3. Testing Typing Indicator
    console.log('\n[3] Testing Typing Indicator...');
    socketA.emit(SocketEvents.JOIN_CHAT, chatId);
    socketB.emit(SocketEvents.JOIN_CHAT, chatId);

    const typingReceived = new Promise((resolve) => {
      socketB.on(SocketEvents.TYPING_START, (data) => {
        if (data.userId === idA && data.chatId === chatId) {
          console.log('   ✍️  User B received: User A is typing...');
          resolve(true);
        }
      });
    });

    await new Promise(r => setTimeout(r, 1000));
    socketA.emit(SocketEvents.TYPING_START, chatId);
    await typingReceived;
    console.log('✅ Typing Indicator Verified.');

    // 4. Testing Message Seen (Tick xanh)
    console.log('\n[4] Testing Message Seen Flow...');
    
    // A gửi tin nhắn cho B
    const msgRes = await axios.post(`${GATEWAY_URL}/api/messages`, {
      chatId,
      content: 'Hello B, bạn đã thấy tin nhắn này chưa?',
      type: 'text',
      clientMessageId: `phase4-seen-test-${Date.now()}`
    }, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const messageId = msgRes.data.data.id;
    console.log(`   ✉️  Message sent by A. ID: ${messageId}`);

    // User A đợi xác nhận "Đã xem"
    const seenReceiptReceived = new Promise((resolve) => {
      socketA.on(SocketEvents.MESSAGE_SEEN, (data) => {
        if (data.messageId === messageId) {
          console.log('   ✅ User A received: SEEN receipt from User B');
          resolve(true);
        }
      });
    });

    // Giả lập User B gửi event "seen"
    console.log('   ⏳ User B marking message as SEEN...');
    await new Promise(r => setTimeout(r, 2000));
    socketB.emit(SocketEvents.MESSAGE_SEEN, { chatId, messageId });

    await seenReceiptReceived;
    console.log('✅ Message Seen Flow Verified.');

    console.log('\n🎉 --- ALL PHASE 4 TESTS PASSED! ---');
    socketA.disconnect();
    socketB.disconnect();
    process.exit(0);

  } catch (err: any) {
    console.error('\n❌ Phase 4 Test Failed!');
    console.error('Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

testPhase4();
