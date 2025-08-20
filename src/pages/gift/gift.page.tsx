import { GiftManager } from '~/features/gift/components/gift-manager';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function GiftPage() {
  return (
    <PageContainer>
      <PageTitle>Gift Management</PageTitle>
      <GiftManager />
    </PageContainer>
  );
}
