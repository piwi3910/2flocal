import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { TOTPSecret } from '../../services/totpService';

interface TOTPItemProps {
  item: TOTPSecret;
  onPress: (item: TOTPSecret) => void;
  onDelete: (item: TOTPSecret) => void;
  onShare: (item: TOTPSecret) => void;
}

const TOTPItem: React.FC<TOTPItemProps> = ({ item, onPress, onDelete, onShare }) => {
  // Handle delete confirmation
  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete ${item.issuer} (${item.label})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => onDelete(item),
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.issuer}>{item.issuer}</Text>
        <Text style={styles.label}>{item.label}</Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={() => onShare(item)}
        >
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  issuer: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#666666',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  shareButton: {
    backgroundColor: '#E0E0E0',
  },
  deleteButton: {
    backgroundColor: '#FFE0E0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
});

// Memoize the component to prevent unnecessary re-renders
export default memo(TOTPItem);