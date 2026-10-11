import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Security,
  VpnKey,
  Fingerprint,
  Tag,
  History,
  Refresh,
  CheckCircle,
  Cancel,
  Warning,
  ContentCopy,
  ExpandMore,
  VerifiedUser,
  Storage,
  Lock,
  Visibility,
  Person,
  CameraAlt,
  Shield,
  Timeline,
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';
import { cryptoLabAPI } from '../services/api';

const AdminCryptoLab = () => {
  const { isDarkMode } = useThemeMode();

  // Tab navigation
  const [activeTab, setActiveTab] = useState(0);

  // Data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [operations, setOperations] = useState([]);
  const [loadingOperations, setLoadingOperations] = useState(false);

  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Full template expansion
  const [showFullVector, setShowFullVector] = useState(false);

  // Image blobs cache for authenticated image view
  const [loadedImages, setLoadedImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  // Snackbar notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Styles
  const tealAccent = isDarkMode ? '#00E0C6' : '#0F766E';
  const amberAccent = isDarkMode ? '#FFB000' : '#B45309';
  const cardBg = isDarkMode ? 'rgba(13, 19, 31, 0.95)' : '#FFFFFF';
  const borderCol = isDarkMode ? 'rgba(0, 224, 198, 0.2)' : 'rgba(15, 118, 110, 0.2)';
  const monoBg = isDarkMode ? 'rgba(0, 0, 0, 0.5)' : '#F1F5F9';

  const showToast = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  };

  // Fetch overview & users list
  const fetchOverviewAndUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, usersRes] = await Promise.all([
        cryptoLabAPI.getOverview(),
        cryptoLabAPI.getUsers(),
      ]);
      setOverview(overviewRes.data);
      setUsersList(usersRes.data);

      // Select first user automatically if not selected
      if (usersRes.data.length > 0 && !selectedUserId) {
        setSelectedUserId(usersRes.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load Cryptography Lab data:', err);
      setError(err.response?.data?.detail || 'Failed to load Cryptography Lab overview from backend.');
    } finally {
      setLoading(false);
    }
  }, [selectedUserId]);

  // Fetch selected user details
  const fetchUserDetails = useCallback(async (userId) => {
    if (!userId) return;
    setLoadingUserDetails(true);
    setVerificationResult(null);
    setShowFullVector(false);
    try {
      const res = await cryptoLabAPI.getUserDetails(userId);
      setUserDetails(res.data);
    } catch (err) {
      console.error('Failed to load user cryptographic details:', err);
      showToast('Could not load cryptographic details for selected user.', 'error');
    } finally {
      setLoadingUserDetails(false);
    }
  }, []);

  // Fetch operations timeline
  const fetchOperations = useCallback(async () => {
    setLoadingOperations(true);
    try {
      const res = await cryptoLabAPI.getOperations(50);
      setOperations(res.data);
    } catch (err) {
      console.error('Failed to load operations timeline:', err);
    } finally {
      setLoadingOperations(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewAndUsers();
    fetchOperations();
  }, [fetchOverviewAndUsers, fetchOperations]);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetails(selectedUserId);
    }
  }, [selectedUserId, fetchUserDetails]);

  // Handle Verify Integrity action
  const handleVerifyIntegrity = async () => {
    if (!selectedUserId) return;
    setVerifying(true);
    try {
      const res = await cryptoLabAPI.verifyIntegrity(selectedUserId);
      setVerificationResult(res.data);
      if (res.data.status === 'VERIFIED') {
        showToast('Cryptographic integrity VERIFIED: Tag & SHA-256 match perfectly!', 'success');
      } else {
        showToast(`Integrity check status: ${res.data.status}`, res.data.status === 'UNAVAILABLE' ? 'warning' : 'error');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationResult({
        status: 'VERIFICATION FAILED',
        message: err.response?.data?.detail || 'Verification request failed.',
      });
      showToast('Integrity verification failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  // Load image with auth headers
  const loadImageBlob = async (userId, imageId) => {
    if (loadedImages[imageId] || loadingImages[imageId]) return;
    setLoadingImages((prev) => ({ ...prev, [imageId]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(cryptoLabAPI.getUserImageUrl(userId, imageId), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setLoadedImages((prev) => ({ ...prev, [imageId]: url }));
      } else {
        showToast('Original image not stored or unavailable.', 'warning');
      }
    } catch (err) {
      console.error('Error fetching image blob:', err);
    } finally {
      setLoadingImages((prev) => ({ ...prev, [imageId]: false }));
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh">
        <CircularProgress sx={{ color: tealAccent }} size={56} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, color: isDarkMode ? '#F3F4F6' : '#0F172A', fontWeight: 600 }}>
          Connecting to Cryptography Engine...
        </Typography>
        <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', mt: 1 }}>
          Retrieving real database records and cryptographic parameters
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchOverviewAndUsers} sx={{ bgcolor: tealAccent }}>
          Retry Connection
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, pt: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
              <Shield sx={{ color: tealAccent, fontSize: 36 }} />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #00E0C6 0%, #FFB000 100%)'
                    : 'linear-gradient(135deg, #0F766E 0%, #B45309 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ADMIN CRYPTOGRAPHY LAB
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', fontWeight: 500 }}>
              Live Biometric Security and Cryptographic Inspection
            </Typography>
          </Box>

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                fetchOverviewAndUsers();
                if (selectedUserId) fetchUserDetails(selectedUserId);
                fetchOperations();
                showToast('Refreshed data from live database.', 'info');
              }}
              sx={{
                borderColor: borderCol,
                color: tealAccent,
                '&:hover': { borderColor: tealAccent, bgcolor: isDarkMode ? 'rgba(0, 224, 198, 0.08)' : 'rgba(15, 118, 110, 0.08)' },
              }}
            >
              Refresh Lab Data
            </Button>
          </Box>
        </Box>

        {/* 6 Summary Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {/* Card 1: Registered Users */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 2,
                boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', fontWeight: 600 }}>
                    Registered Users
                  </Typography>
                  <Person sx={{ color: tealAccent, fontSize: 22 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                  {overview?.registered_users ?? 'Unavailable'}
                </Typography>
                <Typography variant="caption" sx={{ color: tealAccent, fontWeight: 500 }}>
                  Active Database Accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Enrolled Biometric Templates */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 2,
                boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', fontWeight: 600 }}>
                    Enrolled Templates
                  </Typography>
                  <Fingerprint sx={{ color: amberAccent, fontSize: 22 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                  {overview?.enrolled_biometric_templates ?? 'Unavailable'}
                </Typography>
                <Typography variant="caption" sx={{ color: amberAccent, fontWeight: 500 }}>
                  ArcFace Encodings in DB
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Encrypted Biometric Records */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 2,
                boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', fontWeight: 600 }}>
                    Encrypted Records
                  </Typography>
                  <Lock sx={{ color: tealAccent, fontSize: 22 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                  {overview?.encrypted_biometric_records ?? 'Unavailable'}
                </Typography>
                <Typography variant="caption" sx={{ color: tealAccent, fontWeight: 500 }}>
                  AES-256-GCM AEAD
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 4: Available Integrity Digests */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 2,
                boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', fontWeight: 600 }}>
                    Integrity Digests
                  </Typography>
                  <Tag sx={{ color: amberAccent, fontSize: 22 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                  {overview?.available_integrity_digests ?? 'Unavailable'}
                </Typography>
                <Typography variant="caption" sx={{ color: amberAccent, fontWeight: 500 }}>
                  SHA-256 Checksums
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 5: Recent Registrations */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 2,
                boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', fontWeight: 600 }}>
                    Recent Registrations
                  </Typography>
                  <Timeline sx={{ color: tealAccent, fontSize: 22 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                  {overview?.recent_registration_operations ?? 'Unavailable'}
                </Typography>
                <Typography variant="caption" sx={{ color: tealAccent, fontWeight: 500 }}>
                  Operations (7 Days)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 6: Recent Authentication Operations */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card
              sx={{
                bgcolor: cardBg,
                border: `1px solid ${borderCol}`,
                borderRadius: 2,
                boxShadow: isDarkMode ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', fontWeight: 600 }}>
                    Recent Authentications
                  </Typography>
                  <History sx={{ color: amberAccent, fontSize: 22 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                  {overview?.recent_authentication_operations ?? 'Unavailable'}
                </Typography>
                <Typography variant="caption" sx={{ color: amberAccent, fontWeight: 500 }}>
                  Verified Attendance Marks
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 6 Tabs Navigation */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: cardBg,
            border: `1px solid ${borderCol}`,
            borderRadius: 2,
            mb: 3,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                bgcolor: tealAccent,
                height: 3,
              },
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '0.95rem',
                textTransform: 'none',
                minHeight: 56,
                color: isDarkMode ? '#9CA3AF' : '#64748B',
                '&.Mui-selected': {
                  color: tealAccent,
                },
              },
            }}
          >
            <Tab icon={<Security sx={{ fontSize: 20 }} />} iconPosition="start" label="1. Overview" />
            <Tab icon={<Person sx={{ fontSize: 20 }} />} iconPosition="start" label="2. Users & Images" />
            <Tab icon={<Fingerprint sx={{ fontSize: 20 }} />} iconPosition="start" label="3. Biometric Templates" />
            <Tab icon={<VpnKey sx={{ fontSize: 20 }} />} iconPosition="start" label="4. Encryption & Hashing" />
            <Tab icon={<Storage sx={{ fontSize: 20 }} />} iconPosition="start" label="5. Database Records" />
            <Tab icon={<Timeline sx={{ fontSize: 20 }} />} iconPosition="start" label="6. Live Operations" />
          </Tabs>
        </Paper>

        {/* ============================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ============================================================== */}
        {activeTab === 0 && (
          <Box>
            <Grid container spacing={3}>
              {/* Cryptographic Subsystems Status */}
              <Grid item xs={12} md={7}>
                <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                      <VerifiedUser sx={{ color: tealAccent }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                        Cryptographic Subsystems & Security Controls
                      </Typography>
                    </Box>

                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#9CA3AF' : '#475569' }}>Mechanism</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#9CA3AF' : '#475569' }}>Standard / Spec</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: isDarkMode ? '#9CA3AF' : '#475569' }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                              Biometric Encryption
                            </TableCell>
                            <TableCell sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                              AES-256-GCM (Authenticated Encryption with 96-bit Nonce, 128-bit Tag)
                            </TableCell>
                            <TableCell>
                              <Chip label="OPERATIONAL" size="small" sx={{ bgcolor: 'rgba(0, 224, 198, 0.15)', color: tealAccent, fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                              Integrity Verification
                            </TableCell>
                            <TableCell sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                              SHA-256 Cryptographic Hash (256-bit Digest)
                            </TableCell>
                            <TableCell>
                              <Chip label="OPERATIONAL" size="small" sx={{ bgcolor: 'rgba(0, 224, 198, 0.15)', color: tealAccent, fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                              Credential Hashing
                            </TableCell>
                            <TableCell sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                              bcrypt ($2b$ algorithm, 12 rounds, salted per-password)
                            </TableCell>
                            <TableCell>
                              <Chip label="OPERATIONAL" size="small" sx={{ bgcolor: 'rgba(0, 224, 198, 0.15)', color: tealAccent, fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                              Session Security
                            </TableCell>
                            <TableCell sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                              JWT Authentication (HMAC-SHA256, strictly validated)
                            </TableCell>
                            <TableCell>
                              <Chip label="OPERATIONAL" size="small" sx={{ bgcolor: 'rgba(0, 224, 198, 0.15)', color: tealAccent, fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                              Liveness & Anti-Replay
                            </TableCell>
                            <TableCell sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                              Temporal frame differences + random head-sweep challenge
                            </TableCell>
                            <TableCell>
                              <Chip label="OPERATIONAL" size="small" sx={{ bgcolor: 'rgba(0, 224, 198, 0.15)', color: tealAccent, fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                              Privacy Policy
                            </TableCell>
                            <TableCell sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                              Zero-Raw-Image Storage Policy enforced; gallery frames restricted to admin
                            </TableCell>
                            <TableCell>
                              <Chip label="ENFORCED" size="small" sx={{ bgcolor: 'rgba(255, 176, 0, 0.15)', color: amberAccent, fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Real Operational Metrics */}
              <Grid item xs={12} md={5}>
                <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                      <History sx={{ color: amberAccent }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                        Operational Database Metrics
                      </Typography>
                    </Box>

                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" p={1.5} sx={{ bgcolor: monoBg, borderRadius: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Accounts in DB</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: tealAccent }}>{overview?.registered_users}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" p={1.5} sx={{ bgcolor: monoBg, borderRadius: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Biometric Templates in DB</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: amberAccent }}>{overview?.enrolled_biometric_templates}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" p={1.5} sx={{ bgcolor: monoBg, borderRadius: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Enrolled Face Images in Gallery</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: tealAccent }}>{overview?.total_face_images_stored}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" p={1.5} sx={{ bgcolor: monoBg, borderRadius: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Total Attendance Authentications</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: amberAccent }}>{overview?.total_attendance_authentications}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" p={1.5} sx={{ bgcolor: monoBg, borderRadius: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Recent Registrations (7 Days)</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: tealAccent }}>{overview?.recent_registration_operations}</Typography>
                      </Box>
                    </Box>

                    <Box mt={3} p={2} sx={{ bgcolor: isDarkMode ? 'rgba(0, 224, 198, 0.05)' : 'rgba(15, 118, 110, 0.05)', borderRadius: 1.5, border: `1px solid ${borderCol}` }}>
                      <Typography variant="caption" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', display: 'block' }}>
                        <strong>Source of Truth:</strong> All values are queried directly from the SQLite/PostgreSQL tables (<code>users</code>, <code>face_embeddings</code>, <code>face_images</code>, <code>attendance</code>). No synthetic or simulated values are generated.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ============================================================== */}
        {/* TAB 2: USERS & IMAGES */}
        {/* ============================================================== */}
        {activeTab === 1 && (
          <Box>
            <Grid container spacing={3}>
              {/* Left Column: User Selection */}
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                      Select Registered User ({usersList.length})
                    </Typography>

                    <Box sx={{ maxHeight: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {usersList.map((u) => {
                        const isSelected = selectedUserId === u.id;
                        return (
                          <Paper
                            key={u.id}
                            elevation={0}
                            onClick={() => setSelectedUserId(u.id)}
                            sx={{
                              p: 1.5,
                              cursor: 'pointer',
                              borderRadius: 1.5,
                              border: `1px solid ${isSelected ? tealAccent : borderCol}`,
                              bgcolor: isSelected
                                ? isDarkMode ? 'rgba(0, 224, 198, 0.12)' : 'rgba(15, 118, 110, 0.1)'
                                : isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#F8FAFC',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: tealAccent,
                              },
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: isSelected ? tealAccent : (isDarkMode ? '#F3F4F6' : '#0F172A') }}>
                                {u.full_name || 'Unnamed User'}
                              </Typography>
                              <Chip
                                label={u.face_registered ? 'Enrolled' : 'Not Enrolled'}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  bgcolor: u.face_registered ? 'rgba(0, 224, 198, 0.2)' : 'rgba(255, 176, 0, 0.15)',
                                  color: u.face_registered ? tealAccent : amberAccent,
                                }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', display: 'block', mt: 0.5 }}>
                              USN/ID: <strong>{u.usn}</strong> | Role: {u.role}
                            </Typography>
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#6B7280' : '#94A3B8' }}>
                              Email: {u.email}
                            </Typography>
                          </Paper>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column: User Details & Stored Images */}
              <Grid item xs={12} md={8}>
                {loadingUserDetails ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                    <CircularProgress sx={{ color: tealAccent }} />
                  </Box>
                ) : userDetails ? (
                  <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      {/* User Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={3}>
                        <Box>
                          <Typography variant="h5" sx={{ fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                            {userDetails.user.full_name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                            ID: <strong>#{userDetails.user.id}</strong> | USN: <strong>{userDetails.user.usn}</strong> | Role: <strong>{userDetails.user.role}</strong>
                          </Typography>
                        </Box>
                        <Chip
                          icon={userDetails.user.face_registered ? <CheckCircle /> : <Warning />}
                          label={userDetails.user.face_registered ? 'Biometric Enrolled' : 'No Biometrics Enrolled'}
                          color={userDetails.user.face_registered ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>

                      <Divider sx={{ mb: 3 }} />

                      {/* Stored Face Images Section */}
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CameraAlt sx={{ color: tealAccent }} /> Stored Facial Images Inspection
                      </Typography>

                      <Alert severity="info" sx={{ mb: 3 }}>
                        {userDetails.images.policy_notice}
                      </Alert>

                      {userDetails.images.count > 0 ? (
                        <Grid container spacing={2}>
                          {userDetails.images.items.map((img) => (
                            <Grid item xs={12} sm={6} md={4} key={img.id}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 1.5,
                                  border: `1px solid ${borderCol}`,
                                  borderRadius: 2,
                                  bgcolor: monoBg,
                                  textAlign: 'center',
                                }}
                              >
                                <Typography variant="caption" sx={{ fontWeight: 700, color: tealAccent, display: 'block', mb: 1 }}>
                                  Frame #{img.position} (ID: {img.id})
                                </Typography>

                                {loadedImages[img.id] ? (
                                  <Box
                                    component="img"
                                    src={loadedImages[img.id]}
                                    alt={`Face frame ${img.position}`}
                                    sx={{
                                      width: '100%',
                                      height: 160,
                                      objectFit: 'cover',
                                      borderRadius: 1.5,
                                      border: `1px solid ${borderCol}`,
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      height: 160,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      bgcolor: isDarkMode ? '#05070B' : '#E2E8F0',
                                      borderRadius: 1.5,
                                      border: `1px dashed ${borderCol}`,
                                      p: 2,
                                    }}
                                  >
                                    <Lock sx={{ color: isDarkMode ? '#6B7280' : '#94A3B8', fontSize: 32, mb: 1 }} />
                                    <Typography variant="caption" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', mb: 1.5 }}>
                                      Encrypted in Database ({Math.round(img.byte_size / 1024)} KB)
                                    </Typography>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={loadingImages[img.id] ? <CircularProgress size={14} /> : <Visibility />}
                                      onClick={() => loadImageBlob(userDetails.user.id, img.id)}
                                      disabled={loadingImages[img.id]}
                                      sx={{ borderColor: tealAccent, color: tealAccent, fontSize: '0.75rem' }}
                                    >
                                      Load Frame
                                    </Button>
                                  </Box>
                                )}

                                <Box mt={1.5} textAlign="left">
                                  <Typography variant="caption" sx={{ display: 'block', color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                                    Quality Score: <strong>{img.quality_score ?? 'N/A'}%</strong>
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'block', color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                                    Size: <strong>{img.byte_size} bytes</strong>
                                  </Typography>
                                  <Typography variant="caption" sx={{ display: 'block', color: isDarkMode ? '#6B7280' : '#94A3B8' }}>
                                    Captured: {img.created_at ? new Date(img.created_at).toLocaleString() : 'N/A'}
                                  </Typography>
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            textAlign: 'center',
                            border: `1px dashed ${borderCol}`,
                            borderRadius: 2,
                            bgcolor: isDarkMode ? 'rgba(0,0,0,0.2)' : '#F8FAFC',
                          }}
                        >
                          <Shield sx={{ fontSize: 48, color: amberAccent, mb: 1.5 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                            Original image not stored.
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', maxWidth: 480, mx: 'auto', mt: 1 }}>
                            The system adheres to a strict Zero-Raw-Image-Storage privacy policy. Raw images are processed during enrollment to extract biometric embeddings and discarded immediately thereafter.
                          </Typography>
                        </Paper>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Alert severity="info">Please select a user to inspect stored images and metadata.</Alert>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        {/* ============================================================== */}
        {/* TAB 3: BIOMETRIC TEMPLATES */}
        {/* ============================================================== */}
        {activeTab === 2 && (
          <Box>
            {loadingUserDetails ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <CircularProgress sx={{ color: tealAccent }} />
              </Box>
            ) : userDetails?.biometric_template ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Fingerprint sx={{ color: amberAccent, fontSize: 32 }} />
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                              BIOMETRIC TEMPLATE DETAILS
                            </Typography>
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                              Subject: <strong>{userDetails.user.full_name}</strong> (USN: {userDetails.user.usn})
                            </Typography>
                          </Box>
                        </Box>
                        <Chip label="TEMPLATE AVAILABLE" color="success" sx={{ fontWeight: 700 }} />
                      </Box>

                      <Divider sx={{ mb: 3 }} />

                      {/* Metadata Grid */}
                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, bgcolor: monoBg, borderRadius: 1.5 }}>
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>Biometric Type</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Face (Facial Geometry)</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, bgcolor: monoBg, borderRadius: 1.5 }}>
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>Recognition Model</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{userDetails.biometric_template.model} (ArcFace)</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, bgcolor: monoBg, borderRadius: 1.5 }}>
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>Template Dimensions</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{userDetails.biometric_template.dim}-D Float32</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Paper sx={{ p: 2, bgcolor: monoBg, borderRadius: 1.5 }}>
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>Vector L2 Norm</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{userDetails.biometric_template.vector_norm} (Normalized)</Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Vector Preview */}
                      <Box sx={{ mb: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Biometric Vector Preview (First 8 Features)
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ContentCopy />}
                            onClick={() => copyToClipboard(JSON.stringify(userDetails.biometric_template.full_vector), 'Full Biometric Vector')}
                            sx={{ borderColor: tealAccent, color: tealAccent }}
                          >
                            Copy Vector
                          </Button>
                        </Box>

                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: monoBg,
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            borderRadius: 1.5,
                            border: `1px solid ${borderCol}`,
                            color: tealAccent,
                            wordBreak: 'break-all',
                          }}
                        >
                          [{userDetails.biometric_template.vector_sample.map((v) => (v >= 0 ? `+${v.toFixed(4)}` : v.toFixed(4))).join(', ')}, ...]
                        </Paper>
                      </Box>

                      {/* Full Vector Accordion */}
                      <Accordion
                        expanded={showFullVector}
                        onChange={() => setShowFullVector(!showFullVector)}
                        sx={{
                          bgcolor: monoBg,
                          border: `1px solid ${borderCol}`,
                          borderRadius: '8px !important',
                          '&:before': { display: 'none' },
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {showFullVector ? 'Collapse Full Template' : `View Full Template (${userDetails.biometric_template.dim} Coordinates)`}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Box
                            sx={{
                              maxHeight: 280,
                              overflowY: 'auto',
                              p: 2,
                              bgcolor: isDarkMode ? '#05070B' : '#FFFFFF',
                              borderRadius: 1.5,
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              lineHeight: 1.8,
                              color: isDarkMode ? '#A7F3D0' : '#065F46',
                            }}
                          >
                            {JSON.stringify(userDetails.biometric_template.full_vector, null, 2)}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Paper sx={{ p: 5, textAlign: 'center', bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                <Warning sx={{ fontSize: 48, color: amberAccent, mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Plaintext template unavailable.
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', mt: 1 }}>
                  The selected user has not enrolled biometric facial embeddings. Once enrolled, the mathematical template will be extracted and protected with AES-256-GCM.
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        {/* ============================================================== */}
        {/* TAB 4: ENCRYPTION & HASHING */}
        {/* ============================================================== */}
        {activeTab === 3 && (
          <Box>
            <Alert severity="warning" icon={<Shield />} sx={{ mb: 3 }}>
              <strong>CRITICAL SECURITY MANDATE:</strong> The AES-256-GCM Secret Key is securely bound to the server runtime environment and is <strong>NEVER exposed</strong> over any API endpoint or client interface.
            </Alert>

            {loadingUserDetails ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <CircularProgress sx={{ color: tealAccent }} />
              </Box>
            ) : userDetails?.biometric_template ? (
              <Grid container spacing={3}>
                {/* Section A: AES-256-GCM Encryption */}
                <Grid item xs={12} md={7}>
                  <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2, height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Lock sx={{ color: tealAccent }} />
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            AES-256-GCM ENCRYPTION
                          </Typography>
                        </Box>
                        <Chip label="ENCRYPTED" color="success" size="small" sx={{ fontWeight: 700 }} />
                      </Box>

                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', mb: 2 }}>
                        Symmetric Authenticated Encryption with Associated Data (AEAD) protecting template vectors.
                      </Typography>

                      <Divider sx={{ mb: 2.5 }} />

                      {/* Ciphertext */}
                      <Box mb={2.5}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: isDarkMode ? '#9CA3AF' : '#475569' }}>
                            CIPHERTEXT ({userDetails.biometric_template.ciphertext_bytes_len} bytes)
                          </Typography>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<ContentCopy fontSize="small" />}
                            onClick={() => copyToClipboard(userDetails.biometric_template.ciphertext, 'Ciphertext')}
                            sx={{ color: tealAccent, p: 0 }}
                          >
                            Copy
                          </Button>
                        </Box>
                        <Paper
                          sx={{
                            p: 1.5,
                            maxHeight: 120,
                            overflowY: 'auto',
                            bgcolor: monoBg,
                            fontFamily: 'monospace',
                            fontSize: '0.78rem',
                            wordBreak: 'break-all',
                            color: tealAccent,
                            borderRadius: 1.5,
                            border: `1px solid ${borderCol}`,
                          }}
                        >
                          {userDetails.biometric_template.ciphertext}
                        </Paper>
                      </Box>

                      {/* 96-bit Nonce */}
                      <Box mb={2.5}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: isDarkMode ? '#9CA3AF' : '#475569' }}>
                            NONCE / INITIALIZATION VECTOR (96-bit, {userDetails.biometric_template.nonce_bytes_len} bytes)
                          </Typography>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<ContentCopy fontSize="small" />}
                            onClick={() => copyToClipboard(userDetails.biometric_template.nonce, 'Nonce')}
                            sx={{ color: tealAccent, p: 0 }}
                          >
                            Copy
                          </Button>
                        </Box>
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: monoBg,
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: amberAccent,
                            borderRadius: 1.5,
                            border: `1px solid ${borderCol}`,
                          }}
                        >
                          {userDetails.biometric_template.nonce}
                        </Paper>
                      </Box>

                      {/* 128-bit Authentication Tag */}
                      <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: isDarkMode ? '#9CA3AF' : '#475569' }}>
                            AES-GCM AUTHENTICATION TAG (128-bit, {userDetails.biometric_template.tag_bytes_len} bytes)
                          </Typography>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<ContentCopy fontSize="small" />}
                            onClick={() => copyToClipboard(userDetails.biometric_template.tag, 'Authentication Tag')}
                            sx={{ color: tealAccent, p: 0 }}
                          >
                            Copy
                          </Button>
                        </Box>
                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: monoBg,
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: '#10B981',
                            borderRadius: 1.5,
                            border: `1px solid ${borderCol}`,
                          }}
                        >
                          {userDetails.biometric_template.tag}
                        </Paper>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Section B & C: SHA-256 and Password Security */}
                <Grid item xs={12} md={5}>
                  <Box display="flex" flexDirection="column" gap={3}>
                    {/* SHA-256 Integrity Card */}
                    <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Tag sx={{ color: amberAccent }} />
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              SHA-256 INTEGRITY DIGEST
                            </Typography>
                          </Box>
                          <Chip label="256-BIT" size="small" sx={{ bgcolor: 'rgba(255, 176, 0, 0.15)', color: amberAccent, fontWeight: 700 }} />
                        </Box>

                        <Typography variant="caption" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B', display: 'block', mb: 1.5 }}>
                          Cryptographic hash digest bound to the encrypted biometric payload for tamper detection:
                        </Typography>

                        <Paper
                          sx={{
                            p: 1.5,
                            bgcolor: monoBg,
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            wordBreak: 'break-all',
                            color: amberAccent,
                            borderRadius: 1.5,
                            border: `1px solid ${borderCol}`,
                            mb: 2,
                          }}
                        >
                          {userDetails.biometric_template.sha256_digest}
                        </Paper>

                        {/* Live Verification Trigger */}
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={verifying ? <CircularProgress size={18} color="inherit" /> : <VerifiedUser />}
                          onClick={handleVerifyIntegrity}
                          disabled={verifying}
                          sx={{
                            bgcolor: tealAccent,
                            color: '#070A0F',
                            fontWeight: 700,
                            '&:hover': { bgcolor: isDarkMode ? '#5EEAD4' : '#14B8A6' },
                          }}
                        >
                          {verifying ? 'Verifying Integrity...' : 'Verify Integrity'}
                        </Button>

                        {/* Verification Result Display */}
                        {verificationResult && (
                          <Box mt={2} p={2} sx={{ bgcolor: verificationResult.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: 1.5, border: `1px solid ${verificationResult.status === 'VERIFIED' ? '#10B981' : '#EF4444'}` }}>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              {verificationResult.status === 'VERIFIED' ? <CheckCircle sx={{ color: '#10B981' }} /> : <Cancel sx={{ color: '#EF4444' }} />}
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: verificationResult.status === 'VERIFIED' ? '#10B981' : '#EF4444' }}>
                                STATUS: {verificationResult.status}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', color: isDarkMode ? '#D1D5DB' : '#374151' }}>
                              {verificationResult.message}
                            </Typography>
                            {verificationResult.verified_at && (
                              <Typography variant="caption" sx={{ display: 'block', color: isDarkMode ? '#9CA3AF' : '#6B7280', mt: 0.5 }}>
                                Verified at: {new Date(verificationResult.verified_at).toLocaleTimeString()}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>

                    {/* Password Security Card */}
                    <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <VpnKey sx={{ color: tealAccent }} />
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>
                            PASSWORD SECURITY
                          </Typography>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={1.2}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>Algorithm:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{userDetails.password_security.algorithm}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>Format:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{userDetails.password_security.format} (OpenBSD bcrypt)</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>Work Factor:</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{userDetails.password_security.work_factor_rounds} Rounds</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>Plaintext Password:</Typography>
                            <Chip label="NEVER DISPLAYED" size="small" color="error" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>Hash Preview:</Typography>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: tealAccent }}>{userDetails.password_security.hash_preview}</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">Please select an enrolled user to view AES-256-GCM ciphertext and SHA-256 integrity digests.</Alert>
            )}
          </Box>
        )}

        {/* ============================================================== */}
        {/* TAB 5: DATABASE RECORDS */}
        {/* ============================================================== */}
        {activeTab === 4 && (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              <strong>READ-ONLY DATABASE INSPECTION:</strong> Displays exact records stored in the primary database. Secret keys, plaintext passwords, and JWT tokens are omitted for security.
            </Alert>

            {loadingUserDetails ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <CircularProgress sx={{ color: tealAccent }} />
              </Box>
            ) : userDetails?.database_records ? (
              <Grid container spacing={3}>
                {/* User Table Row */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Table: <code>users</code>
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<ContentCopy />}
                          onClick={() => copyToClipboard(JSON.stringify(userDetails.database_records.users_table, null, 2), 'users table row')}
                        >
                          Copy
                        </Button>
                      </Box>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: monoBg,
                          maxHeight: 260,
                          overflowY: 'auto',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          color: isDarkMode ? '#F3F4F6' : '#0F172A',
                          borderRadius: 1.5,
                        }}
                      >
                        <pre style={{ margin: 0 }}>
                          {JSON.stringify(userDetails.database_records.users_table, null, 2)}
                        </pre>
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Face Embedding Table Row */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Table: <code>face_embeddings</code>
                        </Typography>
                        {userDetails.database_records.face_embeddings_table && (
                          <Button
                            size="small"
                            startIcon={<ContentCopy />}
                            onClick={() => copyToClipboard(JSON.stringify(userDetails.database_records.face_embeddings_table, null, 2), 'face_embeddings table row')}
                          >
                            Copy
                          </Button>
                        )}
                      </Box>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: monoBg,
                          maxHeight: 260,
                          overflowY: 'auto',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          color: tealAccent,
                          borderRadius: 1.5,
                        }}
                      >
                        <pre style={{ margin: 0 }}>
                          {userDetails.database_records.face_embeddings_table
                            ? JSON.stringify(userDetails.database_records.face_embeddings_table, null, 2)
                            : 'No row found in face_embeddings table for this user.'}
                        </pre>
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Face Images Table Rows */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Table: <code>face_images</code> ({userDetails.database_records.face_images_table.length} rows)
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<ContentCopy />}
                          onClick={() => copyToClipboard(JSON.stringify(userDetails.database_records.face_images_table, null, 2), 'face_images rows')}
                        >
                          Copy
                        </Button>
                      </Box>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: monoBg,
                          maxHeight: 260,
                          overflowY: 'auto',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          color: amberAccent,
                          borderRadius: 1.5,
                        }}
                      >
                        <pre style={{ margin: 0 }}>
                          {JSON.stringify(userDetails.database_records.face_images_table, null, 2)}
                        </pre>
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Attendance Table Rows */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          Table: <code>attendance</code> ({userDetails.database_records.attendance_table.length} recent rows)
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<ContentCopy />}
                          onClick={() => copyToClipboard(JSON.stringify(userDetails.database_records.attendance_table, null, 2), 'attendance rows')}
                        >
                          Copy
                        </Button>
                      </Box>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: monoBg,
                          maxHeight: 260,
                          overflowY: 'auto',
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                          color: isDarkMode ? '#6EE7B7' : '#047857',
                          borderRadius: 1.5,
                        }}
                      >
                        <pre style={{ margin: 0 }}>
                          {JSON.stringify(userDetails.database_records.attendance_table, null, 2)}
                        </pre>
                      </Paper>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">Select a user to inspect actual database table rows.</Alert>
            )}
          </Box>
        )}

        {/* ============================================================== */}
        {/* TAB 6: LIVE OPERATIONS */}
        {/* ============================================================== */}
        {activeTab === 5 && (
          <Box>
            <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderCol}`, borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Live Operations Audit Timeline ({operations.length})
                    </Typography>
                    <Typography variant="body2" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                      Real chronological timeline of registrations, enrollments, and authentications from database records.
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={fetchOperations}
                    disabled={loadingOperations}
                    sx={{ borderColor: tealAccent, color: tealAccent }}
                  >
                    Refresh Timeline
                  </Button>
                </Box>

                {loadingOperations ? (
                  <Box display="flex" justifyContent="center" py={5}>
                    <CircularProgress sx={{ color: tealAccent }} />
                  </Box>
                ) : operations.length > 0 ? (
                  <Box display="flex" flexDirection="column" gap={2.5}>
                    {operations.map((op) => (
                      <Paper
                        key={op.operation_id}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          border: `1px solid ${borderCol}`,
                          borderRadius: 2,
                          bgcolor: monoBg,
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1} mb={1.5}>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Chip
                              label={op.operation_type}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor:
                                  op.operation_type.includes('Registration')
                                    ? 'rgba(0, 224, 198, 0.15)'
                                    : op.operation_type.includes('Enrollment')
                                    ? 'rgba(255, 176, 0, 0.15)'
                                    : 'rgba(16, 185, 129, 0.15)',
                                color:
                                  op.operation_type.includes('Registration')
                                    ? tealAccent
                                    : op.operation_type.includes('Enrollment')
                                    ? amberAccent
                                    : '#10B981',
                              }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {op.operation_id}
                            </Typography>
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                              User: <strong>{op.user_name}</strong> ({op.user_id})
                            </Typography>
                          </Box>

                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                              {new Date(op.timestamp).toLocaleString()}
                            </Typography>
                            <Chip
                              label={op.status}
                              size="small"
                              color="success"
                              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                            />
                          </Box>
                        </Box>

                        {/* Pipeline Steps */}
                        <Box sx={{ pl: 1, borderLeft: `2px solid ${tealAccent}`, mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                          {op.steps.map((st, idx) => (
                            <Box key={idx} display="flex" alignItems="center" gap={1}>
                              <CheckCircle sx={{ fontSize: 16, color: '#10B981' }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 200 }}>
                                {st.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: isDarkMode ? '#9CA3AF' : '#64748B' }}>
                                — {st.detail}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Alert severity="info">No operation records recorded yet.</Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Container>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCryptoLab;
