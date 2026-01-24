import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  CardActions,
  Fade,
  Zoom,
  Alert,
  IconButton,
  Collapse,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  registerFinance, 
  getFinanceByAdmin,
  updateFinance,
  deleteFinance
} from "../../../redux/financeRelated/financeHandle";
import { clearFinanceState } from "../../../redux/financeRelated/financeSlice";
import { BlueButton } from "../../../components/buttonStyles";
import Popup from "../../../components/Popup";
import styled from "styled-components";
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const AddFinance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userState = useSelector((state) => state.user);
  const { currentUser } = userState || {};
  const adminID = currentUser?._id;

  const financeState = useSelector((state) => state.finance || {});
  const { status = "idle", response, error, financeList = [] } = financeState;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [financeData, setFinanceData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editingFinance, setEditingFinance] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [financeToDelete, setFinanceToDelete] = useState(null);

  // Load finance accounts on mount
  useEffect(() => {
    console.log("🚀 Component mounted, adminID:", adminID);
    if (adminID) {
      console.log("📡 Dispatching getFinanceByAdmin...");
      dispatch(getFinanceByAdmin(adminID));
    }
  }, [adminID, dispatch]);

  // Handle finance list updates
  useEffect(() => {
    console.log("📊 Finance State Updated:", { status, response, financeList });
    
    if (status === "succeeded" && Array.isArray(response)) {
      console.log("✅ Setting finance data:", response);
      setFinanceData(response);
    } else if (status === "succeeded" && Array.isArray(financeList)) {
      console.log("✅ Setting finance data from financeList:", financeList);
      setFinanceData(financeList);
    }
  }, [status, response, financeList]);

  // Handle create/update success
useEffect(() => {
  console.log("🔄 Finance operation status:", status);
  
  if (status === "succeeded") {
    setLoader(false);
    
    // Check if this is a create/update/delete operation (not a fetch)
    if (response && !Array.isArray(response) && response.message) {
      setSuccessMessage(response.message || "Operation completed successfully!");
      setShowSuccessAlert(true);
      setName("");
      setEmail("");
      setPassword("");
      setShowForm(false);
      setEditMode(false);
      setEditingFinance(null);
      
      // Refresh finance data
      if (adminID) {
        dispatch(getFinanceByAdmin(adminID));
      }
      
      // Clear state after delay
      setTimeout(() => {
        setShowSuccessAlert(false);
        dispatch(clearFinanceState());
      }, 3000);
    }
  } else if (status === "failed") {
    setLoader(false);
    setMessage(error || response || "Operation failed");
    setShowPopup(true);
    
    // Reset loading state but keep error for display
    setTimeout(() => {
      dispatch(clearFinanceState());
    }, 3000);
  }
}, [status, response, error, dispatch, adminID]);

// Separate effect for loading state
useEffect(() => {
  if (status === "loading") {
    setLoader(true);
  }
}, [status]);   

