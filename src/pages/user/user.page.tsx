import { UserManager } from '~/features/user/components/user-manager';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function UserPage() {
  return (
    <PageContainer>
      <PageTitle>User Management</PageTitle>
      <UserManager />
    </PageContainer>
  );
}
