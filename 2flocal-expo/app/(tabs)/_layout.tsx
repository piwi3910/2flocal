import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0066CC',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderTopColor: isDark ? '#2C2C2E' : '#E0E0E0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'TOTP Codes',
          tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
