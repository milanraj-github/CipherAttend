import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  EventAvailable,
  CheckCircle,
  Cancel,
  TrendingUp,
  FilterAlt,
  Download,
} from '@mui/icons-material';
import { userAPI } from '../services/api';

const UserAttendance = () => {
  const [user, setUser] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendanceData();
    fetchAttendanceStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAttendanceData = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await userAPI.getAttendance(filters);
      setUser(response.data.user);
      setAttendanceRecords(response.data.attendance_records || []);
    } catch (err) {
      setError('Failed to load attendance data');
      console.error('Attendance fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async (month = selectedMonth, year = selectedYear) => {
    try {
      const response = await userAPI.getAttendanceStats({ month, year });
      setStats(response.data.stats);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const handleFilterApply = () => {
    const filters = {};
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    
    fetchAttendanceData(filters);
  };

  const handleStatsFilter = () => {
    fetchAttendanceStats(selectedMonth, selectedYear);
  };

  if (loading && !attendanceRecords.length) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" sx={{ background: 'var(--bg-primary)' }}>
          <CircularProgress sx={{ color: 'var(--teal-accent)' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ background: 'var(--bg-gradient)', minHeight: '100vh', py: 4, px: 2, color: 'var(--text-primary)' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Card elevation={0} sx={{ p: 4, mb: 4, borderRadius: '20px', background: 'var(--card-solid)', border: '1px solid var(--teal-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Typography variant="h4" fontWeight="900" sx={{ fontFamily: '"JetBrains Mono", sans-serif', color: 'var(--amber-accent)' }}>
              MY <span style={{ color: 'var(--teal-accent)' }}>ATTENDANCE RECORD</span>
            </Typography>
          </Box>
          
          {user && (
            <Typography variant="body1" fontWeight="500" sx={{ color: 'var(--text-secondary)', fontFamily: '"Inter", sans-serif' }}>
              Welcome, <strong>{user.full_name}</strong>! Here is your cryptographic attendance logs.
            </Typography>
          )}
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', border: '1px solid var(--amber-accent)', background: 'rgba(255, 176, 0, 0.15)', color: 'var(--amber-accent)' }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: '18px', background: 'var(--card-solid)', border: '1px solid var(--teal-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(0, 224, 198, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <EventAvailable sx={{ color: 'var(--teal-accent)' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="800" sx={{ color: 'var(--text-primary)', fontFamily: '"Inter", sans-serif' }}>
                        {stats.total_days}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: '700' }}>
                        Total Classes
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: '18px', background: 'var(--card-solid)', border: '1px solid var(--teal-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle sx={{ color: '#16a34a' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="800" sx={{ color: '#16a34a', fontFamily: '"Inter", sans-serif' }}>
                        {stats.present_days}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: '700' }}>
                        Present Days
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: '18px', background: 'var(--card-solid)', border: '1px solid var(--teal-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Cancel sx={{ color: '#dc2626' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="800" sx={{ color: '#dc2626', fontFamily: '"Inter", sans-serif' }}>
                        {stats.absent_days}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: '700' }}>
                        Absent Days
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ borderRadius: '18px', background: 'var(--card-solid)', border: '1px solid var(--teal-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255, 176, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp sx={{ color: 'var(--amber-accent)' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" fontWeight="800" sx={{ color: 'var(--amber-accent)', fontFamily: '"Inter", sans-serif' }}>
                        {stats.attendance_percentage}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontWeight: '700' }}>
                        Attendance Rate
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress variant="determinate" value={stats.attendance_percentage} sx={{ height: 6, borderRadius: 3, background: 'var(--card-inner)', '& .MuiLinearProgress-bar': { borderRadius: 3, background: 'linear-gradient(90deg, var(--amber-accent) 0%, var(--teal-accent) 100%)' } }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Card elevation={0} sx={{ p: 3.5, mb: 4, borderRadius: '20px', background: 'var(--card-solid)', border: '1px solid var(--teal-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, fontFamily: '"Inter", sans-serif', fontWeight: '800', color: 'var(--text-primary)' }}>
            <FilterAlt sx={{ color: 'var(--teal-accent)' }} /> Date & Month Filter
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{
                  background: 'var(--card-inner)',
                  borderRadius: '10px',
                  '& .MuiOutlinedInput-root': { color: 'var(--text-primary)' },
                  '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{
                  background: 'var(--card-inner)',
                  borderRadius: '10px',
                  '& .MuiOutlinedInput-root': { color: 'var(--text-primary)' },
                  '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <Button
                variant="contained"
                onClick={handleFilterApply}
                fullWidth
                sx={{
                  py: 1.2,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--amber-accent), var(--teal-accent))',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: '800',
                }}
              >
                Apply Filter
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" gap={1} alignItems="center">
                <TextField
                  select
                  label="Month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  SelectProps={{ native: true }}
                  size="small"
                  sx={{
                    minWidth: 100,
                    background: 'var(--card-inner)',
                    borderRadius: '10px',
                    '& select': { color: 'var(--text-primary)' },
                    '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1} style={{ background: '#0D131F', color: '#F3F4F6' }}>
                      {new Date(0, i).toLocaleString('default', { month: 'short' })}
                    </option>
                  ))}
                </TextField>
                
                <TextField
                  select
                  label="Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  SelectProps={{ native: true }}
                  size="small"
                  sx={{
                    minWidth: 90,
                    background: 'var(--card-inner)',
                    borderRadius: '10px',
                    '& select': { color: 'var(--text-primary)' },
                    '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
                  }}
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <option key={year} value={year} style={{ background: '#0D131F', color: '#F3F4F6' }}>
                        {year}
                      </option>
                    );
                  })}
                </TextField>
                
                <Button
                  variant="outlined"
                  onClick={handleStatsFilter}
                  size="small"
                  sx={{
                    borderRadius: '10px',
                    border: '1px solid var(--teal-border)',
                    color: 'var(--teal-accent)',
                    textTransform: 'none',
                    fontWeight: '700',
                    px: 2,
                    py: 1,
                  }}
                >
                  Update
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* Attendance Records Table */}
        <Card elevation={0} sx={{ borderRadius: '20px', background: 'var(--card-solid)', border: '1px solid var(--teal-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
          <Box p={3.5}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={1.5}>
              <Typography variant="h6" sx={{ fontFamily: '"Inter", sans-serif', fontWeight: '800', color: 'var(--text-primary)' }}>
                Attendance Records ({attendanceRecords.length} entries)
              </Typography>
              {attendanceRecords.length > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={() => {
                    const csv = [
                      ['Date', 'Time In', 'Status', 'Recorded At'],
                      ...attendanceRecords.map(record => [
                        new Date(record.date).toLocaleDateString(),
                        record.time_in || '-',
                        record.status,
                        new Date(record.created_at).toLocaleString(),
                      ])
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `attendance-${user?.unique_id || 'record'}-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  }}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: '700',
                    border: '1px solid var(--amber-border)',
                    color: 'var(--amber-accent)',
                  }}
                >
                  Export CSV
                </Button>
              )}
            </Box>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress sx={{ color: 'var(--teal-accent)' }} />
              </Box>
            ) : attendanceRecords.length === 0 ? (
              <Box textAlign="center" p={4}>
                <Typography variant="body1" sx={{ color: 'var(--text-secondary)', fontFamily: '"Inter", sans-serif' }}>
                  No attendance records found for the selected period.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: 'var(--card-inner)' }}>
                      <TableCell sx={{ fontWeight: '800', color: 'var(--text-primary)' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: '800', color: 'var(--text-primary)' }}>Time In</TableCell>
                      <TableCell sx={{ fontWeight: '800', color: 'var(--text-primary)' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: '800', color: 'var(--text-primary)' }}>Recorded At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id} hover>
                        <TableCell sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell sx={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          {record.time_in ? 
                            new Date(`2000-01-01T${record.time_in}`).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            sx={{
                              background: record.status === 'present' ? 'rgba(0, 224, 198, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: record.status === 'present' ? 'var(--teal-accent)' : '#dc2626',
                              fontWeight: '800',
                              border: `1px solid ${record.status === 'present' ? 'var(--teal-border)' : '#dc2626'}`,
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'var(--text-secondary)' }}>
                          {new Date(record.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Card>
      </Container>
    </Box>
  );
};

export default UserAttendance;