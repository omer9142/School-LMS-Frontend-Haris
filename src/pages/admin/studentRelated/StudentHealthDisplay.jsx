import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LocalHospital,
  Bloodtype,
  Favorite,
  Scale,
  Height,
  MedicalServices,
  Warning,
  Edit,
  AccessTime,
  Restaurant,
  DirectionsRun,
  Computer,
  Groups,
  EmojiEvents,
  Psychology,
} from '@mui/icons-material';
import { getStudentHealthInfo } from '../../../redux/studentHealthRelated/studentHealthHandle';

const StudentHealthDisplay = ({ studentId, userRole, canEdit = false, onEditClick }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get health data from Redux
  const { healthData, loading, error } = useSelector((state) => state.studentHealth);

  // Fetch health data
  useEffect(() => {
    if (studentId) {
      console.log('🔄 Dispatching getStudentHealthInfo for student:', studentId);
      dispatch(getStudentHealthInfo(studentId));
    }
  }, [dispatch, studentId]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        py: 8,
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading health information...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 2, 
            maxWidth: 500, 
            mx: 'auto',
            textAlign: 'left'
          }}
        >
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            Unable to Load Health Information
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => dispatch(getStudentHealthInfo(studentId))}
          sx={{ mt: 1 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!healthData || Object.keys(healthData).length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="info" sx={{ mb: 2, maxWidth: 500, mx: 'auto' }}>
          <Typography variant="body1" gutterBottom>
            No Health Information Found
          </Typography>
          <Typography variant="body2">
            No health records have been created for this student yet.
          </Typography>
        </Alert>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<LocalHospital />}
            onClick={onEditClick}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              },
            }}
          >
            Add Health Information
          </Button>
        )}
      </Box>
    );
  }

  console.log('📦 Health data received in display component:', healthData);

  // Extract data from the health record
  const medicalHistory = healthData.medicalHistory || {};
  const habits = healthData.habits || {};

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Render medical history section
  const renderMedicalHistory = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital /> Medical History
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {/* Blood Group */}
          {medicalHistory.bloodGroup && (
            <Grid item xs={6} sm={4} md={3}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <Bloodtype sx={{ color: 'error.main', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Blood Group</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>{medicalHistory.bloodGroup}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Last Checkup Date */}
          {medicalHistory.lastCheckupDate && (
            <Grid item xs={6} sm={4} md={3}>
              <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                <AccessTime sx={{ color: 'info.main', mb: 1 }} />
                <Typography variant="body2" color="textSecondary">Last Checkup</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>{formatDate(medicalHistory.lastCheckupDate)}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Allergies */}
          {medicalHistory.allergies && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning color="warning" /> Allergies
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{medicalHistory.allergies}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Chronic Conditions */}
          {medicalHistory.chronicConditions && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MedicalServices color="error" /> Chronic Conditions
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{medicalHistory.chronicConditions}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Current Medications */}
          {medicalHistory.currentMedications && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom>Current Medications</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{medicalHistory.currentMedications}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Past Surgeries */}
          {medicalHistory.pastSurgeries && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom>Past Surgeries</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{medicalHistory.pastSurgeries}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Vaccinations */}
          {medicalHistory.vaccinations && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom>Vaccinations</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{medicalHistory.vaccinations}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Emergency Medical Notes */}
          {medicalHistory.emergencyMedicalNotes && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mt: 1, bgcolor: 'warning.light', border: '2px solid', borderColor: 'warning.main' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'warning.dark', fontWeight: 'bold' }}>
                  ⚠️ Emergency Medical Notes
                </Typography>
                <Typography variant="body2" sx={{ color: 'warning.dark', whiteSpace: 'pre-line' }}>
                  {medicalHistory.emergencyMedicalNotes}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  // Render habits section
  const renderHabitsSection = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Psychology /> Habits & Behavior
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {/* Sleep Pattern */}
          {habits.sleepPattern && (
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime color="info" /> Sleep Pattern
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{habits.sleepPattern}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Eating Habits */}
          {habits.eatingHabits && (
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Restaurant color="success" /> Eating Habits
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{habits.eatingHabits}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Physical Activity */}
          {habits.physicalActivity && (
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsRun color="primary" /> Physical Activity
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{habits.physicalActivity}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Screen Time */}
          {habits.screenTime && (
            <Grid item xs={12} md={6}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Computer color="secondary" /> Screen Time
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{habits.screenTime}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Social Behavior */}
          {habits.socialBehavior && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Groups color="info" /> Social Behavior
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{habits.socialBehavior}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Strengths & Interests */}
          {habits.strengthsAndInterests && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmojiEvents color="warning" /> Strengths & Interests
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{habits.strengthsAndInterests}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Behavioral Notes */}
          {habits.behavioralNotes && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom>Behavioral Notes</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{habits.behavioralNotes}</Typography>
              </Paper>
            </Grid>
          )}

          {/* Additional Notes */}
          {habits.additionalNotes && (
            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom>Additional Notes</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{habits.additionalNotes}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ py: 2 }}>
      {/* Header with Edit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalHospital color="primary" />
          Student Health Information
        </Typography>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={onEditClick}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
              },
            }}
          >
            Edit Health Information
          </Button>
        )}
      </Box>

      {/* Record Info */}
    
<Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
  <CardContent>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Typography variant="body2" color="textSecondary">Created By</Typography>
        <Typography variant="body1">
          {healthData.createdByRole || 'Unknown'}
        </Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="body2" color="textSecondary">Last Updated</Typography>
        <Typography variant="body1">
          {formatDate(healthData.updatedAt || healthData.createdAt)}
        </Typography>
      </Grid>
      {healthData.lastUpdatedByRole && (
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">Last Updated By</Typography>
          <Typography variant="body1">
            {healthData.lastUpdatedByRole}
          </Typography>
        </Grid>
      )}
    </Grid>
  </CardContent>
</Card>

      {/* Medical History */}
      {renderMedicalHistory()}

      {/* Habits & Behavior */}
      {renderHabitsSection()}

      {/* Footer Information */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          This information was last updated on {formatDate(healthData.updatedAt || healthData.createdAt)}
        </Typography>
      </Box>
    </Box>
  );
};

export default StudentHealthDisplay;