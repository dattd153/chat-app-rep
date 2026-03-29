import mongoose from 'mongoose';

/**
 * Diagnostic script to check the state of databases for Phase 5.
 */

const MONGO_URI_BASE = 'mongodb://localhost:27017';

async function verifyDB() {
  console.log('🔍 Diagnosing Phase 5 state...');

  try {
    // 1. Check User Service (Outbox)
    console.log('\n--- User Service Database ---');
    const userConn = await mongoose.createConnection(`${MONGO_URI_BASE}/user`).asPromise();
    const UserOutbox = userConn.model('Outbox', new mongoose.Schema({}, { strict: false }));
    const userEvents = await UserOutbox.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`Outbox events count: ${await UserOutbox.countDocuments()}`);
    userEvents.forEach((e: any) => console.log(`[${e.status}] ${e.eventType} - ${JSON.stringify(e.payload)}`));
    await userConn.close();

    // 2. Check Message Service (Outbox)
    console.log('\n--- Message Service Database ---');
    const msgConn = await mongoose.createConnection(`${MONGO_URI_BASE}/message`).asPromise();
    const MsgOutbox = msgConn.model('Outbox', new mongoose.Schema({}, { strict: false }));
    const msgEvents = await MsgOutbox.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`Outbox events count: ${await MsgOutbox.countDocuments()}`);
    msgEvents.forEach((e: any) => console.log(`[${e.status}] ${e.eventType} - ${e.payload.content}`));
    await msgConn.close();

    // 3. Check Chat Service (Members)
    console.log('\n--- Chat Service Database ---');
    const chatConn = await mongoose.createConnection(`${MONGO_URI_BASE}/chat`).asPromise();
    const ChatMember = chatConn.model('ChatMember', new mongoose.Schema({}, { strict: false }));
    console.log(`Chat members count: ${await ChatMember.countDocuments()}`);
    const members = await ChatMember.find({}).limit(5);
    members.forEach((m: any) => console.log(`Chat: ${m.chatId}, User: ${m.userId}`));
    await chatConn.close();

    // 4. Check Notification Service (Notifications)
    console.log('\n--- Notification Service Database ---');
    const notifConn = await mongoose.createConnection(`${MONGO_URI_BASE}/notification`).asPromise();
    const Notification = notifConn.model('Notification', new mongoose.Schema({}, { strict: false }));
    console.log(`Notifications count: ${await Notification.countDocuments()}`);
    const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(5);
    notifications.forEach((n: any) => console.log(`To: ${n.userId}, Type: ${n.type}, Status: ${n.status}`));
    await notifConn.close();

    console.log('\n🏁 Diagnosis Completed.');
  } catch (err: any) {
    console.error('💥 Diagnosis failed:', err.message);
  }
}

verifyDB();
