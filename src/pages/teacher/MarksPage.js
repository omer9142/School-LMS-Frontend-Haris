import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchMarksByTeacher, 
  addMarks, 
  updateMarks, 
  deleteMarks 
} from "../../redux/marksRelated/marksHandle";
import { getTeacherDetails } from "../../redux/teacherRelated/teacherHandle";
import { getClassStudents, getClassDetails } from "../../redux/sclassRelated/sclassHandle";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Container,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Chip,
  useMediaQuery,
  useTheme,
  Grid,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import { Edit, Delete, Class as ClassIcon, CheckCircle, Person } from "@mui/icons-material";
import ScrollToTop from '../../components/ScrollToTop';

const MarksPage = () => {
  const dispatch = useDispatch();
  const { marksList, loading, response, error } = useSelector((state) => state.marks);
  const { currentUser } = useSelector((state) => state.user);
  const { teacherDetails } = useSelector((state) => state.teacher);
  const { sclassStudents, classDetails } = useSelector((state) => state.sclass);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Form state - removed obtainedMarks as it will be per student
  const [formData, setFormData] = useState({
    subjectId: "",
    assessmentType: "",
    topic: "",
    date: new Date().toISOString().split('T')[0],
    totalMarks: "100",
  });

  // Student marks state - will hold obtained marks for each student
  const [studentMarks, setStudentMarks] = useState({});

  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [fetchingData, setFetchingData] = useState(true);
  
  // State for edit functionality
  const [editingMark, setEditingMark] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [markToDelete, setMarkToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // NEW: Filter states for marks records
  const [filterClass, setFilterClass] = useState("all");
  const [filterAssessmentType, setFilterAssessmentType] = useState("all");

  // Fetch teacher details to get subjects and classes
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getTeacherDetails(currentUser._id));
      dispatch(fetchMarksByTeacher(currentUser._id));
    }
  }, [currentUser, dispatch]);

  // Extract classes and subjects from teacherDetails
  useEffect(() => {
    if (teacherDetails) {
      const teacherSubjects = teacherDetails.teachSubject || [];
      setSubjects(Array.isArray(teacherSubjects) ? teacherSubjects : [teacherSubjects]);

      const classes = teacherDetails.teachSclass || [];
      const normalizedClasses = Array.isArray(classes) ? classes : [classes];
      setTeacherClasses(normalizedClasses.filter(cls => cls));

      setFetchingData(false);
    }
  }, [teacherDetails]);

  // Fetch students when a class is selected
  useEffect(() => {
    if (selectedClassId) {
      dispatch(getClassStudents(selectedClassId));
      dispatch(getClassDetails(selectedClassId));
    }
  }, [dispatch, selectedClassId]);

  // Update students list when class students are fetched
  useEffect(() => {
    if (sclassStudents && selectedClassId) {
      const studentList = Array.isArray(sclassStudents) ? sclassStudents : [sclassStudents];
      setStudents(studentList);
      
      // Initialize studentMarks with empty values for each student
      const initialMarks = {};
      studentList.forEach(student => {
        initialMarks[student._id] = "";
      });
      setStudentMarks(initialMarks);
    }
  }, [sclassStudents, selectedClassId]);

  // Update selected class name when class details are fetched
  useEffect(() => {
    if (classDetails && selectedClassId) {
      setSelectedClassName(classDetails.sclassName || "Selected Class");
    }
  }, [classDetails, selectedClassId]);

  // Auto-refresh logic
  useEffect(() => {
    if (response && currentUser?._id) {
      console.log('✅ Marks operation successful, refreshing data...');
      setSnackbar({ open: true, message: response, severity: "success" });
      
      setTimeout(() => {
        dispatch(fetchMarksByTeacher(currentUser._id));
      }, 100);
    }
    
    if (error) {
      console.log('❌ Marks operation failed:', error);
      setSnackbar({ open: true, message: error, severity: "error" });
    }
  }, [response, error, dispatch, currentUser]);

  useEffect(() => {
    if (shouldRefresh && currentUser?._id) {
      console.log('🔄 Manual refresh triggered...');
      dispatch(fetchMarksByTeacher(currentUser._id));
      setShouldRefresh(false);
    }
  }, [shouldRefresh, dispatch, currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClassId(classId);
    
    const selectedClass = teacherClasses.find(cls => {
      const clsId = typeof cls === 'string' ? cls : cls._id;
      return clsId === classId;
    });
    
    if (selectedClass) {
      const className = typeof selectedClass === 'string' ? selectedClass : selectedClass.sclassName;
      setSelectedClassName(className || "Selected Class");
    } else {
      setSelectedClassName("");
    }
    
    // Clear subject when class changes
    setFormData(prev => ({ ...prev, subjectId: "" }));
  };

  // NEW: Get unique assessment types from marks list
  const uniqueAssessmentTypes = Array.from(new Set(marksList.map(mark => mark.assessmentType))).sort();

  // NEW: Get subjects for the selected class
  const subjectsForSelectedClass = subjects.filter(subject => {
    if (!selectedClassId || !subject.sclassName) return false;
    
    // Check if subject belongs to selected class
    const subjectClassId = typeof subject.sclassName === 'string' 
      ? subject.sclassName 
      : subject.sclassName._id;
    
    return subjectClassId === selectedClassId;
  });

  // NEW: Filter marks based on selected filters
  const filteredMarks = marksList.filter(mark => {
    // Filter by class
    if (filterClass !== "all") {
      const markClassId = mark.studentId?.sclassName?._id;
      if (markClassId !== filterClass) return false;
    }
    
    // Filter by assessment type
    if (filterAssessmentType !== "all") {
      if (mark.assessmentType !== filterAssessmentType) return false;
    }
    
    return true;
  });

  // Handle individual student marks input
  const handleStudentMarksChange = (studentId, value) => {
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  // Save all students' marks at once
  const handleSaveAllMarks = async () => {
    if (!formData.subjectId || !formData.assessmentType || !selectedClassId) {
      setSnackbar({ open: true, message: "Please fill in all required fields (Class, Subject, Assessment Type)", severity: "warning" });
      return;
    }

    // Filter students who have marks entered
    const studentsWithMarks = students.filter(student => {
      const marks = studentMarks[student._id];
      return marks !== "" && marks !== null && marks !== undefined;
    });

    if (studentsWithMarks.length === 0) {
      setSnackbar({ open: true, message: "Please enter marks for at least one student", severity: "warning" });
      return;
    }

    setSubmitting(true);
    console.log('📝 Saving marks for multiple students...');

    try {
      // Create promises for all students with marks
      const savePromises = studentsWithMarks.map(student => {
        const submitData = {
          teacherId: currentUser._id,
          studentId: student._id,
          subjectId: formData.subjectId,
          assessmentType: formData.assessmentType,
          topic: formData.topic,
          date: formData.date,
          obtainedMarks: studentMarks[student._id],
          totalMarks: formData.totalMarks,
        };
        return dispatch(addMarks(submitData));
      });

      // Wait for all saves to complete
      await Promise.all(savePromises);

      setSnackbar({ 
        open: true, 
        message: `Successfully saved marks for ${studentsWithMarks.length} student(s)!`, 
        severity: "success" 
      });

      // Clear only the student marks, keep form data
      const clearedMarks = {};
      students.forEach(student => {
        clearedMarks[student._id] = "";
      });
      setStudentMarks(clearedMarks);

      // Refresh marks list
      setTimeout(() => {
        setShouldRefresh(true);
      }, 500);

    } catch (err) {
      console.error('Error saving marks:', err);
      setSnackbar({ open: true, message: "Error saving marks", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Edit functionality
  const handleEditClick = (mark) => {
    setEditingMark(mark);
    setFormData({
      subjectId: mark.subjectId._id || mark.subjectId,
      assessmentType: mark.assessmentType,
      topic: mark.topic,
      date: mark.date ? new Date(mark.date).toISOString().split('T')[0] : "",
      totalMarks: mark.totalMarks,
    });
    
    // For edit, we'll use a separate dialog with obtained marks
    setEditDialogOpen(true);
  };

  const handleUpdateSubmit = async () => {
    console.log('✏️ Updating marks...', formData);
    
    try {
      await dispatch(updateMarks(editingMark._id, formData));
      setEditDialogOpen(false);
      setEditingMark(null);
      
      setFormData({
        subjectId: "",
        assessmentType: "",
        topic: "",
        date: new Date().toISOString().split('T')[0],
        totalMarks: "100",
      });
      
      setTimeout(() => {
        setShouldRefresh(true);
      }, 500);
      
    } catch (error) {
      console.error('Error updating marks:', error);
      setSnackbar({ open: true, message: "Error updating marks", severity: "error" });
    }
  };

  // Delete functionality
  const handleDeleteClick = (mark) => {
    setMarkToDelete(mark);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    console.log('🗑️ Deleting marks...', markToDelete._id);
    
    try {
      await dispatch(deleteMarks(markToDelete._id));
      setDeleteDialogOpen(false);
      setMarkToDelete(null);
      
      setTimeout(() => {
        setShouldRefresh(true);
      }, 500);
      
    } catch (error) {
      console.error('Error deleting marks:', error);
      setSnackbar({ open: true, message: "Error deleting marks", severity: "error" });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Mobile-friendly card component for marks
  const MobileMarksCard = ({ mark }) => {
    const percentage = ((mark.obtainedMarks / mark.totalMarks) * 100).toFixed(1);
    const isGoodScore = percentage >= 50;

    return (
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 2, 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          backgroundColor: '#ffffff'
        }}
      >
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                {mark.studentId?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                {mark.studentId?.sclassName?.sclassName || 'N/A'} • {mark.subjectId?.subName || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton 
                size="small"
                onClick={() => handleEditClick(mark)}
                disabled={loading}
                sx={{ color: theme.palette.primary.main }}
              >
                <Edit fontSize="small" />
              </IconButton>
              <IconButton 
                size="small"
                onClick={() => handleDeleteClick(mark)}
                disabled={loading}
                sx={{ color: theme.palette.error.main }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Typography variant="body2">
              <strong>Type:</strong> {mark.assessmentType}
            </Typography>
            <Typography variant="body2">
              <strong>Topic:</strong> {mark.topic || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Typography variant="body2">
              <strong>Date:</strong> {mark.date ? new Date(mark.date).toLocaleDateString() : 'N/A'}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              <strong>Marks:</strong> {mark.obtainedMarks} / {mark.totalMarks}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2">
              <strong>Percentage:</strong>
            </Typography>
            <Chip 
              label={`${percentage}%`}
              size="small"
              color={isGoodScore ? "success" : "error"}
              variant="outlined"
              sx={{ fontWeight: 'bold', minWidth: 60 }}
            />
          </Box>
        </Stack>
      </Paper>
    );
  };

  // Desktop table view - updated to use filteredMarks
  const DesktopMarksTable = () => (
    <Table>
      <TableHead>
        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
          <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Student</TableCell>
          <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Class</TableCell>
          <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Subject</TableCell>
          <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Type</TableCell>
          <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Topic</TableCell>
          <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Date</TableCell>
          <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Marks</TableCell>
          <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Percentage</TableCell>
          <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredMarks.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} sx={{ color: theme.palette.text.secondary, textAlign: 'center', py: 4 }}>
              No marks records found for the selected filters.
            </TableCell>
          </TableRow>
        ) : (
          filteredMarks.map((mark) => {
            const percentage = ((mark.obtainedMarks / mark.totalMarks) * 100).toFixed(1);
            return (
              <TableRow 
                key={mark._id}
                sx={{ 
                  '&:hover': { backgroundColor: '#f9f9f9' },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <TableCell sx={{ color: theme.palette.text.primary, fontWeight: '500' }}>
                  {mark.studentId?.name || 'N/A'}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  {mark.studentId?.sclassName?.sclassName || 'N/A'}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>{mark.subjectId?.subName || 'N/A'}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>{mark.assessmentType}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>{mark.topic}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  {mark.date ? new Date(mark.date).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                  {mark.obtainedMarks} / {mark.totalMarks}
                </TableCell>
                <TableCell sx={{ color: percentage >= 50 ? '#2e7d32' : '#d32f2f', fontWeight: 'bold' }}>
                  {percentage}%
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton 
                      onClick={() => handleEditClick(mark)}
                      disabled={loading}
                      sx={{ color: theme.palette.primary.main, '&:hover': { backgroundColor: '#e3f2fd' } }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteClick(mark)}
                      disabled={loading}
                      sx={{ color: theme.palette.error.main, '&:hover': { backgroundColor: '#ffebee' } }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  const customTheme = {
    primary: '#1976d2',
    secondary: '#dc004e',
    accent: '#1a1a1a',
    background: '#fafafa',
    surface: '#ffffff',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e0e0e0',
  };

  // Mobile Student Row Component - Stack layout instead of table
  const MobileStudentRow = ({ student }) => {
    const hasMarks = studentMarks[student._id] !== "" && 
                   studentMarks[student._id] !== null && 
                   studentMarks[student._id] !== undefined;
    
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 2, 
          border: `1px solid ${hasMarks ? customTheme.primary : customTheme.border}`,
          borderRadius: 2,
          backgroundColor: hasMarks ? '#f0f9ff' : customTheme.surface
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: '600', color: customTheme.text }}>
                {student.name}
              </Typography>
              <Typography variant="caption" sx={{ color: customTheme.textSecondary }}>
                Roll: {student.rollNum || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              size="small"
              value={studentMarks[student._id] || ""}
              onChange={(e) => handleStudentMarksChange(student._id, e.target.value)}
              placeholder="Marks"
              inputProps={{ 
                min: 0, 
                max: formData.totalMarks,
                style: { textAlign: 'center' }
              }}
              sx={{
                '& .MuiInputBase-root': { 
                  color: customTheme.text,
                  backgroundColor: '#fff'
                },
                '& .MuiOutlinedInput-notchedOutline': { 
                  borderColor: hasMarks ? customTheme.primary : customTheme.border 
                },
                '&:hover .MuiOutlinedInput-notchedOutline': { 
                  borderColor: customTheme.accent 
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    );
  };

  if (fetchingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading teacher data...</Typography>
      </Box>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Box sx={{ backgroundColor: customTheme.background, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg" sx={{ 
          width: '95%',
          maxWidth: '100%',
          px: { xs: 1, sm: 2, md: 3 }
        }}>
          {/* Header */}
          <Typography 
            variant="h4" 
            mb={4} 
            sx={{ 
              color: customTheme.accent,
              fontWeight: 'bold',
              textAlign: 'center',
              borderBottom: `2px solid ${customTheme.accent}`,
              pb: 1,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' }
            }}
          >
            Marks Management
          </Typography>

          {/* Add Marks Form */}
          <Card 
            sx={{ 
              backgroundColor: customTheme.surface,
              mb: 4,
              borderRadius: 2,
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              border: `1px solid ${customTheme.border}`,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: customTheme.accent,
                    fontWeight: '600',
                    mb: 1,
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                  }}
                >
                  Add New Marks
                </Typography>
                
                {selectedClassName && (
                  <Chip
                    icon={<ClassIcon />}
                    label={`Class: ${selectedClassName}`}
                    variant="outlined"
                    sx={{
                      backgroundColor: '#e3f2fd',
                      color: customTheme.primary,
                      borderColor: customTheme.primary,
                      fontWeight: 'bold',
                      fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                      px: 2,
                      py: 1,
                      maxWidth: '100%'
                    }}
                  />
                )}
              </Box>
              
              <Grid container spacing={2}>
                {/* Class Selection */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: customTheme.textSecondary }}>Class</InputLabel>
                    <Select
                      value={selectedClassId}
                      onChange={handleClassChange}
                      label="Class"
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        color: customTheme.text,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.border },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.accent }
                      }}
                    >
                      <MenuItem value="">Select Class</MenuItem>
                      {teacherClasses.map((classItem) => {
                        const classId = typeof classItem === 'string' ? classItem : classItem._id;
                        const className = typeof classItem === 'string' ? classItem : classItem.sclassName;
                        return (
                          <MenuItem key={classId} value={classId}>
                            {className || classId}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Subject Dropdown */}
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Subject"
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleChange}
                    disabled={!selectedClassId}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      '& .MuiInputBase-root': { color: customTheme.text },
                      '& .MuiInputLabel-root': { color: customTheme.textSecondary },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.border },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.accent }
                    }}
                  >
                    <MenuItem value="">Select Subject</MenuItem>
                    {!selectedClassId ? (
                      <MenuItem disabled>Select a class first</MenuItem>
                    ) : subjectsForSelectedClass.length > 0 ? (
                      subjectsForSelectedClass.map((subject) => (
                        <MenuItem key={subject._id} value={subject._id}>
                          {subject.subName} ({subject.sessions || 0} sessions)
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No subjects found for this class</MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Assessment Type"
                    name="assessmentType"
                    value={formData.assessmentType}
                    onChange={handleChange}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      '& .MuiInputBase-root': { color: customTheme.text },
                      '& .MuiInputLabel-root': { color: customTheme.textSecondary },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.border },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.accent }
                    }}
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    {["Test", "Quiz", "Mid Term", "Final", "Other"].map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="e.g., Chapter 1, Algebra"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      '& .MuiInputBase-root': { color: customTheme.text },
                      '& .MuiInputLabel-root': { color: customTheme.textSecondary },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.border },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.accent }
                    }}
                  />
                </Grid>

                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.date}
                    onChange={handleChange}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      '& .MuiInputBase-root': { color: customTheme.text },
                      '& .MuiInputLabel-root': { color: customTheme.textSecondary },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.border },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.accent }
                    }}
                  />
                </Grid>

                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    label="Total Marks"
                    name="totalMarks"
                    type="number"
                    value={formData.totalMarks}
                    onChange={handleChange}
                    placeholder="100"
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      '& .MuiInputBase-root': { color: customTheme.text },
                      '& .MuiInputLabel-root': { color: customTheme.textSecondary },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.border },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.accent }
                    }}
                  />
                </Grid>
              </Grid>

              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  mt: 2, 
                  color: customTheme.textSecondary,
                  fontStyle: 'italic',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Select class and fill in the details above. Then enter marks for each student below and click "Save All Marks".
              </Typography>
            </CardContent>
          </Card>

          {/* Students List with Marks Input */}
          {selectedClassId && students.length > 0 && (
            <Card 
              sx={{ 
                backgroundColor: customTheme.surface,
                mb: 4,
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                border: `1px solid ${customTheme.border}`,
                overflow: 'hidden'
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: customTheme.accent,
                    fontWeight: '600',
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}
                >
                  <Person sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                  Enter Marks for Students ({students.length})
                </Typography>

                {/* Mobile View - Stack Layout */}
                {isMobile ? (
                  <Box>
                    {students.map((student) => (
                      <MobileStudentRow key={student._id} student={student} />
                    ))}
                  </Box>
                ) : (
                  /* Desktop View - Table Layout */
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold', minWidth: '300px' }}>Student Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '250px' }}>Obtained Marks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {students.map((student) => {
                          const hasMarks = studentMarks[student._id] !== "" && 
                                         studentMarks[student._id] !== null && 
                                         studentMarks[student._id] !== undefined;
                          return (
                            <TableRow 
                              key={student._id}
                              sx={{ 
                                '&:hover': { backgroundColor: '#f9f9f9' },
                                backgroundColor: hasMarks ? '#f0f9ff' : 'transparent'
                              }}
                            >
                              <TableCell>
                                <Typography variant="body1" sx={{ fontWeight: '500', color: customTheme.text }}>
                                  {student.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: customTheme.textSecondary }}>
                                  Roll: {student.rollNum || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  fullWidth
                                  type="number"
                                  size="small"
                                  value={studentMarks[student._id] || ""}
                                  onChange={(e) => handleStudentMarksChange(student._id, e.target.value)}
                                  placeholder="Enter marks"
                                  inputProps={{ min: 0, max: formData.totalMarks }}
                                  sx={{
                                    '& .MuiInputBase-root': { 
                                      color: customTheme.text,
                                      backgroundColor: '#fff'
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': { 
                                      borderColor: hasMarks ? customTheme.primary : customTheme.border 
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': { 
                                      borderColor: customTheme.accent 
                                    }
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                )}

                <Divider sx={{ my: 3 }} />

                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Typography variant="body2" sx={{ 
                    color: customTheme.textSecondary,
                    textAlign: { xs: 'center', sm: 'left' },
                    mb: { xs: 2, sm: 0 }
                  }}>
                    Total Marks: <strong>{formData.totalMarks}</strong> | 
                    Students with marks entered: <strong>
                      {Object.values(studentMarks).filter(m => m !== "" && m !== null && m !== undefined).length}
                    </strong> / {students.length}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                    <Button 
                      variant="outlined"
                      onClick={() => {
                        const clearedMarks = {};
                        students.forEach(student => {
                          clearedMarks[student._id] = "";
                        });
                        setStudentMarks(clearedMarks);
                      }}
                      disabled={submitting}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        borderColor: customTheme.textSecondary,
                        color: customTheme.textSecondary,
                        '&:hover': {
                          borderColor: customTheme.accent,
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                    >
                      Clear All Marks
                    </Button>

                    <Button 
                      variant="contained" 
                      onClick={handleSaveAllMarks}
                      disabled={submitting || !formData.subjectId || !formData.assessmentType}
                      startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircle />}
                      size={isMobile ? "medium" : "large"}
                      sx={{
                        backgroundColor: customTheme.accent,
                        color: '#ffffff',
                        fontWeight: 'bold',
                        px: 4,
                        '&:hover': {
                          backgroundColor: '#000000',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        },
                        '&:disabled': {
                          backgroundColor: customTheme.textSecondary,
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {submitting ? 'Saving...' : 'Save All Marks'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Message when no class is selected */}
          {!selectedClassId && (
            <Card 
              sx={{ 
                backgroundColor: '#fff3cd',
                mb: 4,
                borderRadius: 2,
                border: '1px solid #ffc107'
              }}
            >
              <CardContent>
                <Typography variant="body1" sx={{ color: '#856404', textAlign: 'center' }}>
                  Please select a class from the form above to view students and enter marks.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Marks Records Table - UPDATED WITH FILTERS */}
          <Card 
            sx={{ 
              backgroundColor: customTheme.surface,
              borderRadius: 2,
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              border: `1px solid ${customTheme.border}`,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3, 
                flexDirection: { xs: 'column', sm: 'row' }, 
                gap: 2 
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: customTheme.accent,
                    fontWeight: '600',
                    textAlign: { xs: 'center', sm: 'left' },
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}
                >
                  Marks Records ({filteredMarks.length})
                  <Typography variant="caption" sx={{ 
                    display: 'block', 
                    color: customTheme.textSecondary,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}>
                    Filtered from {marksList.length} total records
                  </Typography>
                </Typography>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShouldRefresh(true)}
                  disabled={loading}
                  sx={{
                    borderColor: customTheme.accent,
                    color: customTheme.accent,
                    '&:hover': {
                      borderColor: '#000000',
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={16} /> : 'Refresh'}
                </Button>
              </Box>

              {/* NEW: Filter dropdowns for marks records */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: customTheme.textSecondary }}>Filter by Class</InputLabel>
                    <Select
                      value={filterClass}
                      onChange={(e) => setFilterClass(e.target.value)}
                      label="Filter by Class"
                      sx={{
                        color: customTheme.text,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.border },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.accent }
                      }}
                    >
                      <MenuItem value="all">All Classes</MenuItem>
                      {teacherClasses.map((classItem) => {
                        const classId = typeof classItem === 'string' ? classItem : classItem._id;
                        const className = typeof classItem === 'string' ? classItem : classItem.sclassName;
                        return (
                          <MenuItem key={classId} value={classId}>
                            {className || classId}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: customTheme.textSecondary }}>Filter by Assessment Type</InputLabel>
                    <Select
                      value={filterAssessmentType}
                      onChange={(e) => setFilterAssessmentType(e.target.value)}
                      label="Filter by Assessment Type"
                      sx={{
                        color: customTheme.text,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.border },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: customTheme.accent }
                      }}
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      {uniqueAssessmentTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* NEW: Clear filters button */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    {(filterClass !== "all" || filterAssessmentType !== "all") && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setFilterClass("all");
                          setFilterAssessmentType("all");
                        }}
                        sx={{
                          color: customTheme.textSecondary,
                          borderColor: customTheme.textSecondary,
                          '&:hover': {
                            borderColor: customTheme.accent,
                            backgroundColor: '#f5f5f5'
                          }
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading marks data...</Typography>
                </Box>
              ) : isMobile ? (
                <Box>
                  {filteredMarks.length === 0 ? (
                    <Typography sx={{ color: customTheme.textSecondary, textAlign: 'center', py: 4 }}>
                      No marks records found for the selected filters.
                    </Typography>
                  ) : (
                    filteredMarks.map((mark) => (
                      <MobileMarksCard key={mark._id} mark={mark} />
                    ))
                  )}
                </Box>
              ) : (
                <DesktopMarksTable />
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog 
            open={editDialogOpen} 
            onClose={() => {
              setEditDialogOpen(false);
              setEditingMark(null);
            }}
            fullScreen={isSmallMobile}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Edit Marks</DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Subject"
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleChange}
                    >
                      <MenuItem value="">Select Subject</MenuItem>
                      {subjects.map((subject) => (
                        <MenuItem key={subject._id} value={subject._id}>
                          {subject.subName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Assessment Type"
                      name="assessmentType"
                      value={formData.assessmentType}
                      onChange={handleChange}
                    >
                      <MenuItem value="">Select Type</MenuItem>
                      {["Test", "Quiz", "Mid Term", "Final", "Other"].map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Topic"
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date"
                      name="date"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Obtained Marks"
                      name="obtainedMarks"
                      type="number"
                      value={editingMark?.obtainedMarks || ""}
                      onChange={(e) => setEditingMark({...editingMark, obtainedMarks: e.target.value})}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Total Marks"
                      name="totalMarks"
                      type="number"
                      value={formData.totalMarks}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingMark(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const updatedData = {
                    ...formData,
                    obtainedMarks: editingMark.obtainedMarks,
                    studentId: editingMark.studentId._id || editingMark.studentId
                  };
                  dispatch(updateMarks(editingMark._id, updatedData)).then(() => {
                    setEditDialogOpen(false);
                    setEditingMark(null);
                    setTimeout(() => setShouldRefresh(true), 500);
                  });
                }}
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Update'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog 
            open={deleteDialogOpen} 
            onClose={() => setDeleteDialogOpen(false)}
            fullScreen={isSmallMobile}
          >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete marks for {markToDelete?.studentId?.name || 'this student'}? 
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={20} /> : 'Delete'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar 
            open={snackbar.open} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
};

export default MarksPage;