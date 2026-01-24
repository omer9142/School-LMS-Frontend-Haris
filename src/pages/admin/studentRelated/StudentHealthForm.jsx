import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  CircularProgress,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';
import styled from 'styled-components';
import { getStudentHealthInfo, createOrUpdateHealthInfo } from '../../../redux/studentHealthRelated/studentHealthHandle';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const StudentHealthForm = () => {
  const { studentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { healthData, loading, error } = useSelector((state) => state.studentHealth);
  const { currentUser } = useSelector((state) => state.user);
  const { currentRole } = useSelector((state) => state.user); // Moved from handleSubmit
  
  const [formData, setFormData] = useState({
    medicalHistory: {
      bloodGroup: '',
      allergies: '',
      chronicConditions: '',
      currentMedications: '',
      pastSurgeries: '',
      vaccinations: '',
      emergencyMedicalNotes: '',
      lastCheckupDate: ''
    },
    habits: {
      sleepPattern: '',
      eatingHabits: '',
      physicalActivity: '',
      screenTime: '',
      behavioralNotes: '',
      strengthsAndInterests: '',
      socialBehavior: '',
      additionalNotes: ''
    }
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  // Fetch existing health data
  useEffect(() => {
    if (studentId) {
      dispatch(getStudentHealthInfo(studentId));
    }
  }, [dispatch, studentId]);

  // Populate form with existing data
  useEffect(() => {
    if (healthData) {
      setFormData({
        medicalHistory: {
          bloodGroup: healthData.medicalHistory?.bloodGroup || '',
          allergies: healthData.medicalHistory?.allergies || '',
          chronicConditions: healthData.medicalHistory?.chronicConditions || '',
          currentMedications: healthData.medicalHistory?.currentMedications || '',
          pastSurgeries: healthData.medicalHistory?.pastSurgeries || '',
          vaccinations: healthData.medicalHistory?.vaccinations || '',
          emergencyMedicalNotes: healthData.medicalHistory?.emergencyMedicalNotes || '',
          lastCheckupDate: healthData.medicalHistory?.lastCheckupDate 
            ? new Date(healthData.medicalHistory.lastCheckupDate).toISOString().split('T')[0]
            : ''
        },
        habits: {
          sleepPattern: healthData.habits?.sleepPattern || '',
          eatingHabits: healthData.habits?.eatingHabits || '',
          physicalActivity: healthData.habits?.physicalActivity || '',
          screenTime: healthData.habits?.screenTime || '',
          behavioralNotes: healthData.habits?.behavioralNotes || '',
          strengthsAndInterests: healthData.habits?.strengthsAndInterests || '',
          socialBehavior: healthData.habits?.socialBehavior || '',
          additionalNotes: healthData.habits?.additionalNotes || ''
        }
      });
    }
  }, [healthData]);

  const handleMedicalChange = (field) => (e) => {
    setFormData({
      ...formData,
      medicalHistory: {
        ...formData.medicalHistory,
        [field]: e.target.value
      }
    });
  };

  const handleHabitsChange = (field) => (e) => {
    setFormData({
      ...formData,
      habits: {
        ...formData.habits,
        [field]: e.target.value
      }
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setSubmitMessage({ type: '', text: '' });

  console.log('Submitting with currentUser:', currentUser); // Debug log

  const result = await dispatch(
    createOrUpdateHealthInfo(studentId, formData, currentUser) // Only 3 arguments
  );
  
  setSubmitting(false);
  
  if (result.success) {
    setSubmitMessage({ type: 'success', text: result.message || 'Health information saved successfully!' });
    setTimeout(() => {
      navigate(-1);
    }, 2000);
  } else {
    setSubmitMessage({ type: 'error', text: result.message || 'Failed to save health information' });
  }
};

  if (loading && !healthData) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading health information...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <StyledContainer maxWidth="md">
      <Box mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#1976d2' }}
        >
          Back to Student
        </Button>
      </Box>

      <StyledPaper elevation={3}>
        <Typography variant="h4" gutterBottom fontWeight={600} sx={{ color: '#000', mb: 3 }}>
          Student Health & Habits Management
        </Typography>

        {submitMessage.text && (
          <Alert severity={submitMessage.type} sx={{ mb: 3 }}>
            {submitMessage.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Medical History Section */}
          <SectionTitle variant="h5">Medical History</SectionTitle>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Blood Group"
                value={formData.medicalHistory.bloodGroup}
                onChange={handleMedicalChange('bloodGroup')}
              >
                <MenuItem value="">Not specified</MenuItem>
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Last Checkup Date"
                InputLabelProps={{ shrink: true }}
                value={formData.medicalHistory.lastCheckupDate}
                onChange={handleMedicalChange('lastCheckupDate')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Allergies"
                placeholder="e.g., Peanuts, Penicillin, Pollen"
                value={formData.medicalHistory.allergies}
                onChange={handleMedicalChange('allergies')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Chronic Conditions"
                placeholder="e.g., Asthma, Diabetes"
                value={formData.medicalHistory.chronicConditions}
                onChange={handleMedicalChange('chronicConditions')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Current Medications"
                placeholder="List any medications the student is currently taking"
                value={formData.medicalHistory.currentMedications}
                onChange={handleMedicalChange('currentMedications')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Past Surgeries"
                placeholder="List any past surgeries"
                value={formData.medicalHistory.pastSurgeries}
                onChange={handleMedicalChange('pastSurgeries')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Vaccinations"
                placeholder="List vaccination records"
                value={formData.medicalHistory.vaccinations}
                onChange={handleMedicalChange('vaccinations')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Emergency Medical Notes"
                placeholder="Important medical information for emergencies"
                value={formData.medicalHistory.emergencyMedicalNotes}
                onChange={handleMedicalChange('emergencyMedicalNotes')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fff3cd'
                  }
                }}
              />
              <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                ⚠️ This information will be highlighted for emergency reference
              </Typography>
            </Grid>
          </Grid>

          {/* Habits Section */}
          <SectionTitle variant="h5" sx={{ mt: 5 }}>Habits & Behavior</SectionTitle>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Sleep Pattern"
                placeholder="e.g., Sleeps 7-8 hours, goes to bed at 10 PM"
                value={formData.habits.sleepPattern}
                onChange={handleHabitsChange('sleepPattern')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Eating Habits"
                placeholder="e.g., Eats balanced meals, prefers vegetarian food"
                value={formData.habits.eatingHabits}
                onChange={handleHabitsChange('eatingHabits')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Physical Activity"
                placeholder="e.g., Plays soccer twice a week, active lifestyle"
                value={formData.habits.physicalActivity}
                onChange={handleHabitsChange('physicalActivity')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Screen Time"
                placeholder="e.g., 2 hours daily on phones/tablets"
                value={formData.habits.screenTime}
                onChange={handleHabitsChange('screenTime')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Social Behavior"
                placeholder="e.g., Friendly, works well in groups"
                value={formData.habits.socialBehavior}
                onChange={handleHabitsChange('socialBehavior')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Strengths & Interests"
                placeholder="e.g., Good at mathematics, interested in arts"
                value={formData.habits.strengthsAndInterests}
                onChange={handleHabitsChange('strengthsAndInterests')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Behavioral Notes"
                placeholder="Any behavioral observations or concerns"
                value={formData.habits.behavioralNotes}
                onChange={handleHabitsChange('behavioralNotes')}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Additional Notes"
                placeholder="Any other relevant information"
                value={formData.habits.additionalNotes}
                onChange={handleHabitsChange('additionalNotes')}
              />
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Box mt={4} display="flex" justifyContent="center">
            <SubmitButton
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            >
              {submitting ? 'Saving...' : 'Save Health Information'}
            </SubmitButton>
          </Box>
        </form>
      </StyledPaper>
    </StyledContainer>
  );
};

export default StudentHealthForm;

// Styled Components
const StyledContainer = styled(Container)`
  padding: 30px 10px;
  @media (max-width: 600px) {
    padding: 15px;
  }
`;

const StyledPaper = styled(Paper)`
  padding: 35px;
  border-radius: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 600px) {
    padding: 25px;
  }
`;

const SectionTitle = styled(Typography)`
  color: #1976d2;
  font-weight: 600;
  margin-bottom: 8px;
  margin-top: 16px;
`;

const SubmitButton = styled(Button)`
  background: #1976d2;
  color: white;
  border-radius: 8px;
  padding: 12px 40px;
  font-weight: 600;
  text-transform: none;
  transition: all 0.3s;
  &:hover {
    background: #125aa0;
    transform: scale(1.03);
  }
  &:disabled {
    background: #ccc;
  }
`;