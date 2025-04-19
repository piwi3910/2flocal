import axios from 'axios';
import { api } from './apiClient';

// Types for TOTP management
export interface TOTPSecret {
  id: string;
  issuer: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export interface TOTPCode {
  code: string;
  remainingSeconds: number;
  period: number;
  issuer: string;
  label: string;
}

export interface TOTPQRCode {
  qrCode: string;
  uri: string;
}

export interface TOTPSecretData {
  issuer: string;
  label: string;
  secret: string;
}

export interface TOTPUriData {
  uri: string;
  secret: string;
  issuer: string;
  label: string;
  algorithm?: string;
  digits?: number;
  period?: number;
}

// TOTP service functions
const totpService = {
  // Get all TOTP secrets for the current user
  getSecrets: async (): Promise<TOTPSecret[]> => {
    try {
      const response = await api.get('/accounts');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get TOTP secrets');
      }
      throw new Error('Network error while fetching TOTP secrets');
    }
  },

  // Get TOTP code for a specific secret
  getTOTPCode: async (secretId: string): Promise<TOTPCode> => {
    try {
      const response = await api.get(`/accounts/${secretId}/totp`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get TOTP code');
      }
      throw new Error('Network error while fetching TOTP code');
    }
  },

  // Add a new TOTP secret
  addSecret: async (data: TOTPSecretData): Promise<TOTPSecret> => {
    try {
      const response = await api.post('/accounts', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to add TOTP secret');
      }
      throw new Error('Network error while adding TOTP secret');
    }
  },

  // Delete a TOTP secret
  deleteSecret: async (secretId: string): Promise<void> => {
    try {
      await api.delete(`/accounts/${secretId}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to delete TOTP secret');
      }
      throw new Error('Network error while deleting TOTP secret');
    }
  },

  // Generate QR code for a TOTP secret
  generateQRCode: async (secretId: string): Promise<TOTPQRCode> => {
    try {
      const response = await api.get(`/accounts/${secretId}/qrcode`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to generate QR code');
      }
      throw new Error('Network error while generating QR code');
    }
  },

  // Parse QR code image to extract TOTP secret
  parseQRCode: async (image: string): Promise<TOTPUriData> => {
    try {
      const response = await api.post('/accounts/parse-qrcode', { image });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to parse QR code');
      }
      throw new Error('Network error while parsing QR code');
    }
  }
};

export default totpService;