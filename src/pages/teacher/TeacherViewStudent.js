// src/pages/Teacher/TeacherViewStudent.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../../redux/userRelated/userHandle';
import { getStudentAttendance } from '../../redux/studentRelated/studentHandle';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import StudentHealthDisplay from '../admin/studentRelated/StudentHealthDisplay';

import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableHead,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress,
  Alert,
  Avatar,
  Grid,
  TableRow,
  TableCell,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
} from '@mui/material';

import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import LocalHospital from '@mui/icons-material/LocalHospital';
import Person from '@mui/icons-material/Person';
import Phone from '@mui/icons-material/Phone';
import ContactEmergency from '@mui/icons-material/ContactEmergency';
import DateRange from '@mui/icons-material/DateRange';
import LocationOn from '@mui/icons-material/LocationOn';

import CustomBarChart from '../../components/CustomBarChart';
import CustomPieChart from '../../components/CustomPieChart';

// ---------------- helpers ----------------
const pct2 = (n) => Math.round(n * 100) / 100;

const computeOverallPct = (attendanceArr) => {
  if (!Array.isArray(attendanceArr) || attendanceArr.length === 0) return 0;
  const total = attendanceArr.length;
  const present = attendanceArr.filter(
    (a) => (a?.status || '').toLowerCase() === 'present'
  ).length;
  return pct2((present / total) * 100);
};

const formatPctForDisplay = (n) =>
  Math.abs(n - 100) < 1e-9 ? '100%' : `${n.toFixed(2).replace(/\.00$/, '')}%`;

const getDisplayStudentId = (details) => {
  const explicit =
    details?.studentId ||
    details?.studentID ||
    details?.student_id ||
    details?.registrationId ||
    details?.admissionId ||
    details?.sid;
  if (explicit) return explicit;

  const id = details?._id;
  if (!id) return 'N/A';
  const lastSix = String(id).slice(-6);
  return `STU-${lastSix}`;
};

