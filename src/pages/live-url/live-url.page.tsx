import { LiveUrlManager } from '~/features/live-url/components/live-url-manager';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function LiveUrlPage() {
  return (
    <PageContainer>
      <PageTitle>Live Url Management</PageTitle>
      <LiveUrlManager />
    </PageContainer>
  );
}
