import { PlayerManager } from '~/features/player/components/player-manager';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function PlayerPage() {
  return (
    <PageContainer>
      <PageTitle>Player Management</PageTitle>
      <PlayerManager />
    </PageContainer>
  );
}
