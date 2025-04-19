# 2FLocal UI Design System Documentation

## Overview

The 2FLocal UI Design System provides a consistent, accessible, and visually appealing set of components and styles for the 2FLocal mobile application. This design system is built on top of React Native Paper and follows Material Design principles while maintaining the security-focused nature of the app.

## Design Principles

1. **Security-Focused**: The design system uses visual cues to indicate security states and emphasizes the security-focused nature of the app.
2. **Consistency**: All components follow the same design language and behavior patterns.
3. **Accessibility**: The design system meets WCAG 2.1 AA accessibility standards for contrast and usability.
4. **Responsiveness**: All components adapt to different screen sizes and orientations.
5. **Simplicity**: The design system prioritizes simplicity and clarity to enhance usability.

## Color Palette

### Primary Colors

- **Primary**: `#006494` (Light mode) / `#4DA1A9` (Dark mode)
  - Deep blue representing security and trust
  - Used for primary actions, navigation elements, and key UI components

- **Secondary**: `#4DA1A9` (Light mode) / `#81D4FA` (Dark mode)
  - Teal representing modern technology
  - Used for secondary actions and supporting UI elements

- **Tertiary**: `#D7263D` (Light mode) / `#FF6B6B` (Dark mode)
  - Red representing alerts and important actions
  - Used for critical actions, alerts, and highlighting important information

### Semantic Colors

- **Success**: `#2E933C` (Light mode) / `#4CAF50` (Dark mode)
  - Green representing successful operations
  - Used for success messages, completed actions, and positive feedback

- **Warning**: `#F9A826` (Light mode) / `#FFB74D` (Dark mode)
  - Orange representing warnings
  - Used for warning messages and actions that require caution

- **Error**: `#D7263D` (Light mode) / `#FF6B6B` (Dark mode)
  - Red representing errors
  - Used for error messages, failed actions, and critical alerts

- **Info**: `#2196F3` (Light mode) / `#64B5F6` (Dark mode)
  - Blue representing information
  - Used for informational messages and neutral notifications

### Surface Colors

- **Background**: `#F5F5F5` (Light mode) / `#121212` (Dark mode)
  - Used for the main background of the app

- **Surface**: `#FFFFFF` (Light mode) / `#1E1E1E` (Dark mode)
  - Used for cards, dialogs, and other elevated surfaces

- **Surface Variant**: `#E7E7E7` (Light mode) / `#2C2C2C` (Dark mode)
  - Used for alternative surfaces and subtle distinctions

### Accessibility

All color combinations in the design system meet WCAG 2.1 AA accessibility standards for contrast. The color palette has been carefully selected to ensure readability and usability for all users, including those with visual impairments.

## Typography

The typography system is based on a hierarchical scale that ensures readability and visual harmony. The system uses the system font for optimal performance and native feel.

### Font Family

- **Primary Font**: System font (San Francisco on iOS, Roboto on Android)

### Type Scale

- **Display**: Large, prominent text for major features and page headers
  - Display Large: 32px
  - Display Medium: 24px
  - Display Small: 20px

- **Headline**: Important text that needs emphasis
  - Headline Large: 20px
  - Headline Medium: 18px
  - Headline Small: 16px

- **Title**: Section headers and important content
  - Title Large: 18px
  - Title Medium: 16px
  - Title Small: 14px

- **Body**: Main content text
  - Body Large: 16px
  - Body Medium: 14px
  - Body Small: 12px

- **Label**: Small text for labels and annotations
  - Label Large: 14px
  - Label Medium: 12px
  - Label Small: 11px

### Usage Guidelines

- Use the appropriate typography variant for the content's importance and hierarchy
- Maintain consistent use of typography throughout the application
- Avoid using too many different styles on a single screen
- Ensure text remains readable on all background colors

## Components

### Button

The Button component provides a customizable button with various styles and states.

#### Variants

- **Primary**: Filled button with primary color background
- **Secondary**: Filled button with secondary color background
- **Tertiary**: Elevated button with tertiary color background
- **Outline**: Outlined button with transparent background
- **Text**: Text-only button with no background

#### Sizes

- **Small**: Compact size for tight spaces
- **Medium**: Standard size for most use cases
- **Large**: Larger size for emphasis or touch targets

#### Props

- `label`: Button text
- `onPress`: Function to call when button is pressed
- `variant`: Button variant ('primary', 'secondary', 'tertiary', 'outline', 'text')
- `size`: Button size ('small', 'medium', 'large')
- `loading`: Whether to show a loading indicator
- `disabled`: Whether the button is disabled
- `icon`: Icon to display on the left of the button text
- `style`: Additional styles for the button
- `labelStyle`: Additional styles for the button label
- `testID`: Test ID for testing

#### Usage Example

```tsx
<Button
  label="Sign In"
  onPress={handleSignIn}
  variant="primary"
  size="medium"
  icon="login"
/>
```

### Card

The Card component provides a container for related content and actions.

#### Variants

- **Default**: Standard card with subtle elevation
- **Elevated**: Card with more pronounced elevation
- **Outlined**: Card with border and transparent background
- **Contained**: Card with surface variant background color

#### Props

