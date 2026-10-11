import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  LinearProgress,
  Fade,
  Stack,
  IconButton,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Chip,
} from '@mui/material';
import {
  Close,
  CloudUpload,
  PhotoCamera,
  VerifiedUser,
  Lock,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { faceAPI, livenessAPI, webcamCaptureToFile } from '../services/api';
import FaceCamera from './FaceCamera';

const REQUIRED_IMAGES = 5;
const BURST_FRAMES = 12;
const BURST_INTERVAL_MS = 200;
const READY_TIMEOUT_MS = 25000;

const FaceCapture = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const webcamRef = useRef(null);

  const [mode, setMode] = useState(0); // 0: Live Camera, 1: Upload Images
  const [step, setStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedPreviews, setUploadedPreviews] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const statusRef = useRef({ ready: false, faceDetected: false, quality: 0 });
  const [detectMsg, setDetectMsg] = useState('Position your face in the frame');
  const [challengeId, setChallengeId] = useState(null);
  const [challengePrompt, setChallengePrompt] = useState('');
  const [burstProgress, setBurstProgress] = useState(0);
  const abortRef = useRef(false);

  const handleStatus = useCallback((status) => {
    statusRef.current = status;
    setDetectMsg(status.message);
  }, []);

  const waitForLiveFace = useCallback(async () => {
    const start = Date.now();
    while (Date.now() - start < READY_TIMEOUT_MS) {
      if (abortRef.current) return false;
      if (statusRef.current && statusRef.current.ready) return true;
      await new Promise((r) => setTimeout(r, 150));
    }
    return false;
  }, []);

  const startCapturing = async () => {
    abortRef.current = false;
    setError('');
    setSuccessMsg('');
    setChallengeId(null);
    setCapturedImages([]);
    setBurstProgress(0);
    setIsCapturing(true);
    setStep(1);

    try {
      const live = await waitForLiveFace();
      if (abortRef.current) return;
      if (!live) {
        setError(
          'Could not confirm a live face. Centre your face in the frame, ensure good lighting, and blink when prompted.'
        );
        setIsCapturing(false);
        setStep(0);
        return;
      }

      const { data: challenge } = await livenessAPI.getChallenge();
      if (abortRef.current) return;
      setChallengeId(challenge.challenge_id);
      setChallengePrompt(challenge.instruction);

      const shots = await webcamRef.current.captureBurst({
        count: BURST_FRAMES,
        intervalMs: BURST_INTERVAL_MS,
        onProgress: (n, total) => setBurstProgress(Math.round((n / total) * 100)),
      });
      if (abortRef.current) return;

      setChallengePrompt('');
      setCapturedImages(
        (shots || []).map((imageSrc) => ({
          imageSrc,
          metadata: { timestamp: new Date().toISOString() },
        }))
      );
      setStep(2);
    } catch (e) {
      if (!abortRef.current) {
        setError('Could not complete live face verification. Please try again or use Image Upload.');
        setStep(0);
      }
    } finally {
      setIsCapturing(false);
      setBurstProgress(0);
      setChallengePrompt('');
    }
  };

  const resetCapture = () => {
    abortRef.current = true;
    setCapturedImages([]);
    setChallengeId(null);
    setChallengePrompt('');
    setBurstProgress(0);
    setIsCapturing(false);
    setStep(0);
    setError('');
  };

  useEffect(() => () => { abortRef.current = true; }, []);

  const uploadCapturedImages = async () => {
    if (capturedImages.length < REQUIRED_IMAGES) {
      setError(`Please capture at least ${REQUIRED_IMAGES} face images`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const files = await Promise.all(
        capturedImages.map(async (imageData, index) => {
          return await webcamCaptureToFile(imageData.imageSrc, `face_${index + 1}.jpg`);
        })
      );

      await faceAPI.registerFace(files, challengeId);
      setSuccessMsg('Biometric face template enrolled and encrypted successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Face registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // --- File Upload Mode Handlers ---
  const handleFileUpload = (filesList) => {
    if (!filesList || filesList.length === 0) return;

    const newFiles = Array.from(filesList).filter((f) => f.type.startsWith('image/'));
    if (newFiles.length === 0) {
      setError('Please select valid image files (JPG, PNG, WEBP).');
      return;
    }

    const combined = [...uploadedFiles, ...newFiles].slice(0, 10);
    setUploadedFiles(combined);

    const previews = combined.map((f) => URL.createObjectURL(f));
    setUploadedPreviews(previews);
    setError('');
  };

  const removeUploadedFile = (index) => {
    const nextFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(nextFiles);
    URL.revokeObjectURL(uploadedPreviews[index]);
    const nextPreviews = uploadedPreviews.filter((_, i) => i !== index);
    setUploadedPreviews(nextPreviews);
  };

  const submitUploadedImages = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please upload at least 1 clear face image.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await faceAPI.registerFaceUpload(uploadedFiles);
      setSuccessMsg('Biometric template created and encrypted with AES-256-GCM successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Face upload registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="900" sx={{ color: 'var(--amber-accent)', fontFamily: '"JetBrains Mono", sans-serif', mb: 0.5 }}>
            BIOMETRIC <span style={{ color: 'var(--teal-accent)' }}>FACE REGISTRATION</span>
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontFamily: '"Inter", sans-serif' }}>
            AES-256-GCM Encrypted Face Template Enrollment for Student: <strong>{user?.full_name}</strong> ({user?.usn || user?.unique_id})
          </Typography>
        </Box>

        {/* Global Error & Success Alerts */}
        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: '700' }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}

        {successMsg && (
          <Fade in>
            <Alert severity="success" sx={{ mb: 3, borderRadius: '12px', fontWeight: '700' }}>
              {successMsg}
            </Alert>
          </Fade>
        )}

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
            value={mode}
            onChange={(e, val) => {
              setMode(val);
              setError('');
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
            <Tab icon={<PhotoCamera />} iconPosition="start" label="🎥 Live Camera Scan" />
            <Tab icon={<CloudUpload />} iconPosition="start" label="📁 Upload Face Images" />
          </Tabs>
        </Paper>

        <Grid container spacing={3}>
          {/* Main Action Area */}
          <Grid item xs={12} md={7}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '20px',
                background: 'var(--card-solid)',
                border: '1px solid var(--teal-border)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              }}
            >
              {/* MODE 0: Live Camera */}
              {mode === 0 && (
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="800" sx={{ color: 'var(--text-primary)', mb: 2 }}>
                    Live Camera Stream
                  </Typography>

                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '2px solid var(--teal-border)',
                      background: '#000000',
                      mb: 3,
                    }}
                  >
                    <FaceCamera
                      ref={webcamRef}
                      mode="capture"
                      height={320}
                      width="100%"
                      onStatus={handleStatus}
                    />
                  </Box>

                  {step === 0 && (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={startCapturing}
                      disabled={isCapturing}
                      sx={{
                        py: 1.8,
                        px: 4,
                        fontSize: '1rem',
                        fontWeight: '800',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--amber-accent) 0%, var(--teal-accent) 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 8px 24px var(--amber-border)',
                      }}
                    >
                      Start Live Face Scan
                    </Button>
                  )}

                  {step === 1 && (
                    <Box>
                      <LinearProgress
                        variant={challengePrompt ? 'determinate' : 'indeterminate'}
                        value={burstProgress}
                        sx={{
                          mb: 2,
                          height: 8,
                          borderRadius: 4,
                          background: 'var(--card-inner)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, var(--amber-accent) 0%, var(--teal-accent) 100%)',
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography variant="h6" fontWeight="800" sx={{ color: challengePrompt ? 'var(--amber-accent)' : 'var(--teal-accent)', mb: 1 }}>
                        {challengePrompt || 'Preparing liveness check…'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                        {challengePrompt ? 'Keep your face in frame while we check' : detectMsg}
                      </Typography>
                    </Box>
                  )}

                  {step === 2 && (
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <VerifiedUser />}
                        onClick={uploadCapturedImages}
                        disabled={loading}
                        sx={{
                          py: 1.8,
                          px: 4,
                          fontWeight: '800',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, var(--teal-accent) 0%, #0F766E 100%)',
                          color: '#FFFFFF',
                        }}
                      >
                        {loading ? 'Encrypting & Enrolling...' : 'Complete Biometric Enrollment'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={resetCapture}
                        disabled={loading}
                        sx={{
                          py: 1.8,
                          px: 3,
                          fontWeight: '700',
                          borderRadius: '12px',
                          border: '1px solid var(--table-border)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Retake
                      </Button>
                    </Stack>
                  )}
                </CardContent>
              )}

              {/* MODE 1: Upload Images */}
              {mode === 1 && (
                <CardContent sx={{ p: 4 }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    style={{ display: 'none' }}
                  />

                  <Box
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      border: `2px dashed ${isDragOver ? 'var(--amber-accent)' : 'var(--teal-border)'}`,
                      borderRadius: '16px',
                      p: { xs: 3, sm: 5 },
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragOver ? 'rgba(0, 224, 198, 0.08)' : 'var(--card-inner)',
                      transition: 'all 0.25s ease',
                      mb: 3,
                      '&:hover': {
                        borderColor: 'var(--amber-accent)',
                        background: 'rgba(255, 176, 0, 0.05)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--teal-border) 0%, var(--amber-border) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CloudUpload sx={{ fontSize: 32, color: 'var(--teal-accent)' }} />
                    </Box>
                    <Typography variant="h6" fontWeight="800" sx={{ color: 'var(--text-primary)', mb: 0.5 }}>
                      Upload 1 to 5 Face Photos
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1.5 }}>
                      Drag & drop multiple clear face photos or click to browse
                    </Typography>
                    <Chip
                      label="Clear Frontal Poses Recommended (Max 10 Images)"
                      size="small"
                      sx={{ background: 'var(--card-solid)', border: '1px solid var(--teal-border)', fontWeight: '600' }}
                    />
                  </Box>

                  {/* Submit Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={uploadedFiles.length === 0 || loading}
                    onClick={submitUploadedImages}
                    startIcon={loading ? <CircularProgress size={20} sx={{ color: '#ffffff' }} /> : <Lock />}
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
                    {loading ? 'Extracting & Encrypting Template...' : `Register & Encrypt ${uploadedFiles.length} Image(s)`}
                  </Button>
                </CardContent>
              )}
            </Card>
          </Grid>

          {/* Gallery / Review Section */}
          <Grid item xs={12} md={5}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '20px',
                background: 'var(--card-solid)',
                border: '1px solid var(--teal-border)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight="800" sx={{ color: 'var(--text-primary)', mb: 2 }}>
                  Selected Gallery ({mode === 0 ? capturedImages.length : uploadedFiles.length})
                </Typography>

                {mode === 0 && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))',
                      gap: 1.5,
                      minHeight: 180,
                      border: '1px solid var(--table-border)',
                      borderRadius: '14px',
                      p: 2,
                      background: 'var(--card-inner)',
                    }}
                  >
                    {capturedImages.length === 0 ? (
                      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gridColumn="1 / -1" sx={{ color: 'var(--text-secondary)', py: 4 }}>
                        <PhotoCamera sx={{ fontSize: 40, color: 'var(--text-muted)', mb: 1 }} />
                        <Typography variant="body2" fontWeight="600">
                          Captured camera frames will appear here
                        </Typography>
                      </Box>
                    ) : (
                      capturedImages.map((img, i) => (
                        <Box key={i} sx={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--teal-accent)', aspectRatio: '1' }}>
                          <img src={img.imageSrc} alt={`Capture ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                      ))
                    )}
                  </Box>
                )}

                {mode === 1 && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                      gap: 1.5,
                      minHeight: 180,
                      border: '1px solid var(--table-border)',
                      borderRadius: '14px',
                      p: 2,
                      background: 'var(--card-inner)',
                    }}
                  >
                    {uploadedPreviews.length === 0 ? (
                      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gridColumn="1 / -1" sx={{ color: 'var(--text-secondary)', py: 4 }}>
                        <CloudUpload sx={{ fontSize: 40, color: 'var(--text-muted)', mb: 1 }} />
                        <Typography variant="body2" fontWeight="600">
                          Uploaded images will appear here
                        </Typography>
                      </Box>
                    ) : (
                      uploadedPreviews.map((src, i) => (
                        <Box key={i} sx={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--teal-accent)', aspectRatio: '1' }}>
                          <img src={src} alt={`Upload ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <IconButton
                            size="small"
                            onClick={() => removeUploadedFile(i)}
                            sx={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              background: 'rgba(0,0,0,0.6)',
                              color: '#ffffff',
                              p: 0.3,
                              '&:hover': { background: '#dc2626' },
                            }}
                          >
                            <Close sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))
                    )}
                  </Box>
                )}

                {/* Biometric Standard Box */}
                <Box sx={{ mt: 3, p: 2.5, borderRadius: '12px', background: 'var(--card-inner)', border: '1px solid var(--table-border)' }}>
                  <Typography variant="caption" fontWeight="800" sx={{ color: 'var(--amber-accent)', display: 'block', mb: 0.5 }}>
                    AES-256-GCM ENCRYPTION
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Extracted 128-D vector embeddings are encrypted with Galois/Counter Mode authenticated cryptography before persistence.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FaceCapture;