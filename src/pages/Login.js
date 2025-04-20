import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Alert,
  CircularProgress,
  Button,
  useTheme
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { CalendarMonth, Schedule, AutoAwesome } from '@mui/icons-material';

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, signInWithGoogle, error: authError } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is already set in the auth context
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.5
      }
    }
  };

  const floatingIconStyle = {
    position: 'absolute',
    zIndex: 0,
    opacity: 0.1,
    color: theme.palette.primary.main
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.secondary.main} 100%)`,
        padding: 0
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ width: '100%', maxWidth: '500px', position: 'relative', zIndex: 1 }}
      >
        {/* Floating background elements */}
        <motion.div 
          variants={iconVariants}
          style={{ 
            ...floatingIconStyle, 
            top: '10%', 
            left: '5%', 
            transform: 'rotate(-15deg)' 
          }}
        >
          <CalendarMonth sx={{ fontSize: 100 }} />
        </motion.div>
        <motion.div 
          variants={iconVariants}
          style={{ 
            ...floatingIconStyle, 
            bottom: '15%', 
            right: '10%', 
            transform: 'rotate(20deg)' 
          }}
        >
          <Schedule sx={{ fontSize: 120 }} />
        </motion.div>
        <motion.div 
          variants={iconVariants}
          style={{ 
            ...floatingIconStyle, 
            top: '50%', 
            right: '15%', 
            transform: 'rotate(-5deg)' 
          }}
        >
          <AutoAwesome sx={{ fontSize: 80 }} />
        </motion.div>

        {/* Main login card */}
        <Paper 
          elevation={24} 
          sx={{ 
            p: 5, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <motion.div variants={itemVariants}>
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                justifyContent: 'center'
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, 0, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1] 
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              >
                <CalendarMonth 
                  sx={{ 
                    fontSize: 48, 
                    color: theme.palette.primary.main,
                    mr: 1.5
                  }} 
                />
              </motion.div>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Smart Scheduler
              </Typography>
            </Box>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Typography 
              variant="h6" 
              align="center" 
              sx={{ 
                mb: 3, 
                fontWeight: 500,
                color: theme.palette.text.secondary
              }}
            >
              AI-Powered Meeting Management
            </Typography>
          </motion.div>
          
          <motion.div variants={itemVariants} style={{ width: '100%' }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 3,
                  borderRadius: '8px'
                }}
              >
                {error}
              </Alert>
            )}
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <CircularProgress size={48} />
            ) : (
              <Button
                variant="contained"
                size="large"
                onClick={handleGoogleSignIn}
                startIcon={
                  <img 
                    src="https://developers.google.com/identity/images/g-logo.png" 
                    alt="Google" 
                    width="20"
                    height="20"
                  />
                }
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 500,
                  boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)'
                }}
              >
                Sign in with Google
              </Button>
            )}
          </motion.div>
          
          <motion.div variants={itemVariants} style={{ marginTop: '32px', textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              By signing in, you agree to allow the app to access your Google Calendar 
              to provide AI-powered scheduling assistance.
            </Typography>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            style={{ 
              position: 'absolute',
              bottom: '12px',
              right: '16px',
              fontSize: '12px',
              color: theme.palette.text.disabled
            }}
          >
            v1.0.0
          </motion.div>
        </Paper>
      </motion.div>
    </Container>
  );
}

export default Login;
