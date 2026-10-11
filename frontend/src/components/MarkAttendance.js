import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Fade,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Stack,
  Button,
  Tabs,
  Tab,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircleRounded,
  InfoRounded,
  ErrorRounded,
  CloudUpload,
  PhotoCamera,
  DeleteOutline,
  Verified,
  Lock,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { attendanceAPI, livenessAPI, webcamCaptureToFile } from '../services/api';
import FaceCamera from './FaceCamera';

// Animations
const pulseAnimation = `
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}
@keyframes scanLine {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
@keyframes scanRing {
  0% { transform: scale(0.85); opacity: 0.9; }
  100% { transform: scale(1.25); opacity: 0; }
}
@keyframes cornerGlow {
  0%, 100% { border-color: rgba(0, 224, 198, 0.4); }
  50% { border-color: rgba(255, 176, 0, 1); }
}
`;

const MarkAttendance = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const webcamRef = useRef(null);

  // General & Mode State
  const [attendanceMode, setAttendanceMode] = useState(0); // 0: Camera, 1: Upload Photo
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [alreadyMarked, setAlreadyMarked] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState('ready');

  // Camera Liveness State
  const [faceDetected, setFaceDetected] = useState(false);
  const [liveness, setLiveness] = useState(false);
  const [detectReady, setDetectReady] = useState(false);
  const [detectMsg, setDetectMsg] = useState('Position your face in the frame');
  const [challengePrompt, setChallengePrompt] = useState('');
  const [burstProgress, setBurstProgress] = useState(0);

  // Upload Mode State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadSubject, setUploadSubject] = useState('BCS703');
  const [uploadPeriod, setUploadPeriod] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-capture Control
  const STABILITY_MS = 700;
  const RESULT_DISPLAY_MS = 4000;
  const ERROR_RETRY_MS = 3000;
  const BURST_FRAMES = 12;
  const BURST_INTERVAL_MS = 200;

  const isCapturingRef = useRef(false);
  const stabilityTimerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const requireFaceClearRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (stabilityTimerRef.current) clearTimeout(stabilityTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleStatus = useCallback((status) => {
    setFaceDetected(status.faceDetected);
    setLiveness(status.livenessVerified);
    setDetectReady(status.ready);
    setDetectMsg(status.message);
  }, []);

  const scheduleReset = useCallback((delay) => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = setTimeout(() => {
      resetTimerRef.current = null;
      setSuccess(null);
      setError('');
      setAlreadyMarked(null);
      setAttendanceStatus('ready');
      if (webcamRef.current && webcamRef.current.resetLiveness) {
        webcamRef.current.resetLiveness();
      }
    }, delay);
  }, []);

  // --- Live Camera Action ---
  const captureAndMark = useCallback(async () => {
    if (isCapturingRef.current) return;
    if (!webcamRef.current || !webcamRef.current.getScreenshot) return;

    isCapturingRef.current = true;
    setLoading(true);
    setError('');
    setSuccess(null);
    setAlreadyMarked(null);
    setBurstProgress(0);
    setAttendanceStatus('scanning');

    try {
      const { data: challenge } = await livenessAPI.getChallenge();
      setChallengePrompt(challenge.instruction);
      setAttendanceStatus('challenge');

      const shots = await webcamRef.current.captureBurst({
        count: BURST_FRAMES,
        intervalMs: BURST_INTERVAL_MS,
        onProgress: (n, total) => setBurstProgress(Math.round((n / total) * 100)),
      });

      if (!shots || shots.length === 0) {
        throw new Error('Failed to capture frames from camera.');
      }

      const frames = await Promise.all(
        shots.map((src, i) => webcamCaptureToFile(src, `attendance_${i}.jpg`))
      );

      setChallengePrompt('');
      setAttendanceStatus('processing');

      const response = await attendanceAPI.markAttendance(frames, true, challenge.challenge_id);
      setSuccess(response.data);
      setAttendanceStatus('success');
      requireFaceClearRef.current = true;
      scheduleReset(RESULT_DISPLAY_MS);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Face recognition failed';
      if (errorMessage.toLowerCase().includes('already marked')) {
        setAlreadyMarked({
          message: errorMessage,
          user: err.response?.data?.user || null,
        });
        setAttendanceStatus('already-marked');
        requireFaceClearRef.current = true;
        scheduleReset(RESULT_DISPLAY_MS);
      } else {
        setError(errorMessage);
        setAttendanceStatus('error');
        requireFaceClearRef.current = false;
        scheduleReset(ERROR_RETRY_MS);
      }
    } finally {
      setLoading(false);
      setChallengePrompt('');
      setBurstProgress(0);
      isCapturingRef.current = false;
    }
  }, [scheduleReset]);

  // Trigger camera auto-capture when stable
  useEffect(() => {
    if (attendanceMode !== 0) return; // Only in camera mode

    if (requireFaceClearRef.current && !faceDetected) {
      requireFaceClearRef.current = false;
    }

    const canCapture =
      detectReady &&
      !isCapturingRef.current &&
      attendanceStatus === 'ready' &&
      !requireFaceClearRef.current;

    if (canCapture) {
      if (!stabilityTimerRef.current) {
        stabilityTimerRef.current = setTimeout(() => {
          stabilityTimerRef.current = null;
          captureAndMark();
        }, STABILITY_MS);
      }
    } else if (stabilityTimerRef.current) {
      clearTimeout(stabilityTimerRef.current);
      stabilityTimerRef.current = null;
    }
  }, [attendanceMode, detectReady, faceDetected, attendanceStatus, captureAndMark]);

  // --- Upload Mode Actions ---
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      setAttendanceStatus('error');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError('');
    setSuccess(null);
    setAlreadyMarked(null);
    setAttendanceStatus('ready');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const clearUploadedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError('');
    setSuccess(null);
    setAlreadyMarked(null);
    setAttendanceStatus('ready');
  };

  const submitUploadAttendance = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      setAttendanceStatus('error');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);
    setAlreadyMarked(null);
    setAttendanceStatus('processing');

    try {
      const response = await attendanceAPI.markAttendanceUpload(
        selectedFile,
        uploadSubject,
        uploadPeriod
      );
      setSuccess(response.data);
      setAttendanceStatus('success');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Face not recognized';
      if (errorMessage.toLowerCase().includes('already marked')) {
        setAlreadyMarked({
          message: errorMessage,
          user: err.response?.data?.user || null,
        });
        setAttendanceStatus('already-marked');
      } else {
        setError(errorMessage);
        setAttendanceStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{pulseAnimation}</style>
      <Box
        sx={{
          background: 'var(--bg-gradient)',
          minHeight: '100vh',
          py: 4,
          px: 2,
          color: 'var(--text-primary)',
        }}
      >
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="900" sx={{ color: 'var(--amber-accent)', fontFamily: '"JetBrains Mono", sans-serif', mb: 0.5 }}>
                CIPHER <span style={{ color: 'var(--teal-accent)' }}>ATTENDANCE</span>
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontFamily: '"Inter", sans-serif' }}>
                AES-256-GCM Biometric Security Engine • {format(currentTime, 'EEEE, MMMM dd, yyyy')}
              </Typography>
            </Box>
            <Box sx={{ px: 3, py: 1.2, borderRadius: '14px', background: 'var(--card-solid)', border: '1px solid var(--teal-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <Typography variant="h6" fontWeight="900" sx={{ color: 'var(--teal-accent)', fontFamily: 'monospace' }}>
                {format(currentTime, 'hh:mm:ss a')}
              </Typography>
            </Box>
          </Box>

          {/* Mode Switcher Tabs */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              background: 'var(--card-solid)',
              border: '1px solid var(--teal-border)',
              mb: 3,
              p: 0.75,
            }}
          >
            <Tabs
              value={attendanceMode}
              onChange={(e, val) => {
                setAttendanceMode(val);
                setError('');
                setSuccess(null);
                setAlreadyMarked(null);
                setAttendanceStatus('ready');
              }}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  color: 'var(--text-secondary)',
                  fontWeight: '800',
                  textTransform: 'none',
                  minHeight: 48,
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontFamily: '"Inter", sans-serif',
                  '&.Mui-selected': {
                    color: '#FFFFFF',
                    background: 'linear-gradient(135deg, var(--amber-accent) 0%, var(--teal-accent) 100%)',
                    boxShadow: '0 4px 15px var(--amber-border)',
                  },
                },
                '& .MuiTabs-indicator': { display: 'none' },
              }}
            >
              <Tab icon={<PhotoCamera />} iconPosition="start" label="🎥 Live Web Camera" />
              <Tab icon={<CloudUpload />} iconPosition="start" label="📁 Upload Image / Photo" />
            </Tabs>
          </Paper>

          <Grid container spacing={3}>
            {/* MAIN INTERFACE: Camera or Upload */}
            <Grid item xs={12} md={8}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: 'var(--card-solid)',
                  border: '1px solid var(--teal-border)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                }}
              >
                {/* Status Bar */}
                <Box
                  sx={{
                    background: 'var(--card-solid)',
                    borderBottom: '1px solid var(--table-border)',
                    p: 2.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background:
                          attendanceStatus === 'success'
                            ? '#16a34a'
                            : attendanceStatus === 'already-marked'
                            ? 'var(--amber-accent)'
                            : attendanceStatus === 'error'
                            ? '#dc2626'
                            : (attendanceMode === 0 ? faceDetected : Boolean(selectedFile))
                            ? '#16a34a'
                            : 'var(--text-muted)',
                        boxShadow: (attendanceMode === 0 ? faceDetected : Boolean(selectedFile))
                          ? '0 0 0 3px rgba(22,163,74,0.2)'
                          : 'none',
                        transition: 'all 0.3s ease',
                      }}
                    />
                    <Typography variant="body2" fontWeight="700" sx={{ color: 'var(--text-primary)', fontFamily: '"Inter", sans-serif' }}>
                      {attendanceStatus === 'success'
                        ? 'Attendance Verified'
                        : attendanceStatus === 'already-marked'
                        ? 'Already Marked Today'
                        : attendanceStatus === 'error'
                        ? 'Recognition Failed'
                        : loading
                        ? 'Processing Verification...'
                        : attendanceMode === 0
                        ? detectReady
                          ? 'Live Face Verified'
                          : faceDetected
                          ? 'Blink to Verify'
                          : 'Waiting for Face'
                        : selectedFile
                        ? 'Photo Ready for Verification'
                        : 'Upload Face Photo'}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      loading
                        ? 'PROCESSING'
                        : attendanceStatus === 'success'
                        ? 'VERIFIED'
                        : (attendanceMode === 0 ? faceDetected : Boolean(selectedFile))
                        ? 'READY'
                        : 'STANDBY'
                    }
                    size="small"
                    sx={{
                      background: loading ? 'rgba(255,176,0,0.15)' : 'rgba(0,224,198,0.15)',
                      color: loading ? 'var(--amber-accent)' : 'var(--teal-accent)',
                      border: '1px solid var(--teal-border)',
                      fontWeight: '800',
                      fontSize: '0.72rem',
                      fontFamily: '"Inter", sans-serif',
                      height: '24px',
                    }}
                  />
                </Box>

                {/* MODE 0: Live Camera View */}
                {attendanceMode === 0 && (
                  <Box sx={{ position: 'relative', background: '#000000', minHeight: isMobile ? 400 : 480 }}>
                    <FaceCamera
                      ref={webcamRef}
                      mode="attendance"
                      height={isMobile ? 400 : 480}
                      width="100%"
                      onStatus={handleStatus}
                    />

                    {/* Liveness Challenge Overlay */}
                    {challengePrompt && (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 2,
                          p: 3,
                          background: 'rgba(7,10,15,0.7)',
                          backdropFilter: 'blur(3px)',
                          pointerEvents: 'none',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h6" fontWeight="800" sx={{ color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                          {challengePrompt}
                        </Typography>
                        <Box sx={{ width: '70%', maxWidth: 320 }}>
                          <LinearProgress
                            variant="determinate"
                            value={burstProgress}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              background: 'rgba(255,255,255,0.25)',
                              '& .MuiLinearProgress-bar': { background: 'var(--amber-accent)', borderRadius: 4 },
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                          Keep your face in frame while we verify
                        </Typography>
                      </Box>
                    )}

                    {/* Blink Hint */}
                    {!challengePrompt && !loading && !success && !error && !alreadyMarked && faceDetected && !liveness && (
                      <Box sx={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2.5, py: 1, borderRadius: '999px', background: 'rgba(7,10,15,0.85)', backdropFilter: 'blur(6px)', border: '1px solid var(--amber-border)' }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber-accent)', animation: 'pulse 1.2s ease-in-out infinite' }} />
                          <Typography variant="body2" fontWeight="700" sx={{ color: '#fff', letterSpacing: '0.04em' }}>
                            Please blink to confirm you're live
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Scanning Overlay */}
                    {loading && !success && !error && !alreadyMarked && (
                      <Fade in timeout={300}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
                          <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' }} />
                          <Box sx={{ position: 'absolute', left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent 0%, var(--teal-accent) 50%, transparent 100%)', boxShadow: '0 0 16px 3px var(--teal-accent)', animation: 'scanLine 1.6s ease-in-out infinite' }} />
                          <Box sx={{ position: 'relative', width: isMobile ? 200 : 240, height: isMobile ? 240 : 290, borderRadius: '16px' }}>
                            <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--teal-border)', animation: 'scanRing 1.8s ease-out infinite' }} />
                            {[
                              { top: 0, left: 0, borderTop: '3px solid', borderLeft: '3px solid', borderTopLeftRadius: '12px' },
                              { top: 0, right: 0, borderTop: '3px solid', borderRight: '3px solid', borderTopRightRadius: '12px' },
                              { bottom: 0, left: 0, borderBottom: '3px solid', borderLeft: '3px solid', borderBottomLeftRadius: '12px' },
                              { bottom: 0, right: 0, borderBottom: '3px solid', borderRight: '3px solid', borderBottomRightRadius: '12px' },
                            ].map((pos, i) => (
                              <Box key={i} sx={{ position: 'absolute', width: 32, height: 32, animation: 'cornerGlow 1.2s ease-in-out infinite', ...pos }} />
                            ))}
                          </Box>
                          <Box sx={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center' }}>
                            <Typography variant="body2" fontWeight="700" sx={{ color: '#ffffff', letterSpacing: '0.08em', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                              {attendanceStatus === 'processing' ? 'RECOGNIZING FACE...' : 'SCANNING...'}
                            </Typography>
                          </Box>
                        </Box>
                      </Fade>
                    )}

                    {/* Success Overlay */}
                    {success && (
                      <Fade in timeout={500}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(13,148,136,0.96) 0%, rgba(15,118,110,0.98) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.5, p: 3, zIndex: 10 }}>
                          <Box sx={{ width: 100, height: 100, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}>
                            <CheckCircleRounded sx={{ fontSize: 64, color: '#0F766E' }} />
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', mb: 0.5 }}>Attendance Verified</Typography>
                            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.95)' }}>{success.user?.full_name}</Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace' }}>USN: {success.user?.usn || success.user?.unique_id}</Typography>
                          </Box>
                          <Box sx={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '12px', px: 3, py: 1.5 }}>
                            <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: '700' }}>
                              Time: {format(new Date(), 'hh:mm:ss a')} • Confidence: {success.confidence}%
                            </Typography>
                          </Box>
                        </Box>
                      </Fade>
                    )}

                    {/* Already Marked Overlay */}
                    {alreadyMarked && (
                      <Fade in timeout={500}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(217,119,6,0.96) 0%, rgba(180,83,9,0.98) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.5, p: 3, zIndex: 10 }}>
                          <Box sx={{ width: 100, height: 100, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}>
                            <InfoRounded sx={{ fontSize: 64, color: '#B45309' }} />
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', mb: 0.5 }}>Already Marked</Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', maxWidth: 420 }}>{alreadyMarked.message}</Typography>
                          </Box>
                        </Box>
                      </Fade>
                    )}

                    {/* Error Overlay */}
                    {error && attendanceStatus === 'error' && (
                      <Fade in timeout={500}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(220,38,38,0.96) 0%, rgba(185,28,28,0.98) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.5, p: 3, zIndex: 10 }}>
                          <Box sx={{ width: 100, height: 100, borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.3)' }}>
                            <ErrorRounded sx={{ fontSize: 64, color: '#dc2626' }} />
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', mb: 0.5 }}>Not Recognized</Typography>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', maxWidth: 420 }}>{error}</Typography>
                          </Box>
                        </Box>
                      </Fade>
                    )}
                  </Box>
                )}

                {/* MODE 1: Upload Photo View */}
                {attendanceMode === 1 && (
                  <Box sx={{ p: 4 }}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />

                    {/* Dropzone / Preview Area */}
                    {!previewUrl ? (
                      <Box
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          border: `2px dashed ${isDragOver ? 'var(--amber-accent)' : 'var(--teal-border)'}`,
                          borderRadius: '16px',
                          p: { xs: 4, sm: 6 },
                          textAlign: 'center',
                          cursor: 'pointer',
                          background: isDragOver ? 'rgba(0, 224, 198, 0.08)' : 'var(--card-inner)',
                          transition: 'all 0.25s ease',
                          '&:hover': {
                            borderColor: 'var(--amber-accent)',
                            background: 'rgba(255, 176, 0, 0.05)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 72,
                            height: 72,
                            mx: 'auto',
                            mb: 2,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--teal-border) 0%, var(--amber-border) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CloudUpload sx={{ fontSize: 36, color: 'var(--teal-accent)' }} />
                        </Box>
                        <Typography variant="h6" fontWeight="800" sx={{ color: 'var(--text-primary)', mb: 1 }}>
                          Upload Face Photo to Mark Attendance
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                          Drag & drop your face photo here, or click to browse files
                        </Typography>
                        <Chip
                          label="Supports JPG, PNG, WEBP (Max 10MB)"
                          size="small"
                          sx={{ background: 'var(--card-solid)', border: '1px solid var(--teal-border)', fontWeight: '600' }}
                        />
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            position: 'relative',
                            display: 'inline-block',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '2px solid var(--teal-accent)',
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                            mb: 3,
                          }}
                        >
                          <img
                            src={previewUrl}
                            alt="Selected Face"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '340px',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                          />
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<DeleteOutline />}
                            onClick={clearUploadedFile}
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              borderRadius: '8px',
                              fontWeight: '700',
                              textTransform: 'none',
                            }}
                          >
                            Remove
                          </Button>
                        </Box>

                        {/* File Details */}
                        <Typography variant="body2" fontWeight="700" sx={{ color: 'var(--text-primary)', mb: 2 }}>
                          📁 {selectedFile?.name} ({Math.round((selectedFile?.size || 0) / 1024)} KB)
                        </Typography>
                      </Box>
                    )}

                    {/* Subject & Period Selection */}
                    <Box sx={{ mt: 3, mb: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: 'var(--text-secondary)' }}>Subject Code</InputLabel>
                            <Select
                              value={uploadSubject}
                              label="Subject Code"
                              onChange={(e) => setUploadSubject(e.target.value)}
                              sx={{
                                background: 'var(--card-inner)',
                                borderRadius: '10px',
                                color: 'var(--text-primary)',
                              }}
                            >
                              <MenuItem value="BCS703">BCS703 - Cryptography & Network Security</MenuItem>
                              <MenuItem value="BCS701">BCS701 - Artificial Intelligence & ML</MenuItem>
                              <MenuItem value="BCS702">BCS702 - Cloud Computing & DevOps</MenuItem>
                              <MenuItem value="BCS704">BCS704 - Cyber Security & Forensics</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: 'var(--text-secondary)' }}>Class Period</InputLabel>
                            <Select
                              value={uploadPeriod}
                              label="Class Period"
                              onChange={(e) => setUploadPeriod(Number(e.target.value))}
                              sx={{
                                background: 'var(--card-inner)',
                                borderRadius: '10px',
                                color: 'var(--text-primary)',
                              }}
                            >
                              {[1, 2, 3, 4, 5, 6].map((p) => (
                                <MenuItem key={p} value={p}>Period {p} ({8 + p}:00 AM - {9 + p}:00 AM)</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Upload Submit Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={!selectedFile || loading}
                      onClick={submitUploadAttendance}
                      startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <Verified />}
                      sx={{
                        py: 1.8,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--amber-accent) 0%, var(--teal-accent) 100%)',
                        color: '#FFFFFF',
                        fontWeight: '900',
                        fontSize: '1rem',
                        boxShadow: '0 8px 24px var(--amber-border)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, var(--teal-accent) 0%, var(--amber-accent) 100%)',
                        },
                      }}
                    >
                      {loading ? 'Verifying Biometric Vector...' : 'Verify Face & Mark Attendance'}
                    </Button>

                    {/* Outcome Notification Card for Upload Mode */}
                    {success && (
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 3,
                          p: 3,
                          borderRadius: '14px',
                          background: 'rgba(15, 118, 110, 0.12)',
                          border: '1px solid var(--teal-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <CheckCircleRounded sx={{ fontSize: 40, color: 'var(--teal-accent)' }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="800" sx={{ color: 'var(--teal-accent)' }}>
                            Attendance Successfully Marked!
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--text-primary)' }}>
                            Student: <strong>{success.user?.full_name}</strong> • USN: <strong>{success.user?.usn || success.user?.unique_id}</strong>
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                            Match Confidence: {success.confidence}% • Status: Present
                          </Typography>
                        </Box>
                      </Paper>
                    )}

                    {alreadyMarked && (
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 3,
                          p: 3,
                          borderRadius: '14px',
                          background: 'rgba(180, 83, 9, 0.12)',
                          border: '1px solid var(--amber-accent)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <InfoRounded sx={{ fontSize: 40, color: 'var(--amber-accent)' }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="800" sx={{ color: 'var(--amber-accent)' }}>
                            Already Marked Today
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--text-primary)' }}>
                            {alreadyMarked.message}
                          </Typography>
                        </Box>
                      </Paper>
                    )}

                    {error && attendanceStatus === 'error' && (
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 3,
                          p: 3,
                          borderRadius: '14px',
                          background: 'rgba(220, 38, 38, 0.12)',
                          border: '1px solid #dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <ErrorRounded sx={{ fontSize: 40, color: '#dc2626' }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#dc2626' }}>
                            Verification Failed
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--text-primary)' }}>
                            {error}
                          </Typography>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                )}

                {/* Auto-capture status footer for Camera Mode */}
                {attendanceMode === 0 && (
                  <Box sx={{ p: 3, background: 'var(--card-solid)' }}>
                    {loading && (
                      <LinearProgress
                        sx={{
                          mb: 2,
                          height: 6,
                          borderRadius: 3,
                          background: 'var(--card-inner)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, var(--amber-accent) 0%, var(--teal-accent) 100%)',
                            borderRadius: 3,
                          },
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        py: 1.8,
                        px: 3,
                        borderRadius: '12px',
                        background: success
                          ? 'rgba(15,118,110,0.12)'
                          : alreadyMarked
                          ? 'rgba(180,83,9,0.12)'
                          : error && attendanceStatus === 'error'
                          ? 'rgba(220,38,38,0.12)'
                          : faceDetected
                          ? 'rgba(255,176,0,0.12)'
                          : 'var(--card-inner)',
                        border: `1px solid ${
                          success
                            ? 'var(--teal-accent)'
                            : alreadyMarked
                            ? 'var(--amber-accent)'
                            : error && attendanceStatus === 'error'
                            ? '#dc2626'
                            : faceDetected
                            ? 'var(--amber-border)'
                            : 'var(--table-border)'
                        }`,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: success
                            ? '#16a34a'
                            : alreadyMarked
                            ? 'var(--amber-accent)'
                            : error && attendanceStatus === 'error'
                            ? '#dc2626'
                            : faceDetected
                            ? 'var(--amber-accent)'
                            : 'var(--text-muted)',
                          animation: (loading || faceDetected) && !success && !alreadyMarked ? 'pulse 1.5s ease-in-out infinite' : 'none',
                        }}
                      />
                      <Typography variant="body2" fontWeight="700" sx={{ color: 'var(--text-primary)', textAlign: 'center' }}>
                        {challengePrompt
                          ? challengePrompt
                          : loading
                          ? 'Verifying biometric template...'
                          : success
                          ? `Welcome, ${success.user?.full_name || ''}`
                          : alreadyMarked
                          ? 'Attendance already marked today'
                          : error && attendanceStatus === 'error'
                          ? 'Face not recognized — retrying shortly'
                          : detectReady
                          ? 'Hold still — starting liveness check'
                          : faceDetected && !liveness
                          ? 'Blink once to confirm you are live'
                          : detectMsg}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Card>
            </Grid>

            {/* SIDEBAR: Mode Guide & Security Standard */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                {/* Mode Guidelines */}
                <Card elevation={0} sx={{ borderRadius: '20px', background: 'var(--card-solid)', border: '1px solid var(--teal-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography variant="h6" fontWeight="800" sx={{ color: 'var(--amber-accent)', mb: 2, fontFamily: '"Inter", sans-serif' }}>
                      {attendanceMode === 0 ? '🎥 Live Camera Guide' : '📁 Image Upload Guide'}
                    </Typography>
                    <Stack spacing={2}>
                      {(attendanceMode === 0
                        ? [
                            'Position your face directly in the frame',
                            'Ensure good lighting and avoid backlight',
                            'Remove dark sunglasses and face masks',
                            'Blink to confirm you are live',
                            'Follow head-turn prompt if requested',
                          ]
                        : [
                            'Upload a clear frontal face image',
                            'Ensure good contrast and lighting on face',
                            'Image must show the face unobscured',
                            'Supports JPG, PNG, and WEBP formats',
                            'Matches against AES-256 encrypted vector',
                          ]
                      ).map((item, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Box
                            sx={{
                              minWidth: 22,
                              height: 22,
                              borderRadius: '6px',
                              background: 'var(--teal-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mt: 0.25,
                            }}
                          >
                            <Typography variant="caption" fontWeight="800" sx={{ color: 'var(--teal-accent)' }}>{i + 1}</Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Cryptographic Biometric Verification */}
                <Card elevation={0} sx={{ borderRadius: '20px', background: 'var(--card-solid)', border: '1px solid var(--teal-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <Lock sx={{ color: 'var(--teal-accent)' }} />
                      <Typography variant="h6" fontWeight="800" sx={{ color: 'var(--teal-accent)', fontFamily: '"Inter", sans-serif' }}>
                        Biometric Security
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      <Box sx={{ p: 2, borderRadius: '12px', background: 'var(--card-inner)', border: '1px solid var(--table-border)' }}>
                        <Typography variant="caption" fontWeight="800" sx={{ color: 'var(--amber-accent)', display: 'block', mb: 0.5 }}>
                          ENCRYPTION STANDARD
                        </Typography>
                        <Typography variant="body2" fontWeight="700" sx={{ color: 'var(--text-primary)' }}>
                          AES-256-GCM Authenticated Cipher
                        </Typography>
                      </Box>
                      <Box sx={{ p: 2, borderRadius: '12px', background: 'var(--card-inner)', border: '1px solid var(--table-border)' }}>
                        <Typography variant="caption" fontWeight="800" sx={{ color: 'var(--teal-accent)', display: 'block', mb: 0.5 }}>
                          INTEGRITY VERIFICATION
                        </Typography>
                        <Typography variant="body2" fontWeight="700" sx={{ color: 'var(--text-primary)' }}>
                          SHA-256 Cryptographic Hash Digest
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default MarkAttendance;
