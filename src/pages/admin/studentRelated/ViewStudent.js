// src/pages/Admin/Student/ViewStudent.js
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, updateUser } from '../../../redux/userRelated/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import StudentHealthDisplay from './StudentHealthDisplay';
import axios from 'axios';
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableHead,
  Typography,
  Tab,
  Paper,
  Container,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  TextField,
  TableRow,
  TableCell,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { green } from '@mui/material/colors';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { 
  Delete as DeleteIcon,
  Visibility,
  VisibilityOff,
  Edit,
  Save,
  Cancel,
  Person,
  Phone,
  Email,
  LocationOn,
  ContactEmergency,
  DateRange,
  Lock,
  LocalHospital, // Added for health button icon
} from '@mui/icons-material';
import { removeStuff, updateStudentFields, getStudentAttendance, getStudentDetailsWithPassword } from '../../../redux/studentRelated/studentHandle';

import CustomPieChart from '../../../components/CustomPieChart';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import Popup from '../../../components/Popup';

// ---------- helpers (fixed %) ----------
const pct2 = (n) => {
  return Math.round(n * 100) / 100;
};

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

const ViewStudent = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const studentID = params.id;
  const address = 'Student';

  // Redux state
  const { userDetails, loading, error } = useSelector((state) => state.user);
  const { attendance, studentDetails } = useSelector((state) => state.student); 

  // Local state - Updated to include all fields
  const [name, setName] = useState('');
  const [rollNum, setRollNum] = useState('');
  const [password, setPassword] = useState('');
  const [sclassName, setSclassName] = useState('');
  const [studentSchool, setStudentSchool] = useState('');
  const [subjectAttendance, setSubjectAttendance] = useState([]);

  // Additional fields for update
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [address1, setAddress1] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  //current password
  const [currentPassword, setCurrentPassword] = useState('*******');

  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Tab state - Changed default to '1'
  const [value, setValue] = useState('1');

  // Marks state
  const [studentMarks, setStudentMarks] = useState([]);
  const [marksLoading, setMarksLoading] = useState(false);
  const [marksError, setMarksError] = useState(null);

  // Fetch user details + fresh per-day attendance
  useEffect(() => {
    dispatch(getUserDetails(studentID, address));
    dispatch(getStudentAttendance(studentID));
  }, [dispatch, studentID]);

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (currentUser?.role === 'Admin' && userDetails?._id) {
      console.log('Admin fetching student password for ID:', userDetails._id);
      dispatch(getStudentDetailsWithPassword(userDetails._id));
    }
  }, [dispatch, userDetails?._id, currentUser?.role]);

  useEffect(() => {
    if (studentDetails?.plainPassword) {
      setCurrentPassword(studentDetails.plainPassword);
    }
  }, [studentDetails]);

  useEffect(() => {
    if (userDetails?.sclassName?._id) {
      dispatch(getSubjectList(userDetails.sclassName._id, 'ClassSubjects'));
    }
  }, [dispatch, userDetails]);

  useEffect(() => {
    if (userDetails) {
      setName(userDetails.name || '');
      setRollNum(userDetails.rollNum || '');
      setPassword('');
      setSclassName(userDetails.sclassName || '');
      setStudentSchool(userDetails.school || '');

      setSubjectAttendance(
        Array.isArray(attendance) && attendance.length > 0
          ? attendance
          : (userDetails.attendance || [])
      );

      setEmail(userDetails.email || '');
      setPhoneNumber(userDetails.phoneNumber || '');
      setDob(userDetails.dob ? userDetails.dob.split('T')[0] : '');
      setFatherName(userDetails.fatherName || '');
      setAddress1(userDetails.address || '');
      setEmergencyContact(userDetails.emergencyContact || '');
    }
  }, [userDetails, attendance]);

  // Fetch marks when tab changes to marks
  useEffect(() => {
    const fetchStudentMarks = async () => {
      if (value === '3' && studentID) {
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
  }, [value, studentID]);

  const handleChange = (_event, newValue) => {
    setValue(newValue);
  };

  const fields = useMemo(
    () => ({
      name,
      rollNum,
      email,
      phoneNumber,
      dob,
      fatherName,
      address: address1,
      emergencyContact,
      ...(password !== '' && { password }),
    }),
    [name, rollNum, email, phoneNumber, dob, fatherName, address1, emergencyContact, password]
  );

  const submitHandler = async (event) => {
    event.preventDefault();
    
    try {
      await dispatch(updateUser(fields, studentID, address));
      await dispatch(getUserDetails(studentID, address));
      
      if (currentUser?.role === 'Admin') {
        await dispatch(getStudentDetailsWithPassword(studentID));
      }
      
      setEditDialogOpen(false);
      setMessage('Student details updated successfully!');
      setShowPopup(true);
      setPassword('');
      
    } catch (err) {
      console.error(err);
      setMessage('Failed to update student details.');
      setShowPopup(true);
    }
  };

  const deleteHandler = () => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      dispatch(removeStuff(studentID, address))
        .then(() => {
          navigate('/Admin/students');
        })
        .catch((err) => {
          console.error("Failed to delete student:", err);
          setMessage("Failed to delete student.");
          setShowPopup(true);
        });
    }
  };

  const openEditDialog = () => {
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setPassword('');
    setShowCurrentPassword(false);
    setShowPassword(false);
  };

  // Navigate to health management page
  const handleManageHealth = () => {
    navigate(`/Admin/students/${studentID}/health`);
  };

  // ---------- attendance memo (per-day system) ----------
  const attendanceData = useMemo(() => {
    if (!Array.isArray(subjectAttendance) || subjectAttendance.length === 0) {
      return {
        overallAttendancePercentage: 0,
        overallAbsentPercentage: 100,
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

    return {
      overallAttendancePercentage: overallPct,
      overallAbsentPercentage: overallAbsentPct,
      chartData,
    };
  }, [subjectAttendance]);

  const { overallAttendancePercentage, chartData } = attendanceData;

  const StudentAttendanceSection = () => {
    if (!Array.isArray(subjectAttendance) || subjectAttendance.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            No attendance data found
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom color="primary">
              Daily Attendance Records
            </Typography>
            
            <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="h6" color="white" textAlign="center">
                Overall Attendance: {formatPctForDisplay(overallAttendancePercentage)}
              </Typography>
              <Typography variant="body2" color="white" textAlign="center">
                Total Sessions: {subjectAttendance.length}
              </Typography>
            </Box>

            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>Date</StyledTableCell>
                  <StyledTableCell>Day</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {subjectAttendance.map((att, index) => {
                  const dateObj = new Date(att.date);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

                  return (
                    <StyledTableRow key={index}>
                      <StyledTableCell>{dateObj.toLocaleDateString()}</StyledTableCell>
                      <StyledTableCell>{dayName}</StyledTableCell>
                      <StyledTableCell>
                        <Typography
                          sx={{
                            fontWeight: "bold",
                            color: att.status === "Present" ? "success.main" : "error.main",
                            textTransform: "uppercase"
                          }}
                        >
                          {att.status}
                        </Typography>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Attendance Chart
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CustomPieChart data={chartData} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // ---------- NEW: Student Marks Section ----------
  const StudentMarksSection = () => {
    if (marksLoading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 8,
          minHeight: '300px'
        }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading marks...</Typography>
        </Box>
      );
    }

    if (marksError) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Alert severity="error" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
            Error loading marks: {marksError}
          </Alert>
          <Button
            variant="contained"
            onClick={() => setValue('3')}
            sx={styles.styledButton}
          >
            Retry
          </Button>
        </Box>
      );
    }

    if (!studentMarks.length) {
      return (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.primary', mb: 2 }}>
            No marks found for this student.
          </Typography>
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
    const MobileMarksCard = ({ mark }) => {
      const percentage = ((mark.obtainedMarks / mark.totalMarks) * 100).toFixed(1);
      const isGoodScore = percentage >= 50;

      return (
        <Card sx={{ mb: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: '600', flex: 1 }}>
                  {mark.subjectId?.subName || mark.subjectId || 'N/A'}
                </Typography>
                <Chip 
                  label={`${percentage}%`}
                  size="small"
                  sx={{ 
                    fontWeight: 'bold', 
                    minWidth: 60,
                    bgcolor: isGoodScore ? 'success.main' : 'error.main',
                    color: 'white'
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  <strong>Type:</strong> {mark.assessmentType || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  <strong>Topic:</strong> {mark.topic || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  <strong>Date:</strong> {mark.date ? new Date(mark.date).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                  Marks:
                </Typography>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: isGoodScore ? 'success.main' : 'error.main',
                      fontWeight: 'bold'
                    }}
                  >
                    {mark.obtainedMarks}
                    <Typography 
                      component="span" 
                      variant="body2" 
                      sx={{ color: 'text.secondary', ml: 0.5 }}
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
      <Paper elevation={0} sx={{ backgroundColor: 'white', borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: '600' }}>Detailed Marks</Typography>
        </Box>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: '1rem' }}>Subject</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: '1rem' }}>Assessment Type</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: '1rem' }}>Topic</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: '1rem' }}>Date</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: '1rem' }}>Marks Obtained</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: '1rem' }}>Total Marks</TableCell>
              <TableCell sx={{ color: 'text.primary', fontWeight: 'bold', fontSize: '1rem' }}>Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentMarks.map((mark, index) => {
              const percentage = ((mark.obtainedMarks / mark.totalMarks) * 100).toFixed(1);
              const isGoodScore = percentage >= 50;
              return (
                <TableRow 
                  key={mark._id || index} 
                  sx={{ 
                    '&:hover': { backgroundColor: '#f9f9f9', transition: 'background-color 0.2s ease' }, 
                    '&:last-child td': { borderBottom: 0 } 
                  }}
                >
                  <TableCell sx={{ color: 'text.primary', fontWeight: '500' }}>
                    {mark.subjectId?.subName || mark.subjectId || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>{mark.assessmentType || 'N/A'}</TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>{mark.topic || 'N/A'}</TableCell>
                  <TableCell sx={{ color: 'text.primary' }}>
                    {mark.date ? new Date(mark.date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ 
                      fontWeight: 'bold', 
                      color: isGoodScore ? 'success.main' : 'error.main' 
                    }}>
                      {mark.obtainedMarks}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: '500' }}>
                    {mark.totalMarks}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ 
                      fontWeight: 'bold', 
                      color: isGoodScore ? 'success.main' : 'error.main' 
                    }}>
                      {percentage}%
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    );

    return (
      <Box sx={{ py: 2 }}>
        {/* Summary Cards */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
            Academic Performance
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              { title: 'Total Assessments', value: summaryStats.totalAssessments, color: 'primary.main' },
              { 
                title: 'Average Score', 
                value: `${averagePercentage}%`, 
                color: averagePercentage >= 50 ? 'success.main' : 'error.main' 
              },
              { title: 'Highest Score', value: summaryStats.highestScore, color: 'primary.main' },
              { title: 'Total Subjects', value: totalSubjects, color: 'primary.main' },
            ].map((card, idx) => (
              <Grid item xs={6} sm={6} md={3} key={idx}>
                <Card elevation={2} sx={{ p: 2, textAlign: 'center', border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    {card.title}
                  </Typography>
                  <Typography variant="h5" sx={{ color: card.color, fontWeight: 'bold', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                    {card.value}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Marks Display */}
        {isMobile ? (
          <Box>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: '600', mb: 2 }}>
              Assessment Results
            </Typography>
            {studentMarks.map((mark, index) => (
              <MobileMarksCard key={mark._id || index} mark={mark} />
            ))}
          </Box>
        ) : (
          <DesktopMarksTable />
        )}
      </Box>
    );
  };

  const StudentDetailsSection = () => {
    if (!userDetails) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6">No student found.</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ py: 2 }}>
        {/* Profile Header with Avatar */}
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
              <Avatar
                alt="Student Avatar"
                src={userDetails?.profileImage?.url || ''}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  fontSize: '3rem',
                  bgcolor: 'primary.main',
                }}
              >
                {userDetails?.name?.charAt(0)}
              </Avatar>

              <Typography variant="h4" gutterBottom textAlign="center">
                {userDetails?.name || 'N/A'}
              </Typography>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Roll No: {userDetails?.rollNum || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Class: {userDetails?.sclassName?.sclassName || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                School: {userDetails?.school?.schoolName || 'N/A'}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Personal Information Cards */}
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
                        {userDetails?.dob ? new Date(userDetails.dob).toDateString() : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Guardian's Name</Typography>
                      <Typography variant="body1">{userDetails?.fatherName || 'N/A'}</Typography>
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
                      <Typography variant="body1">{userDetails?.phoneNumber || 'N/A'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ContactEmergency sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">Emergency Contact</Typography>
                      <Typography variant="body1">{userDetails?.emergencyContact || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Credentials Card */}
          <Grid item xs={12}>
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  <Lock sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Account Credentials
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={email}
                      variant="outlined"
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                           
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-root': {
                          backgroundColor: green[50],
                          '& .MuiInputBase-input': {
                            color: 'text.primary',
                            WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                          }
                        }
                      }}
                      helperText="Click eye icon to view password"
                    />
                  </Grid>
                </Grid>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                  These credentials are used by the student to log into their account.
                </Typography>
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
                <Typography variant="body1">{userDetails?.address || 'N/A'}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Admission Date: {userDetails?.createdAt ? new Date(userDetails.createdAt).toDateString() : 'N/A'}
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
                    {formatPctForDisplay(overallAttendancePercentage)}
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

        {/* Action Buttons - UPDATED WITH HEALTH BUTTON */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            sx={styles.styledButton} 
            onClick={openEditDialog}
            startIcon={<Edit />}
            size="large"
          >
            Edit Student
          </Button>
          
          {/* NEW: Manage Health Button */}
          <Button 
            variant="contained" 
            sx={{
              ...styles.styledButton,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              },
            }}
            onClick={handleManageHealth}
            startIcon={<LocalHospital />}
            size="large"
          >
            Manage Health
          </Button>
          
          <Button 
            variant="contained" 
            color="error" 
            onClick={deleteHandler}
            startIcon={<DeleteIcon />}
            size="large"
          >
            Delete Student
          </Button>
        </Box>
      </Box>
    );
  };

  // Handle loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading student details...</Typography>
      </Box>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading student details: {error}
        </Alert>
        <Button variant="contained" onClick={() => dispatch(getUserDetails(studentID, address))}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <TabList
              onChange={handleChange}
              centered
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1100,
                bgcolor: 'background.paper',
              }}
            >
              <Tab label="Details" value="1" />
              <Tab label="Attendance" value="2" />
              <Tab label="Marks" value="3" />
              <Tab label="Health" value="4" />
            </TabList>
          </Box>
          <Container sx={{ py: 3, mb: 8 }}>
            <TabPanel value="1" sx={{ px: 0 }}>
              <StudentDetailsSection />
            </TabPanel>
            <TabPanel value="2" sx={{ px: 0 }}>
              <StudentAttendanceSection />
            </TabPanel>
            <TabPanel value="3" sx={{ px: 0 }}>
              <StudentMarksSection />
            </TabPanel>
            <TabPanel value="4" sx={{ px: 0 }}>
  <StudentHealthDisplay 
    studentId={studentID}
    userRole={currentUser?.role}
    canEdit={true}
    onEditClick={handleManageHealth}
  />
