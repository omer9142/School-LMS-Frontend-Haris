import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Avatar,
  Container,
  Paper,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material';
import { updateSuccess } from '../../redux/teacherRelated/teacherSlice';
import { useSelector, useDispatch } from 'react-redux';
import ScrollToTop from '../../components/ScrollToTop';

const TeacherProfile = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    emergencyContact: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phoneNumber: currentUser.phoneNumber || '',
        address: currentUser.address || '',
        emergencyContact: currentUser.emergencyContact || '',
      });
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      await axios.put(`${process.env.REACT_APP_BASE_URL}/Teacher/${currentUser._id}`, formData);
      const { data: freshTeacher } = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/Teacher/${currentUser._id}`
      );
      dispatch(updateSuccess(freshTeacher));
      localStorage.setItem('user', JSON.stringify(freshTeacher));
      setFormData({
        name: freshTeacher.name || '',
        email: freshTeacher.email || '',
        phoneNumber: freshTeacher.phoneNumber || '',
        address: freshTeacher.address || '',
        emergencyContact: freshTeacher.emergencyContact || '',
      });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to update details');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => previewUrl && URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const teachClasses = currentUser?.teachSclass || [];
  const teachSubjects = currentUser?.teachSubject || [];
  const teacherSchool = currentUser?.school?.schoolName || 'N/A';

  return (
    <>
      <ScrollToTop />
      <StyledContainer maxWidth="md">
        {/* Header Section */}
        <StyledPaper elevation={4}>
          <Grid container spacing={2}>
            {/* Profile Picture */}
            <Grid item xs={12}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <Avatar
                  alt="Teacher Avatar"
                  src={previewUrl || currentUser?.profileImage?.url || ''}
                  sx={{
                    width: 150,
                    height: 150,
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
                    border: '3px solid white',
                  }}
                >
                  {currentUser?.name?.charAt(0)}
                </Avatar>

                
              </Box>
            </Grid>

            {/* Teacher Info */}
            <Grid item xs={12}>
              <MobileTitle variant="h5" align="center" fontWeight={600}>
                {currentUser?.name}
              </MobileTitle>
              <MobileSubtitle variant="subtitle1" align="center" color="text.secondary">
                School: {teacherSchool}
              </MobileSubtitle>
              <MobileSubtitle variant="subtitle1" align="center" color="text.secondary">
                Classes: {teachClasses.map((cls) => cls?.sclassName).join(', ') || 'N/A'}
              </MobileSubtitle>
              <MobileSubtitle variant="subtitle1" align="center" color="text.secondary">
                Subjects: {teachSubjects.map((sub) => sub?.subName).join(', ') || 'N/A'}
              </MobileSubtitle>
            </Grid>
          </Grid>
        </StyledPaper>

        {/* Personal Info Section */}
        <StyledCard>
          <CardContent>
            <MobileSectionTitle variant="h4" gutterBottom fontWeight={600}>
              Personal Information
            </MobileSectionTitle>
            <br />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Date of Birth:</InfoLabel>{' '}
                <MobileInfoText>
                  {currentUser?.dob ? new Date(currentUser.dob).toDateString() : 'N/A'}
                </MobileInfoText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Father's Name:</InfoLabel>{' '}
                <MobileInfoText>{currentUser?.fatherName || 'N/A'}</MobileInfoText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Email:</InfoLabel>{' '}
                <MobileInfoText>{currentUser?.email || 'N/A'}</MobileInfoText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Phone:</InfoLabel>{' '}
                <MobileInfoText>{currentUser?.phoneNumber || 'N/A'}</MobileInfoText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Address:</InfoLabel>{' '}
                <MobileInfoText>{currentUser?.address || 'N/A'}</MobileInfoText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Emergency Contact:</InfoLabel>{' '}
                <MobileInfoText>{currentUser?.emergencyContact || 'N/A'}</MobileInfoText>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>

        {/* Editable Update Form (kept same) */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <MobileFormTitle variant="h6" gutterBottom>
              Update Details
            </MobileFormTitle>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <MobileTextField 
                  label="Name" 
                  name="name" 
                  fullWidth 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MobileTextField 
                  label="Email" 
                  name="email" 
                  fullWidth 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MobileTextField 
                  label="Phone" 
                  name="phoneNumber" 
                  fullWidth 
                  value={formData.phoneNumber} 
                  onChange={handleInputChange} 
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MobileTextField 
                  label="Address" 
                  name="address" 
                  fullWidth 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <MobileTextField 
                  label="Emergency Contact" 
                  name="emergencyContact" 
                  fullWidth 
                  value={formData.emergencyContact} 
                  onChange={handleInputChange} 
                  size="small"
                />
              </Grid>
            </Grid>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <MobileButton
                variant="contained"
                color="primary"
                onClick={handleSaveChanges}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : null}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </MobileButton>
            </Box>
          </CardContent>
        </Card>
      </StyledContainer>
    </>
  );
};

export default TeacherProfile;

/* -------------------- Styled Components -------------------- */

const StyledContainer = styled(Container)`
  padding: 30px 10px;
  @media (max-width: 600px) {
    padding: 15px;
  }
`;

const StyledPaper = styled(Paper)`
  padding: 25px;
  margin-bottom: 25px;
  background: linear-gradient(135deg, #f9fafb 0%, #eef1f5 100%);
  border-radius: 16px;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-3px);
  }
`;

const StyledCard = styled(Card)`
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-3px);
  }
`;

const FileInput = styled.input`
  margin-top: 10px;
  cursor: pointer;
  font-size: 0.9rem;
`;

const InfoLabel = styled.strong`
  color: #333;
  font-weight: 600;
  @media (max-width: 600px) {
    font-size: 0.95rem;
    display: block;
    margin-bottom: 2px;
  }
`;

/* -------------------- Mobile-specific Typography Components -------------------- */

const MobileTitle = styled(Typography)`
  @media (max-width: 600px) {
    font-size: 1.5rem !important;
    line-height: 1.3;
  }
`;

const MobileSubtitle = styled(Typography)`
  @media (max-width: 600px) {
    font-size: 0.9rem !important;
    line-height: 1.4;
    margin-bottom: 4px;
  }
`;

const MobileSectionTitle = styled(Typography)`
  @media (max-width: 600px) {
    font-size: 1.4rem !important;
    line-height: 1.3;
  }
`;

const MobileFormTitle = styled(Typography)`
  @media (max-width: 600px) {
    font-size: 1.2rem !important;
    line-height: 1.3;
  }
`;

const MobileInfoText = styled.span`
  @media (max-width: 600px) {
    font-size: 0.95rem;
    line-height: 1.4;
  }
`;

const MobileTextField = styled(TextField)`
  @media (max-width: 600px) {
    & .MuiInputBase-root {
      font-size: 0.95rem;
    }
    & .MuiInputLabel-root {
      font-size: 0.95rem;
    }
  }
`;

const MobileButton = styled(Button)`
  @media (max-width: 600px) {
    font-size: 0.9rem !important;
    padding: 8px 16px !important;
  }
`;