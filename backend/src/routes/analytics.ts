import { Hono } from 'hono';

export const analyticsRouter = new Hono();

analyticsRouter.get('/overview', (c) => {
  return c.json({
    data: {
      totalStablecoinMarketCapUSD: '10,875,000.00',
      totalStablecoinMarketCapPHP: '625,312,500.00',
      totalActiveHolders: 4311,
      volume24hUSD: '1,860,000.00',
      totalMints24hUSD: '250,000.00',
      totalBurns24hUSD: '110,000.00',
      netIssuance24hUSD: '+140,000.00',
      trackedStablecoinsCount: 2,
      lastBlockIndexed: 35811328,
    },
    timestamp: new Date().toISOString(),
  });
});

analyticsRouter.get('/timeseries', (c) => {
  // 7-day volume timeseries
  const history = [
    { date: '2026-11-03', volumeUSD: 1420000, transfers: 580 },
    { date: '2026-11-04', volumeUSD: 1680000, transfers: 642 },
    { date: '2026-11-05', volumeUSD: 1910000, transfers: 710 },
    { date: '2026-11-06', volumeUSD: 1750000, transfers: 689 },
    { date: '2026-11-07', volumeUSD: 2100000, transfers: 840 },
    { date: '2026-11-08', volumeUSD: 1950000, transfers: 795 },
    { date: '2026-11-09', volumeUSD: 1860000, transfers: 764 },
  ];

  return c.json({ data: history });
});
