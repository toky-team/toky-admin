import { useAuthStore } from '~/features/auth/store/auth-state';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <PageContainer>
      <div className="text-center space-y-4">
        <PageTitle>홈 페이지</PageTitle>
        <p>
          환영합니다, <span className="font-semibold">{user ? user.name : '게스트'}</span>님!
        </p>
      </div>
    </PageContainer>
  );
}
