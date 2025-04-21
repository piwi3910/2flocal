import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import FormButton from '../../components/auth/FormButton';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // No need to navigate - the AuthContext will handle redirecting to the login screen
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'Not available'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email Verified</Text>
            <Text style={styles.infoValue}>
              {user?.isEmailVerified ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Account Created</Text>
            <Text style={styles.infoValue}>
              {user?.createdAt 
                ? new Date(user.createdAt).toLocaleDateString() 
                : 'Not available'}
            </Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <FormButton
            title="Edit Profile"
            variant="outline"
            onPress={() => Alert.alert('Coming Soon', 'This feature is not yet implemented.')}
            style={styles.actionButton}
          />
          
          <FormButton
            title="Change Password"
            variant="outline"
            onPress={() => Alert.alert('Coming Soon', 'This feature is not yet implemented.')}
            style={styles.actionButton}
          />
          
          <FormButton
            title="Biometric Settings"
            variant="outline"
            onPress={() => Alert.alert('Coming Soon', 'This feature is not yet implemented.')}
            style={styles.actionButton}
          />
          
          <FormButton
            title="Log Out"
            variant="secondary"
            onPress={handleLogout}
            isLoading={isLoggingOut}
            disabled={isLoggingOut}
            style={[styles.actionButton, styles.logoutButton]}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#F9F9F9',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 24,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  logoutButton: {
    marginTop: 12,
  },
});