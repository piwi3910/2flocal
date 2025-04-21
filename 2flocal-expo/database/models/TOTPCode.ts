import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class TOTPCode extends Model {
  static table = 'totp_codes';
  
  static associations: Associations = {
    users: { type: 'belongs_to' as const, key: 'user_id' },
  };

  @field('issuer') issuer!: string;
  @field('account') account!: string;
  @field('secret') secret!: string;
  @field('algorithm') algorithm?: string;
  @field('digits') digits?: number;
  @field('period') period?: number;
  @field('is_favorite') isFavorite?: boolean;
  @field('user_id') userId!: string;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('last_synced_at') lastSyncedAt!: Date;

  // Generate TOTP code based on the secret and current time
  generateTOTPCode(): string {
    // This is a placeholder. In a real implementation, you would use a TOTP library
    // to generate the code based on the secret, algorithm, digits, and period.
    return '123456';
  }

  // Get time remaining until the code expires (in seconds)
  getTimeRemaining(): number {
    const period = this.period || 30; // Default period is 30 seconds
    const currentTime = Math.floor(Date.now() / 1000);
    return period - (currentTime % period);
  }
}