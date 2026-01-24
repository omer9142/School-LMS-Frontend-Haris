import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper,
  Box,
  Checkbox,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Badge,
  Button,
  Snackbar,
  Container,
  alpha,
  CardHeader
} from '@mui/material';
import {
  CheckCircleOutline,
  RadioButtonUnchecked,
  Delete,
  Refresh,
  TrendingUp,
  Comment,
  AccessTime,
  CheckCircleOutline as CheckCircleOutlineIcon
} from '@mui/icons-material';
import { 
  getAllComplains, 
  updateComplainStatus,
  updateMultipleComplainsStatus,
  deleteComplain,
} from '../../../redux/complainRelated/complainHandle';
import TableTemplate from '../../../components/TableTemplate';
import { clearError, clearResponse  } from '../../../redux/complainRelated/complainSlice';


const SeeComplains = () => {
  const dispatch = useDispatch();
  const { complainsList, loading, error, response } = useSelector((state) => state.complain);
  const { currentUser } = useSelector(state => state.user);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getAllComplains(currentUser._id, "Complain"));
    }
  }, [currentUser._id, dispatch]);

  useEffect(() => {
    if (response) {
      setSnackbar({ open: true, message: response, severity: "info" });
      // Clear response after showing
      setTimeout(() => dispatch(clearResponse()), 3000);
    }
    if (error) {
      setSnackbar({ open: true, message: error, severity: "error" });
      // Clear error after showing
      setTimeout(() => dispatch(clearError()), 3000);
    }
  }, [response, error, dispatch]);

  const handleStatusToggle = async (complainId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
    try {
      await dispatch(updateComplainStatus(complainId, newStatus));
      setSnackbar({ open: true, message: `Complaint marked as ${newStatus}`, severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
    }
  };

  const handleMarkAllPending = async () => {
    const resolvedComplains = complainsList.filter(complain => complain.status === 'resolved');
    const resolvedIds = resolvedComplains.map(complain => complain._id);
    
    if (resolvedIds.length > 0) {
      try {
        await dispatch(updateMultipleComplainsStatus(resolvedIds, 'pending', currentUser._id));
        setSnackbar({ open: true, message: "All complaints marked as pending", severity: "success" });
      } catch (error) {
        setSnackbar({ open: true, message: "Failed to update complaints", severity: "error" });
      }
    } else {
      setSnackbar({ open: true, message: "No resolved complaints to update", severity: "info" });
    }
  };

  const handleDeleteComplain = async (complainId) => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        await dispatch(deleteComplain(complainId, currentUser._id));
        setSnackbar({ open: true, message: "Complaint deleted successfully", severity: "success" });
      } catch (error) {
        setSnackbar({ open: true, message: "Failed to delete complaint", severity: "error" });
      }
    }
  };

  const handleRefresh = () => {
    dispatch(getAllComplains(currentUser._id, "Complain"));
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const complainColumns = [
    { id: 'user', label: 'User', minWidth: 150 },
    { id: 'complaint', label: 'Complaint', minWidth: 250 }, // Increased width to show more text
    { id: 'date', label: 'Date', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 100 },
  ];

  const complainRows = complainsList?.map((complain) => {
    const userName = complain.user ? complain.user.name : 'Unknown User';
    const date = new Date(complain.date);
    const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";

    // Show more text in the complaint column since we don't have details view
    const complaintText = complain.complaint.length > 80 ? complain.complaint.substring(0, 80) + '...' : complain.complaint;

    return {
      user: userName,
      complaint: complaintText,
      date: dateString,
      status: complain.status,
      id: complain._id,
      dbStatus: complain.status,
    };
  }) || [];

  const ComplainButtonHaver = ({ row }) => (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <IconButton
        size="small"
        onClick={() => handleDeleteComplain(row.id)}
        color="error"
        disabled={loading}
      >
        <Delete />
      </IconButton>
      <Checkbox
        icon={<RadioButtonUnchecked />}
        checkedIcon={<CheckCircleOutline sx={{ color: '#4caf50' }} />}
        checked={row.dbStatus === 'resolved'}
        onChange={() => handleStatusToggle(row.id, row.dbStatus)}
        disabled={loading}
        sx={{
          '&.Mui-checked': {
            color: '#4caf50',
          },
        }}
      />
    </Box>
  );

  // Filter complains by status from database
  const resolvedComplains = complainRows.filter(row => row.dbStatus === 'resolved');
  const pendingComplains = complainRows.filter(row => row.dbStatus === 'pending');

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'default' },
      resolved: { label: 'Resolved', color: 'success' }
    };
    
    const config = statusConfig[status] || { label: 'Unknown', color: 'default' };
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  if (loading && complainsList.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading complaints...</Typography>
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
          boxShadow: 8,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center">
              <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Complaint Management
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Monitor and manage all complaints in the system
                </Typography>
              </Box>
            </Box>
            <Button
              startIcon={<Refresh />}
              onClick={handleRefresh}
              variant="contained"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", boxShadow: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: alpha('#667eea', 0.1), color: '#667eea' }}>
                <Comment />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {complainRows.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Complaints
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", boxShadow: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: alpha('#ff9800', 0.1), color: '#ff9800' }}>
                <AccessTime />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {pendingComplains.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Complaints
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", boxShadow: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems:"center", gap: 2 }}>
              <Avatar sx={{ bgcolor: alpha('#4caf50', 0.1), color: '#4caf50' }}>
                <CheckCircleOutlineIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {resolvedComplains.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Resolved Complaints
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {complainRows.length === 0 && !loading ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No complaints to display at the moment.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Pending Complaints Table - Full width */}
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  borderBottom: 1, 
                  borderColor: 'divider' 
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Pending Complaints ({pendingComplains.length})
                  </Typography>
                </Box>
                {pendingComplains.length > 0 ? (
                  <TableTemplate
                    buttonHaver={ComplainButtonHaver}
                    columns={complainColumns}
                    rows={pendingComplains}
                  />
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      All complaints are resolved!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Resolved Complaints Table - Full width, placed under Pending Complaints */}
          <Grid item xs={12}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ 
                  p: 2, 
                  backgroundColor: '#4caf50', 
                  color: 'white',
                  borderBottom: 1, 
                  borderColor: 'divider' 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent={resolvedComplains.length} color="error">
                      <CheckCircleOutlineIcon />
                    </Badge>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Resolved Complaints ({resolvedComplains.length})
                    </Typography>
                  </Box>
                </Box>
                
                {resolvedComplains.length > 0 ? (
                  <>
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        onClick={handleMarkAllPending}
                        startIcon={<Refresh />}
                        color="primary"
                        disabled={loading}
                        variant="outlined"
                      >
                        Mark All Pending
                      </Button>
                    </Box>
                    <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                      <TableTemplate
                        buttonHaver={ComplainButtonHaver}
                        columns={complainColumns}
                        rows={resolvedComplains}
                      />
                    </Box>
                  </>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <RadioButtonUnchecked sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="h6" color="textSecondary">
                      No resolved complaints yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

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

export default SeeComplains;