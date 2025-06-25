import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { useAuthInit } from '~/features/auth/hooks/use-auth-init';
import { Loading } from '~/features/loading/components/loading';
import HomePage from '~/pages/home/home.page';
import LoginPage from '~/pages/login/login.page';
import LoginCallbackPage from '~/pages/login/login-callback.page';
import ScorePage from '~/pages/score/score.page';
import RequireAuth from '~/shared/components/require-auth';
import AppLayout from '~/shared/layouts/app-layout';
import PublicLayout from '~/shared/layouts/public-layout';

export default function App() {
  const { loading } = useAuthInit();

  if (loading) return <Loading />;

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/callback" element={<LoginCallbackPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/score" element={<ScorePage />} />
            </Route>
          </Route>
          <Route path="*" element={<div className="text-2xl font-bold">404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
      <Loading />
    </>
  );
}
