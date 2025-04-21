# 2FLocal Expo App

A React Native Expo app for managing TOTP (Time-based One-Time Password) codes with offline support using WatermelonDB.

## Features

- Secure storage of TOTP secrets
- Offline access to TOTP codes
- Biometric authentication
- Sync with backend when online
- Dark mode support

## Tech Stack

- React Native with Expo
- TypeScript
- WatermelonDB for offline data storage
- Expo Router for navigation
- Expo Secure Store for secure storage
- Expo Local Authentication for biometric authentication

## Setup

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/2flocal-expo.git
   cd 2flocal-expo
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npx expo start
   ```

### Development Build

Since WatermelonDB requires native modules, you need to create a development build to use it:

1. Install EAS CLI:
   ```
   npm install -g eas-cli
   ```

2. Log in to your Expo account:
   ```
   eas login
   ```

3. Build a development client:
   ```
   eas build --profile development --platform android
   ```
   or
   ```
   eas build --profile development --platform ios
   ```

4. Once the build is complete, install it on your device or simulator.

5. Start the development server with the development client:
   ```
   npx expo start --dev-client
   ```

## Project Structure

```
2flocal-expo/
├── app/                   # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── assets/                # Static assets
├── components/            # Reusable components
├── context/               # React Context providers
├── database/              # WatermelonDB configuration
│   ├── models/            # Database models
│   ├── schema.ts          # Database schema
│   └── migrations.ts      # Database migrations
├── hooks/                 # Custom React hooks
├── plugins/               # Expo plugins
├── services/              # API and service functions
├── utils/                 # Utility functions
├── app.json               # Expo configuration
├── babel.config.js        # Babel configuration
├── eas.json               # EAS Build configuration
├── metro.config.js        # Metro bundler configuration
└── tsconfig.json          # TypeScript configuration
```

## WatermelonDB Usage

### Database Setup

The database is initialized in `database/index.ts`:

```typescript
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import migrations from './migrations';
import { User, TOTPCode, SyncLog } from './models';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: false,
  dbName: '2flocal.db',
});

export const database = new Database({
  adapter,
  modelClasses: [User, TOTPCode, SyncLog],
});
```

### Models

Models are defined in `database/models/` directory:

```typescript
// Example: TOTPCode.ts
import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export default class TOTPCode extends Model {
  static table = 'totp_codes';
  
  @field('issuer') issuer!: string;
  @field('account') account!: string;
  @field('secret') secret!: string;
  // ... other fields
}
```

### Querying Data

```typescript
import { database } from '../database';
import { TOTPCode } from '../database/models';
import { Q } from '@nozbe/watermelondb';

// Get all TOTP codes for a user
const getTOTPCodes = async (userId: string) => {
  const totpCollection = database.get<TOTPCode>('totp_codes');
  return await totpCollection.query(
    Q.where('user_id', userId)
  ).fetch();
};
```

### Creating Records

```typescript
import { database } from '../database';
import { TOTPCode } from '../database/models';

// Create a new TOTP code
const createTOTPCode = async (data) => {
  const totpCollection = database.get<TOTPCode>('totp_codes');
  
  return await database.write(async () => {
    return await totpCollection.create(code => {
      code.issuer = data.issuer;
      code.account = data.account;
      code.secret = data.secret;
      // ... set other fields
    });
  });
};
```

### Updating Records

```typescript
import { database } from '../database';
import { TOTPCode } from '../database/models';

// Update a TOTP code
const updateTOTPCode = async (id, data) => {
  const totpCollection = database.get<TOTPCode>('totp_codes');
  const code = await totpCollection.find(id);
  
  return await database.write(async () => {
    return await code.update(c => {
      if (data.issuer) c.issuer = data.issuer;
      if (data.account) c.account = data.account;
      // ... update other fields
    });
  });
};
```

### Deleting Records

```typescript
import { database } from '../database';
import { TOTPCode } from '../database/models';

// Delete a TOTP code
const deleteTOTPCode = async (id) => {
  const totpCollection = database.get<TOTPCode>('totp_codes');
  const code = await totpCollection.find(id);
  
  return await database.write(async () => {
    return await code.destroyPermanently();
  });
};
```

### Syncing with Backend

The app syncs with the backend when online using WatermelonDB's synchronization API:

```typescript
import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../database';

// Sync database with backend
const syncDatabase = async () => {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      // Fetch changes from server
      const response = await api.get('/sync', { params: { last_pulled_at: lastPulledAt } });
      return response.data;
    },
    pushChanges: async ({ changes }) => {
      // Push local changes to server
      await api.post('/sync', { changes });
    },
  });
};
```

## License

MIT
