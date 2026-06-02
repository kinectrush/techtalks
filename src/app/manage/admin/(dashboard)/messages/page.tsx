import { MessagesManager } from '@/features/manage/messages/messages-manager';
import { listContactMessagesAction } from '@/features/manage/messages/actions';

export default async function AdminMessagesPage() {
  const initialMessages = await listContactMessagesAction();
  return <MessagesManager initialMessages={initialMessages} />;
}

