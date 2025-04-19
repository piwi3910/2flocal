import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Switch } from 'react-native';
import { Divider, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../theme/ThemeProvider';
import {
  Button,
  Card,
  TextInput,
  Typography,
  DisplayLarge,
  HeadlineMedium,
  BodyMedium,
  BodySmall,
} from '../components/common';

/**
 * A screen to showcase all UI components in the design system
 */
const ComponentShowcaseScreen: React.FC = () => {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const [inputValue, setInputValue] = useState('');
  const [secureInputValue, setSecureInputValue] = useState('');
  const [errorInputValue, setErrorInputValue] = useState('');
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with theme toggle */}
        <View style={styles.header}>
          <DisplayLarge>2FLocal UI</DisplayLarge>
          <View style={styles.themeToggle}>
            <BodyMedium>Dark Mode</BodyMedium>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={isDarkMode ? theme.colors.primaryContainer : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Typography Section */}
        <SectionTitle title="Typography" />
        <View style={styles.section}>
          <Typography variant="displayLarge">Display Large</Typography>
          <Typography variant="displayMedium">Display Medium</Typography>
          <Typography variant="displaySmall">Display Small</Typography>
          <Typography variant="headlineLarge">Headline Large</Typography>
          <Typography variant="headlineMedium">Headline Medium</Typography>
          <Typography variant="headlineSmall">Headline Small</Typography>
          <Typography variant="titleLarge">Title Large</Typography>
          <Typography variant="titleMedium">Title Medium</Typography>
          <Typography variant="titleSmall">Title Small</Typography>
          <Typography variant="bodyLarge">Body Large</Typography>
          <Typography variant="bodyMedium">Body Medium</Typography>
          <Typography variant="bodySmall">Body Small</Typography>
          <Typography variant="labelLarge">Label Large</Typography>
          <Typography variant="labelMedium">Label Medium</Typography>
          <Typography variant="labelSmall">Label Small</Typography>
        </View>
        
        {/* Typography Styles */}
        <SectionTitle title="Typography Styles" />
        <View style={styles.section}>
          <Typography bold>Bold Text</Typography>
          <Typography italic>Italic Text</Typography>
          <Typography center>Centered Text</Typography>
          <Typography right>Right-aligned Text</Typography>
          <Typography color={theme.colors.primary}>Primary Color Text</Typography>
          <Typography color={theme.colors.error}>Error Color Text</Typography>
          <Typography color={theme.colors.success}>Success Color Text</Typography>
        </View>
        
        {/* Buttons Section */}
        <SectionTitle title="Buttons" />
        <View style={styles.section}>
          <View style={styles.buttonRow}>
            <Button label="Primary" onPress={() => {}} variant="primary" />
            <Button label="Secondary" onPress={() => {}} variant="secondary" />
            <Button label="Tertiary" onPress={() => {}} variant="tertiary" />
          </View>
          
          <View style={styles.buttonRow}>
            <Button label="Outline" onPress={() => {}} variant="outline" />
            <Button label="Text" onPress={() => {}} variant="text" />
          </View>
          
          <View style={styles.buttonRow}>
            <Button label="Small" onPress={() => {}} size="small" />
            <Button label="Medium" onPress={() => {}} size="medium" />
            <Button label="Large" onPress={() => {}} size="large" />
          </View>
          
          <View style={styles.buttonRow}>
            <Button label="With Icon" onPress={() => {}} icon="lock" />
            <Button label="Loading" onPress={() => {}} loading={true} />
            <Button label="Disabled" onPress={() => {}} disabled={true} />
          </View>
        </View>
        
        {/* Cards Section */}
        <SectionTitle title="Cards" />
        <View style={styles.section}>
          <Card
            title="Default Card"
            subtitle="With title and subtitle"
            content="This is a default card with title, subtitle, and content."
            onPress={() => {}}
          />
          
          <Card
            title="Elevated Card"
            subtitle="With elevation"
            content="This card has elevation applied to it."
            variant="elevated"
            onPress={() => {}}
          />
          
          <Card
            title="Outlined Card"
            subtitle="With border"
            content="This card has an outline border."
            variant="outlined"
            onPress={() => {}}
          />
          
          <Card
            title="Contained Card"
            subtitle="With background color"
            content="This card has a background color."
            variant="contained"
            onPress={() => {}}
          />
          
          <Card
            title="Card with Icons"
            subtitle="Left and right icons"
            content="This card has icons on both sides of the header."
            left={<IconButton icon="shield-lock" size={24} onPress={() => {}} />}
            right={<IconButton icon="dots-vertical" size={24} onPress={() => {}} />}
            withDivider
            onPress={() => {}}
          />
          
          <Card title="Card with Custom Content">
            <View style={styles.cardContent}>
              <BodyMedium>This card has custom content instead of a simple string.</BodyMedium>
              <Button label="Card Button" onPress={() => {}} size="small" style={styles.cardButton} />
            </View>
          </Card>
        </View>
        
        {/* Text Inputs Section */}
        <SectionTitle title="Text Inputs" />
        <View style={styles.section}>
          <TextInput
            label="Default Input"
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Enter text"
            helperText="This is a default outlined input"
          />
          
          <TextInput
            label="Flat Input"
            value={inputValue}
            onChangeText={setInputValue}
            variant="flat"
            placeholder="Enter text"
          />
          
          <TextInput
            label="With Left Icon"
            value={inputValue}
            onChangeText={setInputValue}
            leftIcon="account"
            placeholder="Enter username"
          />
          
          <TextInput
            label="With Right Icon"
            value={inputValue}
            onChangeText={setInputValue}
            rightIcon="magnify"
            placeholder="Search..."
          />
          
          <TextInput
            label="Password Input"
            value={secureInputValue}
            onChangeText={setSecureInputValue}
            secureTextEntry
            placeholder="Enter password"
          />
          
          <TextInput
            label="Error Input"
            value={errorInputValue}
            onChangeText={setErrorInputValue}
            error={true}
            errorMessage="This field is required"
            placeholder="Enter required field"
          />
          
          <TextInput
            label="Disabled Input"
            value="Disabled value"
            onChangeText={() => {}}
            disabled
          />
          
          <View style={styles.inputRow}>
            <TextInput
              label="Small"
              value={inputValue}
              onChangeText={setInputValue}
              size="small"
              style={styles.rowInput}
            />
            
            <TextInput
              label="Medium"
              value={inputValue}
              onChangeText={setInputValue}
              size="medium"
              style={styles.rowInput}
            />
            
            <TextInput
              label="Large"
              value={inputValue}
              onChangeText={setInputValue}
              size="large"
              style={styles.rowInput}
            />
          </View>
        </View>
        
        {/* Colors Section */}
        <SectionTitle title="Colors" />
        <View style={styles.section}>
          <View style={styles.colorRow}>
            <ColorSwatch color={theme.colors.primary} name="Primary" />
            <ColorSwatch color={theme.colors.primaryContainer} name="Primary Container" />
            <ColorSwatch color={theme.colors.secondary} name="Secondary" />
            <ColorSwatch color={theme.colors.secondaryContainer} name="Secondary Container" />
          </View>
          
          <View style={styles.colorRow}>
            <ColorSwatch color={theme.colors.tertiary} name="Tertiary" />
            <ColorSwatch color={theme.colors.tertiaryContainer} name="Tertiary Container" />
            <ColorSwatch color={theme.colors.surface} name="Surface" />
            <ColorSwatch color={theme.colors.background} name="Background" />
          </View>
          
          <View style={styles.colorRow}>
            <ColorSwatch color={theme.colors.error} name="Error" />
            <ColorSwatch color={theme.colors.success} name="Success" />
            <ColorSwatch color={theme.colors.warning} name="Warning" />
            <ColorSwatch color={theme.colors.info} name="Info" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Section Title Component
const SectionTitle: React.FC<{ title: string }> = ({ title }) => {
  const { theme } = useAppTheme();
  
  return (
    <View style={styles.sectionTitle}>
      <HeadlineMedium color={theme.colors.primary}>{title}</HeadlineMedium>
      <Divider style={[styles.divider, { backgroundColor: theme.colors.primary }]} />
    </View>
  );
};

// Color Swatch Component
const ColorSwatch: React.FC<{ color: string; name: string }> = ({ color, name }) => {
  const { theme } = useAppTheme();
  const textColor = isLightColor(color) ? '#000000' : '#FFFFFF';
  
  return (
    <View style={styles.colorSwatch}>
      <View style={[styles.colorSquare, { backgroundColor: color }]}>
        <BodySmall color={textColor}>{name}</BodySmall>
      </View>
      <BodySmall color={theme.colors.onSurface}>{color}</BodySmall>
    </View>
  );
};

// Helper function to determine if a color is light or dark
const isLightColor = (color: string): boolean => {
  // Simple check for light colors - not perfect but works for most cases
  return color.toLowerCase() === '#ffffff' || 
         color.toLowerCase() === 'white' || 
         color.startsWith('#F') || 
         color.startsWith('#f') || 
         color.startsWith('#E') || 
         color.startsWith('#e') || 
         color.startsWith('#D') || 
         color.startsWith('#d');
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    marginBottom: 24,
    gap: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  divider: {
    height: 2,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  cardContent: {
    gap: 8,
  },
  cardButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  rowInput: {
    flex: 1,
    minWidth: 100,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  colorSwatch: {
    alignItems: 'center',
    width: 80,
  },
  colorSquare: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginBottom: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
});

export default ComponentShowcaseScreen;