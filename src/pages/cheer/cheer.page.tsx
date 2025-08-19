import { CheerManager } from '~/features/cheer/components/cheer-manager';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function CheerPage() {
  return (
    <PageContainer>
      <PageTitle>Cheer Management</PageTitle>
      <CheerManager />
    </PageContainer>
  );
}
