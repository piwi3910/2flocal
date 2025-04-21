import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import FormButton from '../../components/auth/FormButton';

// Mock TOTP data for demonstration
const mockTOTPCodes = [
  {
    id: '1',
    issuer: 'Google',
    account: 'user@gmail.com',
    code: '123456',
    timeRemaining: 30,
  },
  {
    id: '2',
    issuer: 'GitHub',
    account: 'developer',
    code: '789012',
    timeRemaining: 15,
  },
  {
    id: '3',
    issuer: 'Microsoft',
    account: 'user@outlook.com',
    code: '345678',
    timeRemaining: 25,
  },
];

export default function TOTPListScreen() {
  const [totpCodes, setTotpCodes] = useState(mockTOTPCodes);

  // Function to handle adding a new TOTP code
  const handleAddTOTP = () => {
    Alert.alert('Coming Soon', 'This feature is not yet implemented.');
    // In a real app, this would navigate to the Add TOTP screen
    // router.push('/totp/add');
  };

  // Function to handle scanning a QR code
  const handleScanQRCode = () => {
    Alert.alert('Coming Soon', 'This feature is not yet implemented.');
    // In a real app, this would navigate to the Scan QR Code screen
    // router.push('/totp/scan');
  };

  // Function to handle TOTP item press
  const handleTOTPPress = (id: string) => {
    Alert.alert('Coming Soon', 'TOTP detail view is not yet implemented.');
    // In a real app, this would navigate to the TOTP detail screen
    // router.push({
    //   pathname: '/totp/[id]',
    //   params: { id }
    // });
  };

  // Render each TOTP item
  const renderTOTPItem = ({ item }: { item: typeof mockTOTPCodes[0] }) => (
    <TouchableOpacity
      style={styles.totpItem}
      onPress={() => handleTOTPPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.totpItemContent}>
        <View style={styles.totpItemHeader}>
          <Text style={styles.totpIssuer}>{item.issuer}</Text>
          <View style={styles.timeRemainingContainer}>
            <Text style={styles.timeRemainingText}>{item.timeRemaining}s</Text>
          </View>
        </View>
        
        <Text style={styles.totpAccount}>{item.account}</Text>
        
        <View style={styles.codeContainer}>
          <Text style={styles.totpCode}>{item.code}</Text>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={() => Alert.alert('Copied', `Code ${item.code} copied to clipboard`)}
          >
            <Ionicons name="copy-outline" size={20} color="#0066CC" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render empty state if no TOTP codes
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="shield-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>No TOTP Codes</Text>
      <Text style={styles.emptyStateMessage}>
        Add your first TOTP code by scanning a QR code or entering the details manually.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>TOTP Codes</Text>
        <Text style={styles.subtitle}>Your two-factor authentication codes</Text>
      </View>
      
      <FlatList
        data={totpCodes}
        renderItem={renderTOTPItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
      
      <View style={styles.actionButtons}>
        <FormButton
          title="Add Manually"
          variant="outline"
          onPress={handleAddTOTP}
          style={styles.actionButton}
        />
        
        <FormButton
          title="Scan QR Code"
          onPress={handleScanQRCode}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  totpItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  totpItemContent: {
    padding: 16,
  },
  totpItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totpIssuer: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timeRemainingContainer: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeRemainingText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  totpAccount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totpCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    letterSpacing: 2,
  },
  copyButton: {
    padding: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
});
