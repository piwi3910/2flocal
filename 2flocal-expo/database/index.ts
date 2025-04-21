import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { synchronize } from '@nozbe/watermelondb/sync';
import { Q } from '@nozbe/watermelondb';

import schema from './schema';
// Import empty migrations array
import migrations from './migrations';
import { User, TOTPCode, SyncLog } from './models';
import api from '../services/apiClient';
import { secureStorage, SecureStorageKeys } from '../services/secureStorageService';

const apiClient = api;

// Initialize the SQLite adapter
// Initialize the SQLite adapter
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: false, // Disable JSI to avoid initialization errors
  onSetUpError: error => {
    // Handle database setup errors
    console.error('Database setup error:', error);
  },
  dbName: '2flocal.db', // Name of the database file
});

// Initialize the database with the adapter and models
export const database = new Database({
  adapter,
  modelClasses: [User, TOTPCode, SyncLog],
});

// Sync function to synchronize local database with the backend
export async function syncDatabase() {
  try {
    // Get the authentication token
    const token = await secureStorage.getItem(SecureStorageKeys.ACCESS_TOKEN);
    
    if (!token) {
      console.log('No auth token available, skipping sync');
      return;
    }

    // Perform the synchronization
    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt }) => {
        try {
          // Get changes from the server since the last pull
          const response = await apiClient.get('/sync', {
            params: { last_pulled_at: lastPulledAt },
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const { changes, timestamp } = response.data;
          return { changes, timestamp };
        } catch (error) {
          console.error('Error pulling changes:', error);
          // Return empty changes if there's an error
          return { changes: { users: { created: [], updated: [], deleted: [] }, totp_codes: { created: [], updated: [], deleted: [] } }, timestamp: Date.now() };
        }
      },
      pushChanges: async ({ changes }) => {
        try {
          // Push local changes to the server
          await apiClient.post('/sync', { changes }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          console.error('Error pushing changes:', error);
          // Log failed sync operations to retry later
          await logFailedSyncOperations(changes);
        }
      },
      migrationsEnabledAtVersion: 1,
    });
    
    console.log('Sync completed successfully');
    
    // Try to process any failed sync operations
    await processFailedSyncOperations(token);
  } catch (error) {
    console.error('Sync failed:', error);
    // Handle sync errors
  }
}

// Log failed sync operations to retry later
async function logFailedSyncOperations(changes: any) {
  try {
    const syncLogsCollection = database.get<SyncLog>('sync_logs');
    
    await database.write(async () => {
      // Log failed user changes
      for (const table of ['users', 'totp_codes']) {
        for (const operation of ['created', 'updated', 'deleted']) {
          if (changes[table] && changes[table][operation]) {
            for (const item of changes[table][operation]) {
              await syncLogsCollection.create(log => {
                log.entityType = table;
                log.entityId = item.id;
                log.syncState = 'failed';
                log.retryCount = 0;
                log.lastAttemptedAt = new Date();
              });
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error logging failed sync operations:', error);
  }
}

// Process failed sync operations
async function processFailedSyncOperations(token: string) {
  try {
    const syncLogsCollection = database.get<SyncLog>('sync_logs');
    const failedLogs = await syncLogsCollection.query(
      Q.where('sync_state', 'failed'),
      Q.where('retry_count', Q.lt(5))
    ).fetch();
    
    if (failedLogs.length === 0) {
      return;
    }
    
    console.log(`Processing ${failedLogs.length} failed sync operations`);
    
    for (const log of failedLogs) {
      try {
        // Get the entity data
        const entityCollection = database.get(log.entityType);
        const entity = await entityCollection.find(log.entityId).catch(() => null);
        
        if (entity) {
          // Push the entity to the server
          await apiClient.post(`/sync/${log.entityType}/${log.entityId}`, {
            data: entity._raw,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Mark as synced
          await log.markAsSynced();
        } else {
          // Entity not found, mark as synced to remove from retry queue
          await log.markAsSynced();
        }
      } catch (error) {
        console.error(`Error processing failed sync operation for ${log.entityType}/${log.entityId}:`, error);
        
        // Increment retry count
        await log.markAsFailed((error as Error).message || 'Unknown error');
      }
    }
  } catch (error) {
    console.error('Error processing failed sync operations:', error);
  }
}