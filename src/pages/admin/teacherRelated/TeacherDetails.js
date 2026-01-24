import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  getTeacherDetails,
  assignClassTeacher,
  removeTeacherSubjects,
  removeClassTeacherAction,
  updateTeacherDetails,
  getTeacherDetailsWithPassword,
  removeTeacherFromClass // Added this import
} from '../../../redux/teacherRelated/teacherHandle';
import {
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Paper,
  Chip,
  TextField,
  IconButton,
  InputAdornment,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CakeIcon from '@mui/icons-material/Cake';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import BookIcon from '@mui/icons-material/Book';
import EditIcon from '@mui/icons-material/Edit';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const TeacherDetails = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const { loading, teacherDetails, error, response } = useSelector((state) => state.teacher);

  const teacherID = params.id;

  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeSubOpen, setRemoveSubOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // NEW: State for class filter in subjects section
  const [selectedSubjectClass, setSelectedSubjectClass] = useState("all");
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    dob: '',
    fatherName: '',
    address: '',
    phoneNumber: '',
    emergencyContact: '',
    newPassword: ''
  });

  // Modal handlers
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedClass(null);
  };

  const handleAssignOpen = () => setAssignOpen(true);
  const handleAssignClose = () => {
    setAssignOpen(false);
    setSelectedClass(null);
  };

  const handleRemoveSubOpen = () => setRemoveSubOpen(true);
  const handleRemoveSubClose = () => {
    setRemoveSubOpen(false);
    setSelectedSubjects([]);
  };

  const handleEditOpen = () => {
    // Pre-fill the form with current teacher data
    setEditForm({
      name: teacherDetails?.name || '',
      email: teacherDetails?.email || '',
      dob: teacherDetails?.dob ? teacherDetails.dob.split('T')[0] : '',
      fatherName: teacherDetails?.fatherName || '',
      address: teacherDetails?.address || '',
      phoneNumber: teacherDetails?.phoneNumber || '',
      emergencyContact: teacherDetails?.emergencyContact || '',
      newPassword: ''
    });
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditForm({
      name: '',
      email: '',
      dob: '',
      fatherName: '',
      address: '',
      phoneNumber: '',
      emergencyContact: '',
      newPassword: ''
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

 const handleUpdateProfile = async () => {
  try {
    // Prepare update data - include ALL fields
    const updateData = {
      name: editForm.name,
      email: editForm.email,
      dob: editForm.dob,
      fatherName: editForm.fatherName,
      address: editForm.address,
      phoneNumber: editForm.phoneNumber,
      emergencyContact: editForm.emergencyContact
    };

    // Only include new password if provided
    if (editForm.newPassword) {
      updateData.newPassword = editForm.newPassword;
    }

    await dispatch(updateTeacherDetails(teacherID, updateData));
    
    // ✅ CRITICAL: Re-fetch teacher details WITH password after update
    if (currentUser?.role === 'Admin') {
      await dispatch(getTeacherDetailsWithPassword(teacherID));
    }
    
    setSnackbar({ 
      open: true, 
      message: "Profile updated successfully!", 
      severity: "success" 
    });
    handleEditClose();
  } catch (err) {
    setSnackbar({ 
      open: true, 
      message: err.response?.data?.message || 'Failed to update profile', 
      severity: "error" 
    });
  }
};

  const handleChooseClass = () => {
    if (selectedClass) {
      navigate(`/Admin/teachers/choosesubject/${selectedClass}/${teacherDetails?._id}`);
      handleClose();
    }
  };

  const handleAssignClassTeacher = async () => {
    if (!selectedClass) {
      setSnackbar({ open: true, message: "Please select a class", severity: "warning" });
      return;
    }

    try {
      await dispatch(assignClassTeacher(teacherDetails?._id, selectedClass));
      setSnackbar({ open: true, message: "Class teacher assigned successfully!", severity: "success" });
      handleAssignClose();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Error assigning class teacher', severity: "error" });
    }
  };

  const handleRemoveSubjects = async () => {
    if (!selectedSubjects.length) {
      setSnackbar({ open: true, message: "Please select subjects to remove", severity: "warning" });
      return;
    }

    try {
      await dispatch(removeTeacherSubjects(teacherID, selectedSubjects));
      setSnackbar({ open: true, message: "Selected subjects removed successfully", severity: "success" });
      handleRemoveSubClose();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Failed to remove subjects', severity: "error" });
    }
  };

  const handleRemoveClassTeacher = async (classId) => {
    if (!classId) return;

    if (window.confirm("Are you sure you want to remove this teacher as class teacher for this class?")) {
      try {
        await dispatch(removeClassTeacherAction(teacherID, classId));
        setSnackbar({ open: true, message: "Class teacher removed successfully", severity: "success" });
      } catch (err) {
        setSnackbar({ open: true, message: err.message || "Failed to remove class teacher", severity: "error" });
      }
    }
  };

  // NEW: Function to remove teacher from class (not just class teacher role)
  const handleRemoveTeacherFromClass = async (classId, className) => {
    if (!classId) return;

    if (window.confirm(`Are you sure you want to remove this teacher from teaching ${className}?`)) {
      try {
        await dispatch(removeTeacherFromClass(teacherID, classId));
        setSnackbar({ open: true, message: `Teacher removed from ${className} successfully`, severity: "success" });
      } catch (err) {
        setSnackbar({ open: true, message: err.message || "Failed to remove teacher from class", severity: "error" });
      }
    }
  };

   const { currentUser } = useSelector((state) => state.user);

   useEffect(() => {
    // Fetch teacher details with plain password for admin
    if (currentUser?.role === 'Admin' && teacherDetails?._id) {
      dispatch(getTeacherDetailsWithPassword(teacherDetails._id));
    }
  }, [dispatch, teacherDetails?._id, currentUser?.role]);

  useEffect(() => {
    dispatch(getTeacherDetails(teacherID));
  }, [dispatch, teacherID]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: "error" });
    }
    if (response) {
      setSnackbar({ open: true, message: response.message || "Operation successful", severity: "success" });
    }
  }, [error, response]);

  const handleRefresh = () => {
    dispatch(getTeacherDetails(teacherID));
    setSnackbar({ open: true, message: "Refreshing teacher data...", severity: "info" });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading && !teacherDetails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading teacher details...</Typography>
      </Box>
    );
  }

  if (!teacherDetails && !loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Teacher not found</Alert>
      </Container>
    );
  }

  const subjects = Array.isArray(teacherDetails?.teachSubject)
    ? teacherDetails.teachSubject
    : teacherDetails?.teachSubject
      ? [teacherDetails.teachSubject]
      : [];

  // NEW: Get unique classes from subjects for the filter dropdown
  const uniqueClasses = Array.from(
    new Set(
      subjects
        .filter(sub => sub?.sclassName?.sclassName)
        .map(sub => sub.sclassName.sclassName)
    )
  );

  // NEW: Filter subjects based on selected class
  const filteredSubjects = selectedSubjectClass === "all" 
    ? subjects 
    : subjects.filter(sub => sub?.sclassName?.sclassName === selectedSubjectClass);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Teacher Profile</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<EditIcon />}
            onClick={handleEditOpen}
          >
            Edit Profile
          </Button>
          <Button variant="outlined" onClick={handleRefresh} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Personal Information Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Personal Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ fontSize: 18, mr: 1 }} /> Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight="500">{teacherDetails?.name || 'N/A'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                    <EmailIcon sx={{ fontSize: 18, mr: 1 }} /> Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight="500">{teacherDetails?.email || 'N/A'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                    <CakeIcon sx={{ fontSize: 18, mr: 1 }} /> Date of Birth
                  </Typography>
                  <Typography variant="body1" fontWeight="500">{formatDate(teacherDetails?.dob)}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                    <FamilyRestroomIcon sx={{ fontSize: 18, mr: 1 }} /> Father's Name
                  </Typography>
                  <Typography variant="body1" fontWeight="500">{teacherDetails?.fatherName || 'N/A'}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ContactPhoneIcon sx={{ fontSize: 32, color: 'success.main', mr: 1 }} />
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  Contact Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                    <HomeIcon sx={{ fontSize: 18, mr: 1 }} /> Address
                  </Typography>
                  <Typography variant="body1" fontWeight="500">{teacherDetails?.address || 'N/A'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon sx={{ fontSize: 18, mr: 1 }} /> Phone Number
                  </Typography>
                  <Typography variant="body1" fontWeight="500">{teacherDetails?.phoneNumber || 'N/A'}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center' }}>
                    <ContactPhoneIcon sx={{ fontSize: 18, mr: 1 }} /> Emergency Contact
                  </Typography>
                  <Typography variant="body1" fontWeight="500">{teacherDetails?.emergencyContact || 'N/A'}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Academic Assignments Section */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ fontSize: 32, color: 'secondary.main', mr: 1 }} />
                <Typography variant="h5" fontWeight="bold" color="secondary.main">
                  Academic Assignments
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {/* Classes Assigned - UPDATED WITH REMOVE BUTTONS */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <ClassIcon sx={{ fontSize: 22, mr: 1, color: 'primary.main' }} />
                      Classes Assigned
                    </Typography>
                    {teacherDetails?.teachSclass?.length ? (
                      <Stack spacing={1}>
                        {teacherDetails.teachSclass.map((cls, index) => (
                          <Box key={cls._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip 
                              label={cls.sclassName} 
                              color="primary" 
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                            <Tooltip title={`Remove from ${cls.sclassName}`}>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleRemoveTeacherFromClass(cls._id, cls.sclassName)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">No classes assigned</Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Class Teacher Of */}
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <ClassIcon sx={{ fontSize: 22, mr: 1, color: 'secondary.main' }} />
                      Class Teacher Of
                    </Typography>
                    {teacherDetails?.classTeacherOf?.length > 0 ? (
                      <Stack spacing={1}>
                        {teacherDetails.classTeacherOf.map((cls) => (
                          <Box key={cls._id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip 
                              label={cls.sclassName} 
                              color="secondary" 
                              sx={{ fontWeight: 500 }}
                            />
                            <Button 
                              size="small" 
                              color="error" 
                              variant="outlined"
                              onClick={() => handleRemoveClassTeacher(cls._id)}
                              sx={{ ml: 1 }}
                            >
                              Remove
                            </Button>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">Not assigned as class teacher</Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Subjects Section - UPDATED WITH CLASS FILTER DROPDOWN */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BookIcon sx={{ fontSize: 32, color: 'info.main', mr: 1 }} />
                  <Typography variant="h5" fontWeight="bold" color="info.main">
                    Teaching Subjects
                  </Typography>
                </Box>
                
                {/* NEW: Class filter dropdown */}
                {uniqueClasses.length > 0 && (
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Class</InputLabel>
                    <Select
                      value={selectedSubjectClass}
                      onChange={(e) => setSelectedSubjectClass(e.target.value)}
                      label="Filter by Class"
                    >
                      <MenuItem value="all">All Classes</MenuItem>
                      {uniqueClasses.map((className, index) => (
                        <MenuItem key={index} value={className}>
                          {className}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
              
              <Divider sx={{ mb: 3 }} />

              {/* Show filter info */}
              {selectedSubjectClass !== "all" && (
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={`Showing subjects for: ${selectedSubjectClass}`} 
                    color="primary" 
                    size="small"
                    onDelete={() => setSelectedSubjectClass("all")}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ({filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''})
                  </Typography>
                </Box>
              )}

              {filteredSubjects.length > 0 ? (
                <Grid container spacing={2}>
                  {filteredSubjects.map((sub, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={idx}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2.5, 
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.3s',
                          '&:hover': {
                            boxShadow: 4,
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        <Typography variant="h6" fontWeight="600" color="primary" sx={{ mb: 1.5 }}>
                          {sub?.subName}
                        </Typography>
                        
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Course Code:</Typography>
                            <Typography variant="body2" fontWeight="500">{sub?.subCode || 'N/A'}</Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Class:</Typography>
                            <Chip 
                              label={sub?.sclassName?.sclassName || 'N/A'} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">Sessions:</Typography>
                            <Chip 
                              label={sub?.sessions || 0} 
                              size="small" 
                              color="success"
                            />
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <BookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {selectedSubjectClass === "all" 
                      ? "No subjects assigned yet" 
                      : `No subjects found for ${selectedSubjectClass}`
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {selectedSubjectClass === "all" 
                      ? "Click \"Assign Subjects\" below to add subjects" 
                      : "Try selecting a different class or view all classes"
                    }
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: '#f8f9fa' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  onClick={handleOpen} 
                  disabled={!teacherDetails?.teachSclass?.length}
                  size="large"
                >
                  Assign Subjects
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleAssignOpen}
                  disabled={!teacherDetails?.teachSclass?.length}
                  size="large"
                >
                  Assign Class Teacher
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={handleRemoveSubOpen} 
                  disabled={!subjects.length}
                  size="large"
                >
                  Remove Subject
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assign Class Teacher Modal */}
      <Dialog open={assignOpen} onClose={handleAssignClose} fullWidth maxWidth="sm">
        <DialogTitle>Select Class to Assign as Class Teacher</DialogTitle>
        <DialogContent dividers>
          {teacherDetails?.teachSclass?.length ? teacherDetails.teachSclass.map((cls) => (
            <Box
              key={cls._id}
              onClick={() => setSelectedClass(cls._id)}
              sx={{
                p: 2,
                mb: 1,
                border: "1px solid",
                borderColor: selectedClass === cls._id ? "primary.main" : "grey.300",
                borderRadius: 2,
                cursor: "pointer",
                "&:hover": { backgroundColor: "grey.100" }
              }}
            >
              <Typography>{cls.sclassName}</Typography>
            </Box>
          )) : <Typography>No classes assigned.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAssignClose}>Cancel</Button>
          <Button onClick={handleAssignClassTeacher} disabled={!selectedClass} variant="contained">
            Assign as Class Teacher
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Subjects Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Select Class for Subjects</DialogTitle>
        <DialogContent dividers>
          {teacherDetails?.teachSclass?.length ? teacherDetails.teachSclass.map((cls) => (
            <Box
              key={cls._id}
              onClick={() => setSelectedClass(cls._id)}
              sx={{
                p: 2,
                mb: 1,
                border: "1px solid",
                borderColor: selectedClass === cls._id ? "primary.main" : "grey.300",
                borderRadius: 2,
                cursor: "pointer",
                "&:hover": { backgroundColor: "grey.100" }
              }}
            >
              <Typography>{cls.sclassName}</Typography>
            </Box>
          )) : <Typography>No classes assigned.</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleChooseClass} disabled={!selectedClass} variant="contained">
            Continue to Subjects
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Subjects Modal */}
      <Dialog open={removeSubOpen} onClose={handleRemoveSubClose} fullWidth maxWidth="sm">
        <DialogTitle>Select Subjects to Remove</DialogTitle>
        <DialogContent dividers>
          {subjects.map((sub) => (
            <Box key={sub._id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <input
                type="checkbox"
                value={sub._id}
                checked={selectedSubjects.includes(sub._id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedSubjects([...selectedSubjects, sub._id]);
                  else setSelectedSubjects(selectedSubjects.filter((id) => id !== sub._id));
                }}
              />
              <Typography sx={{ ml: 1 }}>{sub.subName} - {sub.sclassName?.sclassName}</Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemoveSubClose}>Cancel</Button>
          <Button onClick={handleRemoveSubjects} disabled={!selectedSubjects.length} variant="contained" color="error">
            Remove Selected
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Modal */}
      <Dialog 
        open={editOpen} 
        onClose={handleEditClose} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            backgroundColor: 'secondary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 2
          }}
        >
          <EditIcon />
          <Typography variant="h6" fontWeight="bold">Edit Teacher Profile</Typography>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Personal Information Section */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight="600" color="primary">Personal Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={editForm.name}
                onChange={(e) => handleEditFormChange('name', e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={editForm.email}
                onChange={(e) => handleEditFormChange('email', e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={editForm.dob}
                onChange={(e) => handleEditFormChange('dob', e.target.value)}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Father's Name"
                value={editForm.fatherName}
                onChange={(e) => handleEditFormChange('fatherName', e.target.value)}
                variant="outlined"
              />
            </Grid>

            {/* Contact Information Section */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ContactPhoneIcon sx={{ fontSize: 24, color: 'success.main', mr: 1 }} />
                <Typography variant="h6" fontWeight="600" color="success.main">Contact Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={editForm.address}
                onChange={(e) => handleEditFormChange('address', e.target.value)}
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={editForm.phoneNumber}
                onChange={(e) => handleEditFormChange('phoneNumber', e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={editForm.emergencyContact}
                onChange={(e) => handleEditFormChange('emergencyContact', e.target.value)}
                variant="outlined"
              />
            </Grid>

            {/* Password Section */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LockIcon sx={{ fontSize: 24, color: 'error.main', mr: 1 }} />
                <Typography variant="h6" fontWeight="600" color="error.main">Password Management</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </Grid>

             <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Current Password"
          type={showCurrentPassword ? 'text' : 'password'}
          value={teacherDetails?.plainPassword || '********'}
          variant="outlined"
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiInputBase-input': {
              backgroundColor: 'grey.100'
            }
          }}
        />
      </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="New Password (Optional)"
                type={showNewPassword ? 'text' : 'password'}
                value={editForm.newPassword}
                onChange={(e) => handleEditFormChange('newPassword', e.target.value)}
                variant="outlined"
                helperText="Leave blank to keep current password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleEditClose} variant="outlined" size="large">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained" 
            color="secondary"
            size="large"
            startIcon={<EditIcon />}
          >
            Update Profile
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
  );
};

export default TeacherDetails;