import { appSchema, tableSchema } from '@nozbe/watermelondb';

// Define the database schema
export default appSchema({
  version: 1,
  tables: [
    // User table
    tableSchema({
      name: 'users',
      columns: [
        { name: 'email', type: 'string', isIndexed: true },
        { name: 'name', type: 'string', isOptional: true },
        { name: 'is_email_verified', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'last_synced_at', type: 'number' },
      ],
    }),
    
    // TOTP table
    tableSchema({
      name: 'totp_codes',
      columns: [
        { name: 'issuer', type: 'string' },
        { name: 'account', type: 'string' },
        { name: 'secret', type: 'string' },
        { name: 'algorithm', type: 'string', isOptional: true },
        { name: 'digits', type: 'number', isOptional: true },
        { name: 'period', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'last_synced_at', type: 'number' },
        { name: 'is_favorite', type: 'boolean', isOptional: true },
        { name: 'user_id', type: 'string', isIndexed: true },
      ],
    }),
    
    // Sync log table to track sync status
    tableSchema({
      name: 'sync_logs',
      columns: [
        { name: 'entity_type', type: 'string', isIndexed: true },
        { name: 'entity_id', type: 'string', isIndexed: true },
        { name: 'sync_status', type: 'string' }, // 'pending', 'synced', 'failed'
        { name: 'last_attempted_at', type: 'number' },
        { name: 'error_message', type: 'string', isOptional: true },
        { name: 'retry_count', type: 'number' },
      ],
    }),
  ],
});