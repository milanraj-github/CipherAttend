import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Card,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  IconButton,
  Fade,
  CircularProgress,
  CardMedia,
  Stack,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person,
  AccountCircle,
  VpnKey,
  Edit,
  Save,
  Cancel,
  Face,
} from '@mui/icons-material';
import { userAPI } from '../services/api';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [viewFacesDialogOpen, setViewFacesDialogOpen] = useState(false);
  const [registeredFaces, setRegisteredFaces] = useState(null);
  const [loadingFaces, setLoadingFaces] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone_number: '',
    department: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      setUser(response.data);
      setProfileForm({
        full_name: response.data.full_name || '',
        phone_number: response.data.phone_number || '',
        department: response.data.department || '',
      });
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async () => {
    setUpdateLoading(true);
    try {
      setError('');
      setSuccess('');
      
      const response = await userAPI.updateProfile(profileForm);
      setUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      let errorMsg = 'Failed to update profile';
      if (err.response?.status === 400) {
        errorMsg = err.response?.data?.detail || 'Invalid data. Please check your inputs.';
      } else if (err.response?.status === 401) {
        errorMsg = 'Authentication expired. Please log in again.';
      } else if (err.response?.status === 409) {
        errorMsg = 'Email already in use by another account.';
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setError(errorMsg);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordLoading(true);
    try {
      setError('');
      setSuccess('');

      if (passwordForm.new_password !== passwordForm.confirm_password) {
        setError('New passwords do not match. Please re-enter your password.');
        setPasswordLoading(false);
        return;
      }

      if (passwordForm.new_password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setPasswordLoading(false);
        return;
      }

      await userAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      setSuccess('Password changed successfully!');
      setPasswordDialogOpen(false);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      let errorMsg = 'Failed to change password';
      if (err.response?.status === 400) {
        errorMsg = err.response?.data?.detail || 'Invalid password. Please check your current password.';
      } else if (err.response?.status === 401) {
        errorMsg = 'Current password is incorrect. Please try again.';
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setError(errorMsg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      department: user.department || '',
    });
    setEditMode(false);
    setError('');
  };

  const handleViewRegisteredFaces = async () => {
    setViewFacesDialogOpen(true);
    setLoadingFaces(true);
    setError('');
    
    try {
      const response = await userAPI.getRegisteredFaces();
      if (response && response.data) {
        if (!response.data.faces) {
          response.data.faces = [];
        }
        setRegisteredFaces(response.data);
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      let errorMsg = 'Failed to load registered faces';
      if (err.response?.status === 404) {
        errorMsg = 'No face data found. Please register your face first.';
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setError(errorMsg);
    } finally {
      setLoadingFaces(false);
    }
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      background: 'var(--card-inner)',
      border: '1px solid var(--teal-border)',
      color: 'var(--text-primary)',
      '& fieldset': { border: 'none' },
      '& input': { color: 'var(--text-primary)' },
      '&:hover': { border: '1px solid var(--amber-border)' },
      '&.Mui-focused': { border: '1px solid var(--teal-accent)', boxShadow: '0 0 10px var(--teal-border)' },
    },
    '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        sx={{ background: 'var(--bg-primary)' }}
      >
        <CircularProgress size={40} sx={{ color: 'var(--teal-accent)' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: 'var(--bg-gradient)', minHeight: '100vh', py: 4, px: 2 }}>
      <Container maxWidth="lg">
        <Fade in timeout={600}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid var(--teal-border)',
              borderRadius: '20px',
              background: 'var(--card-solid)',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            }}
          >
            {/* Header Banner */}
            <Box sx={{ p: { xs: 3, sm: 4 }, borderBottom: '1px solid var(--table-border)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Avatar 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      background: 'linear-gradient(135deg, var(--amber-accent), var(--teal-accent))',
                      color: '#070A0F',
                      fontSize: '1.75rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px var(--amber-border)',
                    }}
                  >
                    {user?.full_name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="900" sx={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', mb: 0.8, fontFamily: '"Inter", sans-serif' }}>
                      {user?.full_name || 'My Profile'}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip 
                        label={user?.role === 'admin' ? '● ADMIN' : '● STUDENT / USER'}
                        size="small"
                        sx={{
                          background: user?.role === 'admin' ? 'rgba(255, 176, 0, 0.15)' : 'rgba(0, 224, 198, 0.15)',
                          color: user?.role === 'admin' ? 'var(--amber-accent)' : 'var(--teal-accent)',
                          fontWeight: '800',
                          fontSize: '0.75rem',
                          fontFamily: 'monospace',
                          border: `1px solid ${user?.role === 'admin' ? 'var(--amber-border)' : 'var(--teal-border)'}`,
                        }}
                      />
                      {user?.usn && (
                        <Chip
                          label={`USN: ${user.usn}`}
                          size="small"
                          sx={{
                            background: 'var(--card-inner)',
                            color: 'var(--text-primary)',
                            fontWeight: '700',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            border: '1px solid var(--teal-border)',
                          }}
                        />
                      )}
                    </Stack>
                  </Box>
                </Box>
                
                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {!editMode ? (
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => setEditMode(true)}
                      sx={{
                        borderRadius: '10px',
                        border: '1px solid var(--teal-border)',
                        color: 'var(--teal-accent)',
                        background: 'var(--card-inner)',
                        textTransform: 'none',
                        fontWeight: '700',
                        '&:hover': {
                          border: '1px solid var(--teal-accent)',
                          background: 'rgba(0, 224, 198, 0.12)',
                        },
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        disabled={updateLoading}
                        startIcon={updateLoading ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <Save />}
                        onClick={handleProfileUpdate}
                        sx={{
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, var(--amber-accent), var(--teal-accent))',
                          color: '#FFFFFF',
                          textTransform: 'none',
                          fontWeight: '800',
                        }}
                      >
                        {updateLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancelEdit}
                        sx={{
                          borderRadius: '10px',
                          border: '1px solid var(--table-border)',
                          color: 'var(--text-secondary)',
                          textTransform: 'none',
                          fontWeight: '600',
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<VpnKey />}
                    onClick={() => setPasswordDialogOpen(true)}
                    sx={{
                      borderRadius: '10px',
                      border: '1px solid var(--amber-border)',
                      color: 'var(--amber-accent)',
                      background: 'var(--card-inner)',
                      textTransform: 'none',
                      fontWeight: '700',
                      '&:hover': {
                        border: '1px solid var(--amber-accent)',
                        background: 'rgba(255, 176, 0, 0.12)',
                      },
                    }}
                  >
                    Change Password
                  </Button>
                </Box>
              </Box>

              {/* Alerts */}
              {error && (
                <Fade in>
                  <Alert 
                    severity="error" 
                    sx={{ mt: 3, borderRadius: '10px', fontWeight: '700' }}
                    action={
                      <IconButton color="inherit" size="small" onClick={() => setError('')}>
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  >
                    {error}
                  </Alert>
                </Fade>
              )}
              {success && (
                <Fade in>
                  <Alert 
                    severity="success" 
                    sx={{ mt: 3, borderRadius: '10px', fontWeight: '700' }}
                    action={
                      <IconButton color="inherit" size="small" onClick={() => setSuccess('')}>
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  >
                    {success}
                  </Alert>
                </Fade>
              )}
            </Box>

            {/* Profile Content Body */}
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <Grid container spacing={4}>
                {/* LEFT: Personal Information */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: 'var(--card-inner)',
                      border: '1px solid var(--teal-border)',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                      <Person sx={{ color: 'var(--teal-accent)' }} />
                      <Typography variant="h6" fontWeight="800" sx={{ color: 'var(--teal-accent)', fontFamily: '"Inter", sans-serif' }}>
                        Personal Information
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Box>
                        <Typography variant="caption" fontWeight="700" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                          FULL NAME
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            value={profileForm.full_name}
                            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                            size="small"
                            sx={inputStyles}
                          />
                        ) : (
                          <Typography variant="body1" fontWeight="700" sx={{ color: 'var(--text-primary)' }}>
                            {user?.full_name}
                          </Typography>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="caption" fontWeight="700" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                          EMAIL ADDRESS
                        </Typography>
                        <Typography variant="body1" fontWeight="700" sx={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          {user?.email}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" fontWeight="700" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                          PHONE NUMBER
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            value={profileForm.phone_number}
                            onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                            size="small"
                            sx={inputStyles}
                          />
                        ) : (
                          <Typography variant="body1" fontWeight="700" sx={{ color: 'var(--text-primary)' }}>
                            {user?.phone_number || 'Not provided'}
                          </Typography>
                        )}
                      </Box>

                      <Box>
                        <Typography variant="caption" fontWeight="700" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                          DEPARTMENT / BRANCH
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            value={profileForm.department}
                            onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                            size="small"
                            sx={inputStyles}
                          />
                        ) : (
                          <Typography variant="body1" fontWeight="700" sx={{ color: 'var(--text-primary)' }}>
                            {user?.department || 'Computer Science & Engineering (CSE)'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* RIGHT: Account & Biometric Information */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      background: 'var(--card-inner)',
                      border: '1px solid var(--amber-border)',
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                      <AccountCircle sx={{ color: 'var(--amber-accent)' }} />
                      <Typography variant="h6" fontWeight="800" sx={{ color: 'var(--amber-accent)', fontFamily: '"Inter", sans-serif' }}>
                        Account & Biometrics
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      <Box>
                        <Typography variant="caption" fontWeight="700" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                          STUDENT USER ID / USN
                        </Typography>
                        <Typography variant="body1" fontWeight="800" sx={{ color: 'var(--teal-accent)', fontFamily: 'monospace' }}>
                          {user?.usn || user?.unique_id}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" fontWeight="700" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                          BIOMETRIC FACE ENROLLMENT
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center" mt={0.5}>
                          <Chip 
                            label={user?.face_registered ? '✓ ENROLLED & ENCRYPTED' : 'PENDING ENROLLMENT'} 
                            size="small"
                            sx={{
                              background: user?.face_registered ? 'rgba(0, 224, 198, 0.15)' : 'rgba(255, 176, 0, 0.15)',
                              color: user?.face_registered ? 'var(--teal-accent)' : 'var(--amber-accent)',
                              border: `1px solid ${user?.face_registered ? 'var(--teal-border)' : 'var(--amber-border)'}`,
                              fontWeight: '800',
                              fontSize: '0.75rem',
                              fontFamily: 'monospace',
                            }}
                          />
                          {user?.face_registered ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={handleViewRegisteredFaces}
                              sx={{
                                borderRadius: '8px',
                                border: '1px solid var(--teal-border)',
                                color: 'var(--teal-accent)',
                                textTransform: 'none',
                                fontWeight: '700',
                                fontSize: '0.75rem',
                                '&:hover': { background: 'rgba(0, 224, 198, 0.1)' },
                              }}
                            >
                              View Faces
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => window.location.href = '/face-capture'}
                              sx={{
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, var(--amber-accent), var(--teal-accent))',
                                color: '#FFFFFF',
                                textTransform: 'none',
                                fontWeight: '800',
                                fontSize: '0.75rem',
                              }}
                            >
                              Register Face
                            </Button>
                          )}
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="caption" fontWeight="700" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                          ACCOUNT STATUS
                        </Typography>
                        <Chip 
                          label={user?.is_active ? 'ACTIVE' : 'INACTIVE'} 
                          size="small"
                          sx={{
                            background: user?.is_active ? 'rgba(0, 224, 198, 0.15)' : 'rgba(220, 38, 38, 0.15)',
                            color: user?.is_active ? 'var(--teal-accent)' : '#dc2626',
                            border: `1px solid ${user?.is_active ? 'var(--teal-border)' : '#dc2626'}`,
                            fontWeight: '800',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="caption" fontWeight="700" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                          MEMBER SINCE
                        </Typography>
                        <Typography variant="body1" fontWeight="700" sx={{ color: 'var(--text-primary)' }}>
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recently Enrolled'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Fade>

        {/* Change Password Modal */}
        <Dialog 
          open={passwordDialogOpen} 
          onClose={() => setPasswordDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              background: 'var(--card-solid)',
              color: 'var(--text-primary)',
              border: '1px solid var(--teal-border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            },
          }}
        >
          <DialogTitle sx={{ color: 'var(--amber-accent)', fontWeight: '800', pb: 1, fontFamily: '"Inter", sans-serif' }}>
            Change Account Password
          </DialogTitle>
          <DialogContent sx={{ px: 3, pt: 2 }}>
            <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                sx={inputStyles}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                sx={inputStyles}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                sx={inputStyles}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1.5 }}>
            <Button 
              onClick={() => setPasswordDialogOpen(false)}
              sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: '600', color: 'var(--text-secondary)' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordChange} 
              variant="contained"
              disabled={passwordLoading}
              startIcon={passwordLoading ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : null}
              sx={{
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--amber-accent), var(--teal-accent))',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: '800',
              }}
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Registered Faces Modal */}
        <Dialog 
          open={viewFacesDialogOpen} 
          onClose={() => setViewFacesDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              background: 'var(--card-solid)',
              color: 'var(--text-primary)',
              border: '1px solid var(--teal-border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            },
          }}
        >
          <DialogTitle sx={{ 
            color: 'var(--teal-accent)', 
            fontWeight: '800', 
            pb: 2, 
            fontFamily: '"Inter", sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Face /> Registered Biometric Face Templates
            </Box>
            <IconButton onClick={() => setViewFacesDialogOpen(false)} sx={{ color: 'var(--text-secondary)' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ px: 3, pb: 3 }}>
            {loadingFaces ? (
              <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="240px" gap={2}>
                <CircularProgress size={40} sx={{ color: 'var(--teal-accent)' }} />
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  Retrieving biometric templates...
                </Typography>
              </Box>
            ) : registeredFaces ? (
              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 3,
                    background: 'var(--card-inner)',
                    border: '1px solid var(--teal-border)',
                    borderRadius: '12px',
                  }}
                >
                  <Stack direction="row" spacing={3} alignItems="center">
                    <Box>
                      <Typography variant="caption" fontWeight="700" sx={{ color: 'var(--text-secondary)' }}>
                        TOTAL REGISTERED IMAGES
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'var(--teal-accent)', fontWeight: '800' }}>
                        {registeredFaces.total_faces || (registeredFaces.faces ? registeredFaces.faces.length : 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ width: '1px', height: '40px', background: 'var(--table-border)' }} />
                    <Box>
                      <Typography variant="caption" fontWeight="700" sx={{ color: 'var(--text-secondary)' }}>
                        STUDENT USER ID
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontWeight: '700', fontFamily: 'monospace' }}>
                        {registeredFaces.user_id || user?.unique_id}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* Face Grid */}
                <Grid container spacing={2}>
                  {registeredFaces?.faces && Array.isArray(registeredFaces.faces) && registeredFaces.faces.map((face, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        elevation={0}
                        sx={{
                          border: '1px solid var(--teal-border)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          background: 'var(--card-inner)',
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={face.image_data}
                          alt={face.filename}
                          sx={{ width: '100%', height: 180, objectFit: 'cover' }}
                        />
                        <Box sx={{ p: 1.5 }}>
                          <Typography variant="caption" fontWeight="700" sx={{ color: 'var(--text-primary)', display: 'block', mb: 0.5 }}>
                            {face.filename}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                            {new Date(face.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={() => setViewFacesDialogOpen(false)}
              variant="outlined"
              sx={{ borderRadius: '10px', border: '1px solid var(--table-border)', color: 'var(--text-secondary)' }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default UserProfile;