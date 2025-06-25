import KakaoLoginButton from '~/features/auth/components/kakao-login-button';
import PageCenteredContainer from '~/shared/components/page-centered-container';

export default function LoginPage() {
  return (
    <PageCenteredContainer>
      <KakaoLoginButton />
    </PageCenteredContainer>
  );
}
