export const QUEUE_NOTIFICATIONS = 'notifications';
export const QUEUE_MEDIA = 'media';
export const QUEUE_INDEXING = 'indexing';
export const QUEUE_SYSTEM = 'system';

export interface NotificationJob {
  notificationId: string;
}

export interface MediaJob {
  listingId: string;
  storageKey: string;
}

export interface IndexingJob {
  listingId: string;
}

export interface SystemJob {
  task: 'purge-expired-sessions' | 'purge-expired-verifications';
}
