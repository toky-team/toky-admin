import { ChatManager } from '~/features/chat/components/chat-manager';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function ChatPage() {
  return (
    <PageContainer>
      <PageTitle>Chat Management</PageTitle>
      <ChatManager />
    </PageContainer>
  );
}