</TabPanel>
          </Container>
        </TabContext>
      </Box>

      {/* Edit Student Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={closeEditDialog} 
        maxWidth="md" 
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Typography variant="h5" color="primary">
            <Edit sx={{ mr: 1, verticalAlign: 'middle' }} />
            Edit Student Details
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={submitHandler}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  value={rollNum}
                  onChange={(e) => setRollNum(e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DateRange color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Guardian's Name"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ContactEmergency color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  multiline
                  rows={3}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <LocationOn color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      backgroundColor: green[50],
                      '& .MuiInputBase-input': {
                        color: 'text.primary',
                        WebkitTextFillColor: 'rgba(0, 0, 0, 0.87)',
                      }
                    }
                  }}
                  helperText="Click eye icon to view password"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password (optional)"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText="Leave blank to keep current password"
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={closeEditDialog}
            variant="outlined" 
            startIcon={<Cancel />}
            size="large"
          >
            Cancel
          </Button>
          <Button 
            onClick={submitHandler}
            variant="contained" 
            sx={styles.styledButton}
            startIcon={<Save />}
            size="large"
          >
            Update Student
          </Button>
        </DialogActions>
      </Dialog>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ViewStudent;

const styles = {
  styledButton: {
    backgroundColor: '#000000ff',
    '&:hover': {
      backgroundColor: '#1565c0',
    },
  },
};
                     