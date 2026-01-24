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
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Alert,
  Grid,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
  Container,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Save,
  CalendarToday,
  Group,
  School,
} from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { getClassStudents } from "../../redux/sclassRelated/sclassHandle";
import api from "../../api"; // Import your configured api instance
import ScrollToTop from '../../components/ScrollToTop'; // Import ScrollToTop

const ClassAttendance = () => {
  const dispatch = useDispatch();
  const { sclassStudents, loading } = useSelector((state) => state.sclass);
  const { currentUser, token } = useSelector((state) => state.user);
  const theme = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const classTeacherClasses = Array.isArray(currentUser?.classTeacherOf)
    ? currentUser.classTeacherOf
    : currentUser?.classTeacherOf
    ? [currentUser.classTeacherOf]
    : [];

  const [selectedClassId, setSelectedClassId] = useState(
    classTeacherClasses.length > 0 ? classTeacherClasses[0]._id : null
  );
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (selectedClassId) {
      dispatch(getClassStudents(selectedClassId));
      setAttendance({});
      setSaveSuccess(false);
    }
  }, [dispatch, selectedClassId]);

  const setStatus = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setSaveSuccess(false);
  };

  const saveAttendance = async () => {
    try {
      if (!selectedClassId) {
        alert("No class selected.");
        return;
      }

      setSaveLoading(true);
      const payload = {
        teacherId: currentUser?._id,
        sclassId: selectedClassId,
        date,
        records: sclassStudents.map((s) => ({
          studentId: s._id,
          status: attendance[s._id] || "Absent",
        })),
      };

      // 🔍 DEBUG: Log the payload and user info
      console.log("=== ATTENDANCE SAVE DEBUG ===");
      console.log("Payload:", payload);
      console.log("Current User:", currentUser);
      console.log("classTeacherOf:", currentUser?.classTeacherOf);
      console.log("Selected Class ID:", selectedClassId);
      console.log("Base URL (from env):", process.env.REACT_APP_BASE_URL);
      console.log("============================");

      // Use the configured api instance instead of axios directly
      const response = await api.post(
        "/Attendance/Mark", // Relative path since baseURL is already configured
        payload
        // No need to manually add headers - api interceptor handles it
      );

      console.log("✅ Success response:", response.data);

      setSaveSuccess(true);
      setAttendance({});
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("❌ Error saving attendance:", err);
      console.error("Error response:", err.response?.data);
      alert(
        `Error saving attendance: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const presentCount = Object.values(attendance).filter(
    (status) => status === "Present"
  ).length;
  const absentCount = Object.values(attendance).filter(
    (status) => status === "Absent"
  ).length;
  const totalCount = sclassStudents?.length || 0;

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

  if (!classTeacherClasses.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            No Class Assignment
          </Typography>
          <Typography variant="body1">
            You are not assigned as a class teacher for any class.
          </Typography>
        </Alert>
      </Container>
    );
  }

  const selectedClass = classTeacherClasses.find(
    (cls) => cls._id === selectedClassId
  );

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Mobile view: Total Students on same line
  const renderTotalStudents = () => (
    <Box textAlign={isMobile ? "left" : "right"}>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {isMobile ? "Total Students:" : "Total Students"}
      </Typography>
      {!isMobile && (
        <Typography variant="h4" fontWeight="bold" color="primary">
          {totalCount}
        </Typography>
      )}
    </Box>
  );

  return (
    <>
      <ScrollToTop /> {/* Add ScrollToTop here */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Card
          sx={{
            mb: 3,
            background: "#000",
            color: "white",
            boxShadow: theme.shadows[8],
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <School sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Class Attendance
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Class Info */}
        {selectedClass && (
          <Card
            sx={{
              mb: 4,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: theme.shadows[2],
            }}
          >
            <CardContent
              sx={{
                py: 2,
                px: 3,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                >
                  Class: {selectedClass.sclassName}
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <CalendarToday fontSize="small" />
                  {formattedDate}
                </Typography>
              </Box>
              {isMobile ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                  <Typography variant="body1" color="text.secondary">
                    Total Students:
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {totalCount}
                  </Typography>
                </Box>
              ) : (
                renderTotalStudents()
              )}
            </CardContent>
          </Card>
        )}

        {/* Mobile Layout: Students Table first, then sidebar */}
        {isMobile ? (
          <Box>
            {/* Students Table - Mobile */}
            <Card sx={{ mb: 3, boxShadow: theme.shadows[3] }}>
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    p: 3,
                    borderBottom: 1,
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Students List
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click Present/Absent to mark attendance for each student
                  </Typography>
                </Box>

                <Box sx={{ width: "100%", overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Student</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Roll No</TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(sclassStudents) && sclassStudents.length > 0 ? (
                        sclassStudents.map((student) => (
                          <TableRow key={student._id}>
                            <TableCell>
                              <Box display="flex" alignItems="center">
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    mr: 1,
                                    bgcolor: theme.palette.primary.main,
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {student.name?.charAt(0) || "S"}
                                </Avatar>
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="medium"
                                  sx={{ fontSize: '0.85rem' }}
                                >
                                  {student.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={student.rollNum}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box
                                display="flex"
                                gap={0.5}
                                justifyContent="center"
                                flexWrap="wrap"
                              >
                                <Button
                                  variant={
                                    attendance[student._id] === "Present"
                                      ? "contained"
                                      : "outlined"
                                  }
                                  color="success"
                                  size="small"
                                  onClick={() => setStatus(student._id, "Present")}
                                  sx={{
                                    minWidth: 60,
                                    fontSize: "0.7rem",
                                    borderRadius: 1.5,
                                    textTransform: "none",
                                    px: 1,
                                    py: 0.5,
                                  }}
                                >
                                  Present
                                </Button>
                                <Button
                                  variant={
                                    attendance[student._id] === "Absent"
                                      ? "contained"
                                      : "outlined"
                                  }
                                  color="error"
                                  size="small"
                                  onClick={() => setStatus(student._id, "Absent")}
                                  sx={{
                                    minWidth: 60,
                                    fontSize: "0.7rem",
                                    borderRadius: 1.5,
                                    textTransform: "none",
                                    px: 1,
                                    py: 0.5,
                                  }}
                                >
                                  Absent
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                            <Group
                              sx={{
                                fontSize: 40,
                                color: "text.secondary",
                                mb: 1,
                              }}
                            />
                            <Typography variant="h6" color="text.secondary">
                              No students found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>

            {/* Sidebar - Mobile (moved to bottom) */}
            <Card sx={{ boxShadow: theme.shadows[3] }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Class Selection
                </Typography>

                {classTeacherClasses.length > 1 && (
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Class</InputLabel>
                    <Select
                      value={selectedClassId}
                      label="Select Class"
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      size="small"
                    >
                      {classTeacherClasses.map((cls) => (
                        <MenuItem key={cls._id} value={cls._id}>
                          {cls.sclassName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <Box
                  sx={{
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Attendance Summary
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Present:</Typography>
                    <Chip
                      label={presentCount}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Absent:</Typography>
                    <Chip
                      label={absentCount}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Total:</Typography>
                    <Chip
                      label={totalCount}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={saveLoading ? <CircularProgress size={20} /> : <Save />}
                  onClick={saveAttendance}
                  disabled={saveLoading || Object.keys(attendance).length === 0}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                    boxShadow: theme.shadows[4],
                    "&:hover": { boxShadow: theme.shadows[8] },
                  }}
                >
                  {saveLoading ? "Saving..." : "Save Attendance"}
                </Button>

                {saveSuccess && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Attendance saved successfully!
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Card sx={{ mb: 3, boxShadow: theme.shadows[3] }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                    Attendance Summary
                  </Typography>

                  {classTeacherClasses.length > 1 && (
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Select Class</InputLabel>
                      <Select
                        value={selectedClassId}
                        label="Select Class"
                        onChange={(e) => setSelectedClassId(e.target.value)}
                      >
                        {classTeacherClasses.map((cls) => (
                          <MenuItem key={cls._id} value={cls._id}>
                            {cls.sclassName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: 2,
                    }}
                  >
                   
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Present:</Typography>
                      <Chip
                        label={presentCount}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">Absent:</Typography>
                      <Chip
                        label={absentCount}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">Total:</Typography>
                      <Chip
                        label={totalCount}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={saveLoading ? <CircularProgress size={20} /> : <Save />}
                    onClick={saveAttendance}
                    disabled={saveLoading || Object.keys(attendance).length === 0}
                    sx={{
                      mt: 3,
                      py: 1.5,
                      background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                      boxShadow: theme.shadows[4],
                      "&:hover": { boxShadow: theme.shadows[8] },
                    }}
                  >
                    {saveLoading ? "Saving..." : "Save Attendance"}
                  </Button>

                  {saveSuccess && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Attendance saved successfully!
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Students Table */}
            <Grid item xs={12} md={8}>
              <Card sx={{ boxShadow: theme.shadows[3] }}>
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      p: 3,
                      borderBottom: 1,
                      borderColor: "divider",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Students List
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click Present/Absent to mark attendance for each student
                    </Typography>
                  </Box>

                  <Box sx={{ width: "100%", overflowX: "auto" }}>
                    <Table size="medium">
                      <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>Student</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>Roll No</TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.isArray(sclassStudents) && sclassStudents.length > 0 ? (
                          sclassStudents.map((student) => (
                            <TableRow key={student._id}>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <Avatar
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      mr: 1.5,
                                      bgcolor: theme.palette.primary.main,
                                    }}
                                  >
                                    {student.name?.charAt(0) || "S"}
                                  </Avatar>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight="medium"
                                    noWrap
                                  >
                                    {student.name}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={student.rollNum}
                                  size="small"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Box
                                  display="flex"
                                  gap={1}
                                  justifyContent="center"
                                  flexWrap="wrap"
                                >
                                  <Button
                                    variant={
                                      attendance[student._id] === "Present"
                                        ? "contained"
                                        : "outlined"
                                    }
                                    color="success"
                                    size="small"
                                    startIcon={<CheckCircle />}
                                    onClick={() => setStatus(student._id, "Present")}
                                    sx={{
                                      minWidth: 100,
                                      fontSize: "0.85rem",
                                      borderRadius: 2,
                                      textTransform: "none",
                                    }}
                                  >
                                    Present
                                  </Button>
                                  <Button
                                    variant={
                                      attendance[student._id] === "Absent"
                                        ? "contained"
                                        : "outlined"
                                    }
                                    color="error"
                                    size="small"
                                    startIcon={<Cancel />}
                                    onClick={() => setStatus(student._id, "Absent")}
                                    sx={{
                                      minWidth: 100,
                                      fontSize: "0.85rem",
                                      borderRadius: 2,
                                      textTransform: "none",
                                    }}
                                  >
                                    Absent
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                              <Group
                                sx={{
                                  fontSize: 48,
                                  color: "text.secondary",
                                  mb: 1,
                                }}
                              />
                              <Typography variant="h6" color="text.secondary">
                                No students found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
};


export default ClassAttendance;