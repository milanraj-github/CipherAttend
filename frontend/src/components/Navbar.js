import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  MoreVert,
  LightMode,
  DarkMode,
  InfoOutlined,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { useThemeMode } from '../context/ThemeContext';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, isDarkMode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuEl, setMobileMenuEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMobileMenuOpen = (event) => setMobileMenuEl(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuEl(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const navigateToPage = (path) => {
    navigate(path);
    handleMenuClose();
    handleMobileMenuClose();
  };

  const isActivePage = (path) => location.pathname === path;

  const navigationItems = [
    { path: '/project-info', label: 'Project Information', icon: <InfoOutlined fontSize="small" sx={{ mr: 0.8 }} /> },
    { path: '/mark-attendance', label: 'Mark Attendance' },
    { path: '/dashboard', label: 'Dashboard' },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: isDarkMode ? 'rgba(7, 10, 15, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.2)' : 'rgba(13, 148, 136, 0.2)'}`,
        boxShadow: scrolled
          ? isDarkMode
            ? '0 10px 30px rgba(0,0,0,0.6)'
            : '0 8px 24px rgba(0,0,0,0.08)'
          : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', height: 72 }}>
        {/* Brand / Logo */}
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer' }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FFB000 0%, #00E0C6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#070A0F',
              fontWeight: '900',
              fontSize: '1.2rem',
              boxShadow: isDarkMode ? '0 0 15px rgba(255, 176, 0, 0.4)' : '0 2px 8px rgba(217, 119, 6, 0.3)',
            }}
          >
            S
          </Box>
          <Typography
            variant="h6"
            fontWeight="900"
            sx={{
              color: isDarkMode ? '#FFB000' : '#D97706',
              letterSpacing: '-0.02em',
              fontFamily: '"JetBrains Mono", "Inter", sans-serif',
              textShadow: isDarkMode ? '0 0 12px rgba(255, 176, 0, 0.3)' : 'none',
            }}
          >
            CRYPTOLAB <span style={{ color: isDarkMode ? '#00E0C6' : '#0D9488' }}>ATTENDANCE</span>
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mx: { xs: 2, md: 4, lg: 6 }, flexGrow: 1 }}>
            {user ? (
              navigationItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => navigateToPage(item.path)}
                  startIcon={item.icon}
                  sx={{
                    px: 2.5,
                    py: 1.2,
                    borderRadius: '10px',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: isActivePage(item.path)
                      ? isDarkMode ? '#00E0C6' : '#0D9488'
                      : isDarkMode ? '#9CA3AF' : '#64748B',
                    background: isActivePage(item.path)
                      ? isDarkMode ? 'rgba(0, 224, 198, 0.12)' : 'rgba(13, 148, 136, 0.12)'
                      : 'transparent',
                    border: isActivePage(item.path)
                      ? `1px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.3)' : 'rgba(13, 148, 136, 0.3)'}`
                      : '1px solid transparent',
                    '&:hover': {
                      background: isDarkMode ? 'rgba(255, 176, 0, 0.15)' : 'rgba(217, 119, 6, 0.12)',
                      color: isDarkMode ? '#FFB000' : '#D97706',
                      borderColor: isDarkMode ? 'rgba(255, 176, 0, 0.3)' : 'rgba(217, 119, 6, 0.3)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {item.label}
                </Button>
              ))
            ) : (
              <Button
                onClick={() => navigateToPage('/project-info')}
                startIcon={<InfoOutlined sx={{ fontSize: '1.1rem' }} />}
                sx={{
                  px: 2.5,
                  py: 1.2,
                  borderRadius: '10px',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: isActivePage('/project-info')
                    ? isDarkMode ? '#00E0C6' : '#0D9488'
                    : isDarkMode ? '#9CA3AF' : '#64748B',
                  background: isActivePage('/project-info')
                    ? isDarkMode ? 'rgba(0, 224, 198, 0.12)' : 'rgba(13, 148, 136, 0.12)'
                    : 'transparent',
                  border: isActivePage('/project-info')
                    ? `1px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.3)' : 'rgba(13, 148, 136, 0.3)'}`
                    : '1px solid transparent',
                  '&:hover': {
                    background: isDarkMode ? 'rgba(255, 176, 0, 0.15)' : 'rgba(217, 119, 6, 0.12)',
                    color: isDarkMode ? '#FFB000' : '#D97706',
                    borderColor: isDarkMode ? 'rgba(255, 176, 0, 0.3)' : 'rgba(217, 119, 6, 0.3)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Project Information
              </Button>
            )}
          </Box>
        )}

        {/* Actions & Theme Toggle Section */}
        <Box display="flex" alignItems="center" gap={1.5}>
          {/* Theme Toggle Button */}
          <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                p: 1,
                borderRadius: '10px',
                color: isDarkMode ? '#FFB000' : '#0D9488',
                background: isDarkMode ? 'rgba(255, 176, 0, 0.1)' : 'rgba(13, 148, 136, 0.1)',
                border: `1px solid ${isDarkMode ? 'rgba(255, 176, 0, 0.25)' : 'rgba(13, 148, 136, 0.25)'}`,
                '&:hover': {
                  background: isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(217, 119, 6, 0.15)',
                  color: isDarkMode ? '#00E0C6' : '#D97706',
                  borderColor: isDarkMode ? '#00E0C6' : '#D97706',
                },
                transition: 'all 0.25s ease',
              }}
            >
              {isDarkMode ? <LightMode sx={{ fontSize: '1.25rem' }} /> : <DarkMode sx={{ fontSize: '1.25rem' }} />}
            </IconButton>
          </Tooltip>

          {/* User Section */}
          {user ? (
            <Box display="flex" alignItems="center" gap={2}>
              {!isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" fontWeight="700" sx={{ color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                      {user.full_name.split(' ')[0]}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#00E0C6' : '#0D9488', fontFamily: 'monospace' }}>
                      {user.role === 'admin' ? '● ADMIN' : '● USER'}
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                      p: 0.5,
                      background: isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(13, 148, 136, 0.15)',
                      border: `1px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.3)' : 'rgba(13, 148, 136, 0.3)'}`,
                      '&:hover': {
                        background: isDarkMode ? 'rgba(255, 176, 0, 0.2)' : 'rgba(217, 119, 6, 0.2)',
                        borderColor: isDarkMode ? '#FFB000' : '#D97706',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        background: 'linear-gradient(135deg, #FFB000 0%, #D97706 100%)',
                        color: '#070A0F',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {user.full_name.charAt(0)}
                    </Avatar>
                  </IconButton>
                </Box>
              )}
              {isMobile && (
                <IconButton
                  onClick={handleMobileMenuOpen}
                  sx={{
                    color: isDarkMode ? '#00E0C6' : '#0D9488',
                    background: isDarkMode ? 'rgba(0, 224, 198, 0.1)' : 'rgba(13, 148, 136, 0.1)',
                  }}
                >
                  <MoreVert />
                </IconButton>
              )}
            </Box>
          ) : (
            <Stack direction="row" spacing={1.5} alignItems="center">
              {isMobile && (
                <IconButton
                  onClick={handleMobileMenuOpen}
                  sx={{ color: isDarkMode ? '#00E0C6' : '#0D9488' }}
                >
                  <MoreVert />
                </IconButton>
              )}
              {!isMobile && (
                <>
                  <Button
                    onClick={() => navigateToPage('/login')}
                    sx={{
                      color: isDarkMode ? '#00E0C6' : '#0D9488',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 2.5,
                      border: `1px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.3)' : 'rgba(13, 148, 136, 0.3)'}`,
                      borderRadius: '10px',
                      '&:hover': {
                        background: isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(13, 148, 136, 0.15)',
                        borderColor: isDarkMode ? '#00E0C6' : '#0D9488',
                      },
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigateToPage('/register')}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 800,
                      px: 3,
                      background: 'linear-gradient(135deg, #FFB000 0%, #D97706 100%)',
                      color: '#070A0F',
                      boxShadow: isDarkMode ? '0 0 15px rgba(255, 176, 0, 0.3)' : '0 2px 8px rgba(217, 119, 6, 0.3)',
                      '&:hover': { background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)' },
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Stack>
          )}
        </Box>

        {/* Desktop User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1,
              borderRadius: '14px',
              background: isDarkMode ? '#0D131F' : '#FFFFFF',
              border: `1px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.3)' : 'rgba(13, 148, 136, 0.25)'}`,
              boxShadow: isDarkMode ? '0 20px 60px rgba(0,0,0,0.8)' : '0 10px 30px rgba(0,0,0,0.12)',
              minWidth: 240,
              color: isDarkMode ? '#F3F4F6' : '#0F172A',
              '& .MuiMenuItem-root': {
                px: 3,
                py: 1.5,
                borderRadius: '8px',
                mx: 1,
                my: 0.5,
                '&:hover': {
                  background: isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(13, 148, 136, 0.12)',
                  color: isDarkMode ? '#00E0C6' : '#0D9488',
                },
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ p: 3, borderBottom: `1px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(13, 148, 136, 0.15)'}` }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #FFB000, #D97706)', color: '#070A0F', fontWeight: 'bold' }}>
                {user?.full_name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="700" sx={{ color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>
                  {user?.full_name}
                </Typography>
                <Typography variant="caption" sx={{ color: isDarkMode ? '#00E0C6' : '#0D9488', fontFamily: 'monospace' }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>
          </Box>
          <MenuItem onClick={() => navigateToPage('/profile')}>
            <Typography fontWeight="600">My Profile</Typography>
          </MenuItem>
          <MenuItem onClick={toggleTheme}>
            <Box display="flex" alignItems="center" gap={1.5} width="100%">
              {isDarkMode ? <LightMode fontSize="small" sx={{ color: '#FFB000' }} /> : <DarkMode fontSize="small" sx={{ color: '#0D9488' }} />}
              <Typography fontWeight="600">
                {isDarkMode ? 'Light Theme' : 'Dark Theme'}
              </Typography>
            </Box>
          </MenuItem>
          <Divider sx={{ mx: 1, my: 0.5, borderColor: isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(13, 148, 136, 0.15)' }} />
          <MenuItem onClick={handleLogout} sx={{ color: isDarkMode ? '#FFB000' : '#D97706' }}>
            <Typography fontWeight="600">Sign out</Typography>
          </MenuItem>
        </Menu>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuEl}
          open={Boolean(mobileMenuEl)}
          onClose={handleMobileMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              mt: 1,
              borderRadius: '14px',
              background: isDarkMode ? '#0D131F' : '#FFFFFF',
              border: `1px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.3)' : 'rgba(13, 148, 136, 0.25)'}`,
              minWidth: 260,
              color: isDarkMode ? '#F3F4F6' : '#0F172A',
              '& .MuiMenuItem-root': {
                px: 3,
                py: 1.5,
                borderRadius: '8px',
                mx: 1,
                my: 0.5,
                '&:hover': {
                  background: isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(13, 148, 136, 0.12)',
                  color: isDarkMode ? '#00E0C6' : '#0D9488',
                },
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {user ? (
            <>
              <Box sx={{ p: 3, borderBottom: `1px solid ${isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(13, 148, 136, 0.15)'}` }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ width: 40, height: 40, background: 'linear-gradient(135deg, #FFB000, #D97706)', color: '#070A0F', fontWeight: 'bold' }}>
                    {user?.full_name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="700" sx={{ color: isDarkMode ? '#F3F4F6' : '#0F172A' }}>{user?.full_name}</Typography>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#00E0C6' : '#0D9488', fontFamily: 'monospace' }}>
                      {user?.role === 'admin' ? '● ADMIN' : '● USER'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              {navigationItems.map((item) => (
                <MenuItem key={item.path} onClick={() => navigateToPage(item.path)}>
                  <Typography fontWeight={600}>{item.label}</Typography>
                </MenuItem>
              ))}
              <MenuItem onClick={() => navigateToPage('/profile')}>
                <Typography fontWeight={600}>My Profile</Typography>
              </MenuItem>
              <MenuItem onClick={toggleTheme}>
                <Box display="flex" alignItems="center" gap={1.5} width="100%">
                  {isDarkMode ? <LightMode fontSize="small" sx={{ color: '#FFB000' }} /> : <DarkMode fontSize="small" sx={{ color: '#0D9488' }} />}
                  <Typography fontWeight={600}>
                    {isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider sx={{ mx: 1, my: 1, borderColor: isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(13, 148, 136, 0.15)' }} />
              <MenuItem onClick={handleLogout} sx={{ color: isDarkMode ? '#FFB000' : '#D97706' }}>
                <Typography fontWeight="600">Sign out</Typography>
              </MenuItem>
            </>
          ) : (
            <>
              <MenuItem onClick={() => navigateToPage('/project-info')}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <InfoOutlined fontSize="small" sx={{ color: isDarkMode ? '#00E0C6' : '#0D9488' }} />
                  <Typography fontWeight="600" sx={{ color: isDarkMode ? '#00E0C6' : '#0D9488' }}>
                    Project Information
                  </Typography>
                </Box>
              </MenuItem>
              <Divider sx={{ mx: 1, my: 0.5, borderColor: isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(13, 148, 136, 0.15)' }} />
              <MenuItem onClick={() => navigateToPage('/login')}>
                <Typography fontWeight="600" sx={{ color: isDarkMode ? '#00E0C6' : '#0D9488' }}>Sign in</Typography>
              </MenuItem>
              <MenuItem onClick={() => navigateToPage('/register')}>
                <Typography fontWeight="600" sx={{ color: isDarkMode ? '#FFB000' : '#D97706' }}>Sign up</Typography>
              </MenuItem>
              <MenuItem onClick={() => navigateToPage('/mark-attendance')}>
                <Typography fontWeight="600">Mark Attendance</Typography>
              </MenuItem>
              <Divider sx={{ mx: 1, my: 1, borderColor: isDarkMode ? 'rgba(0, 224, 198, 0.15)' : 'rgba(13, 148, 136, 0.15)' }} />
              <MenuItem onClick={toggleTheme}>
                <Box display="flex" alignItems="center" gap={1.5} width="100%">
                  {isDarkMode ? <LightMode fontSize="small" sx={{ color: '#FFB000' }} /> : <DarkMode fontSize="small" sx={{ color: '#0D9488' }} />}
                  <Typography fontWeight="600">
                    {isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                  </Typography>
                </Box>
              </MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
