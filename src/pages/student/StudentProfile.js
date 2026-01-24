import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableHead,
  TableContainer,
  TableRow,
  TableCell,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { uploadStudentProfilePicture, getUserDetails } from '../../redux/userRelated/userHandle';
import { getSubjectList, getClassDetails } from '../../redux/sclassRelated/sclassHandle';
import CustomBarChart from '../../components/CustomBarChart';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import TableChartIcon from '@mui/icons-material/TableChart';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import ScrollToTop from '../../components/ScrollToTop';

const StudentProfile = () => {
  const { currentUser, response, error, userDetails, loading } = useSelector((state) => state.user);
  const { subjectsList, sclassDetails } = useSelector((state) => state.sclass);
  const dispatch = useDispatch();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [subjectMarks, setSubjectMarks] = useState([]);
  const [selectedSection, setSelectedSection] = useState('table');

  const sclassName = currentUser?.sclassName?.sclassName || 'N/A';
  const studentSchool = currentUser?.school?.schoolName || 'N/A';

  // Fetch user details and marks
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getUserDetails(currentUser._id, "Student"));
    }
  }, [dispatch, currentUser?._id]);

  // Extract subject marks from user details
  useEffect(() => {
    if (userDetails) {
      setSubjectMarks(userDetails.examResult || []);
    }
  }, [userDetails]);

  // Fetch subjects list for the class
  useEffect(() => {
    if (subjectMarks.length === 0 && currentUser?.sclassName?._id) {
      dispatch(getSubjectList(currentUser.sclassName._id, "ClassSubjects"));
    }
  }, [subjectMarks.length, dispatch, currentUser?.sclassName?._id]);

  // Fetch class details
  useEffect(() => {
    if (currentUser?.sclassName?._id) {
      dispatch(getClassDetails(currentUser.sclassName._id, "Sclass"));
    }
  }, [dispatch, currentUser?.sclassName?._id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert('Please select an image first!');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await dispatch(uploadStudentProfilePicture(currentUser._id, formData));

      if (result.success) {
        setSelectedFile(null);
        setPreviewUrl(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        alert('Profile picture uploaded successfully!');
      } else {
        alert(result.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSectionChange = (event, newSection) => {
    setSelectedSection(newSection);
  };

  const renderTableSection = () => {
  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 4, 
        mb: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0, 0, 0, 0.26)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-3px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
        }
      }}
    >
    
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          fontWeight="bold" 
          sx={{
            color: 'primary.main',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            mb: 3
          }}
        >
          Subject Marks
        </Typography>
        <TableContainer 
          sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Subject</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>Marks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjectMarks.map((result, index) => {
                if (!result.subName || !result.marksObtained) {
                  return null;
                }
                return (
                  <TableRow
                    key={index}
                    sx={{
                      "&:hover": { 
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      },
                      transition: "all 0.3s ease",
                      background: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent'
                    }}
                  >
                    <TableCell sx={{ fontSize: '1rem', fontWeight: 500 }}>{result.subName.subName}</TableCell>
                    <TableCell align="center" sx={{ fontSize: '1rem', fontWeight: 600, color: 'black' }}>{result.marksObtained}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  const renderChartSection = () => {
  return (
    <Paper 
      sx={{ 
        p: 3, 
        borderRadius: 1, 
        mb: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(25, 118, 210, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-3px)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
        }
      }}
    >
      
        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom 
          fontWeight="bold" 
          sx={{
            color: 'black',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            mb: 3
          }}
        >
          Performance Chart
        </Typography>
        <CustomBarChart chartData={subjectMarks} dataKey="marksObtained" />
      </Paper>
    );
  };

  const renderClassDetailsSection = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
        maxWidth: "100%",
        mx: "auto",
        boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.08)',
        background: 'white',
        border: '1px solid #e0e0e0',
        marginBottom: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-3px)',
        }
      }}
    >
     
    

      {/* Bottom Content Box */}
      <Box
        sx={{
          background: 'white',
          p: 3,
          textAlign: "left"
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          sx={{ 
            color: "black", 
            mb: 3,
            borderBottom: '2px solid',
            borderColor: 'primary.light',
            pb: 1
          }}
        >
          Class Details
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ color: "#333", mb: 2 }}>
          You are currently in <Box component="span" sx={{ color: "#333", fontWeight: "bold" }}>Class {sclassDetails?.sclassName}</Box>
        </Typography>

        <Box mt={3}>
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ 
              color: "black", 
              mb: 2,
              pb: 1,
              borderBottom: '2px solid',
              borderColor: 'primary.light'
            }}
          >
            Subjects
          </Typography>

          {subjectsList && subjectsList.length > 0 ? (
            subjectsList.map((subject, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderBottom: "1px solid #e0e0e0",
                  "&:last-child": { borderBottom: "none" },
                  background: index % 2 === 0 ? '#f8f9fa' : 'white',
                  borderRadius: '4px',
                  mb: 1,
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                <Typography variant="body1" sx={{ color: "#000", fontWeight: 500 }}>
                  {subject.subName} <Box component="span" sx={{ color: "text.secondary", fontSize: '0.9rem' }}>({subject.subCode})</Box>
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: 'italic', p: 2 }}>
              No subjects found.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

  useEffect(() => {
    return () => previewUrl && URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <>
      <ScrollToTop />
      <StyledContainer maxWidth="md">
        {/* Profile Header Section */}
        <StyledPaper elevation={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" flexDirection="column" alignItems="center">
                <Avatar
                  alt="Student Avatar"
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

                <Box mt={2} display="flex" flexDirection="column" alignItems="center" gap={1}>
                  <FileInput type="file" accept="image/*" onChange={handleFileChange} />
                  <StyledButton
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {uploading ? 'Uploading...' : 'Upload Picture'}
                  </StyledButton>
                  {selectedFile && (
                    <Typography variant="caption" color="text.secondary">
                      Selected: {selectedFile.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Student Basic Info */}
            <Grid item xs={12}>
              <Typography variant="h5" align="center" fontWeight={600}>
                {currentUser?.name}
              </Typography>
              <Typography variant="subtitle1" align="center" color="text.secondary">
                Roll No: {currentUser?.rollNum}
              </Typography>
              <Typography variant="subtitle1" align="center" color="text.secondary">
                Class: {sclassName}
              </Typography>
              <Typography variant="subtitle1" align="center" color="text.secondary">
                School: {studentSchool}
              </Typography>
            </Grid>
          </Grid>
        </StyledPaper>

        {/* Class Details Section */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading class details...</Typography>
          </Box>
        ) : (
          <>
            {/* Show Class Details if no marks */}
            {(!subjectMarks || subjectMarks.length === 0) && renderClassDetailsSection()}
            
            {/* Show Marks Table/Chart if marks exist */}
            {subjectMarks && subjectMarks.length > 0 && (
              <>
                {selectedSection === 'table' && renderTableSection()}
                {selectedSection === 'chart' && renderChartSection()}
                
                <Paper
                  sx={{
                    position: 'relative',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    borderRadius: "16px",
                    background: 'transparent',
                    boxShadow: 'none',
                    marginBottom: 3
                  }}
                  elevation={0}
                >
                  <BottomNavigation
                    value={selectedSection}
                    onChange={handleSectionChange}
                    showLabels
                    sx={{
                      borderRadius: "16px",
                      background: 'linear-gradient(135deg, #000000ff 0%, #000000ff 100%)',
                      color: "#fff",
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      height: '70px'
                    }}
                  >
                    <BottomNavigationAction
                      label="Table"
                      value="table"
                      icon={selectedSection === 'table' ? 
                        <TableChartIcon sx={{ fontSize: 28 }} /> : 
                        <TableChartOutlinedIcon sx={{ fontSize: 28 }} />
                      }
                      sx={{ 
                        color: "#fff",
                        '&.Mui-selected': { 
                          color: '#fff',
                          background: 'rgba(255,255,255,0.15)',
                          borderRadius: 2,
                          mx: 1
                        }
                      }}
                    />
                    <BottomNavigationAction
                      label="Chart"
                      value="chart"
                      icon={selectedSection === 'chart' ? 
                        <InsertChartIcon sx={{ fontSize: 28 }} /> : 
                        <InsertChartOutlinedIcon sx={{ fontSize: 28 }} />
                      }
                      sx={{ 
                        color: "#fff",
                        '&.Mui-selected': { 
                          color: '#fff',
                          background: 'rgba(255,255,255,0.15)',
                          borderRadius: 2,
                          mx: 1
                        }
                      }}
                    />
                  </BottomNavigation>
                </Paper>
              </>
            )}
          </>
        )}

        {/* Personal Info Section */}
        <StyledCard>
          <CardContent>
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Personal Information
            </Typography>
            <br/>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Date of Birth:</InfoLabel> {currentUser?.dob ? new Date(currentUser.dob).toDateString() : 'N/A'}
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Guardian's Name:</InfoLabel> {currentUser?.fatherName || 'N/A'}
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Email:</InfoLabel> {currentUser?.email || 'N/A'}
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Phone:</InfoLabel> {currentUser?.phoneNumber || 'N/A'}
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Address:</InfoLabel> {currentUser?.address || 'N/A'}
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoLabel>Emergency Contact:</InfoLabel> {currentUser?.emergencyContact || 'N/A'}
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      </StyledContainer>
    </>
  );
};

export default StudentProfile;

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
  box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-3px);
  }

  @media (max-width: 600px) {
    padding: 20px;
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

const StyledButton = styled(Button)`
  background: #1976d2;
  color: white;
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  padding: 8px 20px;
  transition: 0.3s;
  &:hover {
    background: #125aa0;
    transform: scale(1.03);
  }
`;

const InfoLabel = styled.strong`
  color: #333;
  font-weight: 600;
`;