const TeacherViewStudent = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const studentID = params.id;

  const { currentUser, userDetails } = useSelector((state) => state.user);
  const { attendance } = useSelector((state) => state.student);

  // UI state
  const [value, setValue] = useState('1'); // tabs: "1" Details, "2" Attendance, "3" Marks
  const [selectedSection, setSelectedSection] = useState('table'); // bottom nav in panels

  // fetch student details and attendance
  useEffect(() => {
    if (studentID) {
      dispatch(getUserDetails(studentID, 'Student'));
      dispatch(getStudentAttendance(studentID));
    }
  }, [dispatch, studentID]);

  const handleTabChange = (_e, newValue) => setValue(newValue);
  const handleSectionChange = (_e, newSection) => setSelectedSection(newSection);

  // Navigate to health management page
  const handleManageHealth = () => {
    navigate(`/Teacher/students/${studentID}/health`);
  };

  // Use per-day attendance from Redux if available, otherwise fall back to userDetails.attendance
  const subjectAttendance = useMemo(() => {
    return Array.isArray(attendance) && attendance.length > 0
      ? attendance
      : (userDetails?.attendance || []);
  }, [attendance, userDetails]);

  const subjectMarks = userDetails?.examResult || [];

  // Attendance aggregates (based on per-day attendance)
  const attendanceSummary = useMemo(() => {
    if (!Array.isArray(subjectAttendance) || subjectAttendance.length === 0) {
      return {
        overallPct: 0,
        overallAbsentPct: 100,
        chartData: [
          { name: 'Present', value: 0 },
          { name: 'Absent', value: 100 },
        ],
      };
    }

    const overallPct = computeOverallPct(subjectAttendance);
    const overallAbsentPct = pct2(100 - overallPct);

    const chartData = [
      { name: 'Present', value: overallPct },
      { name: 'Absent', value: overallAbsentPct },
    ];

    return { overallPct, overallAbsentPct, chartData };
  }, [subjectAttendance]);

  const { overallPct, chartData } = attendanceSummary;

  // Filter marks to teacher's subjects
  const filteredMarks = useMemo(() => {
    if (!Array.isArray(subjectMarks)) return [];
    
    if (currentUser?.teachSubject) {
      const teacherSubjectIds = Array.isArray(currentUser.teachSubject)
        ? currentUser.teachSubject.map(sub => sub._id || sub)
        : [currentUser.teachSubject._id || currentUser.teachSubject];
      
      return subjectMarks.filter((m) => {
        const id = typeof m?.subName === 'string' ? m.subName : (m?.subName?._id || m?.subName);
        return !!id && teacherSubjectIds.includes(id);
      });
    }
    
    return subjectMarks;
  }, [subjectMarks, currentUser]);

  // -------------------- SECTIONS --------------------
  const StudentDetailsSection = () => {
    const s = userDetails;
    if (!s) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No student found.</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 2 }}>
        {/* Header */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
              <Avatar
                alt="Student Avatar"
                src={s?.profileImage?.url || ''}
                sx={{ width: 120, height: 120, mb: 2, fontSize: '3rem', bgcolor: 'primary.main' }}
              >
                {s?.name?.charAt(0)}
              </Avatar>

              <Typography variant="h4" gutterBottom textAlign="center">
                {s?.name || 'N/A'}
              </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Roll No: {s?.rollNum || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Class: {s?.sclassName?.sclassName || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                School: {s?.school?.schoolName || 'N/A'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DateRange sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Date of Birth</Typography>
                      <Typography variant="body1">
                        {s?.dob ? new Date(s.dob).toDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Guardian's Name</Typography>
                      <Typography variant="body1">{s?.fatherName || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Phone</Typography>
                      <Typography variant="body1">{s?.phoneNumber || 'N/A'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ContactEmergency sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Emergency Contact</Typography>
                      <Typography variant="body1">{s?.emergencyContact || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Address Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body1">{s?.address || 'N/A'}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Student ID: {getDisplayStudentId(s)}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Admission Date: {s?.createdAt ? new Date(s.createdAt).toDateString() : 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Attendance Overview Card */}
        {Array.isArray(subjectAttendance) && subjectAttendance.length > 0 && (
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Attendance Overview
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Overall Attendance:</strong>{' '}
                    {formatPctForDisplay(overallPct)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Based on {subjectAttendance.length} session(s)
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CustomPieChart data={chartData} />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Academic Summary (teacher-scoped marks) */}
        {filteredMarks.length > 0 && (
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Academic Summary (Your Subjects)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Total Subjects:</strong> {filteredMarks.length}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Average Score:</strong>{' '}
                    {(
                      filteredMarks.reduce(
                        (sum, m) => sum + (m?.marksObtained || 0),
                        0
                      ) / filteredMarks.length
                    ).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Action Button - MANAGE HEALTH */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="contained" 
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                transform: 'scale(1.03)',
              },
              transition: 'all 0.3s ease'
            }}
            onClick={handleManageHealth}
            startIcon={<LocalHospital />}
            size="large"
          >
            Manage Health
          </Button>
        </Box>
      </Box>
    );
  };

  const StudentAttendanceSection = () => {
    const renderTableSection = () => {
      if (!Array.isArray(subjectAttendance) || subjectAttendance.length === 0) {
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              No attendance data found.
            </Typography>
          </Box>
        );
      }

      return (
        <>
          <Typography variant="h5" gutterBottom>
            Daily Attendance
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Date</b></TableCell>
                <TableCell><b>Day</b></TableCell>
                <TableCell><b>Status</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {subjectAttendance.map((att, index) => {
                const dateObj = new Date(att.date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

                return (
                  <TableRow key={index}>
                    <TableCell>{dateObj.toLocaleDateString()}</TableCell>
                    <TableCell>{dayName}</TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color: att.status === "Present" ? "green" : "red"
                        }}
                      >
                        {att.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="h6">
              Overall Attendance Percentage: {formatPctForDisplay(overallPct)}
            </Typography>
          </Box>
        </>
      );
    };

    const renderChartSection = () => (
      <Box>
        <Typography variant="h5" gutterBottom>
          Attendance Chart
        </Typography>
        <CustomPieChart data={chartData} />
      </Box>
    );

    return (
      <Box sx={{ pb: 8 }}> {/* Add padding bottom to accommodate fixed navigation */}
        {selectedSection === 'table' ? renderTableSection() : renderChartSection()}

        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
          <BottomNavigation value={selectedSection} onChange={handleSectionChange} showLabels>
            <BottomNavigationAction
              label="Table"
              value="table"
              icon={selectedSection === 'table' ? <TableChartIcon /> : <TableChartOutlinedIcon />}
            />
            <BottomNavigationAction
              label="Chart"
              value="chart"
              icon={selectedSection === 'chart' ? <InsertChartIcon /> : <InsertChartOutlinedIcon />}
            />
          </BottomNavigation>
        </Paper>
      </Box>
    );
  };

  // -------------------- MOBILE-RESPONSIVE STUDENT MARKS SECTION --------------------
  const StudentMarksSection = () => {
    const [studentMarks, setStudentMarks] = useState([]);
    const [marksLoading, setMarksLoading] = useState(false);
    const [marksError, setMarksError] = useState(null);

    const customTheme = {
      background: '#fafafa',
      surface: '#ffffff',
      accent: '#1a1a1a',
      text: '#1a1a1a',
      textSecondary: '#666666',
      border: '#e0e0e0',
      primary: '#1976d2',
      success: '#2e7d32',
      error: '#d32f2f',
    };

    useEffect(() => {
      const fetchStudentMarks = async () => {
        if (studentID) {
          setMarksLoading(true);
          setMarksError(null);
          try {
            const { data } = await axios.get(`${process.env.REACT_APP_BASE_URL}/marks/student/${studentID}`);
            setStudentMarks(data);
          } catch (error) {
            setMarksError(error.response?.data?.message || error.message);
            console.error('Error fetching student marks:', error);
          } finally {
            setMarksLoading(false);
          }
        }
      };

      fetchStudentMarks();
    }, [studentID]);

    if (marksLoading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 8,
          backgroundColor: customTheme.background,
          minHeight: '300px'
        }}>
          <CircularProgress />
          <Typography sx={{ ml: 2, color: customTheme.text }}>Loading marks...</Typography>
        </Box>
      );
    }

    if (marksError) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: customTheme.background
        }}>
          <Alert severity="error" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
            Error loading marks: {marksError}
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              backgroundColor: customTheme.accent,
              color: '#ffffff',
              '&:hover': { backgroundColor: '#000000' }
            }}
          >
            Retry
          </Button>
        </Box>
      );
    }

    if (!studentMarks.length) {
      return (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: customTheme.background
        }}>
          <Typography variant="h6" gutterBottom sx={{ color: customTheme.text, mb: 2 }}>
            No marks found for this student.
          </Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: customTheme.primary,
              color: '#ffffff',
              '&:hover': { backgroundColor: '#115293' }
            }}
            onClick={() => navigate('/Teacher/marks')}
          >
            Go to Marks Management
          </Button>
        </Box>
      );
    }

    // Calculate summary stats
    const summaryStats = studentMarks.reduce((acc, mark) => {
      const percentage = (mark.obtainedMarks / mark.totalMarks) * 100;
      acc.totalAssessments++;
      acc.totalPercentage += percentage;
      acc.highestScore = Math.max(acc.highestScore, mark.obtainedMarks);
      acc.subjects.add(mark.subjectId?.subName || mark.subjectId || 'Unknown');
      return acc;
    }, { totalAssessments: 0, totalPercentage: 0, highestScore: 0, subjects: new Set() });

    const averagePercentage = (summaryStats.totalPercentage / summaryStats.totalAssessments).toFixed(1);
    const totalSubjects = summaryStats.subjects.size;

    // Mobile-friendly card view for marks
    const MobileMarksCard = ({ mark, index }) => {
      const percentage = ((mark.obtainedMarks / mark.totalMarks) * 100).toFixed(1);
      const isGoodScore = percentage >= 50;

      return (
        <Card sx={{ mb: 2, border: `1px solid ${customTheme.border}`, borderRadius: 2 }}>
          <CardContent>
            <Stack spacing={1.5}>
              {/* Header with Subject and Score */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" sx={{ color: customTheme.accent, fontWeight: '600', flex: 1 }}>
                  {mark.subjectId?.subName || mark.subjectId || 'N/A'}
                </Typography>
                <Chip 
                  label={`${percentage}%`}
                  size="small"
                  color={isGoodScore ? "success" : "error"}
                  sx={{ fontWeight: 'bold', minWidth: 60 }}
                />
              </Box>

              {/* Assessment Details */}
              <Box>
                <Typography variant="body2" sx={{ color: customTheme.textSecondary, mb: 0.5 }}>
                  <strong>Type:</strong> {mark.assessmentType || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: customTheme.textSecondary, mb: 0.5 }}>
                  <strong>Topic:</strong> {mark.topic || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: customTheme.textSecondary, mb: 0.5 }}>
                  <strong>Date:</strong> {mark.date ? new Date(mark.date).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>

              {/* Marks Breakdown */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${customTheme.border}` }}>
                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                  Marks:
                </Typography>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: isGoodScore ? customTheme.success : customTheme.error,
                      fontWeight: 'bold'
                    }}
                  >
                    {mark.obtainedMarks}
                    <Typography 
                      component="span" 
                      variant="body2" 
                      sx={{ color: customTheme.textSecondary, ml: 0.5 }}
                    >
                      / {mark.totalMarks}
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      );
    };

    // Desktop table view
    const DesktopMarksTable = () => (
      <Paper elevation={0} sx={{ backgroundColor: customTheme.surface, borderRadius: 2, border: `1px solid ${customTheme.border}`, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: `1px solid ${customTheme.border}` }}>
          <Typography variant="h5" sx={{ color: customTheme.accent, fontWeight: '600' }}>Detailed Marks</Typography>
        </Box>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ color: customTheme.accent, fontWeight: 'bold', fontSize: '1rem' }}>Subject</TableCell>
              <TableCell sx={{ color: customTheme.accent, fontWeight: 'bold', fontSize: '1rem' }}>Assessment Type</TableCell>
              <TableCell sx={{ color: customTheme.accent, fontWeight: 'bold', fontSize: '1rem' }}>Topic</TableCell>
              <TableCell sx={{ color: customTheme.accent, fontWeight: 'bold', fontSize: '1rem' }}>Date</TableCell>
              <TableCell sx={{ color: customTheme.accent, fontWeight: 'bold', fontSize: '1rem' }}>Marks Obtained</TableCell>
              <TableCell sx={{ color: customTheme.accent, fontWeight: 'bold', fontSize: '1rem' }}>Total Marks</TableCell>
              <TableCell sx={{ color: customTheme.accent, fontWeight: 'bold', fontSize: '1rem' }}>Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentMarks.map((mark, index) => {
              const percentage = ((mark.obtainedMarks / mark.totalMarks) * 100).toFixed(1);
              return (
                <TableRow key={mark._id || index} sx={{ '&:hover': { backgroundColor: '#f9f9f9', transition: 'background-color 0.2s ease' }, '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ color: customTheme.text, fontWeight: '500' }}>{mark.subjectId?.subName || mark.subjectId || 'N/A'}</TableCell>
                  <TableCell sx={{ color: customTheme.text }}>{mark.assessmentType || 'N/A'}</TableCell>
                  <TableCell sx={{ color: customTheme.text }}>{mark.topic || 'N/A'}</TableCell>
                  <TableCell sx={{ color: customTheme.text }}>{mark.date ? new Date(mark.date).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell><Typography sx={{ fontWeight: 'bold', color: mark.obtainedMarks / mark.totalMarks >= 0.5 ? customTheme.success : customTheme.error }}>{mark.obtainedMarks}</Typography></TableCell>
                  <TableCell sx={{ color: customTheme.text, fontWeight: '500' }}>{mark.totalMarks}</TableCell>
                  <TableCell><Typography sx={{ fontWeight: 'bold', color: percentage >= 50 ? customTheme.success : customTheme.error }}>{percentage}%</Typography></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    );

    return (
      <Box sx={{ backgroundColor: customTheme.background, minHeight: '100vh', py: 3 }}>
        {/* Header & Summary Cards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: customTheme.accent, fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
            Student Marks
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { title: 'Total Assessments', value: summaryStats.totalAssessments },
              { title: 'Average', value: `${averagePercentage}%`, color: averagePercentage >= 50 ? customTheme.success : customTheme.error },
              { title: 'Highest Score', value: summaryStats.highestScore },
              { title: 'Subjects', value: totalSubjects },
            ].map((card, idx) => (
              <Grid item xs={6} sm={6} md={3} key={idx}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', backgroundColor: customTheme.surface, border: `1px solid ${customTheme.border}` }}>
                  <Typography variant="body2" sx={{ color: customTheme.textSecondary, mb: 1, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>{card.title}</Typography>
                  <Typography variant="h5" sx={{ color: card.color || customTheme.accent, fontWeight: 'bold', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>{card.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Responsive Marks Display */}
        {isMobile ? (
          <Box sx={{ px: 1 }}>
            <Typography variant="h5" sx={{ color: customTheme.accent, fontWeight: '600', mb: 2 }}>
              Assessment Results
            </Typography>
            {studentMarks.map((mark, index) => (
              <MobileMarksCard key={mark._id || index} mark={mark} index={index} />
            ))}
          </Box>
        ) : (
          <DesktopMarksTable />
        )}

        {/* Action Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: customTheme.accent,
              color: '#ffffff',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              '&:hover': { 
                backgroundColor: '#000000', 
                transform: 'translateY(-2px)', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)' 
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/Teacher/marks')}
          >
            Manage Marks
          </Button>
        </Box>
      </Box>
    );
  };

  // -------------------- RENDER --------------------
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleTabChange} aria-label="student tabs">
            <Tab label="Details" value="1" />
            <Tab label="Attendance" value="2" />
            <Tab label="Marks" value="3" />
            <Tab label="Health" value="4" />
          </TabList>
        </Box>

        <TabPanel value="1" sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          <StudentDetailsSection />
        </TabPanel>
        <TabPanel value="2" sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          <StudentAttendanceSection />
        </TabPanel>
        <TabPanel value="3" sx={{ p: { xs: 0, sm: 1 } }}>
          <StudentMarksSection />
        </TabPanel>
        <TabPanel value="4" sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
  <StudentHealthDisplay 
    studentId={studentID}
    userRole="Teacher"
    canEdit={true}
    onEditClick={handleManageHealth}
  />
</TabPanel>
      </TabContext>
    </Container>
  );
};

export default TeacherViewStudent;