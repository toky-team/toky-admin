import { useHealth } from '~/features/health/hooks/use-health';
import { formatSecond } from '~/shared/lib/formatSecond';
import { Card } from '~/shared/ui/card';

export function HealthSummary() {
  const { data, error } = useHealth();

  if (!data && !error) {
    return <Card className="text-sm text-muted text-center">⏳ 상태 확인 중...</Card>;
  }

  if (error || !data) {
    return <Card className="text-sm text-danger text-center">❌ 서버 상태 오류</Card>;
  }

  return (
    <Card className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="font-semibold">⏱ Uptime</p>
        <p>{formatSecond(data.uptime)}</p>
      </div>
      <div>
        <p className="font-semibold">🧠 Memory</p>
        <p>
          RSS: {data.memory.rss}
          <br />
          Heap: {data.memory.heapUsed} / {data.memory.heapTotal}
        </p>
      </div>
      <div>
        <p className="font-semibold">🗄 DB</p>
        <p className={data.services.database === 'connected' ? 'text-success' : 'text-danger'}>
          {data.services.database}
        </p>
      </div>
      <div>
        <p className="font-semibold">📦 Redis</p>
        <p className={data.services.redis === 'connected' ? 'text-success' : 'text-danger'}>{data.services.redis}</p>
      </div>
    </Card>
  );
}
