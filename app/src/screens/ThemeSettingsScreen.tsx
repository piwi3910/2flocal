import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Switch, Divider, Text, useTheme } from 'react-native-paper';
import { useAppTheme } from '../theme/ThemeProvider';
import { themeSpacing } from '../theme/theme';

const ThemeSettingsScreen: React.FC = () => {
  const { themeType, darkModeType, setThemeType, setDarkModeType, isDarkMode } = useAppTheme();
  const theme = useTheme();
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text 
        variant="headlineMedium" 
        style={[styles.title, { color: theme.colors.onBackground }]}
      >
        Theme Settings
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <List.Section>
          <List.Subheader style={{ color: theme.colors.onSurface }}>Theme Mode</List.Subheader>
          
          <List.Item
            title="Light Mode"
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="white-balance-sunny" color={theme.colors.onSurface} />}
            right={() => (
              <Switch
                value={themeType === 'light'}
                onValueChange={value => {
                  if (value) setThemeType('light');
                }}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Dark Mode"
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="moon-waning-crescent" color={theme.colors.onSurface} />}
            right={() => (
              <Switch
                value={themeType === 'dark'}
                onValueChange={value => {
                  if (value) setThemeType('dark');
                }}
                color={theme.colors.primary}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Use System Settings"
            titleStyle={{ color: theme.colors.onSurface }}
            left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.onSurface} />}
            right={() => (
              <Switch
                value={themeType === 'system'}
                onValueChange={value => {
                  if (value) setThemeType('system');
                }}
                color={theme.colors.primary}
              />
            )}
          />
        </List.Section>
      </View>
      
      {(themeType === 'dark' || (themeType === 'system' && isDarkMode)) && (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <List.Section>
            <List.Subheader style={{ color: theme.colors.onSurface }}>Dark Mode Options</List.Subheader>
            
            <List.Item
              title="OLED Dark Mode"
              titleStyle={{ color: theme.colors.onSurface }}
              description="Uses true black for better battery life on OLED screens"
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="cellphone" color={theme.colors.onSurface} />}
              right={() => (
                <Switch
                  value={darkModeType === 'oled'}
                  onValueChange={value => {
                    setDarkModeType(value ? 'oled' : 'dark');
                  }}
                  color={theme.colors.primary}
                />
              )}
            />
          </List.Section>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: themeSpacing.md,
  },
  title: {
    marginBottom: themeSpacing.md,
  },
  card: {
    borderRadius: 8,
    marginBottom: themeSpacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});

export default ThemeSettingsScreen;