import { QuestionManager } from '~/features/question/components/question-manager';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function QuestionPage() {
  return (
    <PageContainer>
      <PageTitle>Question Management</PageTitle>
      <QuestionManager />
    </PageContainer>
  );
}
