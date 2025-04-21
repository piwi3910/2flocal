import { database } from '../database';
import { TOTPCode } from '../database/models';
import { Q } from '@nozbe/watermelondb';
import { generateTOTP } from '../utils/totpGenerator';

// Interface for TOTP code creation
export interface TOTPCodeData {
  issuer: string;
  account: string;
  secret: string;
  algorithm?: string;
  digits?: number;
  period?: number;
  userId: string;
}

// TOTP Service for managing TOTP codes
const totpService = {
  // Get all TOTP codes for a user
  getAllTOTPCodes: async (userId: string) => {
    try {
      const totpCollection = database.get<TOTPCode>('totp_codes');
      const totpCodes = await totpCollection.query(
        Q.where('user_id', userId)
      ).fetch();
      
      return totpCodes.map(code => ({
        id: code.id,
        issuer: code.issuer,
        account: code.account,
        secret: code.secret,
        algorithm: code.algorithm,
        digits: code.digits,
        period: code.period,
        isFavorite: code.isFavorite,
        userId: code.userId,
        createdAt: code.createdAt,
        updatedAt: code.updatedAt,
      }));
    } catch (error) {
      console.error('Error getting TOTP codes:', error);
      throw error;
    }
  },
  
  // Get a single TOTP code by ID
  getTOTPCode: async (id: string) => {
    try {
      const totpCollection = database.get<TOTPCode>('totp_codes');
      const code = await totpCollection.find(id);
      
      return {
        id: code.id,
        issuer: code.issuer,
        account: code.account,
        secret: code.secret,
        algorithm: code.algorithm,
        digits: code.digits,
        period: code.period,
        isFavorite: code.isFavorite,
        userId: code.userId,
        createdAt: code.createdAt,
        updatedAt: code.updatedAt,
      };
    } catch (error) {
      console.error('Error getting TOTP code:', error);
      throw error;
    }
  },
  
  // Create a new TOTP code
  createTOTPCode: async (data: TOTPCodeData) => {
    try {
      const totpCollection = database.get<TOTPCode>('totp_codes');
      
      let newCode: TOTPCode | undefined;
      await database.write(async () => {
        newCode = await totpCollection.create(code => {
          code.issuer = data.issuer;
          code.account = data.account;
          code.secret = data.secret;
          code.algorithm = data.algorithm || 'SHA1';
          code.digits = data.digits || 6;
          code.period = data.period || 30;
          code.userId = data.userId;
          code.isFavorite = false;
        });
      });
      
      if (!newCode) {
        throw new Error('Failed to create TOTP code');
      }
      
      return {
        id: newCode.id,
        issuer: newCode.issuer,
        account: newCode.account,
        secret: newCode.secret,
        algorithm: newCode.algorithm,
        digits: newCode.digits,
        period: newCode.period,
        isFavorite: newCode.isFavorite,
        userId: newCode.userId,
        createdAt: newCode.createdAt,
        updatedAt: newCode.updatedAt,
      };
    } catch (error) {
      console.error('Error creating TOTP code:', error);
      throw error;
    }
  },
  
  // Update a TOTP code
  updateTOTPCode: async (id: string, data: Partial<TOTPCodeData>) => {
    try {
      const totpCollection = database.get<TOTPCode>('totp_codes');
      const code = await totpCollection.find(id);
      
      await database.write(async () => {
        await code.update(c => {
          if (data.issuer) c.issuer = data.issuer;
          if (data.account) c.account = data.account;
          if (data.secret) c.secret = data.secret;
          if (data.algorithm) c.algorithm = data.algorithm;
          if (data.digits) c.digits = data.digits;
          if (data.period) c.period = data.period;
        });
      });
      
      return {
        id: code.id,
        issuer: code.issuer,
        account: code.account,
        secret: code.secret,
        algorithm: code.algorithm,
        digits: code.digits,
        period: code.period,
        isFavorite: code.isFavorite,
        userId: code.userId,
        createdAt: code.createdAt,
        updatedAt: code.updatedAt,
      };
    } catch (error) {
      console.error('Error updating TOTP code:', error);
      throw error;
    }
  },
  
  // Delete a TOTP code
  deleteTOTPCode: async (id: string) => {
    try {
      const totpCollection = database.get<TOTPCode>('totp_codes');
      const code = await totpCollection.find(id);
      
      await database.write(async () => {
        await code.destroyPermanently();
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting TOTP code:', error);
      throw error;
    }
  },
  
  // Toggle favorite status
  toggleFavorite: async (id: string) => {
    try {
      const totpCollection = database.get<TOTPCode>('totp_codes');
      const code = await totpCollection.find(id);
      
      await database.write(async () => {
        await code.update(c => {
          c.isFavorite = !c.isFavorite;
        });
      });
      
      return {
        id: code.id,
        isFavorite: code.isFavorite,
      };
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      throw error;
    }
  },
  
  // Generate current TOTP code
  generateTOTPCode: async (id: string) => {
    try {
      const totpCollection = database.get<TOTPCode>('totp_codes');
      const code = await totpCollection.find(id);
      
      const totpCode = generateTOTP(
        code.secret,
        code.algorithm || 'SHA1',
        code.digits || 6,
        code.period || 30
      );
      
      const timeRemaining = getTimeRemaining(code.period || 30);
      
      return {
        code: totpCode,
        timeRemaining,
      };
    } catch (error) {
      console.error('Error generating TOTP code:', error);
      throw error;
    }
  },
};

// Helper function to calculate time remaining
function getTimeRemaining(period: number): number {
  const currentTime = Math.floor(Date.now() / 1000);
  return period - (currentTime % period);
}

export default totpService;