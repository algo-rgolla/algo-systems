import type { ScanCounterListDto } from '@/api/types/dtos'
import { SCANS } from '@/features/stocks/scans'

export const scanCounters: ScanCounterListDto = {
  isAdmin: false,
  scanCounters: [
    { scanType: SCANS.longUnusualVolume, scanTypeText: 'Unusual Volume', scanResultCount: 6 },
    { scanType: SCANS.longBigGainers, scanTypeText: 'Big Gainers', scanResultCount: 6 },
    { scanType: SCANS.longEmaCrossover, scanTypeText: 'EMA Crossover', scanResultCount: 6 },
  ],
}