const submitHandler = async (e) => {
  e.preventDefault();

  if (!name || !email || (!password && !editMode)) {
    setMessage("Please fill all required fields");
    setShowPopup(true);
    return;
  }

  const payload = {
    name,
    email,
    adminID,
    ...(password && { password })
  };

  setLoader(true);
  
  try {
    if (editMode && editingFinance) {
      await dispatch(updateFinance(editingFinance._id, payload)).unwrap();
    } else {
      await dispatch(registerFinance(payload)).unwrap();
    }
  } catch (error) {
    // Error is handled by the Redux state, so we just need to ensure loader is reset
    setLoader(false);
  }
};

  const handleEdit = (finance) => {
    setEditMode(true);
    setEditingFinance(finance);
    setName(finance.name);
    setEmail(finance.email);
    setPassword("");
    setShowForm(true);
  };

  const handleDeleteClick = (finance) => {
    setFinanceToDelete(finance);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (financeToDelete) {
      dispatch(deleteFinance(financeToDelete._id, adminID));
      setDeleteDialogOpen(false);
      setFinanceToDelete(null);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditMode(false);
    setEditingFinance(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <StyledContainer>
      {/* Success Alert */}
      <Collapse in={showSuccessAlert}>
        <Alert 
          severity="success" 
          sx={{ 
            position: 'fixed', 
            top: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            zIndex: 2000,
            minWidth: 300,
            boxShadow: 6,
            borderRadius: 2
          }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setShowSuccessAlert(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {successMessage || "Operation completed successfully!"}
        </Alert>
      </Collapse>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 400 }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            <Typography variant="h6" fontWeight="bold">Confirm Delete</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the finance account for <strong>{financeToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {!showForm ? (
        // --- Finance Home View ---
        <Zoom in={true} timeout={500}>
          <StyledBox>
            <HeaderSection>
              <GradientIconWrapper>
                <AccountCircleIcon sx={{ fontSize: 56, color: 'white' }} />
              </GradientIconWrapper>
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 800, color: '#1a237e' }}>
                Finance Management
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, fontWeight: 400 }}>
                Manage your finance officer accounts and permissions
              </Typography>
            </HeaderSection>

            {status === "loading" && financeData.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                <CircularProgress size={60} />
              </Box>
            ) : financeData && financeData.length > 0 ? (
              <FinanceSection>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#1a237e' }}>
                      Finance Officers
                    </Typography>
                    <Chip 
                      label={financeData.length} 
                      color="primary" 
                      size="small"
                      sx={{  fontSize: '0.5rem' }}
                    />
                  </Box>
                  <BlueButton
                    size="small"
                    variant="contained"
                    onClick={() => setShowForm(true)}
                    startIcon={<PersonAddIcon />}
                    sx={{ 
                      px: 0.8,
                      py: 0.8,
                      borderRadius: 3,
                      boxShadow: 3,
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    Add New Officer
                  </BlueButton>
                </Box>
                
                <Grid container spacing={3}>
                  {financeData.map((finance, index) => (
                    <Grid item xs={12} md={6} lg={4} key={finance._id}>
                      <Fade in={true} timeout={600 + (index * 100)}>
                        <FinanceCard elevation={2}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                              <Box sx={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: '50%', 
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '1.25rem'
                              }}>
                                {finance.name?.charAt(0).toUpperCase()}
                              </Box>
                              <Chip 
                                label="Active" 
                                color="success" 
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Box>

                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1a237e', mb: 2 }}>
                              {finance.name}
                            </Typography>

                            <InfoItem>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                <Typography variant="body2" color="text.secondary">Email</Typography>
                              </Box>
                              <Typography variant="body2" fontWeight="500" sx={{ wordBreak: 'break-all' }}>
                                {finance.email}
                              </Typography>
                            </InfoItem>

                            {finance.school && (
                              <InfoItem>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <SchoolIcon sx={{ fontSize: 18, color: '#64748b' }} />
                                  <Typography variant="body2" color="text.secondary">School</Typography>
                                </Box>
                                <Typography variant="body2" fontWeight="500">
                                  {finance.school}
                                </Typography>
                              </InfoItem>
                            )}

                            <InfoItem sx={{ borderBottom: 'none', mb: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarTodayIcon sx={{ fontSize: 16, color: '#64748b' }} />
                                <Typography variant="caption" color="text.secondary">Created</Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(finance.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </Typography>
                            </InfoItem>
                          </CardContent>
                          
                          <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                            <Button 
                              variant="outlined" 
                              color="primary"
                              fullWidth
                              size="medium"
                              startIcon={<EditIcon />}
                              onClick={() => handleEdit(finance)}
                              sx={{ borderRadius: 2 }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outlined" 
                              color="error"
                              fullWidth
                              size="medium"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteClick(finance)}
                              sx={{ borderRadius: 2 }}
                            >
                              Delete
                            </Button>
                          </CardActions>
                        </FinanceCard>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
              </FinanceSection>
            ) : (
              <EmptyState>
                <EmptyStateIcon>
                  <PeopleIcon sx={{ fontSize: 80, color: '#cbd5e1' }} />
                </EmptyStateIcon>
                <Typography variant="h5" sx={{ mb: 2, color: '#334155', fontWeight: 700 }}>
                  No Finance Officers Yet
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 4, maxWidth: 400 }}>
                  Get started by creating your first finance officer account to manage financial operations
                </Typography>
                <BlueButton
                  size="large"
                  variant="contained"
                  onClick={() => setShowForm(true)}
                  startIcon={<PersonAddIcon />}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    boxShadow: 4,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Create First Account
                </BlueButton>
              </EmptyState>
            )}
          </StyledBox>
        </Zoom>
      ) : (
        // --- Finance Form View ---
        <Fade in={true} timeout={500}>
          <FormBox>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleCancelForm}
              sx={{ mb: 3, alignSelf: 'flex-start', fontWeight: 600 }}
            >
              Back to Finance List
            </Button>

            <FormHeader>
              <GradientIconWrapper>
                {editMode ? <EditIcon sx={{ fontSize: 56, color: 'white' }} /> : <PersonAddIcon sx={{ fontSize: 56, color: 'white' }} />}
              </GradientIconWrapper>
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 800, color: '#1a237e' }}>
                {editMode ? "Update Finance Officer" : "Create Finance Account"}
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, fontWeight: 400 }}>
                {editMode ? "Update the finance officer information" : "Add a new finance officer to your organization"}
              </Typography>
            </FormHeader>

            <form onSubmit={submitHandler} style={{ width: '100%', maxWidth: 600 }}>
              <Stack spacing={3}>
                <TextField
                  label="Full Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      }
                    }
                  }}
                />
                <TextField
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  disabled={editMode}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      }
                    }
                  }}
                />
                <TextField
                  label={editMode ? "New Password (leave blank to keep current)" : "Password"}
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editMode}
                  fullWidth
                  helperText={editMode ? "Only fill this if you want to change the password" : "Temporary password (finance officer should change it after first login)"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: '#1976d2',
                      }
                    }
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    onClick={handleCancelForm}
                    disabled={loader}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1rem',
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </Button>
                  <BlueButton
                    fullWidth
                    size="large"
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: 3,
                      '&:hover': {
                        boxShadow: 6
                      }
                    }}
                    variant="contained"
                    type="submit"
                    disabled={loader}
                    startIcon={loader ? <CircularProgress size={20} color="inherit" /> : null}
                  >
                    {loader ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Update Officer" : "Create Finance Account")}
                  </BlueButton>
                </Box>
              </Stack>
            </form>
          </FormBox>
        </Fade>
      )}

      <Popup
        message={message}
        setShowPopup={setShowPopup}
        showPopup={showPopup}
      />
    </StyledContainer>
  );
};

