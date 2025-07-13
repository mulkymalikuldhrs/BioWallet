import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    border: string;
    primary: string;
    secondary: string;
    accent: string;
    error: string;
    success: string;
    warning: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');
  
  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync('theme');
        if (savedTheme) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    
    loadTheme();
  }, []);
  
  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await SecureStore.setItemAsync('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };
  
  // Determine if we should use dark mode
  const isDark = theme === 'system' 
    ? systemColorScheme === 'dark' 
    : theme === 'dark';
  
  // Define colors based on theme
  const colors = {
    background: isDark ? '#121212' : '#FFFFFF',
    card: isDark ? '#1E1E1E' : '#F5F5F5',
    text: isDark ? '#FFFFFF' : '#000000',
    border: isDark ? '#2C2C2C' : '#E0E0E0',
    primary: '#3B82F6', // Blue
    secondary: isDark ? '#6B7280' : '#9CA3AF',
    accent: isDark ? '#F59E0B' : '#F59E0B', // Gold/Amber
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  };
  
  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};