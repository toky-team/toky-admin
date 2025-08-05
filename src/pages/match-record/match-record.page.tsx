import { MatchRecordManager } from '~/features/match-record/components/match-record-manager';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function MatchRecordPage() {
  return (
    <PageContainer>
      <PageTitle>Match Record Management</PageTitle>
      <MatchRecordManager />
    </PageContainer>
  );
}
