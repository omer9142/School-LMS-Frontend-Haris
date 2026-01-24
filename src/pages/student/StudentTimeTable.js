import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentTimetable } from '../../redux/studentRelated/studentHandle';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Avatar,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import { 
  Schedule, 
  Class, 
  Person,
  ArrowBackIos,
  ArrowForwardIos 
} from '@mui/icons-material';
import ScrollToTop from '../../components/ScrollToTop';

// Constants outside component
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"];
const FULL_PERIODS = [
  "Period 1", "Period 2", "Period 3", "Period 4", 
  "Period 5", "Period 6", "Period 7", "Period 8"
];

// Memoized components
const TimetableCell = React.memo(({ cellData, isCurrent, isTablet, periodIndex }) => {
  if (!cellData) {
    return (
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
    );
  }

  return (
    <Box>
      <Chip
        label={cellData.subject}
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
        {cellData.className}
      </Typography>
      {isCurrent && (
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mt: 0.5, 
            color: '#000000ff',
            fontWeight: 'bold',
            fontSize: { xs: '0.6rem', sm: '0.7rem' }
          }}
        >
          Current
        </Typography>
      )}
    </Box>
  );
});

const MobileDayView = React.memo(({ day, timetableGrid, currentPeriod, currentDay }) => (
  <Box>
    <Card sx={{ mb: 2, bgcolor: 'primary.main', color: 'white' }}>
      <CardContent sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {day}
        </Typography>
        {day === currentDay && (
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Today
          </Typography>
        )}
      </CardContent>
    </Card>

    {PERIODS.map((period, periodIndex) => {
      const periodNumber = periodIndex + 1;
      const slot = timetableGrid[day] && timetableGrid[day][periodNumber];
      const isCurrent = day === currentDay && periodNumber === currentPeriod;
      
      return (
        <Card 
          key={periodIndex}
          sx={{ 
            mb: 2,
            border: isCurrent ? '2px solid' : '1px solid',
            borderColor: isCurrent ? 'primary.main' : 'divider',
            bgcolor: isCurrent ? 'primary.light' : 'background.paper'
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {FULL_PERIODS[periodIndex]}
                </Typography>
                {slot && !slot.free ? (
                  <Box mt={1}>
                    <Chip
                      label={slot.subject}
                      size="small"
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      Class: {slot.className}
                    </Typography>
                  </Box>
                ) : (
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    fontStyle="italic"
                    mt={1}
                  >
                    Free Period
                  </Typography>
                )}
              </Box>
              {isCurrent && (
                <Chip 
                  label="Now" 
                  size="small" 
                  color="secondary" 
                  variant="filled"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      );
    })}
  </Box>
));

const StudentTimetable = () => {
  const dispatch = useDispatch();
  const { loading, error, timetable } = useSelector((state) => state.student);
  const { currentUser } = useSelector((state) => state.user);
  const studentId = currentUser?._id;
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [selectedDay, setSelectedDay] = useState(0);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // Memoize current day and period calculations
  const { currentDay, currentPeriod } = useMemo(() => {
    const today = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = dayNames[today.getDay()];
    
    const hour = today.getHours();
    let currentPeriod = null;
    if (hour >= 8 && hour < 9) currentPeriod = 1;
    else if (hour >= 9 && hour < 10) currentPeriod = 2;
    else if (hour >= 10 && hour < 11) currentPeriod = 3;
    else if (hour >= 11 && hour < 12) currentPeriod = 4;
    else if (hour >= 13 && hour < 14) currentPeriod = 5;
    else if (hour >= 14 && hour < 15) currentPeriod = 6;
    else if (hour >= 15 && hour < 16) currentPeriod = 7;
    else if (hour >= 16 && hour < 17) currentPeriod = 8;
    
    return { currentDay, currentPeriod };
  }, []);

  // Optimize timetable grid creation
  const timetableGrid = useMemo(() => {
    const grid = {};
    
    DAYS.forEach(day => {
      grid[day] = {};
      PERIODS.forEach((_, index) => {
        grid[day][index + 1] = { free: true };
      });
    });

    timetable?.forEach(slot => {
      if (grid[slot.day] && grid[slot.day][slot.periodNumber]) {
        grid[slot.day][slot.periodNumber] = {
          free: false,
          subject: slot.subjectName,
          className: slot.classId?.sclassName || currentUser?.sclassName?.sclassName || "N/A",
          period: slot.periodNumber
        };
      }
    });

    return grid;
  }, [timetable, currentUser]);

  // Optimize handler functions
  const handleDayChange = useCallback((event, newValue) => {
    setSelectedDay(newValue);
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDay((prev) => (prev + 1) % DAYS.length);
  }, []);

  const handlePrevDay = useCallback(() => {
    setSelectedDay((prev) => (prev - 1 + DAYS.length) % DAYS.length);
  }, []);

  // Optimize cell data function
  const getCellData = useCallback((day, periodIndex) => {
    const periodNumber = periodIndex + 1;
    const slot = timetableGrid[day] && timetableGrid[day][periodNumber];
    
    if (!slot || slot.free) return null;
    return {
      subject: slot.subject,
      className: slot.className
    };
  }, [timetableGrid]);

  // Check if slot is current
  const isCurrentSlot = useCallback((day, periodIndex) => {
    return day === currentDay && (periodIndex + 1) === currentPeriod;
  }, [currentDay, currentPeriod]);

  useEffect(() => {
    if (studentId) {
      dispatch(getStudentTimetable(studentId));
    }
  }, [dispatch, studentId]);

  useEffect(() => {
    const today = new Date().getDay();
    const adjustedIndex = today === 0 ? 0 : today - 1;
    setCurrentDayIndex(adjustedIndex);
    setSelectedDay(adjustedIndex);
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="400px"
        sx={{ background: 'black' }}
      >
        <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'white' }}>
          Loading your timetable...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Card sx={{ backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
          <CardContent sx={{ textAlign: 'center', p: 3 }}>
            <Typography color="error" variant="h6" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Box sx={{ 
        p: { xs: 1, sm: 2, md: 4 }, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh'
      }}>
        {/* Header Section */}
        <Card sx={{ mb: 3, background: 'black', color: 'white' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: { xs: 40, sm: 56 }, 
                height: { xs: 40, sm: 56 } 
              }}>
                <Schedule sx={{ fontSize: { xs: 24, sm: 32 } }} />
              </Avatar>
              <Box>
                <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                  Class Timetable
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Weekly schedule for {currentUser?.name || 'Student'}
                </Typography>
              </Box>
            </Box>
            
            {currentDay !== 'Sunday' && currentDay !== 'Saturday' && (
              <Chip 
                label={`Today is ${currentDay}`}
                size={isMobile ? "small" : "medium"}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
          </CardContent>
        </Card>

        {(!timetable || timetable.length === 0) ? (
          <Card sx={{ textAlign: 'center', p: { xs: 3, sm: 6 } }}>
            <Class sx={{ fontSize: { xs: 60, sm: 80 }, color: '#bdbdbd', mb: 2 }} />
            <Typography variant={isMobile ? "h6" : "h5"} color="textSecondary" gutterBottom>
              No Timetable Available
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Your class timetable hasn't been created yet. Please contact your administrator.
            </Typography>
          </Card>
        ) : isMobile ? (
          // Mobile View - Single Day at a time
          <Box>
            {/* Day Navigation */}
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <IconButton onClick={handlePrevDay} size="small">
                    <ArrowBackIos fontSize="small" />
                  </IconButton>
                  
                  <Tabs
                    value={selectedDay}
                    onChange={handleDayChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ minHeight: 'auto' }}
                  >
                    {DAYS.map((day, index) => (
                      <Tab 
                        key={index}
                        label={day.substring(0, 3)}
                        sx={{ 
                          minWidth: 'auto', 
                          px: 1.5,
                          fontSize: '0.8rem',
                          minHeight: '40px',
                        }}
                      />
                    ))}
                  </Tabs>
                  
                  <IconButton onClick={handleNextDay} size="small">
                    <ArrowForwardIos fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>

            {/* Mobile Day Schedule */}
            <MobileDayView 
              day={DAYS[selectedDay]} 
              timetableGrid={timetableGrid}
              currentPeriod={currentPeriod}
              currentDay={currentDay}
            />
          </Box>
        ) : (
          // Desktop/Tablet View - Full Timetable
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: isTablet ? 500 : 'none' }}>
                <Table 
                  sx={{ 
                    '& .MuiTableCell-root': { 
                      borderColor: '#e0e0e0',
                      py: { xs: 1, sm: 1.5, md: 2.5 }
                  } 
                }}
                size={isTablet ? "small" : "medium"}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.1rem' },
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
                    {PERIODS.map((period, index) => (
                      <TableCell 
                        key={index} 
                        align="center"
                        sx={{ 
                          fontWeight: 'bold', 
                          fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.95rem' },
                          py: 2,
                          minWidth: { xs: 60, sm: 80, md: 100 }
                        }}
                      >
                        {isTablet ? period : FULL_PERIODS[index]}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {DAYS.map((day, dayIndex) => (
                    <TableRow 
                      key={dayIndex}
                      sx={{ 
                        '&:hover': { bgcolor: '#f8f9fa' }
                      }}
                    >
                      <TableCell 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                          py: 2,
                          borderRight: '2px solid #e0e0e0',
                          bgcolor: '#f5f5f5'
                        }}
                      >
                        {day}
                      </TableCell>
                      {PERIODS.map((period, periodIndex) => {
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
                            <TimetableCell 
                              cellData={cellData}
                              isCurrent={isCurrent}
                              isTablet={isTablet}
                              periodIndex={periodIndex}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Footer Info */}
      <Card sx={{ mt: 3, bgcolor: '#f8f9fa' }}>
        <CardContent sx={{ py: 1.5 }}>
          <Typography 
            variant="body2" 
            color="textSecondary" 
            align="center"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            Timetable updates automatically. Contact administration for any schedule changes.
          </Typography>
        </CardContent>
      </Card>
      </Box>
    </>
  );
};

export default React.memo(StudentTimetable);