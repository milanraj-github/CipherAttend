import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      mode: 'dark',
      isDarkMode: true,
      toggleTheme: () => {},
    };
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('cipherattend_theme') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('cipherattend_theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDarkMode = mode === 'dark';

  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode,
        primary: {
          main: isDarkMode ? '#00E0C6' : '#0F766E',
          light: isDarkMode ? '#5EEAD4' : '#14B8A6',
          dark: isDarkMode ? '#0F766E' : '#042F2E',
          contrastText: isDarkMode ? '#070A0F' : '#FFFFFF',
        },
        secondary: {
          main: isDarkMode ? '#FFB000' : '#B45309',
          light: isDarkMode ? '#FCD34D' : '#D97706',
          dark: isDarkMode ? '#B45309' : '#78350F',
          contrastText: '#FFFFFF',
        },
        background: {
          default: isDarkMode ? '#070A0F' : '#F8FAFC',
          paper: isDarkMode ? '#0D131F' : '#FFFFFF',
        },
        text: {
          primary: isDarkMode ? '#F3F4F6' : '#0F172A',
          secondary: isDarkMode ? '#9CA3AF' : '#334155',
        },
        divider: isDarkMode ? 'rgba(0, 224, 198, 0.15)' : '#E2E8F0',
      },
      typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: { fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' },
        h2: { fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' },
        h3: { fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' },
        h4: { fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' },
        h5: { fontWeight: 700, color: isDarkMode ? '#F3F4F6' : '#0F172A' },
        h6: { fontWeight: 700, color: isDarkMode ? '#F3F4F6' : '#0F172A' },
        subtitle1: { fontWeight: 600, color: isDarkMode ? '#F3F4F6' : '#1E293B' },
        subtitle2: { fontWeight: 600, color: isDarkMode ? '#9CA3AF' : '#334155' },
        body1: { color: isDarkMode ? '#F3F4F6' : '#1E293B' },
        body2: { color: isDarkMode ? '#9CA3AF' : '#334155' },
      },
      shape: {
        borderRadius: 12,
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 10,
            },
          },
        },
      },
    });
  }, [mode, isDarkMode]);

  return (
    <ThemeContext.Provider value={{ mode, isDarkMode, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
