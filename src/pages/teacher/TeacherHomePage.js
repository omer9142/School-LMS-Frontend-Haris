import React, { useEffect, useMemo, useState } from 'react';
import { Container, Grid, Paper, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, useMediaQuery, useTheme } from '@mui/material';
import SeeNotice from '../../components/SeeNotice';
import CountUp from 'react-countup';
import styled from 'styled-components';
import Students from "../../assets/img1.png";
import SubjectsIcon from "../../assets/subjects.svg"; 
import ClassesIcon from "../../assets/classroomIcon.png";
import { getClassStudents, getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import { useDispatch, useSelector } from 'react-redux';
import WelcomeImage from "../../assets/student-welcome.png";
import { getTeacherTimetable } from '../../redux/timetableRelated/timetableHandle';
import { Person, Schedule } from '@mui/icons-material';
import ScrollToTop from '../../components/ScrollToTop'; // Import ScrollToTop

const TeacherHomePage = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { sclassStudents } = useSelector((state) => state.sclass);
  const { timetable, loading } = useSelector((state) => state.timetable);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Teacher classes
  const teacherClasses = useMemo(() => {
    if (!currentUser) return [];
    const raw = currentUser.teachSclass;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  }, [currentUser]);

  const classIDs = useMemo(
    () => teacherClasses.map(c => (typeof c === 'string' ? c : (c._id || c))).filter(Boolean),
    [teacherClasses]
  );

  const [selectedClassId, setSelectedClassId] = useState(classIDs[0] || null);

  useEffect(() => {
    if (!selectedClassId && classIDs.length > 0) setSelectedClassId(classIDs[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classIDs.join(',')]);

  // Fetch class students and class details
  useEffect(() => {
    if (selectedClassId) {
      dispatch(getClassStudents(selectedClassId));
      dispatch(getClassDetails(selectedClassId));
    }
  }, [dispatch, selectedClassId]);

  // Fetch teacher timetable
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getTeacherTimetable(currentUser._id));
    }
  }, [dispatch, currentUser]);

  const numberOfStudents = Array.isArray(sclassStudents) ? sclassStudents.length : 0;
  const numberOfSubjects = Array.isArray(currentUser?.teachSubject) ? currentUser.teachSubject.length : 0;
  const numberOfClasses = Array.isArray(currentUser?.teachSclass) ? currentUser.teachSclass.length : 0;

  // Timetable data processing
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];
  const fullPeriods = ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6", "Period 7", "Period 8"];

  const createTimetableGrid = () => {
    const grid = {};

    days.forEach(day => {
      grid[day] = {};
      periods.forEach((_, index) => {
        grid[day][index + 1] = { free: true };
      });
    });

    timetable?.forEach(slot => {
      if (grid[slot.day] && grid[slot.day][slot.periodNumber]) {
        grid[slot.day][slot.periodNumber] = {
          free: false,
          subject: slot.subjectName,
          className: slot.classId?.sclassName || "N/A",
          period: slot.periodNumber
        };
      }
    });

    return grid;
  };

  const timetableGrid = createTimetableGrid();

  // Get current day and period for highlighting
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

  // Beautiful Timetable Table Component matching the timetable page UI
  const TimetableTable = () => {
    if (loading) {
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
            Your teaching schedule will appear here once assigned.
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
                  const periodNumber = periodIndex + 1;
                  const slot = timetableGrid[day] && timetableGrid[day][periodNumber];
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
                      {slot && !slot.free ? (
                        <Box>
                          <Chip
                            label={slot.subject}
                            size={isTablet ? "small" : "medium"}
                            sx={{
                              bgcolor: '#e8f5e8',
                              color: '#2e7d32',
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
                            {slot.className}
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
      <ScrollToTop /> {/* Add ScrollToTop here */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <WelcomeCard>
              <WelcomeContent>
                <div>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "bold", mb: 1, mt: -1, color: "black" }}
                  >
                    Hey {currentUser?.name || "Teacher"}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "#666", fontFamily: "poppins" }}
                  >
                    Welcome!
                  </Typography>
                </div>
                <TeacherAvatar>
                  <img
                    src={WelcomeImage}
                    alt="Welcome"
                    style={{
                      width: "100px",
                      height: "140px",
                      objectFit: "cover",
                    }}
                  />
                </TeacherAvatar>
              </WelcomeContent>
            </WelcomeCard>
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <CardIcon src={Students} alt="Students" />
              <Title>Class Students</Title>
              <Data start={0} end={numberOfStudents} duration={0.1} />
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <CardIcon src={SubjectsIcon} alt="Subjects" />
              <Title>Total Subjects</Title>
              <Data start={0} end={numberOfSubjects} duration={0.1} />
            </StyledPaper>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledPaper>
              <CardIcon src={ClassesIcon} alt="Classes" />
              <Title>Total Classes</Title>
              <Data start={0} end={numberOfClasses} duration={0.1} />
            </StyledPaper>
          </Grid>
          
          {/* Timetable Section */}
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
                  Weekly Teaching Schedule
                </Typography>
              </Box>
              <TimetableTable />
            </Paper>
          </Grid>
          
          {/* Notices Section */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              borderRadius: '12px', 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' 
            }}>
              <SeeNotice classId={selectedClassId} />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

// Styled components matching student dashboard
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

const TeacherAvatar = styled.div`
  display: flex;
  align-items: center;
`;

const StyledPaper = styled(Paper)`
  padding: 24px;
  height: 200px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const CardIcon = styled.img`
  width: 50px;
  height: 50px;
  object-fit: contain;
`;

const Title = styled.p`
  font-size: 1.25rem;
  margin: 8px 0;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

export default TeacherHomePage;