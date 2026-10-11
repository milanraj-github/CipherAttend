import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Paper,
  Button,
  Divider,
} from '@mui/material';
import {
  Lock,
  Tag,
  VpnKey,
  Badge,
  Timer,
  Face,
  CheckCircle,
  Security,
  Fingerprint,
  ArrowForward,
  Shield,
  HowToReg,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThemeMode } from '../context/ThemeContext';
import BiometricFlowchart from './BiometricFlowchart';

const MotionBox = motion(Box);

const ProjectInformation = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useThemeMode();

  // 8 Objectives
  const objectives = [
    {
      num: 1,
      title: 'Biometric Authentication via Facial Recognition',
      desc: 'To implement biometric authentication using facial recognition.',
      icon: <Face sx={{ color: isDarkMode ? '#00E0C6' : '#0F766E' }} />,
    },
    {
      num: 2,
      title: 'Authenticated Template Encryption',
      desc: 'To encrypt biometric templates using AES-256-GCM.',
      icon: <Lock sx={{ color: isDarkMode ? '#FFB000' : '#D97706' }} />,
    },
    {
      num: 3,
      title: 'Tamper Detection & Integrity Auditing',
      desc: 'To use SHA-256 hashing to help detect unauthorized modifications to stored biometric records.',
      icon: <Tag sx={{ color: isDarkMode ? '#38BDF8' : '#0284C7' }} />,
    },
    {
      num: 4,
      title: 'Salted Password Protection',
      desc: 'To protect user passwords using bcrypt hashing.',
      icon: <VpnKey sx={{ color: isDarkMode ? '#A78BFA' : '#7C3AED' }} />,
    },
    {
      num: 5,
      title: 'Cryptographic API Authorization',
      desc: 'To secure access to protected resources using JWT authentication.',
      icon: <Badge sx={{ color: isDarkMode ? '#F43F5E' : '#E11D48' }} />,
    },
    {
      num: 6,
      title: 'Anti-Spoofing & Liveness Defense',
      desc: 'To use liveness detection to help identify basic photograph and video-replay attacks.',
      icon: <Security sx={{ color: isDarkMode ? '#34D399' : '#059669' }} />,
    },
    {
      num: 7,
      title: 'Biometric Privacy Preservation',
      desc: 'To protect sensitive biometric information and reduce unauthorized access.',
      icon: <Fingerprint sx={{ color: isDarkMode ? '#F59E0B' : '#B45309' }} />,
    },
    {
      num: 8,
      title: 'Applied Cryptography Integration',
      desc: 'To demonstrate the practical application of cryptographic concepts in biometric authentication.',
      icon: <Shield sx={{ color: isDarkMode ? '#60A5FA' : '#2563EB' }} />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'var(--bg-gradient)',
        color: 'var(--text-primary)',
        py: { xs: 4, md: 6 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container maxWidth="lg">
        {/* ============================================================== */}
        {/* PAGE TITLE (FIRST AND MOST PROMINENT ELEMENT)                  */}
        {/* ============================================================== */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2.5,
              py: 0.8,
              borderRadius: '50px',
              background: isDarkMode ? 'rgba(0, 224, 198, 0.12)' : 'rgba(15, 118, 110, 0.1)',
              border: `1px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.3)' : 'rgba(15, 118, 110, 0.3)'}`,
              mb: 2.5,
            }}
          >
            <Shield sx={{ fontSize: 18, color: 'var(--teal-accent)' }} />
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                color: 'var(--teal-accent)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Academic Cryptography & Network Security Project
            </Typography>
          </Box>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              fontFamily: '"JetBrains Mono", "Inter", sans-serif',
              letterSpacing: '-0.03em',
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.4rem' },
              color: isDarkMode ? '#FFB000' : '#D97706',
              lineHeight: 1.15,
              mb: 1.5,
              textShadow: isDarkMode ? '0 0 25px rgba(255, 176, 0, 0.25)' : 'none',
            }}
          >
            Implement Biometric-based Authentication
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              color: 'var(--text-secondary)',
              maxWidth: 780,
              mx: 'auto',
              fontWeight: 500,
              fontSize: { xs: '0.95rem', sm: '1.1rem' },
            }}
          >
            A cryptographically secured framework synthesizing deep metric facial embeddings, authenticated symmetric encryption (AES-256-GCM), tamper-evident hashing (SHA-256), and dynamic liveness challenge defense.
          </Typography>
        </MotionBox>

        {/* ============================================================== */}
        {/* 1. INTRODUCTION                                                */}
        {/* ============================================================== */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 6 }}
        >
          <Card
            elevation={0}
            sx={{
              borderRadius: '24px',
              background: 'var(--card-bg)',
              backdropFilter: 'blur(16px)',
              border: `1.5px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.25)' : 'rgba(15, 118, 110, 0.25)'}`,
              boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 6px 20px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                borderLeft: `6px solid ${isDarkMode ? '#00E0C6' : '#0F766E'}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 800,
                    color: isDarkMode ? '#00E0C6' : '#0F766E',
                    background: isDarkMode ? 'rgba(0, 224, 198, 0.1)' : 'rgba(15, 118, 110, 0.1)',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '8px',
                  }}
                >
                  SECTION 1
                </Typography>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    color: isDarkMode ? '#F3F4F6' : '#0F172A',
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Introduction
                </Typography>
              </Stack>

              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? '#E5E7EB' : '#1F2937',
                  fontSize: { xs: '1rem', sm: '1.08rem' },
                  lineHeight: 1.8,
                  mb: 2.5,
                  fontWeight: 400,
                }}
              >
                Biometric-based authentication is a security method used to verify a person's identity through unique physical characteristics such as facial features or fingerprints.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? '#E5E7EB' : '#1F2937',
                  fontSize: { xs: '1rem', sm: '1.08rem' },
                  lineHeight: 1.8,
                  mb: 2.5,
                  fontWeight: 400,
                }}
              >
                This project, <strong>Implement Biometric-based Authentication</strong>, demonstrates how cryptographic techniques can protect biometric information and provide secure authentication.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? '#E5E7EB' : '#1F2937',
                  fontSize: { xs: '1rem', sm: '1.08rem' },
                  lineHeight: 1.8,
                  mb: 2.5,
                  fontWeight: 400,
                }}
              >
                The system uses facial recognition to extract biometric features and <strong>AES-256-GCM</strong> encryption to protect the resulting biometric template before storing it.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? '#E5E7EB' : '#1F2937',
                  fontSize: { xs: '1rem', sm: '1.08rem' },
                  lineHeight: 1.8,
                  mb: 2.5,
                  fontWeight: 400,
                }}
              >
                <strong>SHA-256</strong> helps detect changes to stored data, <strong>bcrypt</strong> protects passwords, and <strong>JWT</strong> supports authentication for protected application resources.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? '#00E0C6' : '#0F766E',
                  fontSize: { xs: '1rem', sm: '1.08rem' },
                  lineHeight: 1.8,
                  fontWeight: 600,
                }}
              >
                The main aim of this project is to demonstrate how cryptography can improve the security and privacy of biometric authentication.
              </Typography>
            </Box>
          </Card>
        </MotionBox>

        {/* ============================================================== */}
        {/* 2. OBJECTIVES                                                  */}
        {/* ============================================================== */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 6 }}
        >
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 800,
                  color: isDarkMode ? '#FFB000' : '#D97706',
                  background: isDarkMode ? 'rgba(255, 176, 0, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '8px',
                }}
              >
                SECTION 2
              </Typography>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 800,
                  color: isDarkMode ? '#F3F4F6' : '#0F172A',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Objectives
              </Typography>
            </Stack>
          </Box>

          <Grid container spacing={2.5}>
            {objectives.map((obj) => (
              <Grid item xs={12} sm={6} md={3} key={obj.num}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: '18px',
                    background: 'var(--card-bg)',
                    backdropFilter: 'blur(12px)',
                    border: `1.5px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: isDarkMode ? '#00E0C6' : '#0F766E',
                      boxShadow: isDarkMode ? '0 12px 28px rgba(0, 224, 198, 0.15)' : '0 8px 20px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '12px',
                        background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {obj.icon}
                    </Box>
                    <Chip
                      label={`0${obj.num}`}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.75rem',
                        background: isDarkMode ? 'rgba(255, 176, 0, 0.15)' : 'rgba(217, 119, 6, 0.12)',
                        color: isDarkMode ? '#FFB000' : '#D97706',
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      color: isDarkMode ? '#E5E7EB' : '#1F2937',
                      lineHeight: 1.6,
                      fontWeight: 600,
                      fontSize: '0.92rem',
                    }}
                  >
                    {obj.desc}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </MotionBox>

        {/* ============================================================== */}
        {/* 3. CRYPTOGRAPHIC CONCEPTS USED                                 */}
        {/* ============================================================== */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 6 }}
        >
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 800,
                  color: isDarkMode ? '#38BDF8' : '#0284C7',
                  background: isDarkMode ? 'rgba(56, 189, 248, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '8px',
                }}
              >
                SECTION 3
              </Typography>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 800,
                  color: isDarkMode ? '#F3F4F6' : '#0F172A',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Cryptographic Concepts Used
              </Typography>
            </Stack>
          </Box>

          <Grid container spacing={3}>
            {/* CONCEPT 1: AES-256-GCM ENCRYPTION */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  background: 'var(--card-bg)',
                  border: `1.5px solid ${isDarkMode ? 'rgba(244, 63, 94, 0.35)' : 'rgba(225, 29, 72, 0.35)'}`,
                  p: 3,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: isDarkMode ? 'rgba(244, 63, 94, 0.15)' : 'rgba(225, 29, 72, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDarkMode ? '#F43F5E' : '#E11D48',
                    }}
                  >
                    <Lock />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        color: isDarkMode ? '#F43F5E' : '#E11D48',
                        fontFamily: '"JetBrains Mono", monospace',
                        letterSpacing: '0.06em',
                      }}
                    >
                      CONCEPT 1
                    </Typography>
                    <Typography variant="h6" fontWeight="800">
                      AES-256-GCM Encryption
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.7, mb: 2.5 }}>
                  AES-256-GCM is a symmetric encryption algorithm that protects biometric templates. It encrypts the biometric data using a secret key and generates an authentication tag to help detect unauthorized changes to the encrypted data.
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    background: isDarkMode ? 'rgba(0,0,0,0.3)' : '#F8FAFC',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                      <strong>Input:</strong> Biometric Template
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: isDarkMode ? '#F43F5E' : '#E11D48', fontWeight: 700 }}>
                      <strong>Process:</strong> AES-256-GCM Encryption
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: isDarkMode ? '#34D399' : '#059669', fontWeight: 700 }}>
                      <strong>Output:</strong> Ciphertext, Nonce, and Authentication Tag
                    </Typography>
                  </Stack>
                </Box>
              </Card>
            </Grid>

            {/* CONCEPT 2: SHA-256 HASHING */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  background: 'var(--card-bg)',
                  border: `1.5px solid ${isDarkMode ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.35)'}`,
                  p: 3,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDarkMode ? '#F59E0B' : '#D97706',
                    }}
                  >
                    <Tag />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        color: isDarkMode ? '#F59E0B' : '#D97706',
                        fontFamily: '"JetBrains Mono", monospace',
                        letterSpacing: '0.06em',
                      }}
                    >
                      CONCEPT 2
                    </Typography>
                    <Typography variant="h6" fontWeight="800">
                      SHA-256 Hashing
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.7, mb: 2.5 }}>
                  SHA-256 is a cryptographic hash function that generates a fixed-length 256-bit digest. The digest helps detect unexpected modifications when compared with a previously trusted digest.
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    background: isDarkMode ? 'rgba(0,0,0,0.3)' : '#F8FAFC',
                    border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                      <strong>Input:</strong> Selected Data
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: isDarkMode ? '#F59E0B' : '#D97706', fontWeight: 700 }}>
                      <strong>Process:</strong> SHA-256
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: '"JetBrains Mono", monospace', color: isDarkMode ? '#34D399' : '#059669', fontWeight: 700 }}>
                      <strong>Output:</strong> 256-bit Hash Digest
                    </Typography>
                  </Stack>
                </Box>
              </Card>
            </Grid>

            {/* CONCEPT 3: bcrypt PASSWORD HASHING */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  background: 'var(--card-bg)',
                  border: `1.5px solid ${isDarkMode ? 'rgba(167, 139, 250, 0.35)' : 'rgba(124, 58, 237, 0.35)'}`,
                  p: 3,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: isDarkMode ? 'rgba(167, 139, 250, 0.15)' : 'rgba(124, 58, 237, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDarkMode ? '#A78BFA' : '#7C3AED',
                    }}
                  >
                    <VpnKey />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        color: isDarkMode ? '#A78BFA' : '#7C3AED',
                        fontFamily: '"JetBrains Mono", monospace',
                        letterSpacing: '0.06em',
                      }}
                    >
                      CONCEPT 3
                    </Typography>
                    <Typography variant="h6" fontWeight="800">
                      bcrypt Password Hashing
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  bcrypt protects passwords by storing their salted hashes instead of storing passwords in plain text. During login, the entered password is verified against the stored password hash.
                </Typography>
              </Card>
            </Grid>

            {/* CONCEPT 4: JWT AUTHENTICATION */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  background: 'var(--card-bg)',
                  border: `1.5px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.35)' : 'rgba(15, 118, 110, 0.35)'}`,
                  p: 3,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(15, 118, 110, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDarkMode ? '#00E0C6' : '#0F766E',
                    }}
                  >
                    <Badge />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        color: isDarkMode ? '#00E0C6' : '#0F766E',
                        fontFamily: '"JetBrains Mono", monospace',
                        letterSpacing: '0.06em',
                      }}
                    >
                      CONCEPT 4
                    </Typography>
                    <Typography variant="h6" fontWeight="800">
                      JWT Authentication
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  JSON Web Token (JWT) supports authentication for protected API requests. The backend verifies the token's signature and relevant claims before allowing access.
                </Typography>
              </Card>
            </Grid>

            {/* CONCEPT 5: CRYPTOGRAPHIC NONCE */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  background: 'var(--card-bg)',
                  border: `1.5px solid ${isDarkMode ? 'rgba(56, 189, 248, 0.35)' : 'rgba(2, 132, 199, 0.35)'}`,
                  p: 3,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      background: isDarkMode ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 132, 199, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isDarkMode ? '#38BDF8' : '#0284C7',
                    }}
                  >
                    <Timer />
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        color: isDarkMode ? '#38BDF8' : '#0284C7',
                        fontFamily: '"JetBrains Mono", monospace',
                        letterSpacing: '0.06em',
                      }}
                    >
                      CONCEPT 5
                    </Typography>
                    <Typography variant="h6" fontWeight="800">
                      Cryptographic Nonce
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  A nonce is a value used for a cryptographic operation. AES-GCM requires a unique nonce for every encryption under the same key to maintain security.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </MotionBox>

        {/* ============================================================== */}
        {/* 4. FLOWCHART                                                   */}
        {/* ============================================================== */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 6 }}
        >
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 800,
                  color: isDarkMode ? '#10B981' : '#059669',
                  background: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(5, 150, 105, 0.1)',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '8px',
                }}
              >
                SECTION 4
              </Typography>
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 800,
                  color: isDarkMode ? '#F3F4F6' : '#0F172A',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Flowchart
              </Typography>
            </Stack>
          </Box>

          {/* Interactive Responsive Flowchart Component */}
          <BiometricFlowchart />
        </MotionBox>

        {/* ============================================================== */}
        {/* 5. CONCLUSION                                                  */}
        {/* ============================================================== */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          sx={{ mb: 6 }}
        >
          <Card
            elevation={0}
            sx={{
              borderRadius: '24px',
              background: 'var(--card-bg)',
              backdropFilter: 'blur(16px)',
              border: `1.5px solid ${isDarkMode ? 'rgba(255, 176, 0, 0.35)' : 'rgba(217, 119, 6, 0.35)'}`,
              boxShadow: isDarkMode ? '0 12px 32px rgba(0,0,0,0.5)' : '0 6px 20px rgba(0,0,0,0.05)',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                borderLeft: `6px solid ${isDarkMode ? '#FFB000' : '#D97706'}`,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 800,
                    color: isDarkMode ? '#FFB000' : '#D97706',
                    background: isDarkMode ? 'rgba(255, 176, 0, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '8px',
                  }}
                >
                  SECTION 5
                </Typography>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    color: isDarkMode ? '#F3F4F6' : '#0F172A',
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Conclusion
                </Typography>
              </Stack>

              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? '#E5E7EB' : '#1F2937',
                  fontSize: { xs: '1rem', sm: '1.08rem' },
                  lineHeight: 1.8,
                  mb: 2.5,
                  fontWeight: 400,
                }}
              >
                This project demonstrates how cryptographic techniques can improve the security of biometric authentication.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? '#E5E7EB' : '#1F2937',
                  fontSize: { xs: '1rem', sm: '1.08rem' },
                  lineHeight: 1.8,
                  mb: 2.5,
                  fontWeight: 400,
                }}
              >
                <strong>AES-256-GCM</strong> protects biometric templates, <strong>SHA-256</strong> helps detect unexpected data changes, <strong>bcrypt</strong> protects passwords, and <strong>JWT</strong> supports secure access to protected resources.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? '#FFB000' : '#D97706',
                  fontSize: { xs: '1rem', sm: '1.08rem' },
                  lineHeight: 1.8,
                  mb: 4,
                  fontWeight: 600,
                }}
              >
                By combining cryptography with facial recognition and biometric matching, the system demonstrates how sensitive biometric information can be protected during storage and authentication.
              </Typography>

              {/* Action Buttons to seamlessly continue to registration or login */}
              <Divider sx={{ mb: 3.5, borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<HowToReg />}
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/register')}
                  sx={{
                    py: 1.6,
                    px: 3.5,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FFB000 0%, #D97706 100%)',
                    color: '#070A0F',
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 4px 14px rgba(255, 176, 0, 0.35)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Proceed to Sign Up
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Lock />}
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.6,
                    px: 3.5,
                    borderRadius: '12px',
                    borderColor: isDarkMode ? '#00E0C6' : '#0F766E',
                    color: isDarkMode ? '#00E0C6' : '#0F766E',
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderWidth: '2px',
                    '&:hover': {
                      borderWidth: '2px',
                      background: isDarkMode ? 'rgba(0, 224, 198, 0.1)' : 'rgba(15, 118, 110, 0.1)',
                      borderColor: isDarkMode ? '#00E0C6' : '#0F766E',
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Box>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default ProjectInformation;
