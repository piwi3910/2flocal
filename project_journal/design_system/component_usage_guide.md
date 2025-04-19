# 2FLocal Component Usage Guide

This guide provides detailed examples and best practices for using the 2FLocal UI components in different scenarios.

## Table of Contents

1. [Button Usage](#button-usage)
2. [Card Usage](#card-usage)
3. [TextInput Usage](#textinput-usage)
4. [Typography Usage](#typography-usage)
5. [Common Patterns](#common-patterns)
6. [Accessibility Considerations](#accessibility-considerations)
7. [Responsive Design](#responsive-design)

## Button Usage

Buttons are used to trigger actions or navigate between screens. The 2FLocal design system provides several button variants and sizes to accommodate different use cases.

### Primary Actions

Use primary buttons for the main action on a screen. There should typically be only one primary button per screen or section.

```tsx
import { Button } from '../components/common';

// Primary action button
<Button
  label="Sign In"
  onPress={handleSignIn}
  variant="primary"
  size="medium"
/>

// Primary action with loading state
<Button
  label="Sign In"
  onPress={handleSignIn}
  variant="primary"
  loading={isLoading}
/>
```

### Secondary Actions

Use secondary buttons for alternative actions that are less important than the primary action.

```tsx
// Secondary action button
<Button
  label="Cancel"
  onPress={handleCancel}
  variant="secondary"
  size="medium"
/>

// Secondary action with icon
<Button
  label="Settings"
  onPress={navigateToSettings}
  variant="secondary"
  icon="cog"
/>
```

### Tertiary Actions

Use tertiary buttons for actions that are less important than secondary actions or for actions that need to stand out from secondary actions.

```tsx
// Tertiary action button
<Button
  label="Learn More"
  onPress={showMoreInfo}
  variant="tertiary"
  size="medium"
/>
```

### Outline and Text Buttons

Use outline and text buttons for less prominent actions or in areas where a filled button would be too visually heavy.

```tsx
// Outline button
<Button
  label="Skip"
  onPress={handleSkip}
  variant="outline"
  size="medium"
/>

// Text button
<Button
  label="Forgot Password?"
  onPress={navigateToForgotPassword}
  variant="text"
  size="small"
/>
```

### Button Sizes

Choose the appropriate button size based on the context and importance of the action.

```tsx
// Small button for compact UIs
<Button
  label="Add"
  onPress={handleAdd}
  variant="primary"
  size="small"
/>

// Medium button for standard actions
<Button
  label="Continue"
  onPress={handleContinue}
  variant="primary"
  size="medium"
/>

// Large button for important actions or touch-friendly UIs
<Button
  label="Create Account"
  onPress={handleCreateAccount}
  variant="primary"
  size="large"
/>
```

### Button with Icons

Add icons to buttons to enhance their meaning and provide visual cues.

```tsx
// Button with left icon
<Button
  label="Secure Login"
  onPress={handleLogin}
  variant="primary"
  icon="shield-lock"
/>
```

### Disabled Buttons

Use disabled buttons to indicate that an action is not currently available.

```tsx
// Disabled button
<Button
  label="Submit"
  onPress={handleSubmit}
  variant="primary"
  disabled={!isFormValid}
/>
```

## Card Usage

Cards are used to group related content and actions. The 2FLocal design system provides several card variants to accommodate different use cases.

### Basic Card

Use basic cards for simple content grouping.

```tsx
import { Card } from '../components/common';

// Basic card with title, subtitle, and content
<Card
  title="Security Key"
  subtitle="TOTP Authentication"
  content="Your security key provides an additional layer of protection."
/>
```

### Interactive Card

Make cards interactive when they represent a selectable item or lead to more details.

```tsx
// Interactive card
<Card
  title="Google Account"
  subtitle="john.doe@gmail.com"
  content="2FA enabled with backup codes"
  onPress={() => navigateToAccountDetails('google')}
/>
```

### Card Variants

Choose the appropriate card variant based on the content and context.

```tsx
// Elevated card for emphasis
<Card
  title="Premium Feature"
  subtitle="Upgrade Required"
  content="This feature is available with a premium subscription."
  variant="elevated"
/>

// Outlined card for a lighter visual weight
<Card
  title="Backup Codes"
  subtitle="Store these safely"
  content="Use these codes if you lose access to your authentication app."
  variant="outlined"
/>

// Contained card for grouped content
<Card
  title="Recent Activity"
  subtitle="Last 7 days"
  content="No suspicious login attempts detected."
  variant="contained"
/>
```

### Card with Icons

Add icons to cards to enhance their meaning and provide visual cues.

```tsx
import { IconButton } from 'react-native-paper';

// Card with left and right icons
<Card
  title="Account Security"
  subtitle="Security settings and options"
  content="Configure two-factor authentication and other security features."
  left={<IconButton icon="shield-lock" size={24} onPress={() => {}} />}
  right={<IconButton icon="chevron-right" size={24} onPress={() => {}} />}
/>
```

### Card with Custom Content

Use custom content for more complex card layouts.

```tsx
import { View } from 'react-native';
import { Button, Typography } from '../components/common';

// Card with custom content
<Card title="Account Security">
  <View style={{ gap: 8 }}>
    <Typography variant="bodyMedium">
      Your account is protected with two-factor authentication.
    </Typography>
    <Typography variant="bodyMedium" bold>
      Last login: April 19, 2025 at 10:30 AM
    </Typography>
    <Button
      label="Review Activity"
      onPress={handleReviewActivity}
      variant="outline"
      size="small"
    />
  </View>
</Card>
```

## TextInput Usage

Text inputs are used to collect user input. The 2FLocal design system provides several text input variants and configurations to accommodate different use cases.

### Basic Text Input

Use basic text inputs for simple text entry.

```tsx
import { TextInput } from '../components/common';
import { useState } from 'react';

// Component with state
const MyComponent = () => {
  const [username, setUsername] = useState('');
  
  return (
    <TextInput
      label="Username"
      value={username}
      onChangeText={setUsername}
      placeholder="Enter your username"
    />
  );
};
```

### Input Variants

Choose the appropriate input variant based on the context and visual design.

```tsx
// Outlined input (default)
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  variant="outlined"
/>

// Flat input
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  variant="flat"
/>
```

### Input with Icons

Add icons to inputs to enhance their meaning and provide visual cues.

```tsx
// Input with left icon
<TextInput
  label="Username"
  value={username}
  onChangeText={setUsername}
  leftIcon="account"
/>

// Input with right icon
<TextInput
  label="Search"
  value={searchQuery}
  onChangeText={setSearchQuery}
  rightIcon="magnify"
/>

// Password input with toggle icon
<TextInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>
```

### Input Validation

Use error states and helper text to provide feedback on input validation.

```tsx
// Input with error
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  error={!isValidEmail(email) && email.length > 0}
  errorMessage="Please enter a valid email address"
/>

// Input with helper text
<TextInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  helperText="Password must be at least 8 characters"
/>
```

### Input Sizes

Choose the appropriate input size based on the context and form layout.

```tsx
// Small input
<TextInput
  label="Verification Code"
  value={code}
  onChangeText={setCode}
  size="small"
  keyboardType="numeric"
/>

// Medium input (default)
<TextInput
  label="Full Name"
  value={fullName}
  onChangeText={setFullName}
  size="medium"
/>

// Large input
<TextInput
  label="Address"
  value={address}
  onChangeText={setAddress}
  size="large"
/>
```

### Specialized Input Types

Configure inputs for specific types of data.

```tsx
// Email input
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  autoCorrect={false}
/>

// Password input
<TextInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  autoCapitalize="none"
  autoCorrect={false}
/>

// Numeric input
<TextInput
  label="PIN"
  value={pin}
  onChangeText={setPin}
  keyboardType="numeric"
  maxLength={6}
/>
```

## Typography Usage

Typography components are used to display text with consistent styling. The 2FLocal design system provides a comprehensive typography system to accommodate different use cases.

### Basic Typography

Use the Typography component for consistent text styling.

```tsx
import { Typography } from '../components/common';

// Basic typography
<Typography variant="bodyMedium">
  This is a standard body text.
</Typography>
```

### Typography Variants

Choose the appropriate typography variant based on the content and hierarchy.

```tsx
// Display variants for major headers
<Typography variant="displayLarge">Welcome to 2FLocal</Typography>
<Typography variant="displayMedium">Security Features</Typography>
<Typography variant="displaySmall">Account Setup</Typography>

// Headline variants for section headers
<Typography variant="headlineLarge">Authentication</Typography>
<Typography variant="headlineMedium">Backup Options</Typography>
<Typography variant="headlineSmall">Advanced Settings</Typography>

// Title variants for subsections and card titles
<Typography variant="titleLarge">Security Key</Typography>
<Typography variant="titleMedium">Backup Codes</Typography>
<Typography variant="titleSmall">Recovery Email</Typography>

// Body variants for main content
<Typography variant="bodyLarge">Primary content text.</Typography>
<Typography variant="bodyMedium">Standard content text.</Typography>
<Typography variant="bodySmall">Secondary content text.</Typography>

// Label variants for form labels and small text
<Typography variant="labelLarge">Username</Typography>
<Typography variant="labelMedium">Last updated: April 19, 2025</Typography>
<Typography variant="labelSmall">Terms and conditions apply</Typography>
```

### Typography Convenience Components

Use the convenience components for common typography variants.

```tsx
import {
  DisplayLarge,
  HeadlineMedium,
  TitleLarge,
  BodyMedium,
  LabelSmall
} from '../components/common';

// Convenience components
<DisplayLarge>Welcome to 2FLocal</DisplayLarge>
<HeadlineMedium>Security Features</HeadlineMedium>
<TitleLarge>Authentication</TitleLarge>
<BodyMedium>Protect your accounts with two-factor authentication.</BodyMedium>
<LabelSmall>Terms and conditions apply</LabelSmall>
```

### Typography Styles

Apply additional styles to typography components.

```tsx
// Bold text
<Typography variant="bodyMedium" bold>
  This is important information.
</Typography>

// Italic text
<Typography variant="bodyMedium" italic>
  Note: This feature is in beta.
</Typography>

// Centered text
<Typography variant="bodyMedium" center>
  Centered information.
</Typography>

// Right-aligned text
<Typography variant="bodyMedium" right>
  Right-aligned information.
</Typography>

// Colored text
<Typography variant="bodyMedium" color="#006494">
  Custom colored text.
</Typography>
```

### Typography with Line Limits

Limit the number of lines for typography components.

```tsx
// Limit to 2 lines with ellipsis
<Typography variant="bodyMedium" numberOfLines={2}>
  This is a long text that will be truncated after two lines. The rest of the text will be hidden and an ellipsis will be shown.
</Typography>
```

## Common Patterns

This section provides examples of common UI patterns using the 2FLocal components.

### Form Pattern

```tsx
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Typography } from '../components/common';
import { useState } from 'react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = () => {
    setIsLoading(true);
    // Login logic
  };
  
  return (
    <View style={styles.container}>
      <Typography variant="headlineLarge" center style={styles.title}>
        Sign In
      </Typography>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="email"
        style={styles.input}
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        leftIcon="lock"
        style={styles.input}
      />
      
      <Button
        label="Sign In"
        onPress={handleLogin}
        variant="primary"
        size="large"
        loading={isLoading}
        style={styles.button}
      />
      
      <Button
        label="Forgot Password?"
        onPress={() => {}}
        variant="text"
        size="medium"
        style={styles.textButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  textButton: {
    alignSelf: 'center',
  },
});
```

### List Pattern

```tsx
import { FlatList, StyleSheet, View } from 'react-native';
import { Card, Typography } from '../components/common';

const AccountsList = ({ accounts, onSelectAccount }) => {
  const renderItem = ({ item }) => (
    <Card
      title={item.name}
      subtitle={item.email}
      content={`Last login: ${item.lastLogin}`}
      variant="outlined"
      onPress={() => onSelectAccount(item)}
      style={styles.card}
    />
  );
  
  return (
    <View style={styles.container}>
      <Typography variant="headlineMedium" style={styles.title}>
        Your Accounts
      </Typography>
      
      <FlatList
        data={accounts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    margin: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 8,
  },
});
```

### Detail Pattern

```tsx
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Typography } from '../components/common';
import { Divider } from 'react-native-paper';

const AccountDetail = ({ account, onEditAccount, onDeleteAccount }) => {
  return (
    <ScrollView style={styles.container}>
      <Typography variant="headlineLarge" style={styles.title}>
        Account Details
      </Typography>
      
      <Card
        title={account.name}
        subtitle={account.email}
        variant="outlined"
        style={styles.card}
      />
      
      <View style={styles.section}>
        <Typography variant="titleMedium" style={styles.sectionTitle}>
          Security Settings
        </Typography>
        <Divider style={styles.divider} />
        
        <View style={styles.row}>
          <Typography variant="bodyMedium">Two-Factor Authentication</Typography>
          <Typography variant="bodyMedium" bold>
            {account.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </Typography>
        </View>
        
        <View style={styles.row}>
          <Typography variant="bodyMedium">Backup Codes</Typography>
          <Typography variant="bodyMedium" bold>
            {account.backupCodesGenerated ? 'Generated' : 'Not Generated'}
          </Typography>
        </View>
        
        <View style={styles.row}>
          <Typography variant="bodyMedium">Recovery Email</Typography>
          <Typography variant="bodyMedium" bold>
            {account.recoveryEmail || 'Not Set'}
          </Typography>
        </View>
      </View>
      
      <View style={styles.actions}>
        <Button
          label="Edit Account"
          onPress={() => onEditAccount(account)}
          variant="primary"
          style={styles.button}
        />
        
        <Button
          label="Delete Account"
          onPress={() => onDeleteAccount(account)}
          variant="outline"
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  actions: {
    marginTop: 16,
  },
  button: {
    marginBottom: 8,
  },
});
```

## Accessibility Considerations

This section provides guidance on making your UI components accessible to all users.

### Button Accessibility

- Ensure buttons have clear, descriptive labels
- Use appropriate button sizes for touch targets (minimum 44x44px)
- Maintain sufficient contrast between button text and background
- Use loading states to indicate when a button action is in progress

```tsx
// Accessible button example
<Button
  label="Create Account"
  onPress={handleCreateAccount}
  variant="primary"
  size="large"
  testID="create-account-button"
/>
```

### TextInput Accessibility

- Always use labels for text inputs
- Provide clear error messages for validation errors
- Use helper text to provide additional context
- Set appropriate keyboard types for different input types

```tsx
// Accessible text input example
<TextInput
  label="Email Address"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  error={!isValidEmail(email) && email.length > 0}
  errorMessage="Please enter a valid email address"
  helperText="We'll never share your email with anyone else"
  testID="email-input"
/>
```

### Typography Accessibility

- Use appropriate typography variants for content hierarchy
- Maintain sufficient contrast between text and background
- Avoid using color as the only means of conveying information
- Support dynamic text sizes for users with visual impairments

```tsx
// Accessible typography example
<Typography 
  variant="bodyLarge" 
  color={theme.colors.onSurface}
  testID="terms-text"
>
  By creating an account, you agree to our Terms of Service and Privacy Policy.
</Typography>
```

## Responsive Design

This section provides guidance on making your UI components responsive to different screen sizes and orientations.

### Responsive Layout

Use flexible layouts that adapt to different screen sizes.

```tsx
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Card, Typography } from '../components/common';

const ResponsiveGrid = ({ items }) => {
  const { width } = useWindowDimensions();
  const numColumns = width > 600 ? 2 : 1;
  
  return (
    <View style={styles.container}>
      <View style={[styles.grid, { flexDirection: numColumns > 1 ? 'row' : 'column' }]}>
        {items.map((item) => (
          <View 
            key={item.id} 
            style={[
              styles.gridItem, 
              { width: numColumns > 1 ? '48%' : '100%' }
            ]}
          >
            <Card
              title={item.title}
              content={item.content}
              onPress={() => {}}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  grid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: 16,
  },
});
```

### Orientation Support

Handle both portrait and landscape orientations.

```tsx
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Button, Typography } from '../components/common';

const OrientationAwareLayout = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.content, 
        { flexDirection: isLandscape ? 'row' : 'column' }
      ]}>
        <View style={[
          styles.section, 
          { width: isLandscape ? '40%' : '100%' }
        ]}>
          <Typography variant="headlineLarge">
            Welcome to 2FLocal
          </Typography>
          <Typography variant="bodyMedium" style={styles.description}>
            Secure your accounts with two-factor authentication.
          </Typography>
        </View>
        
        <View style={[
          styles.section, 
          { width: isLandscape ? '60%' : '100%' }
        ]}>
          <Button
            label="Get Started"
            onPress={() => {}}
            variant="primary"
            size="large"
            style={styles.button}
          />
          
          <Button
            label="Learn More"
            onPress={() => {}}
            variant="outline"
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  section: {
    padding: 16,
  },
  description: {
    marginTop: 8,
    marginBottom: 24,
  },
  button: {
    marginBottom: 16,
  },
});
```

### Safe Area Handling

Use SafeAreaView to handle notches and safe areas.

```tsx
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../components/common';

const SafeAreaScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Typography variant="headlineLarge">
        Safe Area Screen
      </Typography>
      {/* Your screen content */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});