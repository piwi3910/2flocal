import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class SyncLog extends Model {
  static table = 'sync_logs';

  @field('entity_type') entityType!: string;
  @field('entity_id') entityId!: string;
  @field('sync_status') syncState!: 'pending' | 'synced' | 'failed';
  @field('retry_count') retryCount!: number;
  @field('error_message') errorMessage?: string;
  @readonly @date('last_attempted_at') lastAttemptedAt!: Date;

  // Mark as synced
  markAsSynced() {
    return this.update((log) => {
      log.syncState = 'synced';
    });
  }

  // Mark as failed
  markAsFailed(errorMessage: string) {
    return this.update((log) => {
      log.syncState = 'failed';
      log.errorMessage = errorMessage;
      log.retryCount = log.retryCount + 1;
    });
  }

  // Mark for retry
  markForRetry() {
    return this.update((log) => {
      log.syncState = 'pending';
    });
  }
}