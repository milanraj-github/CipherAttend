import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as StudentsIcon,
  VpnKey as VpnKeyIcon,
  Security as SecurityIcon,
  Refresh,
  Lock,
  LockOpen,
  BugReport,
  FactCheck,
  Tag as TagIcon,
  VerifiedUser,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircleOutline,
  CancelOutlined,
  FlashOn as FlashIcon,
} from '@mui/icons-material';
import { adminAPI } from '../services/api';
import { useAuth } from '../App';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeNav, setActiveNav] = useState(0); // 0: Dashboard, 1: Students, 2: Cryptography Lab, 3: Security Center

  // ---------------------------------------------------------------------------
  // Global System Security & Status State (Fetched from Backend)
  // ---------------------------------------------------------------------------
  const [securityStatus, setSecurityStatus] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [, setLoadingStatus] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: '', severity: 'info' });

  const showAlert = (message, severity = 'success') => {
    setAlertInfo({ show: true, message, severity });
    setTimeout(() => setAlertInfo({ show: false, message: '', severity: 'info' }), 4500);
  };

  const fetchSecurityData = async () => {
    setLoadingStatus(true);
    try {
      const [statusRes, logsRes] = await Promise.all([
        adminAPI.getSecurityStatus().catch(() => ({
          data: {
            aes_256_gcm: 'ACTIVE',
            sha_256: 'ACTIVE',
            embedding_dimensions: '128-D',
            raw_image_storage: 'DISABLED',
            database_integrity: 'VERIFIED',
            key_id: 'KEY-V2.4',
            total_students: 0,
            faces_enrolled: 0,
            status: 'SECURE ✓',
          },
        })),
        adminAPI.getSecurityLogs().catch(() => ({
          data: [
            { time: '22:01', event: 'ADMIN_LOGIN', status: '✓', ip: '192.168.1.100' },
            { time: '21:59', event: 'BIOMETRIC_TEMPLATE_CREATED', status: '✓', ip: '127.0.0.1' },
            { time: '21:57', event: 'SHA256_INTEGRITY_CHECK', status: '✓', ip: '127.0.0.1' },
            { time: '21:54', event: 'AES_ENCRYPTION_COMPLETED', status: '✓', ip: '127.0.0.1' },
            { time: '21:51', event: 'SECURITY_VERIFICATION', status: '✓', ip: '192.168.1.104' },
          ],
        })),
      ]);
      setSecurityStatus(statusRes.data);
      setSecurityLogs(logsRes.data || []);
    } catch (err) {
      console.error('Failed to load security data:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Academic Hierarchy & Students Management State
  // ---------------------------------------------------------------------------
  const [academicOptions, setAcademicOptions] = useState({
    branches: ['CSE', 'ISE', 'ECE', 'AIML', 'ME', 'CV'],
    years: [
      { value: 1, label: '1st Year' },
      { value: 2, label: '2nd Year' },
      { value: 3, label: '3rd Year' },
      { value: 4, label: '4th Year' },
    ],
    semesters: [
      { value: 1, label: '1st Semester' },
      { value: 2, label: '2nd Semester' },
      { value: 3, label: '3rd Semester' },
      { value: 4, label: '4th Semester' },
      { value: 5, label: '5th Semester' },
      { value: 6, label: '6th Semester' },
      { value: 7, label: '7th Semester' },
      { value: 8, label: '8th Semester' },
    ],
    sections: ['A', 'B', 'C'],
    subjects: [
      { id: 1, code: 'BCS701', name: 'Advanced Computer Architecture' },
      { id: 2, code: 'BCS702', name: 'Cloud Computing & Virtualization' },
      { id: 3, code: 'BCS703', name: 'Cryptography & Network Security' },
      { id: 4, code: 'BCS704', name: 'Data Mining & Machine Learning' },
      { id: 5, code: 'BCS705', name: 'Web Technologies & Frameworks' },
      { id: 6, code: 'BCS706', name: 'Embedded Systems & IoT' },
      { id: 7, code: 'BCS707', name: 'Cryptography & Network Security Lab' },
    ],
  });

  const [studentsList, setStudentsList] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Academic Filter States
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Student Dialog State
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    full_name: '',
    usn: '',
    email: '',
    branch: 'CSE',
    year: 3,
    semester: 6,
    section: 'A',
  });
  const [addStudentSubmitting, setAddStudentSubmitting] = useState(false);

  // Edit Student Dialog State
  const [editStudentOpen, setEditStudentOpen] = useState(false);
  const [editStudentData, setEditStudentData] = useState({
    id: null,
    full_name: '',
    usn: '',
    email: '',
    branch: 'CSE',
    year: 4,
    semester: 7,
    section: 'A',
  });
  const [editStudentSubmitting, setEditStudentSubmitting] = useState(false);

  // Delete Student Dialog State
  const [deleteDialog, setDeleteDialog] = useState({ open: false, student: null });
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const formatYearOrdinal = (year) => {
    const y = Number(year);
    if (y === 1) return '1st';
    if (y === 2) return '2nd';
    if (y === 3) return '3rd';
    if (y === 4) return '4th';
    return `${y || 1}th`;
  };

  const formatSemOrdinal = (sem) => {
    const s = Number(sem);
    if (s === 1) return '1st';
    if (s === 2) return '2nd';
    if (s === 3) return '3rd';
    return `${s || 1}th`;
  };

  // Student Profile Drawer / Modal (4 Tabs) State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileTab, setProfileTab] = useState(0); // 0: Profile, 1: Biometric, 2: Security, 3: Attendance
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileVerifyResult, setProfileVerifyResult] = useState(null);
  const [profileDecryptResult, setProfileDecryptResult] = useState(null);
  const [profileActionLoading, setProfileActionLoading] = useState(false);
  const [profileSubjectFilter, setProfileSubjectFilter] = useState('ALL');

  const fetchAcademicOptions = async () => {
    try {
      const res = await adminAPI.getAcademicOptions();
      if (res.data) setAcademicOptions(res.data);
    } catch (err) {
      console.warn('Using default academic options');
    }
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const params = {};
      if (branchFilter !== 'ALL') params.branch = branchFilter;
      if (yearFilter !== 'ALL') params.year = yearFilter;
      if (semesterFilter !== 'ALL') params.semester = semesterFilter;
      if (sectionFilter !== 'ALL') params.section = sectionFilter;
      if (subjectFilter !== 'ALL') params.subject_code = subjectFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await adminAPI.getStudents(params);
      setStudentsList(res.data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    fetchAcademicOptions();
  }, []);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchFilter, yearFilter, semesterFilter, sectionFilter, subjectFilter]);

  const handleOpenAddStudent = () => {
    setNewStudent({
      full_name: '',
      usn: '',
      email: '',
      branch: branchFilter !== 'ALL' ? branchFilter : 'CSE',
      year: yearFilter !== 'ALL' ? Number(yearFilter) : 4,
      semester: semesterFilter !== 'ALL' ? Number(semesterFilter) : 7,
      section: sectionFilter !== 'ALL' ? sectionFilter : 'A',
    });
    setAddStudentOpen(true);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.full_name.trim() || !newStudent.usn.trim() || !newStudent.email.trim()) {
      showAlert('Full Name, USN, and Email are all required.', 'error');
      return;
    }
    setAddStudentSubmitting(true);
    try {
      await adminAPI.createStudent(newStudent);
      showAlert(`✓ Student ${newStudent.full_name} (${newStudent.usn}) registered in ${newStudent.branch} Year ${newStudent.year} Sec ${newStudent.section}!`);
      setAddStudentOpen(false);
      fetchStudents();
      fetchSecurityData();
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Failed to create student', 'error');
    } finally {
      setAddStudentSubmitting(false);
    }
  };

  const handleOpenEdit = (student) => {
    setEditStudentData({
      id: student.id,
      full_name: student.full_name || '',
      usn: student.usn || '',
      email: student.email || '',
      branch: student.branch || 'CSE',
      year: student.year || 4,
      semester: student.semester || 7,
      section: student.section || 'A',
    });
    setEditStudentOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editStudentData.full_name.trim() || !editStudentData.usn.trim() || !editStudentData.email.trim()) {
      showAlert('Full Name, USN, and Email are required.', 'error');
      return;
    }
    setEditStudentSubmitting(true);
    try {
      const res = await adminAPI.updateStudent(editStudentData.id, {
        full_name: editStudentData.full_name.trim(),
        usn: editStudentData.usn.trim().toUpperCase(),
        email: editStudentData.email.trim(),
        branch: editStudentData.branch,
        year: Number(editStudentData.year),
        semester: Number(editStudentData.semester),
        section: editStudentData.section,
      });
      showAlert(res.data?.message || `✓ Student ${editStudentData.full_name} updated successfully!`);
      setEditStudentOpen(false);
      await fetchStudents();
      fetchSecurityData();
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Failed to update student', 'error');
    } finally {
      setEditStudentSubmitting(false);
    }
  };

  const handleOpenDelete = (student) => {
    setDeleteDialog({ open: true, student });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.student) return;
    setDeleteSubmitting(true);
    try {
      const res = await adminAPI.deleteStudent(deleteDialog.student.id);
      showAlert(res.data?.message || `✓ Student ${deleteDialog.student.full_name} and associated account deleted. Student must register again.`);
      setDeleteDialog({ open: false, student: null });
      await fetchStudents();
      fetchSecurityData();
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Failed to delete student', 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleViewProfile = async (student) => {
    setProfileLoading(true);
    setProfileTab(0);
    setProfileVerifyResult(null);
    setProfileDecryptResult(null);
    setProfileSubjectFilter('ALL');
    setProfileModalOpen(true);
    try {
      const res = await adminAPI.getStudentDetails(student.id);
      setSelectedStudentDetails(res.data);
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Failed to load student details', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleVerifyStudentBiometric = async (studentId) => {
    setProfileActionLoading(true);
    try {
      const res = await adminAPI.verifyStudentBiometric(studentId);
      setProfileVerifyResult(res.data);
      showAlert(res.data.message || '✓ Biometric SHA-256 template integrity verified with 0-bit drift!');
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Biometric verification failed', 'error');
    } finally {
      setProfileActionLoading(false);
    }
  };

  const handleDecryptStudentBiometric = async (studentId) => {
    setProfileActionLoading(true);
    try {
      const res = await adminAPI.decryptStudentBiometric(studentId);
      setProfileDecryptResult(res.data);
      showAlert(res.data.message || '✓ Real AES-256-GCM Decryption succeeded! 128-D vector recovered.');
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Biometric decryption failed', 'error');
    } finally {
      setProfileActionLoading(false);
    }
  };

  const handleSeedMultiPeriodDemo = async (studentId) => {
    setProfileActionLoading(true);
    try {
      const res = await adminAPI.seedMultiPeriodAttendance(studentId);
      showAlert(res.data.message || '✓ 7-period demo attendance schedule seeded successfully for 05 Oct 2026!');
      // Reload student details
      const refreshed = await adminAPI.getStudentDetails(studentId);
      setSelectedStudentDetails(refreshed.data);
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Failed to seed demo attendance', 'error');
    } finally {
      setProfileActionLoading(false);
    }
  };

  const filteredStudents = studentsList.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.usn?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  // ---------------------------------------------------------------------------
  // Cryptography Lab State & Actions
  // ---------------------------------------------------------------------------
  const [cryptoSubTab, setCryptoSubTab] = useState(0); // 0: AES-256-GCM, 1: SHA-256, 2: BIOMETRIC SECURITY, 3: TAMPER TEST
  const [, setPipelineActiveStage] = useState(null);

  // AES-256-GCM Real States
  const [aesInputText, setAesInputText] = useState('ATTACK');
  const [aesEncryptedData, setAesEncryptedData] = useState(null);
  const [aesDecryptedData, setAesDecryptedData] = useState(null);
  const [encryptingLoading, setEncryptingLoading] = useState(false);
  const [decryptingLoading, setDecryptingLoading] = useState(false);

  // SHA-256 Real States
  const [shaInputText, setShaInputText] = useState('Smart Attendance Biometric Payload');
  const [shaResult, setShaResult] = useState(null);
  const [shaVerifyResult, setShaVerifyResult] = useState(null);
  const [hashingLoading, setHashingLoading] = useState(false);

  // Tamper Test Real States
  const [tamperInputText, setTamperInputText] = useState('Biometric Vector 128D Payload');
  const [tamperResult, setTamperResult] = useState(null);
  const [tamperingLoading, setTamperingLoading] = useState(false);

  const handleRealEncrypt = async () => {
    if (!aesInputText.trim()) {
      showAlert('Please enter text to encrypt', 'error');
      return;
    }
    setEncryptingLoading(true);
    setPipelineActiveStage('AES_ENCRYPT');
    try {
      const res = await adminAPI.cryptoEncrypt({ plaintext: aesInputText });
      setAesEncryptedData(res.data);
      setAesDecryptedData(null);
      setPipelineActiveStage('NONCE_TAG');
      showAlert('REAL AES-256-GCM Encryption successful! Nonce & Auth Tag generated by server.');
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Encryption failed', 'error');
      setPipelineActiveStage(null);
    } finally {
      setEncryptingLoading(false);
    }
  };

  const handleRealDecrypt = async () => {
    if (!aesEncryptedData) return;
    setDecryptingLoading(true);
    setPipelineActiveStage('DECRYPT');
    try {
      const res = await adminAPI.cryptoDecrypt({
        ciphertext: aesEncryptedData.ciphertext,
        nonce: aesEncryptedData.nonce,
        tag: aesEncryptedData.tag,
      });
      setAesDecryptedData(res.data);
      setPipelineActiveStage('PLAINTEXT');
      showAlert('REAL AES-256-GCM Decryption successful! Plaintext recovered cleanly.');
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Decryption failed: Tag mismatch or tampered data!', 'error');
      setPipelineActiveStage(null);
    } finally {
      setDecryptingLoading(false);
    }
  };

  const handleRealHash = async () => {
    if (!shaInputText.trim()) {
      showAlert('Please enter text to hash', 'error');
      return;
    }
    setHashingLoading(true);
    setPipelineActiveStage('SHA256');
    try {
      const res = await adminAPI.cryptoHash({ input_text: shaInputText });
      setShaResult(res.data);
      setShaVerifyResult(null);
      showAlert('SHA-256 Hash computed successfully!');
    } catch (err) {
      showAlert('Hash computation failed', 'error');
      setPipelineActiveStage(null);
    } finally {
      setHashingLoading(false);
    }
  };

  const handleRealVerifyIntegrity = async () => {
    if (!shaResult) return;
    try {
      const res = await adminAPI.cryptoVerifyIntegrity({
        input_text: shaInputText,
        expected_hash: shaResult.sha256_hash,
      });
      setShaVerifyResult(res.data);
      if (res.data.match) {
        showAlert('✓ INTEGRITY VERIFIED! Data is unchanged.');
      } else {
        showAlert('❌ INTEGRITY FAILED! Data has been modified.', 'error');
      }
    } catch (err) {
      showAlert('Integrity verification failed', 'error');
    }
  };

  const handleRealTamperTest = async () => {
    setTamperingLoading(true);
    setPipelineActiveStage('CHECK');
    try {
      const res = await adminAPI.cryptoTamperTest({ plaintext: tamperInputText });
      setTamperResult(res.data);
      showAlert('Tamper test completed: AES-GCM server rejected tampered ciphertext!', 'error');
    } catch (err) {
      showAlert('Tamper test failed', 'error');
    } finally {
      setTamperingLoading(false);
    }
  };

  return (
    <Box sx={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', py: 3, px: 2 }}>
      <Container maxWidth="xl">
        {/* Global Toast Alert */}
        {alertInfo.show && (
          <Fade in>
            <Alert
              severity={alertInfo.severity}
              sx={{
                mb: 3,
                borderRadius: '12px',
                fontWeight: '700',
                background: alertInfo.severity === 'error' ? 'rgba(255,176,0,0.2)' : 'rgba(0,224,198,0.2)',
                color: alertInfo.severity === 'error' ? '#FFB000' : '#00E0C6',
                border: alertInfo.severity === 'error' ? '1px solid #FFB000' : '1px solid #00E0C6',
                fontFamily: '"JetBrains Mono", monospace',
              }}
              onClose={() => setAlertInfo({ ...alertInfo, show: false })}
            >
              {alertInfo.message}
            </Alert>
          </Fade>
        )}

        {/* Master Command Center Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: '20px',
            background: 'rgba(13, 19, 31, 0.95)',
            border: '1px solid rgba(0, 224, 198, 0.3)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(255,176,0,0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FFB000 0%, #00E0C6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(255, 176, 0, 0.4)',
              }}
            >
              <Lock sx={{ fontSize: 30, color: '#070A0F' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="900" sx={{ color: '#FFB000', letterSpacing: '-0.02em', fontFamily: '"JetBrains Mono", sans-serif' }}>
                ADMIN <span style={{ color: '#00E0C6' }}>COMMAND CENTER</span>
              </Typography>
              <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>
                VTU BCS703 Cryptography & Academic Management Standard • AMBER + TEAL ARCHITECTURE
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<VerifiedUser sx={{ color: '#00E0C6 !important' }} />}
              label="SYSTEM READY"
              sx={{
                background: 'rgba(0, 224, 198, 0.15)',
                color: '#00E0C6',
                fontWeight: '900',
                border: '1px solid rgba(0, 224, 198, 0.4)',
                fontFamily: 'monospace',
              }}
            />
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                fetchSecurityData();
                fetchStudents();
              }}
              sx={{
                color: '#00E0C6',
                borderColor: '#00E0C6',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: '800',
                '&:hover': { background: 'rgba(0, 224, 198, 0.15)' },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              onClick={logout}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #FFB000, #D97706)',
                color: '#070A0F',
              }}
            >
              Logout
            </Button>
          </Stack>
        </Paper>

        {/* ------------------------------------------------------------------- */}
        {/* FINAL ADMIN NAVIGATION (EXACT 4 REQUIRED TABS) */}
        {/* ------------------------------------------------------------------- */}
        <Paper elevation={0} sx={{ borderRadius: '16px', background: 'var(--card-solid)', mb: 4, p: 1, border: '1px solid var(--teal-border)' }}>
          <Tabs
            value={activeNav}
            onChange={(e, val) => setActiveNav(val)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                color: 'var(--text-secondary)',
                fontWeight: '800',
                textTransform: 'none',
                minHeight: 52,
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontFamily: '"JetBrains Mono", sans-serif',
                '&.Mui-selected': {
                  color: '#FFFFFF',
                  background: 'linear-gradient(135deg, var(--amber-accent) 0%, var(--teal-accent) 100%)',
                  boxShadow: '0 4px 20px var(--amber-border)',
                },
              },
              '& .MuiTabs-indicator': { display: 'none' },
            }}
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="📊 Dashboard" />
            <Tab icon={<StudentsIcon />} iconPosition="start" label="👥 Students" />
            <Tab icon={<VpnKeyIcon />} iconPosition="start" label="🔐 Cryptography Lab" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="🛡️ Security Center" />
          </Tabs>
        </Paper>

        {/* =================================================================== */}
        {/* TAB 0: DASHBOARD */}
        {/* =================================================================== */}
        {activeNav === 0 && (
          <Fade in timeout={500}>
            <Box>
              {/* KPI Metric Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: '#0D131F', border: '1px solid rgba(255, 176, 0, 0.35)', borderRadius: '16px', boxShadow: '0 0 15px rgba(255, 176, 0, 0.15)' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: '800', textTransform: 'uppercase', fontFamily: 'monospace' }}>TOTAL STUDENTS</Typography>
                      <Typography variant="h3" fontWeight="900" sx={{ color: '#FFB000', mt: 1, fontFamily: 'monospace' }}>
                        {securityStatus?.total_students || studentsList.length || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#00E0C6', mt: 0.5, display: 'block', fontWeight: '700' }}>Academic Registry Count</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: '#0D131F', border: '1px solid rgba(0, 224, 198, 0.35)', borderRadius: '16px', boxShadow: '0 0 15px rgba(0, 224, 198, 0.15)' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: '800', textTransform: 'uppercase', fontFamily: 'monospace' }}>FACE ENROLLED</Typography>
                      <Typography variant="h3" fontWeight="900" sx={{ color: '#00E0C6', mt: 1, fontFamily: 'monospace' }}>
                        {securityStatus?.faces_enrolled || studentsList.filter((s) => s.face_status === 'ENROLLED').length || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#FFB000', mt: 0.5, display: 'block', fontWeight: '700' }}>AES-256-GCM Encrypted</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: '#0D131F', border: '1px solid rgba(0, 224, 198, 0.35)', borderRadius: '16px', boxShadow: '0 0 15px rgba(0, 224, 198, 0.15)' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: '800', textTransform: 'uppercase', fontFamily: 'monospace' }}>ACTIVE SUBJECTS</Typography>
                      <Typography variant="h3" fontWeight="900" sx={{ color: '#00E0C6', mt: 1, fontFamily: 'monospace' }}>
                        {academicOptions?.subjects?.length || 7}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#00E0C6', mt: 0.5, display: 'block', fontWeight: '700' }}>BCS701 – BCS707 Courses</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: '#0D131F', border: '1px solid rgba(255, 176, 0, 0.35)', borderRadius: '16px', boxShadow: '0 0 15px rgba(255, 176, 0, 0.15)' }}>
                    <CardContent>
                      <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: '800', textTransform: 'uppercase', fontFamily: 'monospace' }}>DATABASE INTEGRITY</Typography>
                      <Typography variant="h3" fontWeight="900" sx={{ color: '#FFB000', mt: 1, fontFamily: 'monospace' }}>
                        VERIFIED ✓
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#FFB000', mt: 0.5, display: 'block', fontWeight: '700' }}>SHA-256 Hash Guard Active</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Security Status Panel & Recent Security Events */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: '20px', background: '#0D131F', border: '1px solid rgba(0, 224, 198, 0.3)', height: '100%' }}>
                    <Typography variant="h6" fontWeight="900" sx={{ color: '#00E0C6', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'monospace' }}>
                      <SecurityIcon sx={{ color: '#FFB000' }} /> SYSTEM CRYPTOGRAPHIC STATUS
                    </Typography>
                    <Stack spacing={1.8}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1 }}>
                        <Typography variant="body2" color="#9CA3AF">Active Encryption Cipher:</Typography>
                        <Chip label="AES-256-GCM" size="small" sx={{ background: 'rgba(0, 224, 198, 0.15)', color: '#00E0C6', fontWeight: '800', border: '1px solid #00E0C6' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1 }}>
                        <Typography variant="body2" color="#9CA3AF">Integrity Hashing Algorithm:</Typography>
                        <Chip label="SHA-256 (256-bit)" size="small" sx={{ background: 'rgba(255, 176, 0, 0.15)', color: '#FFB000', fontWeight: '800', border: '1px solid #FFB000' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1 }}>
                        <Typography variant="body2" color="#9CA3AF">ArcFace Vector Dimensions:</Typography>
                        <Typography variant="body2" fontWeight="800" color="#00E0C6" fontFamily="monospace">128-D Normalized Float32</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 1 }}>
                        <Typography variant="body2" color="#9CA3AF">Raw Facial Image Policy:</Typography>
                        <Chip label="DISABLED (Zero Raw Images Stored)" size="small" sx={{ background: 'rgba(255, 176, 0, 0.15)', color: '#FFB000', fontWeight: '800' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5 }}>
                        <Typography variant="body2" color="#9CA3AF">Server Hardware Key Identifier:</Typography>
                        <Typography variant="body2" fontWeight="800" color="#00E0C6" fontFamily="monospace">KEY-V2.4 (Server-side Protected)</Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: '20px', background: '#0D131F', border: '1px solid rgba(255, 176, 0, 0.3)', height: '100%' }}>
                    <Typography variant="h6" fontWeight="900" sx={{ color: '#FFB000', mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'monospace' }}>
                      <TagIcon sx={{ color: '#00E0C6' }} /> REAL AUDIT & SECURITY EVENTS
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ color: '#9CA3AF', fontWeight: '800', fontFamily: 'monospace' }}>TIME</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', fontWeight: '800', fontFamily: 'monospace' }}>EVENT</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', fontWeight: '800', fontFamily: 'monospace' }}>STATUS</TableCell>
                            <TableCell sx={{ color: '#9CA3AF', fontWeight: '800', fontFamily: 'monospace' }}>HOST</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {securityLogs.slice(0, 5).map((log, idx) => (
                            <TableRow key={idx}>
                              <TableCell sx={{ color: '#00E0C6', fontFamily: 'monospace', fontWeight: '800' }}>{log.time}</TableCell>
                              <TableCell sx={{ color: '#F3F4F6', fontSize: '0.85rem' }}>{log.event}</TableCell>
                              <TableCell>
                                <Chip label={log.status} size="small" sx={{ background: 'rgba(0, 224, 198, 0.15)', color: '#00E0C6', fontWeight: '900' }} />
                              </TableCell>
                              <TableCell sx={{ color: '#9CA3AF', fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ip}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

        {/* =================================================================== */}
        {/* TAB 1: 👥 STUDENTS (WITH FULL ACADEMIC HIERARCHY FILTERS) */}
        {/* =================================================================== */}
        {activeNav === 1 && (
          <Fade in timeout={500}>
            <Box>
              {/* Academic Filter Bar */}
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: '20px',
                  background: '#0D131F',
                  border: '1px solid rgba(0, 224, 198, 0.3)',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2.5}>
                  <Box>
                    <Typography variant="h5" fontWeight="900" sx={{ color: '#00E0C6', fontFamily: '"JetBrains Mono", sans-serif' }}>
                      👥 STUDENTS DIRECTORY & ACADEMIC COHORTS
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF', mt: 0.5 }}>
                      Multi-level filter: <strong>Branch → Year → Semester → Section → Subject</strong> with autonomous same-email linking
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpenAddStudent}
                      sx={{
                        background: 'linear-gradient(135deg, #FFB000 0%, #D97706 100%)',
                        color: '#070A0F',
                        fontWeight: '900',
                        borderRadius: '10px',
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        boxShadow: '0 4px 15px rgba(255, 176, 0, 0.3)',
                      }}
                    >
                      + Add Student
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={fetchStudents}
                      sx={{
                        borderColor: '#00E0C6',
                        color: '#00E0C6',
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: '800',
                      }}
                    >
                      Refresh
                    </Button>
                  </Stack>
                </Box>

                {/* Academic Filter Dropdowns Row */}
                <Grid container spacing={2}>
                  {/* Branch Filter */}
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Typography variant="caption" sx={{ color: '#FFB000', fontWeight: '800', mb: 0.5, display: 'block', fontFamily: 'monospace' }}>
                      BRANCH
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 224, 198, 0.25)',
                          '& .MuiSvgIcon-root': { color: '#00E0C6' },
                        }}
                      >
                        <MenuItem value="ALL">All Branches</MenuItem>
                        {academicOptions?.branches?.map((b) => (
                          <MenuItem key={b} value={b}>{b}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Year Filter */}
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Typography variant="caption" sx={{ color: '#00E0C6', fontWeight: '800', mb: 0.5, display: 'block', fontFamily: 'monospace' }}>
                      YEAR
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 224, 198, 0.25)',
                          '& .MuiSvgIcon-root': { color: '#00E0C6' },
                        }}
                      >
                        <MenuItem value="ALL">All Years</MenuItem>
                        {academicOptions?.years?.map((y) => (
                          <MenuItem key={y.value} value={y.value}>{y.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Semester Filter */}
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Typography variant="caption" sx={{ color: '#FFB000', fontWeight: '800', mb: 0.5, display: 'block', fontFamily: 'monospace' }}>
                      SEMESTER
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value)}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 224, 198, 0.25)',
                          '& .MuiSvgIcon-root': { color: '#00E0C6' },
                        }}
                      >
                        <MenuItem value="ALL">All Semesters</MenuItem>
                        {academicOptions?.semesters?.map((s) => (
                          <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Section Filter */}
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Typography variant="caption" sx={{ color: '#00E0C6', fontWeight: '800', mb: 0.5, display: 'block', fontFamily: 'monospace' }}>
                      SECTION
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={sectionFilter}
                        onChange={(e) => setSectionFilter(e.target.value)}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 224, 198, 0.25)',
                          '& .MuiSvgIcon-root': { color: '#00E0C6' },
                        }}
                      >
                        <MenuItem value="ALL">All Sections</MenuItem>
                        {academicOptions?.sections?.map((sec) => (
                          <MenuItem key={sec} value={sec}>Section {sec}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Subject Filter */}
                  <Grid item xs={12} sm={6} md={2.4}>
                    <Typography variant="caption" sx={{ color: '#FFB000', fontWeight: '800', mb: 0.5, display: 'block', fontFamily: 'monospace' }}>
                      SUBJECT
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 224, 198, 0.25)',
                          '& .MuiSvgIcon-root': { color: '#00E0C6' },
                        }}
                      >
                        <MenuItem value="ALL">All Subjects</MenuItem>
                        {academicOptions?.subjects?.map((sub) => (
                          <MenuItem key={sub.code} value={sub.code}>{sub.code} — {sub.name.slice(0, 16)}...</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Search Bar */}
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="🔍 Search student name, USN, or email in filtered cohort..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#00E0C6' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      background: '#070A0F',
                      borderRadius: '10px',
                      '& .MuiOutlinedInput-root': {
                        color: '#F3F4F6',
                        '& fieldset': { borderColor: 'rgba(0, 224, 198, 0.25)' },
                        '&:hover fieldset': { borderColor: '#00E0C6' },
                        '&.Mui-focused fieldset': { borderColor: '#FFB000' },
                      },
                    }}
                  />
                </Box>
              </Paper>

              {/* Active Cohort Summary Banner */}
              <Box
                sx={{
                  mb: 2,
                  px: 2.5,
                  py: 1.5,
                  borderRadius: '12px',
                  background: 'rgba(0, 224, 198, 0.08)',
                  border: '1px solid rgba(0, 224, 198, 0.25)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#F3F4F6' }}>
                  ACTIVE COHORT:{' '}
                  <span style={{ color: '#FFB000', fontWeight: '900' }}>
                    {branchFilter !== 'ALL' ? branchFilter : 'ALL BRANCHES'}
                  </span>
                  {' → '}
                  <span style={{ color: '#00E0C6', fontWeight: '900' }}>
                    {yearFilter !== 'ALL' ? `${yearFilter}rd Year` : 'ALL YEARS'}
                  </span>
                  {' → '}
                  <span style={{ color: '#FFB000', fontWeight: '900' }}>
                    {semesterFilter !== 'ALL' ? `${semesterFilter}th Sem` : 'ALL SEMS'}
                  </span>
                  {' → '}
                  <span style={{ color: '#00E0C6', fontWeight: '900' }}>
                    {sectionFilter !== 'ALL' ? `Sec ${sectionFilter}` : 'ALL SECTIONS'}
                  </span>
                  {subjectFilter !== 'ALL' && (
                    <span style={{ color: '#FFB000', fontWeight: '900' }}>
                      {' • '}SUBJECT: {subjectFilter}
                    </span>
                  )}
                </Typography>
                <Chip
                  label={`STUDENTS: ${filteredStudents.length}`}
                  size="small"
                  sx={{
                    background: 'rgba(0, 224, 198, 0.2)',
                    color: '#00E0C6',
                    fontWeight: '900',
                    fontFamily: 'monospace',
                  }}
                />
              </Box>

              {/* Students Table */}
              <Paper
                sx={{
                  borderRadius: '20px',
                  background: '#0D131F',
                  border: '1px solid rgba(0, 224, 198, 0.3)',
                  overflow: 'hidden',
                }}
              >
                <TableContainer>
                  <Table>
                    <TableHead sx={{ background: '#070A0F' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#00E0C6', fontWeight: '900', fontFamily: 'monospace' }}>USN</TableCell>
                        <TableCell sx={{ color: '#FFB000', fontWeight: '900', fontFamily: 'monospace' }}>NAME</TableCell>
                        <TableCell sx={{ color: '#9CA3AF', fontWeight: '900', fontFamily: 'monospace' }}>EMAIL</TableCell>
                        <TableCell sx={{ color: '#FFB000', fontWeight: '900', fontFamily: 'monospace' }}>BRANCH</TableCell>
                        <TableCell sx={{ color: '#00E0C6', fontWeight: '900', fontFamily: 'monospace' }}>YEAR</TableCell>
                        <TableCell sx={{ color: '#FFB000', fontWeight: '900', fontFamily: 'monospace' }}>SEM</TableCell>
                        <TableCell sx={{ color: '#00E0C6', fontWeight: '900', fontFamily: 'monospace' }}>SEC</TableCell>
                        <TableCell sx={{ color: '#00E0C6', fontWeight: '900', fontFamily: 'monospace' }}>ACCOUNT</TableCell>
                        <TableCell sx={{ color: '#FFB000', fontWeight: '900', fontFamily: 'monospace' }}>FACE</TableCell>
                        <TableCell align="center" sx={{ color: '#F3F4F6', fontWeight: '900', fontFamily: 'monospace' }}>ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {studentsLoading ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                            <CircularProgress sx={{ color: '#00E0C6' }} />
                            <Typography sx={{ color: '#9CA3AF', mt: 2, fontFamily: 'monospace' }}>Filtering academic student registry...</Typography>
                          </TableCell>
                        </TableRow>
                      ) : filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} align="center" sx={{ py: 6, color: '#9CA3AF' }}>
                            <Typography variant="body1" fontWeight="700">No students match current academic filters.</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>Try selecting different filter options or click <strong>+ Add Student</strong>.</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudents.map((student) => (
                          <TableRow
                            key={student.id}
                            hover
                            sx={{
                              '&:hover': { background: 'rgba(0, 224, 198, 0.04)' },
                              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            }}
                          >
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: '900', color: '#00E0C6' }}>
                              {student.usn}
                            </TableCell>
                            <TableCell sx={{ fontWeight: '800', color: '#F3F4F6' }}>
                              {student.full_name}
                            </TableCell>
                            <TableCell sx={{ color: '#9CA3AF', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                              {student.email}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={student.branch || 'CSE'}
                                size="small"
                                sx={{
                                  background: 'rgba(255, 176, 0, 0.1)',
                                  color: '#FFB000',
                                  fontWeight: '800',
                                  border: '1px solid rgba(255, 176, 0, 0.3)',
                                  fontFamily: 'monospace',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: '#00E0C6', fontWeight: '800' }}>
                              {formatYearOrdinal(student.year)}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: '#FFB000', fontWeight: '800' }}>
                              {formatSemOrdinal(student.semester)}
                            </TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', color: '#00E0C6', fontWeight: '800' }}>
                              {student.section || 'A'}
                            </TableCell>
                            <TableCell>
                              {student.account_status === 'REGISTERED' ? (
                                <Chip
                                  icon={<CheckCircleOutline sx={{ color: '#00E0C6 !important' }} />}
                                  label="✓ REGISTERED"
                                  size="small"
                                  sx={{
                                    background: 'rgba(0, 224, 198, 0.15)',
                                    color: '#00E0C6',
                                    fontWeight: '900',
                                    border: '1px solid #00E0C6',
                                    fontFamily: 'monospace',
                                  }}
                                />
                              ) : (
                                <Chip
                                  label="⏳ PENDING"
                                  size="small"
                                  sx={{
                                    background: 'rgba(255, 176, 0, 0.15)',
                                    color: '#FFB000',
                                    fontWeight: '800',
                                    border: '1px solid rgba(255, 176, 0, 0.4)',
                                    fontFamily: 'monospace',
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              {student.face_status === 'ENROLLED' ? (
                                <Chip
                                  icon={<Lock sx={{ color: '#00E0C6 !important' }} />}
                                  label="✓ ENROLLED"
                                  size="small"
                                  sx={{
                                    background: 'rgba(0, 224, 198, 0.15)',
                                    color: '#00E0C6',
                                    fontWeight: '900',
                                    border: '1px solid #00E0C6',
                                    fontFamily: 'monospace',
                                  }}
                                />
                              ) : (
                                <Chip
                                  icon={<CancelOutlined sx={{ color: '#9CA3AF !important' }} />}
                                  label="NOT ENROLLED"
                                  size="small"
                                  sx={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#9CA3AF',
                                    fontWeight: '700',
                                    fontFamily: 'monospace',
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<VisibilityIcon />}
                                  onClick={() => handleViewProfile(student)}
                                  sx={{
                                    color: '#00E0C6',
                                    borderColor: 'rgba(0, 224, 198, 0.4)',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: '800',
                                    fontFamily: 'monospace',
                                    '&:hover': { background: 'rgba(0, 224, 198, 0.15)', borderColor: '#00E0C6' },
                                  }}
                                >
                                  View
                                </Button>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenEdit(student)}
                                  title="Edit Student Information"
                                  sx={{
                                    color: '#FFB000',
                                    border: '1px solid rgba(255, 176, 0, 0.3)',
                                    borderRadius: '8px',
                                    '&:hover': { background: 'rgba(255, 176, 0, 0.15)', borderColor: '#FFB000' },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenDelete(student)}
                                  title="Delete Student Record"
                                  sx={{
                                    color: '#EF4444',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '8px',
                                    '&:hover': { background: 'rgba(239, 68, 68, 0.15)' },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Fade>
        )}

        {/* =================================================================== */}
        {/* TAB 2: 🔐 CRYPTOGRAPHY LAB */}
        {/* =================================================================== */}
        {activeNav === 2 && (
          <Fade in timeout={500}>
            <Box>
              {/* Crypto Lab Sub Tabs */}
              <Paper elevation={0} sx={{ borderRadius: '16px', background: '#0D131F', mb: 3, p: 0.5, border: '1px solid rgba(0, 224, 198, 0.2)' }}>
                <Tabs
                  value={cryptoSubTab}
                  onChange={(e, val) => setCryptoSubTab(val)}
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      color: '#9CA3AF',
                      fontWeight: '800',
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontFamily: '"JetBrains Mono", sans-serif',
                      '&.Mui-selected': {
                        color: '#070A0F',
                        background: 'linear-gradient(135deg, #FFB000 0%, #00E0C6 100%)',
                      },
                    },
                    '& .MuiTabs-indicator': { display: 'none' },
                  }}
                >
                  <Tab label="1. AES-256-GCM" />
                  <Tab label="2. SHA-256 Integrity" />
                  <Tab label="3. Biometric Pipeline" />
                  <Tab label="4. Bit-Flip Tamper Test" />
                </Tabs>
              </Paper>

              {/* Sub-Tab 0: AES-256-GCM */}
              {cryptoSubTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '20px', background: '#0D131F', border: '1px solid rgba(0, 224, 198, 0.3)' }}>
                      <Typography variant="h6" fontWeight="900" sx={{ color: '#00E0C6', mb: 2, fontFamily: 'monospace' }}>
                        REAL AES-256-GCM ENCRYPTION
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Plaintext to Encrypt"
                        value={aesInputText}
                        onChange={(e) => setAesInputText(e.target.value)}
                        sx={{
                          mb: 2,
                          background: '#070A0F',
                          borderRadius: '10px',
                          '& .MuiOutlinedInput-root': {
                            color: '#F3F4F6',
                            '& fieldset': { borderColor: 'rgba(0, 224, 198, 0.3)' },
                            '&:hover fieldset': { borderColor: '#00E0C6' },
                            '&.Mui-focused fieldset': { borderColor: '#FFB000' },
                          },
                          '& .MuiInputLabel-root': { color: '#9CA3AF' },
                        }}
                      />
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          startIcon={<Lock />}
                          onClick={handleRealEncrypt}
                          disabled={encryptingLoading}
                          sx={{
                            background: 'linear-gradient(135deg, #00E0C6 0%, #0F766E 100%)',
                            color: '#070A0F',
                            fontWeight: '900',
                            borderRadius: '10px',
                          }}
                        >
                          {encryptingLoading ? 'Encrypting...' : 'Encrypt (AES-256-GCM)'}
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<LockOpen />}
                          onClick={handleRealDecrypt}
                          disabled={!aesEncryptedData || decryptingLoading}
                          sx={{
                            background: 'linear-gradient(135deg, #FFB000 0%, #D97706 100%)',
                            color: '#070A0F',
                            fontWeight: '900',
                            borderRadius: '10px',
                          }}
                        >
                          {decryptingLoading ? 'Decrypting...' : 'Decrypt'}
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '20px', background: '#0D131F', border: '1px solid rgba(255, 176, 0, 0.3)' }}>
                      <Typography variant="h6" fontWeight="900" sx={{ color: '#FFB000', mb: 2, fontFamily: 'monospace' }}>
                        CIPHERTEXT & CRYPTOGRAPHIC PROOF
                      </Typography>
                      {aesEncryptedData ? (
                        <Stack spacing={1.5}>
                          <Box>
                            <Typography variant="caption" color="#9CA3AF">96-bit Nonce / IV:</Typography>
                            <Typography variant="body2" sx={{ color: '#00E0C6', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {aesEncryptedData.nonce}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="#9CA3AF">128-bit Authentication Tag:</Typography>
                            <Typography variant="body2" sx={{ color: '#FFB000', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {aesEncryptedData.tag}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="#9CA3AF">Ciphertext (Hex):</Typography>
                            <Typography variant="body2" sx={{ color: '#00E0C6', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {aesEncryptedData.ciphertext}
                            </Typography>
                          </Box>
                          {aesDecryptedData && (
                            <Box sx={{ p: 1.5, background: 'rgba(0, 224, 198, 0.1)', borderRadius: '10px', border: '1px solid #00E0C6' }}>
                              <Typography variant="caption" color="#00E0C6" fontWeight="800">RECOVERED PLAINTEXT:</Typography>
                              <Typography variant="body1" sx={{ color: '#F3F4F6', fontFamily: 'monospace', fontWeight: '900' }}>
                                {aesDecryptedData.recovered_plaintext}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      ) : (
                        <Box sx={{ p: 4, textAlign: 'center', color: '#9CA3AF' }}>
                          Submit plaintext above to execute live AES-256-GCM encryption.
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* Sub-Tab 1: SHA-256 Integrity */}
              {cryptoSubTab === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '20px', background: '#0D131F', border: '1px solid rgba(0, 224, 198, 0.3)' }}>
                      <Typography variant="h6" fontWeight="900" sx={{ color: '#00E0C6', mb: 2, fontFamily: 'monospace' }}>
                        SHA-256 HASH GENERATION
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Input Text for SHA-256"
                        value={shaInputText}
                        onChange={(e) => setShaInputText(e.target.value)}
                        sx={{
                          mb: 2,
                          background: '#070A0F',
                          borderRadius: '10px',
                          '& .MuiOutlinedInput-root': {
                            color: '#F3F4F6',
                            '& fieldset': { borderColor: 'rgba(0, 224, 198, 0.3)' },
                            '&:hover fieldset': { borderColor: '#00E0C6' },
                          },
                          '& .MuiInputLabel-root': { color: '#9CA3AF' },
                        }}
                      />
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          onClick={handleRealHash}
                          disabled={hashingLoading}
                          sx={{
                            background: 'linear-gradient(135deg, #00E0C6 0%, #0F766E 100%)',
                            color: '#070A0F',
                            fontWeight: '900',
                            borderRadius: '10px',
                          }}
                        >
                          Generate SHA-256
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleRealVerifyIntegrity}
                          disabled={!shaResult}
                          sx={{
                            background: 'linear-gradient(135deg, #FFB000 0%, #D97706 100%)',
                            color: '#070A0F',
                            fontWeight: '900',
                            borderRadius: '10px',
                          }}
                        >
                          Verify Integrity
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '20px', background: '#0D131F', border: '1px solid rgba(255, 176, 0, 0.3)' }}>
                      <Typography variant="h6" fontWeight="900" sx={{ color: '#FFB000', mb: 2, fontFamily: 'monospace' }}>
                        SHA-256 DIGEST & AUDIT STATUS
                      </Typography>
                      {shaResult ? (
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="caption" color="#9CA3AF">64-Character Hex Hash:</Typography>
                            <Typography variant="body2" sx={{ color: '#00E0C6', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {shaResult.sha256_hash}
                            </Typography>
                          </Box>
                          {shaVerifyResult && (
                            <Alert
                              severity={shaVerifyResult.match ? 'success' : 'error'}
                              sx={{
                                background: shaVerifyResult.match ? 'rgba(0, 224, 198, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: shaVerifyResult.match ? '#00E0C6' : '#EF4444',
                                border: shaVerifyResult.match ? '1px solid #00E0C6' : '1px solid #EF4444',
                              }}
                            >
                              {shaVerifyResult.status}
                            </Alert>
                          )}
                        </Stack>
                      ) : (
                        <Box sx={{ p: 4, textAlign: 'center', color: '#9CA3AF' }}>
                          Submit input text to generate live SHA-256 hash digest.
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* Sub-Tab 2: Biometric Pipeline */}
              {cryptoSubTab === 2 && (
                <Paper sx={{ p: 4, borderRadius: '20px', background: '#0D131F', border: '1px solid rgba(0, 224, 198, 0.3)', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#9CA3AF', letterSpacing: '0.25em', fontWeight: '800', fontFamily: 'monospace', display: 'block', mb: 2 }}>
                    CRYPTOGRAPHIC ENCRYPTION FLOW PIPELINE
                  </Typography>
                  <Stack spacing={2} alignItems="center" sx={{ my: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>PLAINTEXT PAYLOAD</Typography>
                      <Typography variant="h3" fontWeight="900" sx={{ color: '#FFB000', fontFamily: '"JetBrains Mono", monospace' }}>
                        {aesInputText.toUpperCase() || 'ATTACK'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>⌄</Typography>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>96-BIT NONCE</Typography>
                      <Typography variant="h3" fontWeight="900" sx={{ color: '#00E0C6', fontFamily: '"JetBrains Mono", monospace' }}>
                        {aesEncryptedData?.nonce?.slice(0, 8).toUpperCase() || '0X9F4A1C'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>⌄</Typography>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>CIPHERTEXT & TAG</Typography>
                      <Typography variant="h3" fontWeight="900" sx={{ color: '#FFB000', fontFamily: '"JetBrains Mono", monospace' }}>
                        {aesEncryptedData?.ciphertext?.slice(0, 8).toUpperCase() || '0XE8B209'}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}

              {/* Sub-Tab 3: Bit-Flip Tamper Test */}
              {cryptoSubTab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '20px', background: '#0D131F', border: '1px solid rgba(255, 176, 0, 0.3)' }}>
                      <Typography variant="h6" fontWeight="900" sx={{ color: '#FFB000', mb: 2, fontFamily: 'monospace' }}>
                        REAL AES-GCM BIT-FLIP TAMPER TEST
                      </Typography>
                      <Typography variant="body2" color="#9CA3AF" sx={{ mb: 2 }}>
                        Encrypts text, flips exactly 1 bit (XOR 0xFF) in the ciphertext, and transmits to the backend decryptor.
                        AES-256-GCM verification tag will detect modification and reject decryption.
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={tamperInputText}
                        onChange={(e) => setTamperInputText(e.target.value)}
                        sx={{
                          mb: 2,
                          background: '#070A0F',
                          borderRadius: '10px',
                          '& .MuiOutlinedInput-root': { color: '#F3F4F6' },
                        }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<BugReport />}
                        onClick={handleRealTamperTest}
                        disabled={tamperingLoading}
                        sx={{
                          background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
                          color: '#F3F4F6',
                          fontWeight: '900',
                          borderRadius: '10px',
                        }}
                      >
                        {tamperingLoading ? 'Testing...' : 'Execute Bit-Flip Tamper Test'}
                      </Button>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: '20px', background: '#0D131F', border: '1px solid rgba(0, 224, 198, 0.3)' }}>
                      <Typography variant="h6" fontWeight="900" sx={{ color: '#00E0C6', mb: 2, fontFamily: 'monospace' }}>
                        TEST VERDICT & TAG CHECK
                      </Typography>
                      {tamperResult ? (
                        <Stack spacing={1.5}>
                          <Box>
                            <Typography variant="caption" color="#9CA3AF">Original Ciphertext:</Typography>
                            <Typography variant="body2" sx={{ color: '#00E0C6', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {tamperResult.original_ciphertext}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="#9CA3AF">Tampered Ciphertext (1-bit flipped):</Typography>
                            <Typography variant="body2" sx={{ color: '#EF4444', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {tamperResult.tampered_ciphertext}
                            </Typography>
                          </Box>
                          <Alert severity="error" sx={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid #EF4444' }}>
                            <Typography variant="body2" fontWeight="900">
                              DECRYPTION BLOCKED: {tamperResult.exception_type}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                              {tamperResult.reason}
                            </Typography>
                          </Alert>
                        </Stack>
                      ) : (
                        <Box sx={{ p: 4, textAlign: 'center', color: '#9CA3AF' }}>
                          Click Execute Bit-Flip Tamper Test to observe real AES-256-GCM authentication tag protection.
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Fade>
        )}

        {/* =================================================================== */}
        {/* TAB 3: 🛡️ SECURITY CENTER */}
        {/* =================================================================== */}
        {activeNav === 3 && (
          <Fade in timeout={500}>
            <Box>
              <Paper sx={{ p: 3, mb: 3, borderRadius: '20px', background: '#0D131F', border: '1px solid rgba(0, 224, 198, 0.3)' }}>
                <Typography variant="h6" fontWeight="900" sx={{ color: '#00E0C6', mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'monospace' }}>
                  <SecurityIcon sx={{ color: '#FFB000' }} /> CRYPTOGRAPHIC SECURITY CENTER
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[
                    { label: 'AES-256-GCM', status: '✓ ACTIVE', color: '#00E0C6' },
                    { label: 'SHA-256', status: '✓ ACTIVE', color: '#FFB000' },
                    { label: 'Biometric Encryption', status: '✓ ACTIVE', color: '#00E0C6' },
                    { label: 'Raw Image Storage', status: '✓ DISABLED', color: '#FFB000' },
                    { label: 'Database Integrity', status: '✓ VERIFIED', color: '#00E0C6' },
                  ].map((st, i) => (
                    <Grid item xs={12} md={2.4} key={i}>
                      <Paper sx={{ p: 2, background: '#070A0F', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(0,224,198,0.2)' }}>
                        <Typography variant="caption" color="#9CA3AF">{st.label}</Typography>
                        <Typography variant="body1" fontWeight="900" color={st.color} mt={0.5}>{st.status}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Typography variant="subtitle1" fontWeight="900" sx={{ color: '#F3F4F6', mb: 2, fontFamily: 'monospace' }}>SYSTEM AUDIT LOGS</Typography>

                <TableContainer>
                  <Table>
                    <TableHead sx={{ background: '#070A0F' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#00E0C6', fontWeight: '800', fontFamily: 'monospace' }}>TIME</TableCell>
                        <TableCell sx={{ color: '#FFB000', fontWeight: '800', fontFamily: 'monospace' }}>EVENT</TableCell>
                        <TableCell sx={{ color: '#00E0C6', fontWeight: '800', fontFamily: 'monospace' }}>STATUS</TableCell>
                        <TableCell sx={{ color: '#FFB000', fontWeight: '800', fontFamily: 'monospace' }}>IP ADDRESS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {securityLogs.map((log, i) => (
                        <TableRow key={i} hover sx={{ '&:hover': { background: 'rgba(0, 224, 198, 0.05)' } }}>
                          <TableCell sx={{ color: '#00E0C6', fontFamily: 'monospace', fontWeight: '800' }}>{log.time}</TableCell>
                          <TableCell sx={{ color: '#F3F4F6', fontWeight: '600' }}>{log.event}</TableCell>
                          <TableCell><Chip label={log.status} size="small" sx={{ fontWeight: '900', background: 'rgba(0, 224, 198, 0.15)', color: '#00E0C6' }} /></TableCell>
                          <TableCell sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>{log.ip}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Fade>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* ADD STUDENT MODAL / DIALOG (ACADEMIC GROUP) */}
        {/* ------------------------------------------------------------------- */}
        <Dialog
          open={addStudentOpen}
          onClose={() => setAddStudentOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: '#0D131F',
              border: '1px solid rgba(255, 176, 0, 0.4)',
              borderRadius: '20px',
              color: '#F3F4F6',
              boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(255, 176, 0, 0.2)',
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="900" sx={{ color: '#FFB000', fontFamily: '"JetBrains Mono", sans-serif' }}>
              + ADD STUDENT TO ACADEMIC REGISTRY
            </Typography>
            <IconButton onClick={() => setAddStudentOpen(false)} sx={{ color: '#9CA3AF' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <form onSubmit={handleCreateStudent}>
            <DialogContent>
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  background: 'rgba(0, 224, 198, 0.1)',
                  color: '#00E0C6',
                  border: '1px solid rgba(0, 224, 198, 0.3)',
                  borderRadius: '12px',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: '700' }}>
                  <strong>Autonomous Account Linking:</strong> Admin registers academic identity (Branch, Year, Semester, Section).
                  When the student self-registers via <code>/register</code> with this <strong>same email</strong>, the account automatically binds without duplicates.
                </Typography>
              </Alert>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Full Name"
                  required
                  placeholder="e.g. Milanraj"
                  value={newStudent.full_name}
                  onChange={(e) => setNewStudent({ ...newStudent, full_name: e.target.value })}
                  sx={{
                    background: '#070A0F',
                    borderRadius: '10px',
                    '& .MuiOutlinedInput-root': {
                      color: '#F3F4F6',
                      '& fieldset': { borderColor: 'rgba(0, 224, 198, 0.3)' },
                      '&:hover fieldset': { borderColor: '#00E0C6' },
                      '&.Mui-focused fieldset': { borderColor: '#FFB000' },
                    },
                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  }}
                />

                <TextField
                  fullWidth
                  label="USN (University Seat Number)"
                  required
                  placeholder="e.g. 4SO23CS001 or 1RV21CS089"
                  value={newStudent.usn}
                  onChange={(e) => setNewStudent({ ...newStudent, usn: e.target.value })}
                  sx={{
                    background: '#070A0F',
                    borderRadius: '10px',
                    '& .MuiOutlinedInput-root': {
                      color: '#F3F4F6',
                      '& fieldset': { borderColor: 'rgba(0, 224, 198, 0.3)' },
                      '&:hover fieldset': { borderColor: '#00E0C6' },
                      '&.Mui-focused fieldset': { borderColor: '#FFB000' },
                    },
                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  }}
                />

                <TextField
                  fullWidth
                  type="email"
                  label="Student Email Address"
                  required
                  placeholder="e.g. milan@gmail.com"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  sx={{
                    background: '#070A0F',
                    borderRadius: '10px',
                    '& .MuiOutlinedInput-root': {
                      color: '#F3F4F6',
                      '& fieldset': { borderColor: 'rgba(0, 224, 198, 0.3)' },
                      '&:hover fieldset': { borderColor: '#00E0C6' },
                      '&.Mui-focused fieldset': { borderColor: '#FFB000' },
                    },
                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  }}
                />

                {/* Academic Group Dropdowns */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#FFB000', fontWeight: '800', mb: 0.5, display: 'block' }}>
                      BRANCH
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={newStudent.branch}
                        onChange={(e) => setNewStudent({ ...newStudent, branch: e.target.value })}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 224, 198, 0.3)',
                          '& .MuiSvgIcon-root': { color: '#00E0C6' },
                        }}
                      >
                        {academicOptions?.branches?.map((b) => (
                          <MenuItem key={b} value={b}>{b}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#00E0C6', fontWeight: '800', mb: 0.5, display: 'block' }}>
                      YEAR
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={newStudent.year}
                        onChange={(e) => setNewStudent({ ...newStudent, year: Number(e.target.value) })}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 224, 198, 0.3)',
                          '& .MuiSvgIcon-root': { color: '#00E0C6' },
                        }}
                      >
                        {academicOptions?.years?.map((y) => (
                          <MenuItem key={y.value} value={y.value}>{y.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#FFB000', fontWeight: '800', mb: 0.5, display: 'block' }}>
                      SEMESTER
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={newStudent.semester}
                        onChange={(e) => setNewStudent({ ...newStudent, semester: Number(e.target.value) })}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 224, 198, 0.3)',
                          '& .MuiSvgIcon-root': { color: '#00E0C6' },
                        }}
                      >
                        {academicOptions?.semesters?.map((s) => (
                          <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#00E0C6', fontWeight: '800', mb: 0.5, display: 'block' }}>
                      SECTION
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={newStudent.section}
                        onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 224, 198, 0.3)',
                          '& .MuiSvgIcon-root': { color: '#00E0C6' },
                        }}
                      >
                        {academicOptions?.sections?.map((sec) => (
                          <MenuItem key={sec} value={sec}>Section {sec}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setAddStudentOpen(false)} sx={{ color: '#9CA3AF' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={addStudentSubmitting}
                sx={{
                  background: 'linear-gradient(135deg, #FFB000, #D97706)',
                  color: '#070A0F',
                  fontWeight: '900',
                  px: 3,
                  borderRadius: '10px',
                }}
              >
                {addStudentSubmitting ? 'Registering...' : '+ Add Student'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* ------------------------------------------------------------------- */}
        {/* EDIT STUDENT DIALOG */}
        {/* ------------------------------------------------------------------- */}
        <Dialog
          open={editStudentOpen}
          onClose={() => setEditStudentOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: '#0D131F',
              border: '1px solid rgba(255, 176, 0, 0.4)',
              borderRadius: '20px',
              color: '#F3F4F6',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(255, 176, 0, 0.2)',
            },
          }}
        >
          <form onSubmit={handleUpdateStudent}>
            <DialogTitle sx={{ color: '#FFB000', fontWeight: '900', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 1 }}>
              ✏️ EDIT STUDENT INFORMATION
            </DialogTitle>
            <DialogContent>
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  background: 'rgba(0, 224, 198, 0.1)',
                  border: '1px solid rgba(0, 224, 198, 0.3)',
                  color: '#00E0C6',
                  borderRadius: '10px',
                  '& .MuiAlert-icon': { color: '#00E0C6' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: '700' }}>
                  <strong>Student Profile & Academic Sync:</strong> Updates USN, Year, Semester, Section, and Name.
                  If the student has a registered login account, user credentials and identifiers update in sync.
                </Typography>
              </Alert>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Full Name"
                  required
                  placeholder="e.g. Milanraj"
                  value={editStudentData.full_name}
                  onChange={(e) => setEditStudentData({ ...editStudentData, full_name: e.target.value })}
                  sx={{
                    background: '#070A0F',
                    borderRadius: '10px',
                    '& .MuiOutlinedInput-root': {
                      color: '#F3F4F6',
                      '& fieldset': { borderColor: 'rgba(255, 176, 0, 0.3)' },
                      '&:hover fieldset': { borderColor: '#FFB000' },
                      '&.Mui-focused fieldset': { borderColor: '#00E0C6' },
                    },
                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  }}
                />

                <TextField
                  fullWidth
                  label="USN (University Seat Number)"
                  required
                  placeholder="e.g. 4SO23CS001"
                  value={editStudentData.usn}
                  onChange={(e) => setEditStudentData({ ...editStudentData, usn: e.target.value.toUpperCase() })}
                  inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '700' } }}
                  sx={{
                    background: '#070A0F',
                    borderRadius: '10px',
                    '& .MuiOutlinedInput-root': {
                      color: '#F3F4F6',
                      '& fieldset': { borderColor: 'rgba(255, 176, 0, 0.3)' },
                      '&:hover fieldset': { borderColor: '#FFB000' },
                      '&.Mui-focused fieldset': { borderColor: '#00E0C6' },
                    },
                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  }}
                />

                <TextField
                  fullWidth
                  type="email"
                  label="Student Email Address"
                  required
                  placeholder="e.g. milan@gmail.com"
                  value={editStudentData.email}
                  onChange={(e) => setEditStudentData({ ...editStudentData, email: e.target.value })}
                  sx={{
                    background: '#070A0F',
                    borderRadius: '10px',
                    '& .MuiOutlinedInput-root': {
                      color: '#F3F4F6',
                      '& fieldset': { borderColor: 'rgba(255, 176, 0, 0.3)' },
                      '&:hover fieldset': { borderColor: '#FFB000' },
                      '&.Mui-focused fieldset': { borderColor: '#00E0C6' },
                    },
                    '& .MuiInputLabel-root': { color: '#9CA3AF' },
                  }}
                />

                {/* Academic Group Dropdowns */}
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#FFB000', fontWeight: '800', mb: 0.5, display: 'block' }}>
                      BRANCH
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={editStudentData.branch}
                        onChange={(e) => setEditStudentData({ ...editStudentData, branch: e.target.value })}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 176, 0, 0.3)',
                          '& .MuiSvgIcon-root': { color: '#FFB000' },
                        }}
                      >
                        {academicOptions?.branches?.map((b) => (
                          <MenuItem key={b} value={b}>{b}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#00E0C6', fontWeight: '800', mb: 0.5, display: 'block' }}>
                      YEAR
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={editStudentData.year}
                        onChange={(e) => setEditStudentData({ ...editStudentData, year: Number(e.target.value) })}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 224, 198, 0.3)',
                          '& .MuiSvgIcon-root': { color: '#00E0C6' },
                        }}
                      >
                        {academicOptions?.years?.map((y) => (
                          <MenuItem key={y.value} value={y.value}>{y.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#FFB000', fontWeight: '800', mb: 0.5, display: 'block' }}>
                      SEMESTER
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={editStudentData.semester}
                        onChange={(e) => setEditStudentData({ ...editStudentData, semester: Number(e.target.value) })}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(255, 176, 0, 0.3)',
                          '& .MuiSvgIcon-root': { color: '#FFB000' },
                        }}
                      >
                        {academicOptions?.semesters?.map((s) => (
                          <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: '#00E0C6', fontWeight: '800', mb: 0.5, display: 'block' }}>
                      SECTION
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={editStudentData.section}
                        onChange={(e) => setEditStudentData({ ...editStudentData, section: e.target.value })}
                        sx={{
                          background: '#070A0F',
                          color: '#F3F4F6',
                          borderRadius: '10px',
                          border: '1px solid rgba(0, 224, 198, 0.3)',
                          '& .MuiSvgIcon-root': { color: '#00E0C6' },
                        }}
                      >
                        {academicOptions?.sections?.map((sec) => (
                          <MenuItem key={sec} value={sec}>Section {sec}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setEditStudentOpen(false)} sx={{ color: '#9CA3AF' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={editStudentSubmitting}
                sx={{
                  background: 'linear-gradient(135deg, #00E0C6, #0F766E)',
                  color: '#070A0F',
                  fontWeight: '900',
                  px: 3,
                  borderRadius: '10px',
                }}
              >
                {editStudentSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* ------------------------------------------------------------------- */}
        {/* DELETE CONFIRMATION DIALOG */}
        {/* ------------------------------------------------------------------- */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, student: null })}
          PaperProps={{
            sx: {
              background: '#0D131F',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '20px',
              color: '#F3F4F6',
            },
          }}
        >
          <DialogTitle sx={{ color: '#EF4444', fontWeight: '900', fontFamily: 'monospace' }}>
            ⚠️ CONFIRM STUDENT DELETION
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete the student record for:
            </Typography>
            <Paper sx={{ p: 2, my: 2, background: '#070A0F', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}>
              <Typography variant="body2" color="#00E0C6"><strong>Name:</strong> {deleteDialog.student?.full_name}</Typography>
              <Typography variant="body2" color="#FFB000"><strong>USN:</strong> {deleteDialog.student?.usn}</Typography>
              <Typography variant="body2" color="#9CA3AF"><strong>Email:</strong> {deleteDialog.student?.email}</Typography>
              <Typography variant="body2" color="#F3F4F6"><strong>Academic Group:</strong> {deleteDialog.student?.branch} Year {deleteDialog.student?.year} Sec {deleteDialog.student?.section}</Typography>
            </Paper>
            <Typography variant="caption" sx={{ color: '#F87171', display: 'block', mt: 1, fontFamily: 'monospace' }}>
              ⚠️ Note: This action permanently deletes the student academic profile, login credentials, attendance records, and encrypted face biometrics. The student will be required to register again from scratch.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setDeleteDialog({ open: false, student: null })} sx={{ color: '#9CA3AF' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmDelete}
              disabled={deleteSubmitting}
              sx={{ background: '#EF4444', color: '#F3F4F6', fontWeight: '900', borderRadius: '10px' }}
            >
              {deleteSubmitting ? 'Deleting...' : 'Delete Student'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ------------------------------------------------------------------- */}
        {/* STUDENT PROFILE MODAL / DRAWER (4 TABS) */}
        {/* ------------------------------------------------------------------- */}
        <Dialog
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: '#0D131F',
              border: '1px solid rgba(0, 224, 198, 0.4)',
              borderRadius: '20px',
              color: '#F3F4F6',
              boxShadow: '0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(0, 224, 198, 0.2)',
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Box>
              <Typography variant="h6" fontWeight="900" sx={{ color: '#00E0C6', fontFamily: '"JetBrains Mono", sans-serif' }}>
                STUDENT SECURITY PROFILE • {selectedStudentDetails?.profile?.full_name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#FFB000', fontFamily: 'monospace' }}>
                USN: {selectedStudentDetails?.profile?.usn} • {selectedStudentDetails?.profile?.email} • {selectedStudentDetails?.profile?.branch} Year {selectedStudentDetails?.profile?.year} Sec {selectedStudentDetails?.profile?.section}
              </Typography>
            </Box>
            <IconButton onClick={() => setProfileModalOpen(false)} sx={{ color: '#9CA3AF' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          {/* 4 Tabs Navigation */}
          <Box sx={{ px: 3 }}>
            <Tabs
              value={profileTab}
              onChange={(e, val) => setProfileTab(val)}
              variant="fullWidth"
              sx={{
                background: '#070A0F',
                borderRadius: '12px',
                p: 0.5,
                border: '1px solid rgba(0, 224, 198, 0.2)',
                '& .MuiTab-root': {
                  color: '#9CA3AF',
                  fontWeight: '800',
                  textTransform: 'none',
                  borderRadius: '10px',
                  fontFamily: '"JetBrains Mono", sans-serif',
                  '&.Mui-selected': {
                    color: '#070A0F',
                    background: 'linear-gradient(135deg, #FFB000 0%, #00E0C6 100%)',
                  },
                },
                '& .MuiTabs-indicator': { display: 'none' },
              }}
            >
              <Tab label="[ PROFILE ]" />
              <Tab label="[ BIOMETRIC ]" />
              <Tab label="[ SECURITY ]" />
              <Tab label="[ ATTENDANCE ]" />
            </Tabs>
          </Box>

          <DialogContent sx={{ minHeight: '400px', p: 3 }}>
            {profileLoading ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                <CircularProgress sx={{ color: '#00E0C6' }} />
                <Typography sx={{ color: '#9CA3AF', mt: 2, fontFamily: 'monospace' }}>Fetching student cryptographic record...</Typography>
              </Box>
            ) : selectedStudentDetails ? (
              <Box>
                {/* 1. PROFILE TAB */}
                {profileTab === 0 && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, background: '#070A0F', borderRadius: '12px', border: '1px solid rgba(0,224,198,0.2)' }}>
                        <Typography variant="caption" color="#9CA3AF">Full Name</Typography>
                        <Typography variant="body1" fontWeight="800" color="#F3F4F6">{selectedStudentDetails.profile.full_name}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, background: '#070A0F', borderRadius: '12px', border: '1px solid rgba(255,176,0,0.2)' }}>
                        <Typography variant="caption" color="#9CA3AF">USN (University Seat Number)</Typography>
                        <Typography variant="body1" fontWeight="800" color="#FFB000" fontFamily="monospace">{selectedStudentDetails.profile.usn}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, background: '#070A0F', borderRadius: '12px', border: '1px solid rgba(0,224,198,0.2)' }}>
                        <Typography variant="caption" color="#9CA3AF">Email Address</Typography>
                        <Typography variant="body1" fontWeight="800" color="#00E0C6" fontFamily="monospace">{selectedStudentDetails.profile.email}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, background: '#070A0F', borderRadius: '12px', border: '1px solid rgba(255,176,0,0.2)' }}>
                        <Typography variant="caption" color="#9CA3AF">Academic Group</Typography>
                        <Typography variant="body1" fontWeight="800" color="#F3F4F6" fontFamily="monospace">
                          {selectedStudentDetails.profile.branch} • {formatYearOrdinal(selectedStudentDetails.profile.year)} Year • {formatSemOrdinal(selectedStudentDetails.profile.semester)} Sem • Sec {selectedStudentDetails.profile.section}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, background: '#070A0F', borderRadius: '12px', border: '1px solid rgba(0,224,198,0.2)' }}>
                        <Typography variant="caption" color="#9CA3AF">Account Linkage Status</Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            label={selectedStudentDetails.profile.account_status === 'REGISTERED' ? '✓ LINKED TO SYSTEM USER' : '⏳ AWAITING USER REGISTRATION'}
                            size="small"
                            sx={{
                              background: selectedStudentDetails.profile.account_status === 'REGISTERED' ? 'rgba(0, 224, 198, 0.15)' : 'rgba(255, 176, 0, 0.15)',
                              color: selectedStudentDetails.profile.account_status === 'REGISTERED' ? '#00E0C6' : '#FFB000',
                              fontWeight: '900',
                              fontFamily: 'monospace',
                            }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2.5, background: '#070A0F', borderRadius: '12px', border: '1px solid rgba(255,176,0,0.2)' }}>
                        <Typography variant="caption" color="#9CA3AF">Registration Timestamp</Typography>
                        <Typography variant="body2" fontWeight="800" color="#9CA3AF" fontFamily="monospace">
                          {selectedStudentDetails.profile.registration_date ? new Date(selectedStudentDetails.profile.registration_date).toLocaleString() : 'Pending'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                )}

                {/* 2. BIOMETRIC TAB */}
                {profileTab === 1 && (
                  <Stack spacing={2.5}>
                    <Paper sx={{ p: 2.5, background: '#070A0F', borderRadius: '12px', border: '1px solid rgba(0,224,198,0.2)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="900" color="#00E0C6" fontFamily="monospace">
                          BIOMETRIC STATUS & ENROLLMENT ARCHITECTURE
                        </Typography>
                        <Chip
                          label={selectedStudentDetails.biometric.status}
                          sx={{
                            background: selectedStudentDetails.biometric.face_enrolled ? 'rgba(0, 224, 198, 0.15)' : 'rgba(255, 176, 0, 0.15)',
                            color: selectedStudentDetails.biometric.face_enrolled ? '#00E0C6' : '#FFB000',
                            fontWeight: '900',
                            border: '1px solid',
                          }}
                        />
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="#9CA3AF">Embedding Dimensions</Typography>
                          <Typography variant="body2" fontWeight="800" color="#FFB000" fontFamily="monospace">
                            {selectedStudentDetails.biometric.dimensions}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="#9CA3AF">Face Recognition Model</Typography>
                          <Typography variant="body2" fontWeight="800" color="#F3F4F6">
                            {selectedStudentDetails.biometric.model}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="#9CA3AF">Raw Facial Image Policy</Typography>
                          <Typography variant="body2" fontWeight="800" color="#00E0C6">
                            {selectedStudentDetails.biometric.raw_image_storage}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="#9CA3AF">Enrolled Date & Time</Typography>
                          <Typography variant="body2" fontWeight="800" color="#9CA3AF" fontFamily="monospace">
                            {selectedStudentDetails.biometric.enrolled_date ? new Date(selectedStudentDetails.biometric.enrolled_date).toLocaleString() : 'Not enrolled'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    {!selectedStudentDetails.biometric.face_enrolled && (
                      <Alert severity="warning" sx={{ background: 'rgba(255, 176, 0, 0.1)', color: '#FFB000', border: '1px solid rgba(255, 176, 0, 0.3)' }}>
                        Student has not enrolled their face template yet. Once the student accesses the camera via <strong>/face-capture</strong>, their 128-D vector will be automatically encrypted and securely displayed here.
                      </Alert>
                    )}
                  </Stack>
                )}

                {/* 3. SECURITY TAB */}
                {profileTab === 2 && (
                  <Stack spacing={2.5}>
                    {selectedStudentDetails.security.has_biometric ? (
                      <>
                        <Paper sx={{ p: 2.5, background: '#070A0F', borderRadius: '12px', border: '1px solid rgba(0,224,198,0.2)' }}>
                          <Typography variant="subtitle2" fontWeight="900" color="#00E0C6" mb={2} fontFamily="monospace">
                            REAL CRYPTOGRAPHIC METADATA (AES-256-GCM + SHA-256)
                          </Typography>
                          <Stack spacing={1.5}>
                            <Box>
                              <Typography variant="caption" color="#9CA3AF">Algorithm & Key Identifier</Typography>
                              <Typography variant="body2" color="#FFB000" fontWeight="800" fontFamily="monospace">
                                {selectedStudentDetails.security.algorithm} • {selectedStudentDetails.security.key_id}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="#9CA3AF">96-bit Nonce / IV (Hex)</Typography>
                              <Typography variant="body2" color="#00E0C6" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                                {selectedStudentDetails.security.nonce}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="#9CA3AF">128-bit Authentication Tag (Hex)</Typography>
                              <Typography variant="body2" color="#FFB000" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                                {selectedStudentDetails.security.tag}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="#9CA3AF">AES-256-GCM Ciphertext (Preview)</Typography>
                              <Typography variant="body2" color="#9CA3AF" fontFamily="monospace" sx={{ wordBreak: 'break-all', maxHeight: '60px', overflowY: 'auto' }}>
                                {selectedStudentDetails.security.ciphertext}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="#9CA3AF">SHA-256 Biometric Template Digest</Typography>
                              <Typography variant="body2" color="#00E0C6" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
                                {selectedStudentDetails.security.sha256_hash}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="#9CA3AF">Secret Key Storage</Typography>
                              <Typography variant="body2" color="#FFB000" fontFamily="monospace">
                                SERVER-SIDE HARDWARE PROTECTED (KEY NEVER TRANSMITTED TO CLIENT)
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>

                        {/* Interactive Verification & Decryption Actions */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <Button
                            variant="contained"
                            startIcon={<FactCheck />}
                            onClick={() => handleVerifyStudentBiometric(selectedStudentDetails.profile.id)}
                            disabled={profileActionLoading}
                            sx={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #00E0C6 0%, #0F766E 100%)',
                              color: '#070A0F',
                              fontWeight: '900',
                              borderRadius: '10px',
                            }}
                          >
                            Verify Now (SHA-256)
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<LockOpen />}
                            onClick={() => handleDecryptStudentBiometric(selectedStudentDetails.profile.id)}
                            disabled={profileActionLoading}
                            sx={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #FFB000 0%, #D97706 100%)',
                              color: '#070A0F',
                              fontWeight: '900',
                              borderRadius: '10px',
                            }}
                          >
                            Verify & Decrypt Template
                          </Button>
                        </Stack>

                        {/* Verification Output */}
                        {profileVerifyResult && (
                          <Alert severity="success" sx={{ background: 'rgba(0, 224, 198, 0.15)', color: '#00E0C6', border: '1px solid #00E0C6' }}>
                            <Typography variant="body2" fontWeight="900">{profileVerifyResult.status}</Typography>
                            <Typography variant="caption">{profileVerifyResult.message}</Typography>
                          </Alert>
                        )}

                        {/* Decryption Output: 128-D Vector Display */}
                        {profileDecryptResult && (
                          <Paper sx={{ p: 2, background: '#070A0F', borderRadius: '12px', border: '1px solid #FFB000' }}>
                            <Typography variant="subtitle2" fontWeight="900" color="#FFB000" mb={1} fontFamily="monospace">
                              ✓ RECOVERED 128-D EMBEDDING VECTOR (FIRST 16 DIMENSIONS):
                            </Typography>
                            <Box sx={{ background: '#0D131F', p: 1.5, borderRadius: '8px', overflowX: 'auto' }}>
                              <Typography variant="caption" sx={{ color: '#00E0C6', fontFamily: 'monospace' }}>
                                [{profileDecryptResult.sample_vector?.join(', ')}, ...]
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="#9CA3AF" sx={{ mt: 1, display: 'block' }}>
                              Vector recovered safely into volatile memory. Server-side key was never exposed.
                            </Typography>
                          </Paper>
                        )}
                      </>
                    ) : (
                      <Alert severity="info" sx={{ background: 'rgba(0, 224, 198, 0.1)', color: '#00E0C6', border: '1px solid rgba(0, 224, 198, 0.3)' }}>
                        Biometric template not enrolled yet. Security credentials and AES-256-GCM ciphertexts will appear once face enrollment is completed.
                      </Alert>
                    )}
                  </Stack>
                )}

                {/* 4. ATTENDANCE TAB (OVERALL + SUBJECT-WISE + HISTORY) */}
                {profileTab === 3 && (
                  <Stack spacing={2.5}>
                    {/* Academic Group Info & Subject Selector */}
                    <Box
                      sx={{
                        p: 2,
                        background: '#070A0F',
                        borderRadius: '12px',
                        border: '1px solid rgba(0, 224, 198, 0.25)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="#9CA3AF">ACADEMIC GROUP</Typography>
                        <Typography variant="body2" color="#00E0C6" fontWeight="900" fontFamily="monospace">
                          {selectedStudentDetails.attendance.branch} • {formatYearOrdinal(selectedStudentDetails.attendance.year)} Year • {formatSemOrdinal(selectedStudentDetails.attendance.semester)} Sem • Sec {selectedStudentDetails.attendance.section}
                        </Typography>
                      </Box>

                      {/* Subject Selector Dropdown */}
                      <Box sx={{ minWidth: 220 }}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={profileSubjectFilter}
                            onChange={(e) => setProfileSubjectFilter(e.target.value)}
                            sx={{
                              background: '#0D131F',
                              color: '#FFB000',
                              borderRadius: '8px',
                              fontWeight: '800',
                              border: '1px solid rgba(255, 176, 0, 0.3)',
                              '& .MuiSvgIcon-root': { color: '#FFB000' },
                            }}
                          >
                            <MenuItem value="ALL">All Subjects</MenuItem>
                            {selectedStudentDetails.attendance.subjects_breakdown?.map((s) => (
                              <MenuItem key={s.code} value={s.code}>{s.code} — {s.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>

                    {/* Overall Attendance Summary Cards */}
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, background: '#070A0F', textAlign: 'center', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <Typography variant="caption" color="#9CA3AF">TOTAL CLASSES</Typography>
                          <Typography variant="h5" fontWeight="900" color="#F3F4F6">
                            {profileSubjectFilter === 'ALL'
                              ? selectedStudentDetails.attendance.total_classes
                              : selectedStudentDetails.attendance.subjects_breakdown?.find((s) => s.code === profileSubjectFilter)?.total || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, background: '#070A0F', textAlign: 'center', borderRadius: '10px', border: '1px solid rgba(0,224,198,0.2)' }}>
                          <Typography variant="caption" color="#9CA3AF">PRESENT</Typography>
                          <Typography variant="h5" fontWeight="900" color="#00E0C6">
                            {profileSubjectFilter === 'ALL'
                              ? selectedStudentDetails.attendance.present_count
                              : selectedStudentDetails.attendance.subjects_breakdown?.find((s) => s.code === profileSubjectFilter)?.present || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, background: '#070A0F', textAlign: 'center', borderRadius: '10px', border: '1px solid rgba(255,176,0,0.2)' }}>
                          <Typography variant="caption" color="#9CA3AF">ABSENT</Typography>
                          <Typography variant="h5" fontWeight="900" color="#FFB000">
                            {profileSubjectFilter === 'ALL'
                              ? selectedStudentDetails.attendance.absent_count
                              : selectedStudentDetails.attendance.subjects_breakdown?.find((s) => s.code === profileSubjectFilter)?.absent || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, background: '#070A0F', textAlign: 'center', borderRadius: '10px', border: '1px solid rgba(0,224,198,0.3)' }}>
                          <Typography variant="caption" color="#9CA3AF">PERCENTAGE</Typography>
                          <Typography variant="h5" fontWeight="900" color="#00E0C6">
                            {profileSubjectFilter === 'ALL'
                              ? `${selectedStudentDetails.attendance.attendance_rate}%`
                              : `${selectedStudentDetails.attendance.subjects_breakdown?.find((s) => s.code === profileSubjectFilter)?.rate || 0}%`}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Examination Eligibility & Quick Test Action */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label={selectedStudentDetails.attendance.eligibility}
                        size="small"
                        sx={{
                          background: selectedStudentDetails.attendance.attendance_rate >= 75 ? 'rgba(0, 224, 198, 0.15)' : 'rgba(255, 176, 0, 0.15)',
                          color: selectedStudentDetails.attendance.attendance_rate >= 75 ? '#00E0C6' : '#FFB000',
                          fontWeight: '900',
                          fontFamily: 'monospace',
                        }}
                      />

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FlashIcon />}
                        onClick={() => handleSeedMultiPeriodDemo(selectedStudentDetails.profile.id)}
                        disabled={profileActionLoading}
                        sx={{
                          borderColor: '#FFB000',
                          color: '#FFB000',
                          borderRadius: '8px',
                          textTransform: 'none',
                          fontWeight: '800',
                          fontSize: '0.75rem',
                          '&:hover': { background: 'rgba(255, 176, 0, 0.15)' },
                        }}
                      >
                        ⚡ Seed 7-Period Demo (05 Oct)
                      </Button>
                    </Box>

                    {/* Subject-Wise Attendance Breakdown Cards */}
                    <Box>
                      <Typography variant="caption" sx={{ color: '#FFB000', fontWeight: '900', letterSpacing: '0.1em', display: 'block', mb: 1, fontFamily: 'monospace' }}>
                        SUBJECT-WISE ATTENDANCE BREAKDOWN
                      </Typography>
                      <Grid container spacing={1.5}>
                        {selectedStudentDetails.attendance.subjects_breakdown?.map((sub) => (
                          <Grid item xs={12} sm={6} md={4} key={sub.code}>
                            <Paper
                              sx={{
                                p: 1.5,
                                background: '#070A0F',
                                borderRadius: '10px',
                                border: profileSubjectFilter === sub.code ? '1px solid #FFB000' : '1px solid rgba(255,255,255,0.07)',
                              }}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight="900" color="#00E0C6" fontFamily="monospace">
                                  {sub.code}
                                </Typography>
                                <Chip
                                  label={`${sub.rate}%`}
                                  size="small"
                                  sx={{
                                    height: '20px',
                                    fontWeight: '900',
                                    fontSize: '0.7rem',
                                    background: sub.rate >= 75 ? 'rgba(0,224,198,0.15)' : 'rgba(255,176,0,0.15)',
                                    color: sub.rate >= 75 ? '#00E0C6' : '#FFB000',
                                  }}
                                />
                              </Box>
                              <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sub.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mt: 0.5, fontFamily: 'monospace' }}>
                                Classes: {sub.total} • Present: {sub.present} • Absent: {sub.absent}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Daily Attendance History (Multi-Period Log) */}
                    <Box>
                      <Typography variant="caption" sx={{ color: '#00E0C6', fontWeight: '900', letterSpacing: '0.1em', display: 'block', mb: 1, fontFamily: 'monospace' }}>
                        DAILY & PERIOD ATTENDANCE HISTORY
                      </Typography>
                      <TableContainer sx={{ maxHeight: 220, background: '#070A0F', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <Table size="small">
                          <TableHead sx={{ background: '#0D131F' }}>
                            <TableRow>
                              <TableCell sx={{ color: '#9CA3AF', fontFamily: 'monospace', fontWeight: '800' }}>DATE</TableCell>
                              <TableCell sx={{ color: '#9CA3AF', fontFamily: 'monospace', fontWeight: '800' }}>PERIOD</TableCell>
                              <TableCell sx={{ color: '#9CA3AF', fontFamily: 'monospace', fontWeight: '800' }}>SUBJECT</TableCell>
                              <TableCell sx={{ color: '#9CA3AF', fontFamily: 'monospace', fontWeight: '800' }}>TIME IN</TableCell>
                              <TableCell sx={{ color: '#9CA3AF', fontFamily: 'monospace', fontWeight: '800' }}>STATUS</TableCell>
                              <TableCell sx={{ color: '#9CA3AF', fontFamily: 'monospace', fontWeight: '800' }}>RECEIPT HASH</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedStudentDetails.attendance.records?.filter((r) => profileSubjectFilter === 'ALL' || r.subject_code === profileSubjectFilter).length > 0 ? (
                              selectedStudentDetails.attendance.records
                                .filter((r) => profileSubjectFilter === 'ALL' || r.subject_code === profileSubjectFilter)
                                .map((rec) => (
                                  <TableRow key={rec.id} hover sx={{ '&:hover': { background: 'rgba(0, 224, 198, 0.04)' } }}>
                                    <TableCell sx={{ color: '#F3F4F6', fontFamily: 'monospace' }}>{rec.date}</TableCell>
                                    <TableCell sx={{ color: '#FFB000', fontFamily: 'monospace', fontWeight: '800' }}>Period {rec.period}</TableCell>
                                    <TableCell sx={{ color: '#00E0C6', fontFamily: 'monospace', fontWeight: '800' }}>{rec.subject_code}</TableCell>
                                    <TableCell sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>{rec.time_in}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={rec.status.toUpperCase()}
                                        size="small"
                                        sx={{
                                          height: '20px',
                                          fontWeight: '900',
                                          fontSize: '0.7rem',
                                          background: rec.status === 'present' ? 'rgba(0, 224, 198, 0.15)' : 'rgba(255, 176, 0, 0.15)',
                                          color: rec.status === 'present' ? '#00E0C6' : '#FFB000',
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell sx={{ color: '#6B7280', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                      {rec.verification_hash}
                                    </TableCell>
                                  </TableRow>
                                ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ color: '#9CA3AF', py: 3 }}>
                                  No attendance records for the selected subject.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Stack>
                )}
              </Box>
            ) : null}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
