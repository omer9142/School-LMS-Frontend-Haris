import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Container,
  Alert,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from "@mui/material";
import { useSelector } from 'react-redux';
import {
  AddCircleOutline,
  Delete,
  Edit,
  ListAlt,
  Save,
  Cancel as CancelIcon
} from '@mui/icons-material';
import axios from 'axios';
import Popup from '../../../components/Popup';

const MasterSubjectManager = () => {
    const [masterSubjects, setMasterSubjects] = useState([]);
    const [newSubjectName, setNewSubjectName] = useState("");
    const [loading, setLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    const theme = useTheme();
    const { currentUser } = useSelector(state => state.user);
    const adminID = currentUser._id;

    const fetchMasterSubjects = async () => {
        setLoading(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/getMasterSubjects/${adminID}`);
            if (Array.isArray(result.data)) {
                setMasterSubjects(result.data);
            } else {
                setMasterSubjects([]);
            }
        } catch (err) {
            console.error("Error fetching master subjects:", err);
            setMessage("Error loading master subjects");
            setShowPopup(true);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchMasterSubjects();
    }, []);

    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) {
            setMessage("Please enter a subject name");
            setShowPopup(true);
            return;
        }

        setAddLoading(true);
        try {
            const result = await axios.post(`${process.env.REACT_APP_BASE_URL}/addMasterSubject`, {
                subName: newSubjectName.trim(),
                school: adminID
            });

            if (result.data.message) {
                setMessage(result.data.message);
                setShowPopup(true);
            } else {
                setMasterSubjects([...masterSubjects, result.data]);
                setNewSubjectName("");
                setMessage("Subject added successfully!");
                setShowPopup(true);
            }
        } catch (err) {
            console.error("Error adding subject:", err);
            setMessage("Error adding subject");
            setShowPopup(true);
        }
        setAddLoading(false);
    };

    const handleDeleteClick = (subject) => {
        setSubjectToDelete(subject);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!subjectToDelete) return;

        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/deleteMasterSubject/${subjectToDelete._id}`);
            setMasterSubjects(masterSubjects.filter(s => s._id !== subjectToDelete._id));
            setMessage("Subject deleted successfully!");
            setShowPopup(true);
        } catch (err) {
            console.error("Error deleting subject:", err);
            setMessage("Error deleting subject");
            setShowPopup(true);
        }
        setDeleteDialogOpen(false);
        setSubjectToDelete(null);
    };

    const handleEditStart = (subject) => {
        setEditingId(subject._id);
        setEditingName(subject.subName);
    };

    const handleEditSave = async (subjectId) => {
        if (!editingName.trim()) {
            setMessage("Subject name cannot be empty");
            setShowPopup(true);
            return;
        }

        try {
            const result = await axios.put(
                `${process.env.REACT_APP_BASE_URL}/updateMasterSubject/${subjectId}`,
                { subName: editingName.trim() }
            );

            setMasterSubjects(masterSubjects.map(s => 
                s._id === subjectId ? result.data : s
            ));
            setEditingId(null);
            setEditingName("");
            setMessage("Subject updated successfully!");
            setShowPopup(true);
        } catch (err) {
            console.error("Error updating subject:", err);
            setMessage("Error updating subject");
            setShowPopup(true);
        }
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditingName("");
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Card 
                sx={{ 
                    mb: 4, 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: "white",
                    boxShadow: theme.shadows[8]
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <ListAlt sx={{ fontSize: 40 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Master Subject List
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                Manage your school's master subjects
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Add New Subject */}
            <Card sx={{ mb: 4, boxShadow: theme.shadows[3], borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
                        Add New Subject
                    </Typography>
                    <Box display="flex" gap={2} alignItems="center">
                        <TextField
                            fullWidth
                            label="Subject Name"
                            variant="outlined"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                            placeholder="e.g., Mathematics, Physics, Chemistry"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddSubject();
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddSubject}
                            disabled={addLoading || !newSubjectName.trim()}
                            startIcon={addLoading ? <CircularProgress size={20} /> : <AddCircleOutline />}
                            sx={{ 
                                px: 3, 
                                py: 1.5, 
                                minWidth: 120,
                                borderRadius: 2
                            }}
                        >
                            Add
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Subject List */}
            <Card sx={{ boxShadow: theme.shadows[3], borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
                        Current Subjects ({masterSubjects.length})
                    </Typography>
                    
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : masterSubjects.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            No subjects in master list. Add your first subject above!
                        </Alert>
                    ) : (
                        <List>
                            {masterSubjects.map((subject, index) => (
                                <Paper
                                    key={subject._id}
                                    elevation={1}
                                    sx={{
                                        mb: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.05)
                                        }
                                    }}
                                >
                                    <ListItem
                                        sx={{ px: 0 }}
                                        secondaryAction={
                                            editingId === subject._id ? (
                                                <Box display="flex" gap={1}>
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => handleEditSave(subject._id)}
                                                        sx={{ color: '#4caf50' }}
                                                    >
                                                        <Save />
                                                    </IconButton>
                                                    <IconButton
                                                        edge="end"
                                                        onClick={handleEditCancel}
                                                        color="error"
                                                    >
                                                        <CancelIcon />
                                                    </IconButton>
                                                </Box>
                                            ) : (
                                                <Box display="flex" gap={1}>
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => handleEditStart(subject)}
                                                        color="primary"
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => handleDeleteClick(subject)}
                                                        color="error"
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </Box>
                                            )
                                        }
                                    >
                                        {editingId === subject._id ? (
                                            <TextField
                                                fullWidth
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                size="small"
                                                autoFocus
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleEditSave(subject._id);
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {index + 1}. {subject.subName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Typography variant="caption" color="text.secondary">
                                                        Added on {new Date(subject.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                }
                                            />
                                        )}
                                    </ListItem>
                                </Paper>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={deleteDialogOpen} 
                onClose={() => setDeleteDialogOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 3 }
                }}
            >
                <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{subjectToDelete?.subName}"? 
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)}
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm}
                        variant="contained"
                        color="error"
                        sx={{ borderRadius: 2 }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
};

export default MasterSubjectManager;