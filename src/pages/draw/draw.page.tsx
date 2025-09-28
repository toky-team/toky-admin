import { DrawManager } from '~/features/gift/components/draw-manager';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function DrawPage() {
  return (
    <PageContainer>
      <PageTitle>Draw Page</PageTitle>
      <DrawManager />
    </PageContainer>
  );
}
