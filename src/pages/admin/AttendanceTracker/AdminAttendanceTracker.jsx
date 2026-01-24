import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Alert,
  Grid,
  TextField,
  useTheme,
  useMediaQuery,
  alpha,
  Container,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  CalendarToday,
  School,
  Person,
  AccessTime,
  Refresh,
  TrendingUp,
  Visibility,
  Close,
  PersonOutline,
  Schedule,
} from "@mui/icons-material";

import { useSelector, useDispatch } from "react-redux";
import { 
  getDailyAttendanceTracker,
  getClassAttendanceDetails 
} from "../../../redux/AttendanceTracker/attendanceTrackerHandle";

const AdminAttendanceTracker = () => {
  const dispatch = useDispatch();
  const { dailyTracker, loading, error } = useSelector(
    (state) => state.attendanceTracker
  );
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedClassDetails, setSelectedClassDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    dispatch(getDailyAttendanceTracker(selectedDate));
  }, [dispatch, selectedDate]);

  const handleRefresh = () => {
    dispatch(getDailyAttendanceTracker(selectedDate));
  };

  const handleViewDetails = async (classData) => {
    setDetailsDialogOpen(true);
    setLoadingDetails(true);
    
    try {
      console.log("Fetching details for class:", classData.classId, "date:", selectedDate);
      
      // Use Redux action with proper authentication
      const response = await dispatch(getClassAttendanceDetails(classData.classId, selectedDate));
      
      console.log("Received response:", response);
      
      setSelectedClassDetails({
        ...classData,
        trackerInfo: response.trackerInfo,
        attendanceRecords: response.attendanceRecords || []
      });
    } catch (err) {
      console.error("Error fetching class details:", err);
      setSelectedClassDetails({
        ...classData,
        trackerInfo: null,
        attendanceRecords: []
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedClassDetails(null);
  };

  const takenCount = dailyTracker.filter((c) => c.status === "Taken").length;
  const notTakenCount = dailyTracker.filter((c) => c.status === "Not Taken").length;
  const totalClasses = dailyTracker.length;
  const completionRate = totalClasses > 0 
    ? Math.round((takenCount / totalClasses) * 100) 
    : 0;

  const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          boxShadow: theme.shadows[8],
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center">
              <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Attendance Tracker
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Monitor daily attendance across all classes
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Date Selector & Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: "100%", boxShadow: theme.shadows[2] }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CalendarToday sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Select Date
                </Typography>
              </Box>
              <TextField
                type="date"
                fullWidth
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {formattedDate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Classes Table */}
      <Card sx={{ boxShadow: theme.shadows[3] }}>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 3,
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Classes Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalClasses} total classes
            </Typography>
          </Box>

          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead sx={{ bgcolor: alpha(theme.palette.grey[500], 0.1) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {isMobile ? "Class" : "Class Name"}
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {isMobile ? "Teacher" : (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <Person fontSize="medium" />
                        Class Teacher
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    {isMobile ? "Time" : (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AccessTime fontSize="medium" />
                        Marked At
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    <Tooltip title="Number of times attendance was taken">
                      <Box display="flex" alignItems="center" justifyContent="left" marginLeft={2} >
                        {isMobile ? "Times" : "Times Taken"}
                      </Box>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailyTracker.length > 0 ? (
                  dailyTracker.map((classData) => {
                    const timesTakenValue = classData.timesTaken || 0;
                    
                    return (
                      <TableRow
                        key={classData.classId}
                        sx={{
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <School color="primary" fontSize="small" />
                            <Typography variant="body2" fontWeight="medium">
                              {classData.className}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {classData.classTeacher}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {classData.status === "Taken" ? (
                            <Chip
                              icon={<CheckCircle />}
                              label="Taken"
                              color="success"
                              size="small"
                              sx={{ fontWeight: "bold" }}
                            />
                          ) : (
                            <Chip
                              icon={<Cancel />}
                              label="Not Taken"
                              color="error"
                              size="small"
                              sx={{ fontWeight: "bold" }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {classData.markedAt ? (
                            <Typography variant="body2" color="text.secondary">
                              {new Date(classData.markedAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.disabled">
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                            <Chip
                              label={timesTakenValue}
                              size="small"
                              variant="outlined"
                              color={timesTakenValue > 0 ? "success" : "default"}
                              sx={{ fontWeight: "bold", minWidth: "40px" }}
                            />
                            <Box sx={{ width: "85px", display: "flex", justifyContent: "flex-start" }}>
                              {timesTakenValue > 0 && (
                                <Button
                                  size="medium"
                                  variant="outlined"
                                  onClick={() => handleViewDetails(classData)}
                                  sx={{
                                    fontSize: "0.7rem",
                                    textTransform: "none",
                                    px: 1.5,
                                    py: 0.5,
                                    minWidth: "auto",
                                  }}
                                >
                                  View More
                                </Button>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <School
                        sx={{
                          fontSize: 64,
                          color: "text.disabled",
                          mb: 2,
                        }}
                      />
                      <Typography variant="h6" color="text.secondary">
                        No classes found
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        There are no classes registered in the system
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.mode === "dark" ? "#1a1a1a" : "#fff",
            minHeight: "70vh",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.mode === "dark" ? "#000" : "#f5f5f5",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Attendance Details
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          sx={{ 
            p: 0,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "10px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: alpha(theme.palette.grey[500], 0.1),
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: alpha(theme.palette.grey[500], 0.4),
              borderRadius: "5px",
              "&:hover": {
                bgcolor: alpha(theme.palette.grey[500], 0.6),
              },
            },
          }}
        >
          {loadingDetails ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          ) : selectedClassDetails ? (
            <Grid container sx={{ minHeight: "500px" }}>
              {/* Left Side - Tracker Info */}
              <Grid
                item
                xs={12}
                md={5}
                sx={{
                  bgcolor: theme.palette.mode === "dark" ? "#0a0a0a" : "#fafafa",
                  borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  p: 3,
                }}
              >
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Class Information
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="caption" color="text.secondary">
                          Class Name
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body1" fontWeight="medium">
                          {selectedClassDetails.className}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ my: 1, borderColor: alpha(theme.palette.divider, 0.3) }} />
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="caption" color="text.secondary">
                          Class Teacher
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body1" fontWeight="medium">
                          {selectedClassDetails.trackerInfo?.teacherName || selectedClassDetails.classTeacher}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ my: 1, borderColor: alpha(theme.palette.divider, 0.3) }} />
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="caption" color="text.secondary">
                          Times Taken Today
                        </Typography>
                      }
                      secondary={
                        <Chip
                          label={selectedClassDetails.trackerInfo?.timesTaken || selectedClassDetails.timesTaken || 0}
                          color="primary"
                          size="small"
                          sx={{ fontWeight: "bold", mt: 0.5 }}
                        />
                      }
                    />
                  </ListItem>
                  <Divider sx={{ my: 1, borderColor: alpha(theme.palette.divider, 0.3) }} />
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="caption" color="text.secondary">
                          Total Students
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body1" fontWeight="medium">
                          {selectedClassDetails.trackerInfo?.totalStudents || selectedClassDetails.attendanceRecords?.length || 0}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ my: 1, borderColor: alpha(theme.palette.divider, 0.3) }} />
                  
                  {/* All Timestamps */}
                  <ListItem sx={{ px: 0, flexDirection: "column", alignItems: "flex-start" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                      Attendance Marked At
                    </Typography>
                    <Box sx={{ width: "100%" }}>
                      {selectedClassDetails.trackerInfo?.markedAtHistory && 
                       selectedClassDetails.trackerInfo.markedAtHistory.length > 0 ? (
                        selectedClassDetails.trackerInfo.markedAtHistory.map((timestamp, index) => (
                          <Box 
                            key={index}
                            sx={{ 
                              display: "flex", 
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            }}
                          >
                            <Schedule fontSize="small" color="primary" />
                            <Typography variant="body2" fontWeight="medium">
                              {new Date(timestamp).toLocaleString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                month: "short",
                                day: "numeric"
                              })}
                            </Typography>
                            {index === 0 && (
                              <Chip 
                                label="First" 
                                size="small" 
                                color="primary"
                                sx={{ ml: "auto", fontSize: "0.7rem", height: "20px" }}
                              />
                            )}
                          </Box>
                        ))
                      ) : selectedClassDetails.markedAtHistory && selectedClassDetails.markedAtHistory.length > 0 ? (
                        // Fallback to classData markedAtHistory if trackerInfo doesn't have it
                        selectedClassDetails.markedAtHistory.map((timestamp, index) => (
                          <Box 
                            key={index}
                            sx={{ 
                              display: "flex", 
                              alignItems: "center",
                              gap: 1,
                              mb: 0.5,
                              p: 1,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            }}
                          >
                            <Schedule fontSize="small" color="primary" />
                            <Typography variant="body2" fontWeight="medium">
                              {new Date(timestamp).toLocaleString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                month: "short",
                                day: "numeric"
                              })}
                            </Typography>
                            {index === 0 && (
                              <Chip 
                                label="First" 
                                size="small" 
                                color="primary"
                                sx={{ ml: "auto", fontSize: "0.7rem", height: "20px" }}
                              />
                            )}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          No timestamps available
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                </List>
              </Grid>

              {/* Right Side - Attendance Records */}
              <Grid item xs={12} md={7} sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Student Attendance
                </Typography>
                <Box>
                  {selectedClassDetails.attendanceRecords && selectedClassDetails.attendanceRecords.length > 0 ? (
                    <List dense>
                      {selectedClassDetails.attendanceRecords.map((record, index) => (
                        <React.Fragment key={record.studentId || index}>
                          <ListItem
                            sx={{
                              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                              borderRadius: 1,
                              mb: 1,
                              bgcolor:
                                record.status === "Present"
                                  ? alpha(theme.palette.success.main, 0.05)
                                  : alpha("#f44336", 0.05),
                            }}
                          >
                            <PersonOutline
                              sx={{
                                mr: 2,
                                color:
                                  record.status === "Present"
                                    ? theme.palette.success.main
                                    : "#f44336",
                              }}
                            />
                            <ListItemText
                              primary={
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Typography variant="body1" fontWeight="medium">
                                    {record.studentName}
                                  </Typography>
                                  <Chip
                                    label={record.status}
                                    size="small"
                                    sx={{
                                      fontWeight: "bold",
                                      bgcolor:
                                        record.status === "Present"
                                          ? theme.palette.success.main
                                          : "#f44336",
                                      color: "#fff",
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  Marked by: {record.markedBy}
                                </Typography>
                              }
                            />
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      minHeight="300px"
                    >
                      <PersonOutline sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No attendance records found
                      </Typography>
                      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                        Students have not been marked for this date
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default AdminAttendanceTracker;