import { MessagesManager } from '@/features/manage/messages/messages-manager';
import { listContactMessagesAction } from '@/features/manage/messages/actions';

export default async function AdminMessagesPage() {
  const initialResult = await listContactMessagesAction(1);

  return <MessagesManager initialResult={initialResult} />;
}
