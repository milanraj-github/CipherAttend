import React from 'react';
import { Box, Container, Typography, Button, Stack, Paper } from '@mui/material';
import { Shield, Lock, HowToReg, CameraAlt, InfoOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const Home = () => {
  const navigate = useNavigate();

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
      <Container maxWidth="sm">
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: '24px',
              background: 'var(--card-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--teal-border)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px var(--amber-border)',
              textAlign: 'center',
            }}
          >
            {/* Security Shield Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 3,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--amber-border) 0%, var(--teal-border) 100%)',
                border: '2px solid var(--amber-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px var(--teal-border)',
              }}
            >
              <Shield sx={{ fontSize: 44, color: 'var(--teal-accent)' }} />
            </Box>

            {/* Main Header Title */}
            <Typography
              variant="h3"
              fontWeight="900"
              sx={{
                color: 'var(--amber-accent)',
                letterSpacing: '-0.03em',
                fontFamily: '"JetBrains Mono", "Inter", sans-serif',
                fontSize: { xs: '1.85rem', sm: '2.3rem' },
                mb: 1.5,
              }}
            >
              CRYPTOLAB <span style={{ color: 'var(--teal-accent)' }}>ATTENDANCE</span>
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="body1"
              sx={{
                color: 'var(--text-secondary)',
                fontFamily: '"Inter", sans-serif',
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                mb: 5,
                fontWeight: 500,
              }}
            >
              AES-256-GCM Cryptographic Biometric Security
            </Typography>

            {/* Action Buttons */}
            <Stack spacing={2}>
              {/* 1. PROJECT INFORMATION */}
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<InfoOutlined sx={{ color: 'var(--teal-accent)' }} />}
                onClick={() => navigate('/project-info')}
                sx={{
                  py: 1.6,
                  borderRadius: '14px',
                  borderColor: 'var(--teal-accent)',
                  color: 'var(--teal-accent)',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  fontFamily: '"Inter", sans-serif',
                  borderWidth: '2px',
                  background: 'rgba(0, 224, 198, 0.08)',
                  boxShadow: '0 0 15px rgba(0, 224, 198, 0.15)',
                  '&:hover': {
                    borderWidth: '2px',
                    borderColor: 'var(--teal-accent)',
                    background: 'rgba(0, 224, 198, 0.18)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 25px rgba(0, 224, 198, 0.35)',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                ℹ️ PROJECT INFORMATION
              </Button>

              {/* 2. SIGN IN */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Lock sx={{ color: '#070A0F' }} />}
                onClick={() => navigate('/login')}
                sx={{
                  py: 1.6,
                  borderRadius: '14px',
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
                  transition: 'all 0.25s ease',
                }}
              >
                🔐 SIGN IN
              </Button>

              {/* 3. SIGN UP */}
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<HowToReg />}
                onClick={() => navigate('/register')}
                sx={{
                  py: 1.8,
                  borderRadius: '14px',
                  borderColor: '#00E0C6',
                  color: '#00E0C6',
                  fontWeight: '900',
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontFamily: '"Inter", sans-serif',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                    borderColor: '#00E0C6',
                    background: 'rgba(0, 224, 198, 0.12)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 0 20px rgba(0, 224, 198, 0.3)',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                📝 SIGN UP
              </Button>

              {/* 3. MARK ATTENDANCE */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<CameraAlt sx={{ color: '#070A0F' }} />}
                onClick={() => navigate('/mark-attendance')}
                sx={{
                  py: 1.8,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #00E0C6 0%, #0F766E 100%)',
                  color: '#070A0F',
                  fontWeight: '900',
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontFamily: '"Inter", sans-serif',
                  boxShadow: '0 8px 24px rgba(0, 224, 198, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(0, 224, 198, 0.45)',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                📷 MARK ATTENDANCE
              </Button>
            </Stack>
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Home;
