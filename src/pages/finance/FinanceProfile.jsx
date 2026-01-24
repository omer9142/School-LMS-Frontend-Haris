// src/pages/finance/FinanceProfile.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Container,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { updateFinanceProfile } from "../../redux/financeRelated/financeHandle";
import EmailIcon from "@mui/icons-material/Email";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonIcon from "@mui/icons-material/Person";

const FinanceProfile = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  
  // State for editable fields
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Form fields
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");

  // Reset form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
    }
  }, [currentUser]);

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit mode - reset form
      setName(currentUser?.name || "");
      setEmail(currentUser?.email || "");
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    // Basic validation
    if (!name.trim()) {
      setSnackbar({
        open: true,
        message: "Name is required",
        severity: "error"
      });
      return;
    }

    if (!email.trim()) {
      setSnackbar({
        open: true,
        message: "Email is required",
        severity: "error"
      });
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        name: name.trim(),
        email: email.trim(),
      };

      // Dispatch update action
      await dispatch(updateFinanceProfile(currentUser._id, updateData)).unwrap();

      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success"
      });

      setEditMode(false);

    } catch (error) {
      setSnackbar({
        open: true,
        message: error?.message || "Failed to update profile",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          My Profile
        </Typography>
      </Box>

      {/* Centered Card */}
      <Card sx={{ boxShadow: 3, maxWidth: 800, mx: "auto" }}>
        <CardContent sx={{ p: 4 }}>
          {/* Profile Header with Avatar */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: "primary.main",
                mb: 3,
                fontSize: "3rem",
                fontWeight: "bold"
              }}
            >
              {currentUser?.name?.charAt(0).toUpperCase() || "F"}
            </Avatar>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {currentUser?.name || "Finance Officer"}
            </Typography>
            
            {!editMode ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditToggle}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleEditToggle}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Profile Information - Centered Layout */}
          {editMode ? (
            // Edit Form
            <Box sx={{ maxWidth: 500, mx: "auto" }}>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom sx={{ mb: 3 }}>
                Edit Profile Information
              </Typography>
              
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  variant="outlined"
                  size="medium"
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  variant="outlined"
                  size="medium"
                />
              </Stack>
            </Box>
          ) : (
            // View Mode - Profile Details
            <Box sx={{ maxWidth: 600, mx: "auto" }}>
              <Grid container spacing={3}>
                {/* Email */}
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <EmailIcon color="primary" sx={{ fontSize: 30 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {currentUser?.email || "Not set"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* School */}
                {currentUser?.school && (
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                      <SchoolIcon color="primary" sx={{ fontSize: 30 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          School
                        </Typography>
                        <Typography variant="body1" fontWeight="500">
                          {currentUser.school}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Member Since */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <CalendarTodayIcon color="primary" sx={{ fontSize: 30 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Member Since
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {formatDate(currentUser?.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Role */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                    <PersonIcon color="primary" sx={{ fontSize: 30 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Role
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        Finance Officer
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FinanceProfile;