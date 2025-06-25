import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuthInit } from '~/features/auth/hooks/use-auth-init';
import { useAuthStore } from '~/features/auth/store/auth-state';
import PageCenteredContainer from '~/shared/components/page-centered-container';

export default function LoginCallbackPage() {
  const [params] = useSearchParams();
  const isRegistered = params.get('isRegistered') === 'true';
  const { loading } = useAuthInit();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!loading) {
      if (isRegistered) {
        navigate('/');
      } else {
        logout();
        alert('등록되지 않은 사용자입니다.');
        navigate('/login');
      }
    }
  }, [loading, isRegistered, navigate, logout]);

  return (
    <PageCenteredContainer>
      <p className="text-center text-muted">로그인 처리 중...</p>);
    </PageCenteredContainer>
  );
}