export default AddFinance;

// --- Styled Components ---
const StyledContainer = styled(Box)`
  flex: 1 1 auto;
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background: #ffffff;
  padding: 40px 20px;
  position: relative;

  @media (max-width: 768px) {
    padding: 20px 15px;
  }
`;

const StyledBox = styled(Box)`
  width: 100%;
  max-width: 1400px;
  padding: 50px 3rem;
  background: white;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border-radius: 24px;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 40px 2rem;
    border-radius: 20px;
  }

  @media (max-width: 480px) {
    padding: 30px 1.5rem;
    border-radius: 16px;
  }
`;

const FormBox = styled(StyledBox)`
  max-width: 800px;
`;

const HeaderSection = styled(Box)`
  width: 100%;
  margin-bottom: 3rem;
  text-align: center;
`;

const FormHeader = styled(HeaderSection)`
  margin-bottom: 2rem;
`;

const GradientIconWrapper = styled(Box)`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
`;

const FinanceSection = styled(Box)`
  width: 100%;
`;

const FinanceCard = styled(Card)`
  height: 100%;
  border-radius: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
  }
`;

const InfoItem = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const EmptyState = styled(Box)`
  padding: 5rem 3rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 20px;
  border: 3px dashed #cbd5e1;
  margin-top: 2rem;
  width: 100%;
  max-width: 600px;
  text-align: center;

  @media (max-width: 480px) {
    padding: 4rem 2rem;
  }
`;

const EmptyStateIcon = styled(Box)`
  margin-bottom: 1.5rem;
`;