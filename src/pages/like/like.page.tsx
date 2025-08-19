import { LikeManager } from '~/features/like/components/like-manager';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function LikePage() {
  return (
    <PageContainer>
      <PageTitle>Like Management</PageTitle>
      <LikeManager />
    </PageContainer>
  );
}
