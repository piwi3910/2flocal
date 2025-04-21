import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import { Q } from '@nozbe/watermelondb';

export default class User extends Model {
  static table = 'users';
  
  static associations: Associations = {
    totp_codes: { type: 'has_many' as const, foreignKey: 'user_id' },
  };

  @field('email') email!: string;
  @field('name') name?: string;
  @field('is_email_verified') isEmailVerified!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('last_synced_at') lastSyncedAt!: Date;

  // Helper method to get user's TOTP codes
  async totpCodes() {
    return this.collections.get('totp_codes').query(
      Q.where('user_id', this.id)
    ).fetch();
  }
}