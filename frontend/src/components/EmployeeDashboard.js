import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  LinearProgress,
  Fade,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import {
  MenuBook,
} from '@mui/icons-material';
import { userAPI } from '../services/api';
import { useAuth } from '../App';
import { format, startOfWeek, endOfWeek, isWithinInterval, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [subjectSummary, setSubjectSummary] = useState([]);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthlyCalendar, setMonthlyCalendar] = useState([]);
  const [stats, setStats] = useState({
    todayStatus: null,
    thisWeekPresent: 0,
    thisMonthPresent: 0,
    attendanceRate: 0,
    streak: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAttendance();
      const attendanceRecords = response.data.attendance_records || [];
      const subjectsList = response.data.subject_wise_summary || [];
      setAttendance(attendanceRecords);
      setSubjectSummary(subjectsList);
      
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);

      // Day of week for the 1st of this month (0: Sun, 1: Mon, ..., 4: Thu)
      const startDayOfWeek = monthStart.getDay();

      // Leading padding cells to align Day 1 with its correct day of week
      const paddingSlots = Array.from({ length: startDayOfWeek }, (_, i) => ({
        isPadding: true,
        key: `pad-${i}`,
      }));

      // Real days of this month
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const dayCells = daysInMonth.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayRecords = attendanceRecords.filter((r) => r.date === dayStr);
        const presentCount = dayRecords.filter((r) => r.status === 'present').length;
        const isPresent = presentCount > 0;
        const isAbsent = dayRecords.length > 0 && !isPresent;
        return {
          date: day,
          dayNumber: format(day, 'd'),
          dateStr: dayStr,
          status: isPresent ? 'present' : (isAbsent ? 'absent' : null),
          recordsCount: dayRecords.length,
          presentCount,
          isToday: dayStr === todayStr,
        };
      });

      setMonthlyCalendar([...paddingSlots, ...dayCells]);

      // Calculate today's status
      const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
      const todayIsPresent = todayRecords.some((r) => r.status === 'present');
      const todayIsAbsent = todayRecords.length > 0 && !todayIsPresent;

      // Unique dates present this week / this month
      const thisWeekDates = new Set();
      const thisMonthDates = new Set();
      attendanceRecords.forEach((record) => {
        if (record.status === 'present') {
          const recordDate = new Date(record.date);
          if (isWithinInterval(recordDate, { start: weekStart, end: weekEnd })) {
            thisWeekDates.add(record.date);
          }
          if (recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear()) {
            thisMonthDates.add(record.date);
          }
        }
      });

      // Calculate streak across unique attendance days
      let streak = 0;
      const sortedUniqueDates = Array.from(new Set(attendanceRecords.map(r => r.date))).sort().reverse();
      for (const d of sortedUniqueDates) {
        const dayRecs = attendanceRecords.filter(r => r.date === d);
        if (dayRecs.some(r => r.status === 'present')) {
          streak++;
        } else {
          break;
        }
      }

      const totalUniqueDays = new Set(attendanceRecords.map(r => r.date)).size;
      const attendanceRate = totalUniqueDays > 0 ? (thisMonthDates.size / totalUniqueDays) * 100 : 0;

      setStats({
        todayStatus: todayIsPresent ? 'present' : (todayIsAbsent ? 'absent' : null),
        thisWeekPresent: thisWeekDates.size,
        thisMonthPresent: thisMonthDates.size,
        attendanceRate: Math.round(attendanceRate),
        streak,
      });
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.unique_id]);

  const downloadReport = () => {
    const rows = [
      ['Date', 'Status', 'Time In'],
      ...attendance.map((r) => [
        r.date,
        r.status,
        r.time_in || '',
      ]),
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${user?.unique_id || 'report'}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" sx={{ background: 'linear-gradient(135deg, #f5f3f0 0%, #fafaf9 50%, #ffffff 100%)' }}>
        <CircularProgress size={40} sx={{ color: '#f97316' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ background: 'var(--bg-gradient)', minHeight: '100vh', py: 4, color: 'var(--text-primary)' }}>
      <Container maxWidth="xl">
        {/* Hero Section with Split Layout */}
        <Fade in timeout={600}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* LEFT: Large Stats Card */}
            <Grid item xs={12} md={5}>
              <Card elevation={0} sx={{ borderRadius: '28px', background: '#0D131F', border: '1px solid rgba(0, 224, 198, 0.35)', color: '#ffffff', height: '100%', minHeight: 380, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 25px rgba(255, 176, 0, 0.15)' }}>
                {/* Decorative circles */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,176,0,0.1)' }} />
                <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(0,224,198,0.1)' }} />
                
                <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar sx={{ width: 64, height: 64, background: stats.todayStatus === 'present' ? '#10b981' : '#f97316', fontSize: '1.75rem', fontWeight: 'bold', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                      {user?.full_name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="700" sx={{ fontFamily: '"Inter", sans-serif', mb: 0.5 }}>
                        {user?.full_name.split(' ')[0]}
                      </Typography>
                      <Chip label={user?.role || 'Employee'} size="small" sx={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: '600', fontSize: '0.7rem', height: '22px' }} />
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                  {/* Circular Progress - Attendance Rate */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, position: 'relative' }}>
                    <Box sx={{ position: 'relative' }}>
                      <CircularProgress variant="determinate" value={100} size={160} thickness={4} sx={{ color: 'rgba(0,224,198,0.15)', position: 'absolute' }} />
                      <CircularProgress variant="determinate" value={stats.attendanceRate} size={160} thickness={4} sx={{ color: '#00E0C6' }} />
                      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h3" fontWeight="800" sx={{ fontFamily: '"Inter", sans-serif', lineHeight: 1 }}>
                          {stats.attendanceRate}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600', mt: 0.5 }}>
                          This Month
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Quick Stats Row */}
                  <Grid container spacing={2} sx={{ mt: 'auto' }}>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h5" fontWeight="700" sx={{ fontFamily: '"Inter", sans-serif' }}>{stats.streak}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Streak</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h5" fontWeight="700" sx={{ fontFamily: '"Inter", sans-serif' }}>{stats.thisWeekPresent}/7</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>This Week</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box textAlign="center">
                        <Typography variant="h5" fontWeight="700" sx={{ fontFamily: '"Inter", sans-serif' }}>{stats.thisMonthPresent}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Days</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* RIGHT: Welcome & Actions */}
            <Grid item xs={12} md={7}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Welcome Message */}
                <Card elevation={0} sx={{ borderRadius: '20px', background: '#0D131F', border: '1px solid rgba(0, 224, 198, 0.3)', boxShadow: '0 4px 20px rgba(0,0,0,0.6)', p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5" fontWeight="900" sx={{ color: '#FFB000', fontFamily: '"JetBrains Mono", sans-serif', mb: 0.5 }}>
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#9CA3AF', fontFamily: '"Inter", sans-serif' }}>
                        {format(new Date(), 'EEEE, MMMM dd, yyyy')}
                      </Typography>
                    </Box>
                    <Chip
                      label={stats.todayStatus === 'present' ? 'Present Today' : stats.todayStatus === 'absent' ? 'Absent' : 'Not Marked'}
                      sx={{ background: stats.todayStatus === 'present' ? 'rgba(0, 224, 198, 0.15)' : 'rgba(255, 176, 0, 0.15)', color: stats.todayStatus === 'present' ? '#00E0C6' : '#FFB000', border: stats.todayStatus === 'present' ? '1px solid #00E0C6' : '1px solid #FFB000', fontWeight: '800', px: 2, height: '40px', fontSize: '0.9rem', fontFamily: 'monospace' }}
                    />
                  </Box>
                </Card>

                {/* Action Buttons */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Button fullWidth variant="contained" size="large" onClick={() => window.location.href = '/mark-attendance'}
                      sx={{ py: 3, borderRadius: '16px', background: 'linear-gradient(135deg, #00E0C6 0%, #0F766E 100%)', color: '#070A0F', textTransform: 'none', fontWeight: '900', fontSize: '1rem', fontFamily: '"Inter", sans-serif', boxShadow: '0 8px 24px rgba(0,224,198,0.3)', '&:hover': { background: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)', transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}>
                      Mark Attendance
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button fullWidth variant="outlined" size="large" onClick={downloadReport}
                      sx={{ py: 3, borderRadius: '16px', border: '2px solid #FFB000', color: '#FFB000', textTransform: 'none', fontWeight: '900', fontSize: '1rem', fontFamily: '"Inter", sans-serif', '&:hover': { background: 'rgba(255, 176, 0, 0.12)', transform: 'translateY(-2px)' }, transition: 'all 0.3s ease' }}>
                      Download Report
                    </Button>
                  </Grid>
                </Grid>

                {/* Mini Stats Cards */}
                <Grid container spacing={2}>
                  {[
                    { label: 'Streak Days', value: stats.streak, color: '#FFB000', bg: '#070A0F', border: 'rgba(255, 176, 0, 0.3)' },
                    { label: 'Attendance Rate', value: `${stats.attendanceRate}%`, color: '#00E0C6', bg: '#070A0F', border: 'rgba(0, 224, 198, 0.3)' },
                    { label: 'This Month', value: stats.thisMonthPresent, color: '#FFB000', bg: '#070A0F', border: 'rgba(255, 176, 0, 0.3)' },
                  ].map((stat, i) => (
                    <Grid item xs={12} sm={4} key={i}>
                      <Card elevation={0} sx={{ borderRadius: '16px', background: stat.bg, border: `1px solid ${stat.border}`, p: 2.5, textAlign: 'center' }}>
                        <Typography variant="h5" fontWeight="900" sx={{ color: stat.color, fontFamily: 'monospace', lineHeight: 1.2 }}>{stat.value}</Typography>
                        <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: '700', fontFamily: '"Inter", sans-serif' }}>{stat.label}</Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Fade>

        {/* Monthly Calendar & Subject-Wise Attendance List */}
        <Grid container spacing={3}>
          {/* Calendar View - Correctly Aligned to Days of Week */}
          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '24px',
                background: '#0D131F',
                border: '1px solid rgba(0, 224, 198, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" fontWeight="900" sx={{ color: '#F3F4F6', fontFamily: '"JetBrains Mono", monospace' }}>
                      Monthly Calendar
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF', fontFamily: '"Inter", sans-serif' }}>
                      {format(new Date(), 'MMMM yyyy')}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${stats.thisMonthPresent} Active Days`}
                    sx={{
                      background: 'rgba(0, 224, 198, 0.12)',
                      color: '#00E0C6',
                      border: '1px solid rgba(0, 224, 198, 0.35)',
                      fontWeight: '700',
                      fontFamily: 'monospace',
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Weekday headers */}
                <Grid container spacing={1} sx={{ mb: 1.5 }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Grid item xs={12 / 7} key={day}>
                      <Typography
                        variant="caption"
                        fontWeight="800"
                        textAlign="center"
                        display="block"
                        sx={{
                          color: day === 'Sun' || day === 'Sat' ? '#9CA3AF' : '#00E0C6',
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '0.8rem',
                        }}
                      >
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                {/* Days grid with leading padding for day-of-week alignment */}
                <Grid container spacing={1}>
                  {monthlyCalendar.map((item, idx) => {
                    if (item.isPadding) {
                      return (
                        <Grid item xs={12 / 7} key={item.key || idx}>
                          <Box sx={{ aspectRatio: '1', borderRadius: '10px', background: 'transparent' }} />
                        </Grid>
                      );
                    }
                    const isToday = item.isToday;
                    const isPresent = item.status === 'present';
                    const isAbsent = item.status === 'absent';

                    return (
                      <Grid item xs={12 / 7} key={item.dateStr || idx}>
                        <Paper
                          elevation={0}
                          title={`${format(item.date, 'EEEE, MMM dd')}${item.recordsCount ? ` • ${item.presentCount}/${item.recordsCount} periods present` : ''}`}
                          sx={{
                            aspectRatio: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '12px',
                            background: isPresent
                              ? 'rgba(0, 224, 198, 0.12)'
                              : isAbsent
                              ? 'rgba(239, 68, 68, 0.12)'
                              : '#070A0F',
                            border: isToday
                              ? '2px solid #FFB000'
                              : isPresent
                              ? '1px solid rgba(0, 224, 198, 0.5)'
                              : isAbsent
                              ? '1px solid rgba(239, 68, 68, 0.4)'
                              : '1px solid rgba(255, 255, 255, 0.06)',
                            boxShadow: isToday ? '0 0 12px rgba(255, 176, 0, 0.3)' : 'none',
                            position: 'relative',
                            cursor: 'default',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#00E0C6',
                              transform: 'scale(1.05)',
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={isToday ? '900' : '700'}
                            sx={{
                              color: isToday
                                ? '#FFB000'
                                : isPresent
                                ? '#00E0C6'
                                : isAbsent
                                ? '#F87171'
                                : '#6B7280',
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: '0.85rem',
                            }}
                          >
                            {item.dayNumber}
                          </Typography>
                          {/* Indicator dot */}
                          {isPresent && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                background: '#00E0C6',
                                boxShadow: '0 0 4px #00E0C6',
                              }}
                            />
                          )}
                          {isAbsent && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                background: '#EF4444',
                              }}
                            />
                          )}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Legend below calendar */}
                <Box sx={{ mt: 'auto', pt: 3, display: 'flex', gap: 3, justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '2px', border: '2px solid #FFB000', background: 'rgba(255,176,0,0.2)' }} />
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>Today</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '2px', border: '1px solid #00E0C6', background: 'rgba(0,224,198,0.2)' }} />
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>Present</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '2px', border: '1px solid #EF4444', background: 'rgba(239,68,68,0.2)' }} />
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>Absent</Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Subject-Wise Attendance List */}
          <Grid item xs={12} lg={6}>
            <Card
              elevation={0}
              sx={{
                borderRadius: '24px',
                background: '#0D131F',
                border: '1px solid rgba(0, 224, 198, 0.3)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MenuBook sx={{ color: '#00E0C6', fontSize: '1.4rem' }} />
                      <Typography variant="h6" fontWeight="900" sx={{ color: '#F3F4F6', fontFamily: '"JetBrains Mono", monospace' }}>
                        Subject-Wise Attendance
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#9CA3AF', fontFamily: '"Inter", sans-serif', mt: 0.3 }}>
                      Academic Course Performance Breakdown
                    </Typography>
                  </Box>
                  <Chip
                    label={`${subjectSummary.filter(s => s.percentage >= 75).length}/${subjectSummary.length} Eligible (≥75%)`}
                    sx={{
                      background: 'rgba(255, 176, 0, 0.12)',
                      color: '#FFB000',
                      border: '1px solid rgba(255, 176, 0, 0.35)',
                      fontWeight: '700',
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ p: 3, flex: 1, overflowY: 'auto', maxHeight: 480 }}>
                {subjectSummary.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <Typography variant="body2" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>
                      No subjects registered or attendance recorded yet.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {subjectSummary.map((sub) => {
                      const isEligible = sub.percentage >= 75;
                      const isWarning = sub.percentage >= 65 && sub.percentage < 75;
                      const statusColor = isEligible ? '#00E0C6' : isWarning ? '#FFB000' : '#EF4444';
                      const statusBg = isEligible ? 'rgba(0, 224, 198, 0.1)' : isWarning ? 'rgba(255, 176, 0, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                      const statusBorder = isEligible ? 'rgba(0, 224, 198, 0.35)' : isWarning ? 'rgba(255, 176, 0, 0.35)' : 'rgba(239, 68, 68, 0.35)';
                      const isExpanded = expandedSubject === sub.code;

                      // Find attendance records for this subject
                      const subjectLogs = attendance.filter(
                        (r) => r.subject_id === sub.subject_id || r.subject_code === sub.code
                      );

                      return (
                        <Box
                          key={sub.code}
                          sx={{
                            p: 2,
                            borderRadius: '16px',
                            background: '#070A0F',
                            border: isExpanded ? `1px solid ${statusColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: statusColor,
                              boxShadow: `0 4px 16px ${statusBg}`,
                            },
                          }}
                        >
                          {/* Header row */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Chip
                                label={sub.code}
                                size="small"
                                sx={{
                                  background: 'rgba(0, 224, 198, 0.15)',
                                  color: '#00E0C6',
                                  border: '1px solid rgba(0, 224, 198, 0.4)',
                                  fontWeight: '800',
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                }}
                              />
                              <Typography
                                variant="body2"
                                fontWeight="700"
                                sx={{ color: '#F3F4F6', fontFamily: '"Inter", sans-serif' }}
                              >
                                {sub.name}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body2"
                                fontWeight="900"
                                sx={{ color: statusColor, fontFamily: 'monospace' }}
                              >
                                {sub.percentage}%
                              </Typography>
                              <Chip
                                label={sub.status}
                                size="small"
                                sx={{
                                  background: statusBg,
                                  color: statusColor,
                                  border: `1px solid ${statusBorder}`,
                                  fontWeight: '700',
                                  fontSize: '0.7rem',
                                  height: '22px',
                                }}
                              />
                            </Box>
                          </Box>

                          {/* Progress bar */}
                          <Box sx={{ mb: 1.2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(sub.percentage, 100)}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: statusColor,
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>

                          {/* Footer details row */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace' }}>
                              Attended: <strong style={{ color: '#F3F4F6' }}>{sub.attended}</strong> / {sub.total} periods
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => setExpandedSubject(isExpanded ? null : sub.code)}
                              sx={{
                                p: 0,
                                minWidth: 'auto',
                                color: '#9CA3AF',
                                textTransform: 'none',
                                fontSize: '0.72rem',
                                fontFamily: 'monospace',
                                '&:hover': { color: '#00E0C6' },
                              }}
                            >
                              {isExpanded ? 'Hide History ▲' : `View Logs (${subjectLogs.length}) ▼`}
                            </Button>
                          </Box>

                          {/* Expanded period history */}
                          {isExpanded && (
                            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                              {subjectLogs.length === 0 ? (
                                <Typography variant="caption" sx={{ color: '#6B7280', fontFamily: 'monospace' }}>
                                  No period logs recorded for {sub.code}.
                                </Typography>
                              ) : (
                                <Stack spacing={0.8}>
                                  {subjectLogs.map((log, i) => (
                                    <Box
                                      key={log.id || i}
                                      sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        p: 0.8,
                                        borderRadius: '8px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Chip
                                          label={`P${log.period || 1}`}
                                          size="small"
                                          sx={{
                                            height: 20,
                                            fontSize: '0.65rem',
                                            background: 'rgba(255, 176, 0, 0.15)',
                                            color: '#FFB000',
                                            fontFamily: 'monospace',
                                            fontWeight: '700',
                                          }}
                                        />
                                        <Typography variant="caption" sx={{ color: '#D1D5DB', fontFamily: 'monospace' }}>
                                          {log.date}
                                        </Typography>
                                        {log.time_in && (
                                          <Typography variant="caption" sx={{ color: '#6B7280', fontFamily: 'monospace' }}>
                                            • {log.time_in}
                                          </Typography>
                                        )}
                                      </Box>
                                      <Chip
                                        label={log.status === 'present' ? 'Present ✓' : 'Absent ✗'}
                                        size="small"
                                        sx={{
                                          height: 20,
                                          fontSize: '0.65rem',
                                          background: log.status === 'present' ? 'rgba(0, 224, 198, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                          color: log.status === 'present' ? '#00E0C6' : '#F87171',
                                          fontFamily: 'monospace',
                                          fontWeight: '700',
                                        }}
                                      />
                                    </Box>
                                  ))}
                                </Stack>
                              )}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#070A0F', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontFamily: 'monospace', display: 'block', textAlign: 'center' }}>
                  VTU Exam Eligibility Rule: Minimum 75% attendance mandatory in all enrolled subjects.
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EmployeeDashboard;
