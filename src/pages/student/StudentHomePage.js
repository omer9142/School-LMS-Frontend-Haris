import React, { useEffect, useState } from "react";
import { Container, Grid, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { calculateOverallAttendancePercentage } from "../../components/attendanceCalculator";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { getUserDetails } from "../../redux/userRelated/userHandle";
import { getSubjectList } from "../../redux/sclassRelated/sclassHandle";
import { getStudentAttendance, getStudentTimetable } from "../../redux/studentRelated/studentHandle";
import styled from "styled-components";
import SeeNotice from "../../components/SeeNotice";
import WelcomeImage from "../../assets/student-welcome.png";
import ScrollToTop from "../../components/ScrollToTop";
import { Person, Schedule } from '@mui/icons-material';

const COLORS = ["#1e4f8fff", "#c51e1eff"];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];
const fullPeriods = ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6", "Period 7", "Period 8"];

const StudentHomePage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const { userDetails, currentUser, loading, response } = useSelector((state) => state.user);
  const { subjectsList } = useSelector((state) => state.sclass);
  const { attendance, timetable, loading: timetableLoading } = useSelector((state) => state.student);

  const [subjectAttendance, setSubjectAttendance] = useState([]);

  const classID = currentUser.sclassName._id;
  const studentId = currentUser?._id;

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getUserDetails(currentUser._id, "Student"));
      dispatch(getSubjectList(classID, "ClassSubjects"));
      dispatch(getStudentAttendance(currentUser._id));
      dispatch(getStudentTimetable(currentUser._id));
    }
  }, [dispatch, currentUser?._id, classID]);

  useEffect(() => {
    if (attendance && attendance.length > 0) {
      setSubjectAttendance(attendance);
    }
  }, [attendance]);

  // Timetable helper functions
  const getCellData = (day, periodIndex) => {
    const entry = timetable?.find(
      (t) => t.day === day && t.periodNumber === periodIndex + 1
    );
    if (!entry) return null;
    return {
      subject: entry.subjectName || "Unknown Subject",
      className: entry.classId?.sclassName || currentUser?.sclassName?.sclassName || "N/A"
    };
  };

  const getCurrentDay = () => {
    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[today.getDay()];
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 8 && hour < 9) return 1;
    if (hour >= 9 && hour < 10) return 2;
    if (hour >= 10 && hour < 11) return 3;
    if (hour >= 11 && hour < 12) return 4;
    if (hour >= 13 && hour < 14) return 5;
    if (hour >= 14 && hour < 15) return 6;
    if (hour >= 15 && hour < 16) return 7;
    if (hour >= 16 && hour < 17) return 8;
    return null;
  };

  const isCurrentSlot = (day, periodIndex) => {
    const currentDay = getCurrentDay();
    const currentPeriod = getCurrentPeriod();
    return day === currentDay && (periodIndex + 1) === currentPeriod;
  };

  const overallAttendancePercentage = calculateOverallAttendancePercentage(subjectAttendance);
  const overallAbsentPercentage = 100 - overallAttendancePercentage;

  const chartData = [
    { name: "Present", value: overallAttendancePercentage },
    { name: "Absent", value: overallAbsentPercentage },
  ];

  // Timetable Table Component (Updated to match teacher homepage)
  const TimetableTable = () => {
    if (timetableLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" py={6}>
          <Typography variant="h6" color="textSecondary">
            Loading timetable...
          </Typography>
        </Box>
      );
    }

    if (!timetable || timetable.length === 0) {
      return (
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={6}>
          <Schedule sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Timetable Assigned
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your class schedule will appear here once assigned.
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer 
        sx={{ 
          borderRadius: 2, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          maxHeight: isTablet ? 500 : 'none'
        }}
      >
        <Table 
          sx={{ 
            '& .MuiTableCell-root': { 
              borderColor: '#e0e0e0',
              py: { xs: 1, sm: 1.5, md: 2 }
            } 
          }}
          size={isTablet ? "small" : "medium"}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: '#fafafa' }}>
              <TableCell 
                sx={{ 
                  fontWeight: 'bold', 
                  fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                  py: 2,
                  borderRight: '2px solid #e0e0e0',
                  minWidth: { xs: 80, sm: 100, md: 120 }
                }}
              >
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Person sx={{ fontSize: { xs: 16, sm: 20 }, color: '#666' }} />
                  <Typography variant="inherit">
                    Day / Period
                  </Typography>
                </Box>
              </TableCell>
              {periods.map((period, index) => (
                <TableCell 
                  key={index} 
                  align="center"
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                    py: 2,
                    minWidth: { xs: 60, sm: 80, md: 100 }
                  }}
                >
                  {isTablet ? period : fullPeriods[index]}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {days.map((day, dayIndex) => (
              <TableRow 
                key={dayIndex}
                sx={{ 
                  '&:hover': { bgcolor: '#f8f9fa' }
                }}
              >
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem' },
                    py: 2,
                    borderRight: '2px solid #e0e0e0',
                    bgcolor: '#f5f5f5'
                  }}
                >
                  {day}
                </TableCell>
                {periods.map((period, periodIndex) => {
                  const cellData = getCellData(day, periodIndex);
                  const isCurrent = isCurrentSlot(day, periodIndex);
                  
                  return (
                    <TableCell 
                      key={periodIndex} 
                      align="center"
                      sx={{ 
                        py: 2,
                        position: 'relative',
                        bgcolor: isCurrent ? '#e3f2fd' : 'inherit',
                        border: isCurrent ? '2px solid #1976d2' : 'inherit'
                      }}
                    >
                      {cellData ? (
                        <Box>
                          <Chip
                            label={cellData.subject}
                            size={isTablet ? "small" : "medium"}
                            sx={{
                              bgcolor: cellData.subject === 'Unknown Subject' ? '#ffebee' : '#e8f5e8',
                              color: cellData.subject === 'Unknown Subject' ? '#d32f2f' : '#2e7d32',
                              fontWeight: 'medium',
                              mb: 0.5,
                              fontSize: { xs: '0.7rem', sm: '0.8rem' },
                              maxWidth: '100%',
                              '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }
                            }}
                          />
                          <Typography 
                            variant="caption" 
                            display="block" 
                            color="textSecondary"
                            sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
                          >
                            {cellData.className}
                          </Typography>
                          {isCurrent && (
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block', 
                                mt: 0.5, 
                                color: '#1976d2',
                                fontWeight: 'bold',
                                fontSize: { xs: '0.6rem', sm: '0.7rem' }
                              }}
                            >
                              Current
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#bdbdbd',
                            fontStyle: 'italic',
                            fontSize: { xs: '0.7rem', sm: '0.8rem' }
                          }}
                        >
                          Free
                        </Typography>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <ScrollToTop />
      <Container maxWidth="lg" sx={{ mt: 1, mb: 4, mt: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <WelcomeCard>
              <WelcomeContent>
                <div>
                  <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1, mt:-1, color: "black" }}>
                    Hey {currentUser?.name || "Student"}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: "#666", fontFamily: "poppins" }}>
                    Welcome!
                  </Typography>
                </div>
                <StudentAvatar>
                  <img
                    src={WelcomeImage}
                    alt="Welcome"
                    style={{ width: "100px", height: "140px", objectFit: "cover" }}
                  />
                </StudentAvatar>
              </WelcomeContent>
            </WelcomeCard>
          </Grid>

          {/* Attendance Chart */}
          <Grid item xs={12} md={6}>
            <AttendanceCard>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Attendance Overview
              </Typography>
              <ChartContainer>
                {response ? (
                  <Typography variant="body1" sx={{ textAlign: "center" }}>
                    No Attendance Found
                  </Typography>
                ) : loading ? (
                  <Typography variant="body1" sx={{ textAlign: "center" }}>
                    Loading...
                  </Typography>
                ) : subjectAttendance && subjectAttendance.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ textAlign: "center", mt: 2 }}>
                      <Typography variant="h6" color="textSecondary">
                        Overall Attendance: {overallAttendancePercentage}%
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: "center" }}>
                    No Attendance Found
                  </Typography>
                )}
              </ChartContainer>
            </AttendanceCard>
          </Grid>

          {/* Notifications Panel */}
           <Grid item xs={12} md={6}>
            <NotificationCard>
              <NoticeContainer>
                <SeeNotice />
              </NoticeContainer>
            </NotificationCard>
          </Grid>

          {/* Timetable Section - UPDATED */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              borderRadius: '12px', 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #ffffffff 100%)'
            }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Schedule sx={{ fontSize: 32, color: 'black' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black' }}>
                  My Class Timetable
                </Typography>
              </Box>
              <TimetableTable />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

const WelcomeCard = styled(Paper)`
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 8px;
`;

const WelcomeContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StudentAvatar = styled.div`
  display: flex;
  align-items: center;
`;

const AttendanceCard = styled(Paper)`
  padding: 24px;
  height: 100%;
  min-height: 350px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const ChartContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const NotificationCard = styled(Paper)`
  padding: 24px;
  height: 100%;
  min-height: 350px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  @media (max-width: 600px) {
    padding: 16px;
    min-height: auto;
    max-width: 100vw;
    margin-left: -8px;
    margin-right: -8px;
    border-radius: 0;
    box-shadow: none;
  }
`;

const NoticeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  
  @media (max-width: 600px) {
    overflow-x: hidden;
    width: 100%;
    
    /* Target the SeeNotice component's content */
    & > div {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }
    
    /* Target tables or wide content inside notices */
    & table {
      width: 100% !important;
      max-width: 100% !important;
      table-layout: fixed;
    }
    
    /* Target any content that might be causing overflow */
    & * {
      max-width: 100%;
      overflow-wrap: break-word;
      word-wrap: break-word;
    }
  }
`;

export default StudentHomePage;