- `title`: Card title
- `subtitle`: Card subtitle
- `content`: Card content as a string (for simple cards)
- `children`: Card content as React elements (for complex cards)
- `onPress`: Function to call when card is pressed
- `variant`: Card variant ('default', 'elevated', 'outlined', 'contained')
- `style`: Additional styles for the card
- `testID`: Test ID for testing
- `left`: Left icon or component to display in the card header
- `right`: Right icon or component to display in the card header
- `withDivider`: Whether to show a divider between the header and content

#### Usage Example

```tsx
<Card
  title="Security Key"
  subtitle="TOTP Authentication"
  content="Your security key provides an additional layer of protection."
  variant="outlined"
  onPress={handleCardPress}
  left={<IconButton icon="shield" size={24} />}
/>
```

### TextInput

The TextInput component provides a customizable text input field with various styles and states.

#### Variants

- **Default**: Standard input with outline
- **Outlined**: Input with outline (same as default)
- **Flat**: Input with bottom border only

#### Sizes

- **Small**: Compact size for tight spaces
- **Medium**: Standard size for most use cases
- **Large**: Larger size for emphasis or touch targets

#### Props

- `label`: Input label
- `value`: Current value of the input
- `onChangeText`: Function to call when input value changes
- `variant`: Input variant ('default', 'outlined', 'flat')
- `size`: Input size ('small', 'medium', 'large')
- `placeholder`: Placeholder text when input is empty
- `disabled`: Whether the input is disabled
- `error`: Whether the input is in error state
- `errorMessage`: Error message to display
- `helperText`: Helper text to display below the input
- `leftIcon`: Left icon name
- `rightIcon`: Right icon name
- `onRightIconPress`: Function to call when right icon is pressed
- `secureTextEntry`: Whether the input is for password entry
- `keyboardType`: Keyboard type
- `autoCapitalize`: Auto capitalize behavior
- `autoCorrect`: Auto correct behavior
- `maxLength`: Maximum length of input
- `style`: Additional styles for the input container
- `inputStyle`: Additional styles for the input
- `testID`: Test ID for testing

#### Usage Example

```tsx
<TextInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry
  leftIcon="lock"
  errorMessage={passwordError}
  error={!!passwordError}
  helperText="Password must be at least 8 characters"
/>
```

### Typography

The Typography component provides consistent text styling throughout the application.

#### Variants

All Material Design typography variants are supported:
- Display: displayLarge, displayMedium, displaySmall
- Headline: headlineLarge, headlineMedium, headlineSmall
- Title: titleLarge, titleMedium, titleSmall
- Body: bodyLarge, bodyMedium, bodySmall
- Label: labelLarge, labelMedium, labelSmall

#### Props

- `children`: Text content
- `variant`: Typography variant
- `color`: Text color
- `center`: Whether the text is centered
- `right`: Whether the text is right-aligned
- `bold`: Whether the text is bold
- `italic`: Whether the text is italic
- `numberOfLines`: Number of lines before truncating
- `style`: Additional styles for the text
- `testID`: Test ID for testing

#### Usage Example

```tsx
<Typography variant="headlineMedium" bold>
  Welcome to 2FLocal
</Typography>

<BodyMedium>
  Secure your accounts with two-factor authentication.
</BodyMedium>
```

## Theme Provider

The ThemeProvider component provides theme context and functionality for switching between light and dark themes.

### Usage

Wrap your application with the ThemeProvider:

```tsx
import ThemeProvider from './src/theme/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

### Theme Hook

Use the `useAppTheme` hook to access the theme and theme-related functions:

```tsx
import { useAppTheme } from './src/theme/ThemeProvider';

function MyComponent() {
  const { theme, isDarkMode, toggleTheme, setThemeType } = useAppTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      {/* Your component content */}
      <Switch value={isDarkMode} onValueChange={toggleTheme} />
    </View>
  );
}
```

## Responsive Design

The design system is built to be responsive and adapt to different screen sizes and orientations. Components automatically adjust their layout and sizing based on the device's screen dimensions.

### Guidelines

- Use flexible layouts that adapt to different screen sizes
- Test your UI on both small and large devices
- Consider both portrait and landscape orientations
- Use the SafeAreaView component to handle notches and safe areas

## Accessibility

The design system is designed to be accessible to all users, including those with disabilities. All components meet WCAG 2.1 AA accessibility standards.

### Guidelines

- Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Provide text alternatives for non-text content
- Make all functionality available from a keyboard
- Provide clear and consistent navigation
- Use appropriate text sizes and spacing
- Test with screen readers and other assistive technologies

## Component Showcase

A ComponentShowcaseScreen is available to demonstrate all UI components in the design system. Use this screen to explore the available components and their variants.

```tsx
import ComponentShowcaseScreen from './src/screens/ComponentShowcaseScreen';

// Add to your navigation
<Stack.Screen name="ComponentShowcase" component={ComponentShowcaseScreen} />
```

## Best Practices

1. **Consistency**: Use the provided components consistently throughout the application
2. **Simplicity**: Keep UI simple and focused on the task at hand
3. **Feedback**: Provide clear feedback for user actions
4. **Accessibility**: Ensure all UI elements are accessible to all users
5. **Performance**: Optimize UI for performance, especially on lower-end devices
6. **Security**: Use visual cues to indicate security states and actions
7. **Testing**: Test UI on various devices and screen sizes

## Implementation Notes

- The design system is built on top of React Native Paper
- Custom components extend and customize Paper components
- The theme is based on Material Design 3 (MD3) with custom colors and typography
- Dark mode is fully supported with appropriate color adjustments