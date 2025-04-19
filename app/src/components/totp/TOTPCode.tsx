import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { TOTPCode as TOTPCodeType } from '../../services/totpService';

interface TOTPCodeProps {
  secretId: string;
  onGetTOTPCode: (secretId: string) => Promise<TOTPCodeType>;
  initialTOTPData?: TOTPCodeType;
}

const TOTPCode: React.FC<TOTPCodeProps> = ({ secretId, onGetTOTPCode, initialTOTPData }) => {
  const [totpData, setTotpData] = useState<TOTPCodeType | null>(initialTOTPData || null);
  const [remainingTime, setRemainingTime] = useState<number>(initialTOTPData?.remainingSeconds || 0);
  const [isLoading, setIsLoading] = useState<boolean>(!initialTOTPData);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch TOTP code
  const fetchTOTPCode = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await onGetTOTPCode(secretId);
      setTotpData(data);
      setRemainingTime(data.remainingSeconds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get TOTP code');
    } finally {
      setIsLoading(false);
    }
  }, [secretId, onGetTOTPCode]);

  // Initial fetch
  useEffect(() => {
    if (!initialTOTPData) {
      fetchTOTPCode();
    }
  }, [fetchTOTPCode, initialTOTPData]);

  // Countdown timer
  useEffect(() => {
    if (!totpData || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          // When timer reaches 0, fetch a new TOTP code
          fetchTOTPCode();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [totpData, remainingTime, fetchTOTPCode]);

  // Format TOTP code with spaces for better readability
  const formatTOTPCode = (code: string): string => {
    if (code.length === 6) {
      return `${code.substring(0, 3)} ${code.substring(3)}`;
    }
    return code;
  };

  // Calculate progress percentage for the progress bar
  const calculateProgress = (): number => {
    if (!totpData) return 0;
    return (remainingTime / totpData.period) * 100;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!totpData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No TOTP data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.issuerText}>{totpData.issuer}</Text>
      <Text style={styles.labelText}>{totpData.label}</Text>
      <Text style={styles.codeText}>{formatTOTPCode(totpData.code)}</Text>
      
      <View style={styles.timerContainer}>
        <View style={[styles.progressBar, { width: `${calculateProgress()}%` }]} />
        <Text style={styles.timerText}>{remainingTime}s</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  issuerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  labelText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    marginVertical: 12,
    fontFamily: 'monospace',
  },
  timerContainer: {
    height: 24,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#0066CC',
  },
  timerText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    fontSize: 14,
  },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(TOTPCode);