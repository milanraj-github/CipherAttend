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
  Chip,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Email,
  Phone,
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  CheckCircle,
  HowToReg,
  Badge,
  School,
  Class as ClassIcon,
  Numbers,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { authAPI } from '../services/api';

const MotionPaper = motion(Paper);

const BRANCH_OPTIONS = ['CSE', 'ISE', 'ECE', 'AIML', 'ME', 'CV'];
const YEAR_OPTIONS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];
const SEMESTER_OPTIONS = [
  { value: 1, label: 'Semester 1' },
  { value: 2, label: 'Semester 2' },
  { value: 3, label: 'Semester 3' },
  { value: 4, label: 'Semester 4' },
  { value: 5, label: 'Semester 5' },
  { value: 6, label: 'Semester 6' },
  { value: 7, label: 'Semester 7' },
  { value: 8, label: 'Semester 8' },
];
const SECTION_OPTIONS = ['A', 'B', 'C'];

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    usn: '',
    email: '',
    branch: 'CSE',
    year: 3,
    semester: 6,
    section: 'A',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    switch (name) {
      case 'full_name':
        if (!value.trim()) {
          errors.full_name = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.full_name = 'Full name must be at least 2 characters';
        } else {
          delete errors.full_name;
        }
        break;
      case 'usn':
        if (!value.trim()) {
          errors.usn = 'USN is required';
        } else if (value.trim().length < 3) {
          errors.usn = 'USN must be at least 3 characters';
        } else {
          delete errors.usn;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        if (formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
          } else {
            delete errors.confirmPassword;
          }
        }
        break;
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
      default:
        break;
    }
    setFieldErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'usn') {
      val = value.toUpperCase();
    }

    // Auto-update default semester when year changes if out of range
    if (name === 'year') {
      const yr = Number(value);
      const defaultSem = yr * 2;
      setFormData((prev) => ({
        ...prev,
        year: yr,
        semester: defaultSem,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: val,
      }));
    }

    setError('');
    if (['full_name', 'usn', 'email', 'password', 'confirmPassword'].includes(name)) {
      validateField(name, val);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: 'Enter password', color: 'default' };
    if (password.length < 6) return { strength: 25, text: 'Weak', color: 'error' };
    if (password.length < 8) return { strength: 50, text: 'Fair', color: 'warning' };
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 100, text: 'Strong', color: 'success' };
    }
    return { strength: 75, text: 'Good', color: 'info' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.usn.trim()) {
      setError('USN is required (e.g. 4SO23CS070)');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const registrationData = {
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        usn: formData.usn.trim().toUpperCase(),
        branch: formData.branch,
        year: Number(formData.year),
        semester: Number(formData.semester),
        section: formData.section,
        phone_number: formData.phone_number.trim() || null,
        department: formData.branch || 'CSE',
      };

      const response = await authAPI.register(registrationData);
      const { access_token, user } = response.data;

      login(user, access_token);
      navigate('/face-capture');
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';
      if (error.response?.status === 400) {
        if (error.response?.data?.detail?.includes('already')) {
          errorMessage = error.response.data.detail;
        } else {
          errorMessage = error.response?.data?.detail || 'Invalid input. Please check all fields and try again.';
        }
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid email or format. Please check the fields.';
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

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      background: 'var(--card-inner)',
      border: '1px solid var(--teal-border)',
      color: 'var(--text-primary)',
      fontFamily: '"Inter", sans-serif',
      fontSize: '0.88rem',
      '& fieldset': {
        border: 'none',
      },
      '& input': {
        py: 1.3,
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
    '& .MuiFormHelperText-root': {
      color: 'var(--amber-accent)',
      fontSize: '0.75rem',
      mt: 0.5,
    },
  };

  const selectStyles = {
    ...inputStyles,
    '& .MuiSelect-select': {
      py: 1.3,
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
    },
    '& .MuiSvgIcon-root': {
      color: 'var(--teal-accent)',
    },
  };

  const menuProps = {
    PaperProps: {
      sx: {
        background: 'var(--card-solid)',
        border: '1px solid var(--teal-border)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
        '& .MuiMenuItem-root': {
          color: 'var(--text-primary)',
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.88rem',
          '&:hover': {
            background: 'var(--teal-border)',
            color: 'var(--teal-accent)',
          },
          '&.Mui-selected': {
            background: 'var(--teal-border)',
            color: 'var(--teal-accent)',
            fontWeight: '700',
          },
        },
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
      <Container maxWidth="sm">
        <MotionPaper
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: '24px',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--teal-border)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 25px var(--teal-border)',
          }}
        >
          {/* Header Icon */}
          <Box
            sx={{
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--teal-border) 0%, var(--amber-border) 100%)',
              border: '2px solid var(--teal-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px var(--teal-border)',
            }}
          >
            <HowToReg sx={{ fontSize: 30, color: 'var(--teal-accent)' }} />
          </Box>

          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              fontWeight="900"
              gutterBottom
              sx={{
                color: 'var(--teal-accent)',
                letterSpacing: '-0.02em',
                fontFamily: '"JetBrains Mono", "Inter", sans-serif',
                fontSize: { xs: '1.4rem', sm: '1.65rem' },
                mb: 0.6,
              }}
            >
              Create your account
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#9CA3AF',
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              Join Cryptography Smart Attendance System
            </Typography>
          </Box>

          {/* Alert Message */}
          {error && (
            <Fade in timeout={400}>
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
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
            <Stack spacing={2}>
              {/* Full Name */}
              <TextField
                fullWidth
                name="full_name"
                placeholder="Full name *"
                value={formData.full_name}
                onChange={handleChange}
                required
                disabled={loading}
                autoFocus
                error={!!fieldErrors.full_name}
                helperText={fieldErrors.full_name || ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#00E0C6', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />

              {/* USN & Email Row */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  name="usn"
                  placeholder="USN (e.g. 4SO23CS070) *"
                  value={formData.usn}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!fieldErrors.usn}
                  helperText={fieldErrors.usn || ''}
                  inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '700' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge sx={{ color: '#FFB000', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyles}
                />

                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  placeholder="Email address *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#00E0C6', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyles}
                />
              </Stack>

              {/* Academic Details Header */}
              <Box sx={{ pt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#00E0C6',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  🎓 Academic Cohort Details
                </Typography>
              </Box>

              {/* Branch & Year Row */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth sx={selectStyles}>
                  <Select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    disabled={loading}
                    MenuProps={menuProps}
                    startAdornment={
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <School sx={{ color: '#00E0C6', fontSize: 20 }} />
                      </InputAdornment>
                    }
                  >
                    {BRANCH_OPTIONS.map((b) => (
                      <MenuItem key={b} value={b}>
                        {b} Branch
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={selectStyles}>
                  <Select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    disabled={loading}
                    MenuProps={menuProps}
                    startAdornment={
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <Numbers sx={{ color: '#FFB000', fontSize: 20 }} />
                      </InputAdornment>
                    }
                  >
                    {YEAR_OPTIONS.map((y) => (
                      <MenuItem key={y.value} value={y.value}>
                        {y.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Semester & Section Row */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth sx={selectStyles}>
                  <Select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    disabled={loading}
                    MenuProps={menuProps}
                    startAdornment={
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <ClassIcon sx={{ color: '#00E0C6', fontSize: 20 }} />
                      </InputAdornment>
                    }
                  >
                    {SEMESTER_OPTIONS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={selectStyles}>
                  <Select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    disabled={loading}
                    MenuProps={menuProps}
                    startAdornment={
                      <InputAdornment position="start" sx={{ ml: 1 }}>
                        <Typography sx={{ color: '#FFB000', fontWeight: 800, fontSize: '0.85rem' }}>
                          SEC:
                        </Typography>
                      </InputAdornment>
                    }
                  >
                    {SECTION_OPTIONS.map((sec) => (
                      <MenuItem key={sec} value={sec}>
                        Section {sec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Phone Number */}
              <TextField
                fullWidth
                name="phone_number"
                placeholder="Phone number (optional)"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: '#FFB000', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />

              {/* Password */}
              <Box>
                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password *"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#00E0C6', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={passwordStrength.strength}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(7, 10, 15, 0.7)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 2,
                              backgroundColor:
                                passwordStrength.color === 'error'
                                  ? '#ef4444'
                                  : passwordStrength.color === 'warning'
                                  ? '#FFB000'
                                  : passwordStrength.color === 'info'
                                  ? '#00E0C6'
                                  : passwordStrength.color === 'success'
                                  ? '#00E0C6'
                                  : '#64748b',
                            },
                          }}
                        />
                      </Box>
                      <Chip
                        label={passwordStrength.text}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 18,
                          backgroundColor: 'rgba(0, 224, 198, 0.15)',
                          color: '#00E0C6',
                          border: '1px solid rgba(0, 224, 198, 0.3)',
                          fontWeight: '700',
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Confirm Password */}
              <Box>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password *"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  error={!!fieldErrors.confirmPassword}
                  helperText={fieldErrors.confirmPassword || ''}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#FFB000', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{
                            color: '#64748b',
                            '&:hover': { color: '#00E0C6' },
                          }}
                        >
                          {showConfirmPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyles}
                />

                {/* Password Match Indicator */}
                {formData.confirmPassword && formData.password && (
                  <Box sx={{ mt: 1 }}>
                    {formData.password === formData.confirmPassword ? (
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: 14, color: '#00E0C6' }} />}
                        label="Passwords match"
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          backgroundColor: 'rgba(0, 224, 198, 0.15)',
                          color: '#00E0C6',
                          border: '1px solid rgba(0, 224, 198, 0.3)',
                          fontWeight: '700',
                          '& .MuiChip-icon': { color: '#00E0C6' },
                        }}
                      />
                    ) : (
                      <Chip
                        label="Passwords don't match"
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          backgroundColor: 'rgba(255, 176, 0, 0.15)',
                          color: '#FFB000',
                          border: '1px solid rgba(255, 176, 0, 0.3)',
                          fontWeight: '700',
                        }}
                      />
                    )}
                  </Box>
                )}
              </Box>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{
                  py: 1.6,
                  mt: 1,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00E0C6 0%, #0F766E 100%)',
                  color: '#070A0F',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  textTransform: 'none',
                  fontFamily: '"Inter", sans-serif',
                  boxShadow: '0 8px 24px rgba(0, 224, 198, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 28px rgba(0, 224, 198, 0.45)',
                  },
                  '&:disabled': {
                    background: 'rgba(51, 65, 85, 0.5)',
                    color: '#64748b',
                  },
                  transition: 'all 0.25s ease',
                }}
              >
                {loading ? 'Creating account...' : 'Create account'}
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
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#FFB000',
                  textDecoration: 'none',
                  fontWeight: '700',
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </MotionPaper>
      </Container>
    </Box>
  );
};

export default Register;