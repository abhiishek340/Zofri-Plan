import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './contexts/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AnimatePresence } from 'framer-motion';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScheduleMeeting from './pages/ScheduleMeeting';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';

// Create a theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Vibrant blue
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f43f5e', // Rose
      light: '#fb7185',
      dark: '#e11d48',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    success: {
      main: '#10b981', // Emerald
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // Amber
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // Red
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#0ea5e9', // Sky blue
      light: '#38bdf8',
      dark: '#0284c7',
    },
    text: {
      primary: '#1e293b', // Slate-800
      secondary: '#64748b', // Slate-500
      disabled: '#cbd5e1', // Slate-300
    },
    divider: 'rgba(203, 213, 225, 0.3)', // Slate-300 with transparency
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.05),0px 1px 1px 0px rgba(0,0,0,0.04),0px 1px 3px 0px rgba(0,0,0,0.03)',
    '0px 3px 1px -2px rgba(0,0,0,0.05),0px 2px 2px 0px rgba(0,0,0,0.04),0px 1px 5px 0px rgba(0,0,0,0.03)',
    '0px 3px 3px -2px rgba(0,0,0,0.05),0px 3px 4px 0px rgba(0,0,0,0.04),0px 1px 8px 0px rgba(0,0,0,0.03)',
    '0px 2px 4px -1px rgba(0,0,0,0.05),0px 4px 5px 0px rgba(0,0,0,0.04),0px 1px 10px 0px rgba(0,0,0,0.03)',
    '0px 3px 5px -1px rgba(0,0,0,0.05),0px 5px 8px 0px rgba(0,0,0,0.04),0px 1px 14px 0px rgba(0,0,0,0.03)',
    '0px 3px 5px -1px rgba(0,0,0,0.05),0px 6px 10px 0px rgba(0,0,0,0.04),0px 1px 18px 0px rgba(0,0,0,0.03)',
    '0px 4px 5px -2px rgba(0,0,0,0.05),0px 7px 10px 1px rgba(0,0,0,0.04),0px 2px 16px 1px rgba(0,0,0,0.03)',
    '0px 5px 5px -3px rgba(0,0,0,0.05),0px 8px 10px 1px rgba(0,0,0,0.04),0px 3px 14px 2px rgba(0,0,0,0.03)',
    '0px 5px 6px -3px rgba(0,0,0,0.05),0px 9px 12px 1px rgba(0,0,0,0.04),0px 3px 16px 2px rgba(0,0,0,0.03)',
    '0px 6px 6px -3px rgba(0,0,0,0.05),0px 10px 14px 1px rgba(0,0,0,0.04),0px 4px 18px 3px rgba(0,0,0,0.03)',
    '0px 6px 7px -4px rgba(0,0,0,0.05),0px 11px 15px 1px rgba(0,0,0,0.04),0px 4px 20px 3px rgba(0,0,0,0.03)',
    '0px 7px 8px -4px rgba(0,0,0,0.05),0px 12px 17px 2px rgba(0,0,0,0.04),0px 5px 22px 4px rgba(0,0,0,0.03)',
    '0px 7px 8px -4px rgba(0,0,0,0.05),0px 13px 19px 2px rgba(0,0,0,0.04),0px 5px 24px 4px rgba(0,0,0,0.03)',
    '0px 7px 9px -4px rgba(0,0,0,0.05),0px 14px 21px 2px rgba(0,0,0,0.04),0px 5px 26px 4px rgba(0,0,0,0.03)',
    '0px 8px 9px -5px rgba(0,0,0,0.05),0px 15px 22px 2px rgba(0,0,0,0.04),0px 6px 28px 5px rgba(0,0,0,0.03)',
    '0px 8px 10px -5px rgba(0,0,0,0.05),0px 16px 24px 2px rgba(0,0,0,0.04),0px 6px 30px 5px rgba(0,0,0,0.03)',
    '0px 8px 11px -5px rgba(0,0,0,0.05),0px 17px 26px 2px rgba(0,0,0,0.04),0px 6px 32px 5px rgba(0,0,0,0.03)',
    '0px 9px 11px -5px rgba(0,0,0,0.05),0px 18px 28px 2px rgba(0,0,0,0.04),0px 7px 34px 6px rgba(0,0,0,0.03)',
    '0px 9px 12px -6px rgba(0,0,0,0.05),0px 19px 29px 2px rgba(0,0,0,0.04),0px 7px 36px 6px rgba(0,0,0,0.03)',
    '0px 10px 13px -6px rgba(0,0,0,0.05),0px 20px 31px 3px rgba(0,0,0,0.04),0px 8px 38px 7px rgba(0,0,0,0.03)',
    '0px 10px 13px -6px rgba(0,0,0,0.05),0px 21px 33px 3px rgba(0,0,0,0.04),0px 8px 40px 7px rgba(0,0,0,0.03)',
    '0px 10px 14px -6px rgba(0,0,0,0.05),0px 22px 35px 3px rgba(0,0,0,0.04),0px 8px 42px 7px rgba(0,0,0,0.03)',
    '0px 11px 14px -7px rgba(0,0,0,0.05),0px 23px 36px 3px rgba(0,0,0,0.04),0px 9px 44px 8px rgba(0,0,0,0.03)',
    '0px 11px 15px -7px rgba(0,0,0,0.05),0px 24px 38px 3px rgba(0,0,0,0.04),0px 9px 46px 8px rgba(0,0,0,0.03)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          paddingTop: 10,
          paddingBottom: 10, 
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease-in-out',
        },
        elevation1: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.07)',
        },
        elevation3: {
          boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'visible',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.12)',
          },
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
        },
      },
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const location = useLocation();

  useEffect(() => {
    // Initialize AOS animation library
    AOS.init({
      duration: 800,
      easing: 'ease-out',
      once: true,
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="schedule" element={<ScheduleMeeting />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
