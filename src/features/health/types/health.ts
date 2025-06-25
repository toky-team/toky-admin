export interface Health {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    rss: string;
    heapTotal: string;
    heapUsed: string;
  };
  services: {
    database: string;
    redis: string;
  };
}
