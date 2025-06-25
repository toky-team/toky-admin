import { Button } from '~/shared/ui/button';

export default function KakaoLoginButton() {
  const redirectToLogin = () => {
    const callback = encodeURIComponent(window.location.origin + '/login/callback');
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/login/kakao?callback=${callback}`;
  };

  return <Button onClick={redirectToLogin}>카카오톡으로 로그인</Button>;
}
