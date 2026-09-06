export const REPORT_TARGETS = ['USER', 'LISTING'] as const;
export type ReportTarget = (typeof REPORT_TARGETS)[number];

export const REPORT_REASONS = [
  'FRAUD',
  'SPAM',
  'PROHIBITED_ITEM',
  'HARASSMENT',
  'MISLEADING',
  'DUPLICATE',
  'OTHER',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_STATUSES = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];
