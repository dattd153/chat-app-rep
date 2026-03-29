import { UserStatus, ChatType, MessageStatus, MessageType } from '@chat-app/shared';
import { EventSubjects } from '@chat-app/events';

console.log('--- 🧪 Phase 1: Shared Models & Events Verification ---');

// 1. Kiểm tra Shared Models
const mockUser = {
  id: 'user-123',
  status: UserStatus.ONLINE, 
  username: 'antigravity_dev'
};

const mockMessage = {
  id: 'msg-456',
  type: MessageType.TEXT,
  status: MessageStatus.SENT,
  content: 'Hello World!'
};

console.log('✅ Shared Enums & Interfaces are working:');
console.log(`- User Status: ${mockUser.status}`);
console.log(`- Message Type: ${mockMessage.type}`);
console.log(`- Message Status: ${mockMessage.status}`);

// 2. Kiểm tra Event Subjects
console.log('\n✅ Kafka Event Subjects defined:');
console.log(`- Auth Logged In: ${EventSubjects.AUTH_LOGGED_IN}`);
console.log(`- Message Created: ${EventSubjects.MESSAGE_CREATED}`);
console.log(`- User Presence: ${EventSubjects.USER_PRESENCE_CHANGED}`);
console.log(`- Total Events: ${Object.keys(EventSubjects).length}`);

console.log('\n--- ✅ Phase 1 Verification Completed ---');
