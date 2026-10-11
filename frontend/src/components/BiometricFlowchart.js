import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import {
  Person,
  CameraAlt,
  Fingerprint,
  Face,
  Description,
  VpnKey,
  Storage,
  Balance,
  CheckCircle,
  Cancel,
  ArrowForward,
  ArrowDownward,
  ArrowBack,
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';

export const BiometricFlowchart = () => {
  const { isDarkMode } = useThemeMode();

  // Color Palette tailored to match the diagram in light & dark modes
  const t = {
    cardBg: isDarkMode ? '#0D131F' : '#FFFFFF',
    textMain: isDarkMode ? '#F3F4F6' : '#0F172A',
    textMuted: isDarkMode ? '#9CA3AF' : '#475569',
    phaseBorder: isDarkMode ? 'rgba(59, 130, 246, 0.4)' : '#93C5FD',
    phaseBg: isDarkMode ? 'rgba(13, 19, 31, 0.95)' : '#FFFFFF',
    arrow: isDarkMode ? '#60A5FA' : '#2563EB',

    // Node 1: Blue (Registration / Login)
    blue: {
      bg: isDarkMode ? 'rgba(59, 130, 246, 0.12)' : '#EFF6FF',
      border: isDarkMode ? '#3B82F6' : '#93C5FD',
      icon: isDarkMode ? '#60A5FA' : '#2563EB',
    },
    // Node 2: Green (Preprocessing)
    green: {
      bg: isDarkMode ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5',
      border: isDarkMode ? '#10B981' : '#A7F3D0',
      icon: isDarkMode ? '#34D399' : '#059669',
    },
    // Node 3: Purple (Template / Compare)
    purple: {
      bg: isDarkMode ? 'rgba(139, 92, 246, 0.12)' : '#F5F3FF',
      border: isDarkMode ? '#8B5CF6' : '#DDD6FE',
      icon: isDarkMode ? '#A78BFA' : '#7C3AED',
    },
    // Node 4: Pink / Coral (Encryption / Retrieve)
    pink: {
      bg: isDarkMode ? 'rgba(244, 63, 94, 0.12)' : '#FFF1F2',
      border: isDarkMode ? '#F43F5E' : '#FECDD3',
      icon: isDarkMode ? '#FB7185' : '#E11D48',
    },
    // Node 5: Amber / Yellow (Hashing)
    yellow: {
      bg: isDarkMode ? 'rgba(245, 158, 11, 0.12)' : '#FEFCE8',
      border: isDarkMode ? '#F59E0B' : '#FEF08A',
      icon: isDarkMode ? '#FBBF24' : '#D97706',
    },
    // Database: Cyan / Light Blue
    cyan: {
      bg: isDarkMode ? 'rgba(14, 165, 233, 0.12)' : '#F0F9FF',
      border: isDarkMode ? '#0EA5E9' : '#BAE6FD',
      icon: isDarkMode ? '#38BDF8' : '#0284C7',
    },
    // Success: Green
    success: {
      bg: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
      border: isDarkMode ? '#10B981' : '#6EE7B7',
      text: isDarkMode ? '#34D399' : '#047857',
    },
    // Failure: Red
    failure: {
      bg: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
      border: isDarkMode ? '#EF4444' : '#FCA5A5',
      text: isDarkMode ? '#F87171' : '#B91C1C',
    },
  };

  // Reusable Step Card
  const FlowCard = ({ title, themeColor, children, sx }) => (
    <Box
      sx={{
        flex: 1,
        minWidth: { xs: '100%', sm: 190, md: 170 },
        background: themeColor.bg,
        border: `1.5px solid ${themeColor.border}`,
        borderRadius: '16px',
        p: { xs: 2, sm: 2.2 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDarkMode ? '0 8px 20px rgba(0,0,0,0.6)' : '0 4px 14px rgba(0,0,0,0.08)',
        },
        ...sx,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 800,
          color: t.textMain,
          fontSize: '0.88rem',
          mb: 1.5,
          fontFamily: '"Inter", sans-serif',
          lineHeight: 1.25,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );

  // Connecting arrow between horizontal cards
  const RightArrow = () => (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'center',
        color: t.arrow,
        px: 0.5,
      }}
    >
      <ArrowForward sx={{ fontSize: 22 }} />
    </Box>
  );

  // Connecting arrow for vertical / mobile flow
  const DownArrow = () => (
    <Box
      sx={{
        display: { xs: 'flex', md: 'none' },
        alignItems: 'center',
        justifyContent: 'center',
        color: t.arrow,
        py: 1,
      }}
    >
      <ArrowDownward sx={{ fontSize: 22 }} />
    </Box>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* ============================================================== */}
      {/* 1. REGISTRATION / ENROLLMENT (STORING BIOMETRIC DATA)          */}
      {/* ============================================================== */}
      <Box
        sx={{
          border: `2px solid ${t.phaseBorder}`,
          borderRadius: '24px',
          background: t.phaseBg,
          p: { xs: 2.5, sm: 3.5 },
          mb: 4,
          boxShadow: isDarkMode ? '0 12px 30px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        {/* Phase 1 Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#3B82F6',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
            }}
          >
            1
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: t.textMain,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Registration / Enrollment (Storing Biometric Data)
          </Typography>
        </Stack>

        {/* Steps 1 to 5 Horizontal / Responsive Chain */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: { xs: 1.5, md: 1 },
            mb: 3,
          }}
        >
          {/* 1. User Registration */}
          <FlowCard title="1. User Registration" themeColor={t.blue}>
            <Box sx={{ my: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Person sx={{ fontSize: 50, color: t.blue.icon, mb: 0.5 }} />
              <Stack direction="row" spacing={1.5} mb={1.5}>
                <CameraAlt sx={{ fontSize: 24, color: t.blue.icon }} />
                <Fingerprint sx={{ fontSize: 24, color: t.blue.icon }} />
              </Stack>
            </Box>
            <Typography variant="caption" sx={{ color: t.textMuted, fontSize: '0.78rem', lineHeight: 1.35 }}>
              User provides ID and uploads biometric image (Face or Fingerprint)
            </Typography>
          </FlowCard>

          <RightArrow />
          <DownArrow />

          {/* 2. Preprocessing & Feature Extraction */}
          <FlowCard title="2. Preprocessing & Feature Extraction" themeColor={t.green}>
            <Stack direction="row" spacing={1.5} mb={1.5} alignItems="center">
              <Box
                sx={{
                  border: `2px dashed ${t.green.icon}`,
                  borderRadius: '10px',
                  p: 0.5,
                  display: 'flex',
                }}
              >
                <Face sx={{ fontSize: 32, color: t.green.icon }} />
              </Box>
              <Fingerprint sx={{ fontSize: 36, color: t.green.icon }} />
            </Stack>
            <Box sx={{ textAlign: 'left', width: '100%', mt: 'auto' }}>
              {[
                'Validate image',
                'Detect face/fingerprint',
                'Extract features',
                'Generate biometric template (feature vector)',
              ].map((bullet, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: t.textMuted,
                    fontSize: '0.74rem',
                    lineHeight: 1.35,
                    mb: 0.3,
                  }}
                >
                  • {bullet}
                </Typography>
              ))}
            </Box>
          </FlowCard>

          <RightArrow />
          <DownArrow />

          {/* 3. Create Template */}
          <FlowCard title="3. Create Template" themeColor={t.purple}>
            <Description sx={{ fontSize: 44, color: t.purple.icon, mb: 1 }} />
            <Box
              sx={{
                background: isDarkMode ? '#1E1B4B' : '#FFFFFF',
                border: `1px solid ${t.purple.border}`,
                borderRadius: '8px',
                p: 1,
                mb: 1.5,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.7rem',
                color: t.purple.icon,
                lineHeight: 1.3,
                width: '100%',
                maxWidth: 130,
              }}
            >
              0100101101<br />
              1010010010<br />
              1010101...
            </Box>
            <Typography variant="caption" sx={{ color: t.textMuted, fontSize: '0.78rem', lineHeight: 1.35 }}>
              Biometric template (feature vector)
            </Typography>
          </FlowCard>

          <RightArrow />
          <DownArrow />

          {/* 4. Encryption (AES-256-GCM) */}
          <FlowCard title="4. Encryption (AES-256-GCM)" themeColor={t.pink}>
            <VpnKey sx={{ fontSize: 36, color: t.pink.icon, mb: 0.8 }} />
            <Box
              sx={{
                background: isDarkMode ? 'rgba(244, 63, 94, 0.2)' : '#FFE4E6',
                color: t.pink.icon,
                borderRadius: '12px',
                px: 1.2,
                py: 0.3,
                fontWeight: 800,
                fontSize: '0.72rem',
                fontFamily: '"JetBrains Mono", monospace',
                mb: 0.6,
              }}
            >
              AES-256-GCM
            </Box>
            <ArrowDownward sx={{ fontSize: 16, color: t.pink.icon, mb: 0.6 }} />
            <Box
              sx={{
                background: isDarkMode ? '#2D121B' : '#FFFFFF',
                border: `1px solid ${t.pink.border}`,
                borderRadius: '8px',
                p: 0.8,
                mb: 1.2,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.68rem',
                color: t.pink.icon,
                lineHeight: 1.3,
                width: '100%',
                maxWidth: 130,
              }}
            >
              1010010101<br />
              1101100100<br />
              ...
            </Box>
            <Typography variant="caption" sx={{ color: t.textMuted, fontSize: '0.75rem', lineHeight: 1.3 }}>
              Encrypted template (ciphertext + nonce + tag)
            </Typography>
          </FlowCard>

          <RightArrow />
          <DownArrow />

          {/* 5. Hashing (SHA-256) */}
          <FlowCard title="5. Hashing (SHA-256)" themeColor={t.yellow}>
            <Description sx={{ fontSize: 36, color: t.yellow.icon, mb: 0.8 }} />
            <Box
              sx={{
                background: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#FEF08A',
                color: t.yellow.icon,
                borderRadius: '12px',
                px: 1.2,
                py: 0.3,
                fontWeight: 800,
                fontSize: '0.72rem',
                fontFamily: '"JetBrains Mono", monospace',
                mb: 0.6,
              }}
            >
              SHA-256
            </Box>
            <ArrowDownward sx={{ fontSize: 16, color: t.yellow.icon, mb: 0.6 }} />
            <Box
              sx={{
                background: isDarkMode ? '#281E08' : '#FFFFFF',
                border: `1px solid ${t.yellow.border}`,
                borderRadius: '8px',
                p: 0.8,
                mb: 1.2,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.65rem',
                color: t.yellow.icon,
                lineHeight: 1.3,
                width: '100%',
                maxWidth: 130,
              }}
            >
              a3f5e8d2c...<br />
              9b7c1d4e...
            </Box>
            <Typography variant="caption" sx={{ color: t.textMuted, fontSize: '0.75rem', lineHeight: 1.3 }}>
              Hash of template (for verification)
            </Typography>
          </FlowCard>
        </Box>

        {/* Database & Optional Original Image Storage */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'flex-end',
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: { xs: 2, md: 3 },
            mt: 2,
            pr: { md: 2 },
          }}
        >
          {/* Downward indicator connecting Step 4 & 5 to Database */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              mr: 2,
              mt: -2,
            }}
          >
            <ArrowDownward sx={{ fontSize: 26, color: t.arrow }} />
          </Box>

          {/* 6. Store in Database (SQLite) */}
          <Box
            sx={{
              width: { xs: '100%', sm: 310 },
              background: t.cyan.bg,
              border: `1.5px solid ${t.cyan.border}`,
              borderRadius: '16px',
              p: 2.2,
              boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={1.5}>
              <Storage sx={{ fontSize: 26, color: t.cyan.icon }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: t.textMain }}>
                6. Store in Database (SQLite)
              </Typography>
            </Stack>

            <Box
              sx={{
                background: isDarkMode ? '#081726' : '#FFFFFF',
                border: `1px solid ${t.cyan.border}`,
                borderRadius: '8px',
                overflow: 'hidden',
                fontSize: '0.74rem',
                fontFamily: '"JetBrains Mono", monospace',
              }}
            >
              {[
                'user_id',
                'encrypted_template',
                'nonce',
                'auth_tag',
                'template_hash',
                'biometric_type (face/fingerprint)',
                'created_at',
              ].map((field, i) => (
                <Box
                  key={i}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderBottom: i < 6 ? `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}` : 'none',
                    color: isDarkMode ? '#BAE6FD' : '#0369A1',
                  }}
                >
                  {field}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Dashed Arrow */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              alignSelf: 'center',
              color: t.textMuted,
            }}
          >
            <ArrowBack sx={{ fontSize: 22 }} />
          </Box>

          {/* (Optional) Privacy Note Box */}
          <Box
            sx={{
              width: { xs: '100%', sm: 220 },
              border: `1.5px dashed ${isDarkMode ? '#8B5CF6' : '#C4B5FD'}`,
              borderRadius: '16px',
              p: 2,
              background: isDarkMode ? 'rgba(139, 92, 246, 0.06)' : 'rgba(139, 92, 246, 0.03)',
              textAlign: 'center',
              alignSelf: { md: 'center' },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: isDarkMode ? '#C4B5FD' : '#7C3AED',
                display: 'block',
                mb: 0.8,
              }}
            >
              (Optional)
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: t.textMuted,
                fontSize: '0.74rem',
                lineHeight: 1.4,
                display: 'block',
              }}
            >
              Original image can be stored in a secure folder (encrypted) or discarded after processing for better privacy.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Downward line connecting Phase 1 and Phase 2 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          my: -2,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            background: isDarkMode ? '#1E293B' : '#E2E8F0',
            border: `2px solid ${t.phaseBorder}`,
            borderRadius: '50%',
            p: 0.6,
            color: t.arrow,
            display: 'flex',
          }}
        >
          <ArrowDownward sx={{ fontSize: 24 }} />
        </Box>
      </Box>

      {/* ============================================================== */}
      {/* 2. AUTHENTICATION / LOGIN (VERIFYING BIOMETRIC DATA)          */}
      {/* ============================================================== */}
      <Box
        sx={{
          border: `2px solid ${t.phaseBorder}`,
          borderRadius: '24px',
          background: t.phaseBg,
          p: { xs: 2.5, sm: 3.5 },
          mt: 4,
          boxShadow: isDarkMode ? '0 12px 30px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        {/* Phase 2 Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: '#3B82F6',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
            }}
          >
            2
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: t.textMain,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
            Authentication / Login (Verifying Biometric Data)
          </Typography>
        </Stack>

        {/* Steps 1 to 5 Horizontal / Responsive Chain */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'stretch',
            justifyContent: 'space-between',
            gap: { xs: 1.5, md: 1 },
            mb: 4,
          }}
        >
          {/* 1. User Login */}
          <FlowCard title="1. User Login" themeColor={t.blue}>
            <Box sx={{ my: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Person sx={{ fontSize: 50, color: t.blue.icon, mb: 0.5 }} />
              <Stack direction="row" spacing={1.5} mb={1.5}>
                <CameraAlt sx={{ fontSize: 24, color: t.blue.icon }} />
                <Fingerprint sx={{ fontSize: 24, color: t.blue.icon }} />
              </Stack>
            </Box>
            <Typography variant="caption" sx={{ color: t.textMuted, fontSize: '0.78rem', lineHeight: 1.35 }}>
              User submits new biometric image (Face or Fingerprint)
            </Typography>
          </FlowCard>

          <RightArrow />
          <DownArrow />

          {/* 2. Preprocessing & Feature Extraction */}
          <FlowCard title="2. Preprocessing & Feature Extraction" themeColor={t.green}>
            <Stack direction="row" spacing={1.5} mb={1.5} alignItems="center">
              <Box
                sx={{
                  border: `2px dashed ${t.green.icon}`,
                  borderRadius: '10px',
                  p: 0.5,
                  display: 'flex',
                }}
              >
                <Face sx={{ fontSize: 32, color: t.green.icon }} />
              </Box>
              <Fingerprint sx={{ fontSize: 36, color: t.green.icon }} />
            </Stack>
            <Box sx={{ textAlign: 'left', width: '100%', mt: 'auto' }}>
              {[
                'Validate image',
                'Extract features',
                'Generate template from new image',
              ].map((bullet, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: t.textMuted,
                    fontSize: '0.74rem',
                    lineHeight: 1.35,
                    mb: 0.4,
                  }}
                >
                  • {bullet}
                </Typography>
              ))}
            </Box>
          </FlowCard>

          <RightArrow />
          <DownArrow />

          {/* 3. Generate Hash (SHA-256) */}
          <FlowCard title="3. Generate Hash (SHA-256)" themeColor={t.yellow}>
            <Description sx={{ fontSize: 36, color: t.yellow.icon, mb: 0.8 }} />
            <Box
              sx={{
                background: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#FEF08A',
                color: t.yellow.icon,
                borderRadius: '12px',
                px: 1.2,
                py: 0.3,
                fontWeight: 800,
                fontSize: '0.72rem',
                fontFamily: '"JetBrains Mono", monospace',
                mb: 0.6,
              }}
            >
              SHA-256
            </Box>
            <ArrowDownward sx={{ fontSize: 16, color: t.yellow.icon, mb: 0.6 }} />
            <Box
              sx={{
                background: isDarkMode ? '#281E08' : '#FFFFFF',
                border: `1px solid ${t.yellow.border}`,
                borderRadius: '8px',
                p: 0.8,
                mb: 1.2,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.65rem',
                color: t.yellow.icon,
                lineHeight: 1.3,
                width: '100%',
                maxWidth: 130,
              }}
            >
              a3f5e8d2c...<br />
              9b7c1d4e...
            </Box>
            <Typography variant="caption" sx={{ color: t.textMuted, fontSize: '0.75rem', lineHeight: 1.3 }}>
              Hash from new template
            </Typography>
          </FlowCard>

          <RightArrow />
          <DownArrow />

          {/* 4. Retrieve Stored Data */}
          <FlowCard title="4. Retrieve Stored Data" themeColor={t.pink}>
            <Box sx={{ my: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Storage sx={{ fontSize: 48, color: t.pink.icon, mb: 1.5 }} />
            </Box>
            <Typography variant="caption" sx={{ color: t.textMuted, fontSize: '0.76rem', lineHeight: 1.35 }}>
              Get encrypted template, nonce, tag and stored hash from database using user_id
            </Typography>
          </FlowCard>

          <RightArrow />
          <DownArrow />

          {/* 5. Compare Hashes */}
          <FlowCard title="5. Compare Hashes" themeColor={t.purple}>
            <Box sx={{ my: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Balance sx={{ fontSize: 48, color: t.purple.icon, mb: 1.5 }} />
            </Box>
            <Typography variant="caption" sx={{ color: t.textMuted, fontSize: '0.78rem', lineHeight: 1.35 }}>
              Compare new hash with stored hash
            </Typography>
          </FlowCard>
        </Box>

        {/* Decision Diamond & Result Cards */}
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Arrow pointing from Step 5 to Diamond */}
          <ArrowDownward sx={{ fontSize: 26, color: t.arrow, mb: 1.5 }} />

          {/* Decision Row: Success (Left) <--- [ Hashes Match? ] ---> Failure (Right) */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 2.5, md: 3 },
              width: '100%',
            }}
          >
            {/* Left Result Card: Authentication Successful */}
            <Box
              sx={{
                flex: 1,
                maxWidth: { md: 360 },
                width: '100%',
                background: t.success.bg,
                border: `2px solid ${t.success.border}`,
                borderRadius: '16px',
                p: 2.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.8,
                boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.04)',
                order: { xs: 2, md: 1 },
              }}
            >
              <CheckCircle sx={{ fontSize: 38, color: t.success.text, mt: 0.2 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: t.textMain, mb: 0.8 }}>
                  Authentication Successful
                </Typography>
                <Typography variant="body2" sx={{ color: t.textMuted, fontSize: '0.82rem', mb: 0.4 }}>
                  • User verified
                </Typography>
                <Typography variant="body2" sx={{ color: t.textMuted, fontSize: '0.82rem' }}>
                  • Access granted (e.g., attendance marked, system access)
                </Typography>
              </Box>
            </Box>

            {/* Left Branch Arrow (Yes) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.5,
                order: { md: 2 },
              }}
            >
              <ArrowBack sx={{ fontSize: 22, color: t.success.text }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: t.success.text,
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                Yes
              </Typography>
            </Box>

            {/* Center Decision Diamond */}
            <Box
              sx={{
                width: 170,
                height: 100,
                border: `2px solid ${isDarkMode ? '#8B5CF6' : '#7C3AED'}`,
                background: isDarkMode ? '#13112E' : '#FAF5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                p: 1.5,
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                order: { xs: 1, md: 3 },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 900,
                  color: isDarkMode ? '#DDD6FE' : '#6B21A8',
                  fontSize: '0.88rem',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Hashes Match?
              </Typography>
            </Box>

            {/* Right Branch Arrow (No) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.5,
                order: { md: 4 },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: t.failure.text,
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                No
              </Typography>
              <ArrowForward sx={{ fontSize: 22, color: t.failure.text }} />
            </Box>

            {/* Right Result Card: Authentication Failed */}
            <Box
              sx={{
                flex: 1,
                maxWidth: { md: 360 },
                width: '100%',
                background: t.failure.bg,
                border: `2px solid ${t.failure.border}`,
                borderRadius: '16px',
                p: 2.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.8,
                boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.04)',
                order: { xs: 3, md: 5 },
              }}
            >
              <Cancel sx={{ fontSize: 38, color: t.failure.text, mt: 0.2 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: t.textMain, mb: 0.8 }}>
                  Authentication Failed
                </Typography>
                <Typography variant="body2" sx={{ color: t.textMuted, fontSize: '0.82rem', mb: 0.4 }}>
                  • User not verified
                </Typography>
                <Typography variant="body2" sx={{ color: t.textMuted, fontSize: '0.82rem' }}>
                  • Access denied
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BiometricFlowchart;
