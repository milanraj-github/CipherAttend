import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Fade,
  Paper,
  Stack,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { authAPI } from '../services/api';

const MotionPaper = motion(Paper);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData);
      const { access_token, user } = response.data;
      
      login(user, access_token);
      navigate('/dashboard');
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.detail || 'Invalid input. Please check your email and password format.';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later or contact support.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = `Connection error: ${error.message}. Please check your internet connection.`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      background: 'var(--card-inner)',
      border: '1px solid var(--teal-border)',
      color: 'var(--text-primary)',
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.9rem',
      '& fieldset': {
        border: 'none',
      },
      '& input': {
        py: 1.5,
        color: 'var(--text-primary)',
        '&::placeholder': {
          color: 'var(--text-secondary)',
          opacity: 0.8,
        },
      },
      '&:hover': {
        border: '1px solid var(--amber-border)',
      },
      '&.Mui-focused': {
        boxShadow: '0 0 15px var(--teal-border)',
        border: '1px solid var(--teal-accent)',
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'var(--bg-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
        color: 'var(--text-primary)',
      }}
    >
      <Container maxWidth="xs">
        <MotionPaper
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          elevation={0}
          sx={{
            p: { xs: 3.5, sm: 4.5 },
            borderRadius: '24px',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--teal-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 25px var(--amber-border)',
          }}
        >
          {/* Header Icon */}
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              mb: 2.5,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--amber-border) 0%, var(--teal-border) 100%)',
              border: '2px solid var(--amber-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px var(--amber-border)',
            }}
          >
            <Lock sx={{ fontSize: 32, color: 'var(--amber-accent)' }} />
          </Box>

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Typography
              variant="h4"
              fontWeight="900"
              gutterBottom
              sx={{
                color: 'var(--amber-accent)',
                letterSpacing: '-0.02em',
                fontFamily: '"JetBrains Mono", "Inter", sans-serif',
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                mb: 0.8,
              }}
            >
              Welcome back
            </Typography>
            
            <Typography
              variant="body2"
              sx={{
                color: 'var(--text-secondary)',
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              Enter credentials to access Cryptography Command Center
            </Typography>
          </Box>

          {/* Alert Message */}
          {error && (
            <Fade in timeout={400}>
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: '12px',
                  background: 'rgba(255, 176, 0, 0.15)',
                  border: '1px solid rgba(255, 176, 0, 0.4)',
                  color: '#FFB000',
                  '& .MuiAlert-icon': { color: '#FFB000' },
                }}
              >
                <Typography variant="body2" fontWeight="600" sx={{ fontFamily: '"Inter", sans-serif', fontSize: '0.8rem' }}>
                  {error}
                </Typography>
              </Alert>
            </Fade>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} autoComplete="off">
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                name="email"
                type="email"
                placeholder="Email address *"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="new-email"
                inputProps={{
                  autoComplete: 'new-email',
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#00E0C6', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />

              <TextField
                fullWidth
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password *"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="new-password"
                inputProps={{
                  autoComplete: 'new-password',
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#FFB000', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        sx={{
                          color: '#64748b',
                          '&:hover': { color: '#00E0C6' },
                        }}
                      >
                        {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{
                  py: 1.6,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FFB000 0%, #D97706 100%)',
                  color: '#070A0F',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  fontFamily: '"Inter", sans-serif',
                  boxShadow: '0 8px 24px rgba(255, 176, 0, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(255, 176, 0, 0.45)',
                  },
                  '&:disabled': {
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#64748b',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </Stack>
          </Box>

          {/* Footer Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#9CA3AF',
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.85rem',
              }}
            >
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#00E0C6',
                  textDecoration: 'none',
                  fontWeight: '700',
                }}
              >
                Create account
              </Link>
            </Typography>
          </Box>
        </MotionPaper>
      </Container>
    </Box>
  );
};

export default Login;