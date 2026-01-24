import React, { useEffect, useState } from "react";
import {
    Button,
    TextField,
    Grid,
    Box,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Paper,
    IconButton,
    Container,
    Alert,
    useTheme,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from "@mui/material";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getClassDetails } from "../../../redux/sclassRelated/sclassHandle";

import Popup from '../../../components/Popup';
import {
    AddCircleOutline,
    RemoveCircleOutline,
    Save,
    Subject as SubjectIcon,
    Code,
    Schedule,
    ListAlt,
    Shuffle
} from '@mui/icons-material';
import axios from 'axios';


const SubjectForm = () => {
    const [subjects, setSubjects] = useState([{ subName: "", subCode: "", sessions: "" }]);
    const [masterListOpen, setMasterListOpen] = useState(false);
    const [masterSubjects, setMasterSubjects] = useState([]);
    const [selectedMasterSubjects, setSelectedMasterSubjects] = useState([]);
    const [loadingMasterList, setLoadingMasterList] = useState(false);

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()
    const theme = useTheme()

    const userState = useSelector(state => state.user);
    const { sclassDetails } = useSelector(state => state.sclass);

    const { status, currentUser, response, error } = userState;

    const sclassName = params.id
    const adminID = currentUser._id
    const address = "Subject"
    const [className, setClassName] = useState("");
    const { id: classId } = useParams();



    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    // Get current year
    const currentYear = new Date().getFullYear().toString();

    // Generate random 4-digit subject code
    const generateSubjectCode = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    };

    // Fetch master subjects
    const fetchMasterSubjects = async () => {
        setLoadingMasterList(true);
        try {
            const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/getMasterSubjects/${adminID}`);
            if (Array.isArray(result.data)) {
                setMasterSubjects(result.data);
                // Select all subjects by default
                setSelectedMasterSubjects(result.data.map(sub => sub._id));
            } else {
                setMasterSubjects([]);
                setSelectedMasterSubjects([]);
            }
        } catch (err) {
            console.error("Error fetching master subjects:", err);
            setMasterSubjects([]);
            setSelectedMasterSubjects([]);
            setMessage("Error loading master subjects");
            setShowPopup(true);
        }
        setLoadingMasterList(false);
    };

    const handleOpenMasterList = () => {
        setMasterListOpen(true);
        fetchMasterSubjects();
    };

    const handleCloseMasterList = () => {
        setMasterListOpen(false);
        setSelectedMasterSubjects([]);
    };

    const handleToggleMasterSubject = (subjectId) => {
    setSelectedMasterSubjects(prev => {
        if (prev.includes(subjectId)) {
            return prev.filter(id => id !== subjectId);
        } else {
            return [...prev, subjectId]; // ✅ FIXED
        }
    });
};


    const handleSelectAll = () => {
        if (selectedMasterSubjects.length === masterSubjects.length) {
            setSelectedMasterSubjects([]);
        } else {
            setSelectedMasterSubjects(masterSubjects.map(sub => sub._id));
        }
    };

 const handleGenerateCodesAndAdd = () => {
    const selectedSubjectsData = masterSubjects
        .filter(ms => selectedMasterSubjects.includes(ms._id))
        .map(ms => ({
            subName: ms.subName,
            subCode: generateSubjectCode(),
            sessions: currentYear
        }));

    // Check if the first subject form is empty
    const isFirstSubjectEmpty = subjects.length === 1 && 
        subjects[0].subName === "" && 
        subjects[0].subCode === "" && 
        subjects[0].sessions === "";

    if (isFirstSubjectEmpty && selectedSubjectsData.length > 0) {
        // If first form is empty and we have subjects to add
        const remainingSubjects = selectedSubjectsData.slice(1); // All subjects except first
        const newSubjects = [
            selectedSubjectsData[0], // First master subject goes into first form
            ...remainingSubjects // Remaining subjects get added as new forms
        ];
        setSubjects(newSubjects);
    } else {
        // If first form is not empty, add all master subjects to the end
        setSubjects(prev => [...prev, ...selectedSubjectsData]);
    }

    handleCloseMasterList();
    setMessage(`${selectedSubjectsData.length} subject(s) added successfully!`);
    setShowPopup(true);
};

    const handleSubjectNameChange = (index) => (event) => {
        const value = event.target.value;
        const newSubjects = [...subjects];
        newSubjects[index].subName = value.charAt(0).toUpperCase() + value.slice(1);
        setSubjects(newSubjects);
    };

    const handleSubjectCodeChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].subCode = event.target.value.toUpperCase();
        setSubjects(newSubjects);
    };

    const handleSessionsChange = (index) => (event) => {
        const newSubjects = [...subjects];
        newSubjects[index].sessions = event.target.value || 0;
        setSubjects(newSubjects);
    };

    const handleAddSubject = () => {
        setSubjects([...subjects, { subName: "", subCode: "", sessions: "" }]);
    };

    const handleRemoveSubject = (index) => () => {
        const newSubjects = [...subjects];
        newSubjects.splice(index, 1);
        setSubjects(newSubjects);
    };

    const fields = {
        sclassName,
        subjects: subjects.map((subject) => ({
            subName: subject.subName,
            subCode: subject.subCode,
            sessions: subject.sessions,
        })),
        adminID,
    };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === 'added') {
            navigate("/Admin/subjects");
            dispatch(underControl())
            setLoader(false)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch]);

    useEffect(() => {
    const fetchClassDetails = async () => {
        try {
            const res = await axios.get(
                `${process.env.REACT_APP_BASE_URL}/getClassById/${classId}`
            );
            setClassName(res.data.className); // adjust key if backend uses another name
        } catch (err) {
            console.error("Failed to fetch class details", err);
        }
    };

    if (classId) {
        fetchClassDetails();
    }
}, [classId]);


    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Section */}
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
                        <SubjectIcon sx={{ fontSize: 40 }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Add New Subjects
                            </Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                Create subjects for your class
                            </Typography>
                            {/* Added Current Class info */}
                            <Typography variant="subtitle1" sx={{ 
                                mt: 1, 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                            }}>
                                <strong>Current Class:</strong> {sclassDetails?.sclassName || "Loading..."}


                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <form onSubmit={submitHandler}>
                <Card sx={{ boxShadow: theme.shadows[3], borderRadius: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        {/* Subjects List */}
                        {subjects.map((subject, index) => (
                            <Paper
                                key={index}
                                elevation={2}
                                sx={{
                                    p: 3,
                                    mb: 3,
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.5)
                                }}
                            >
                                <Box display="flex" alignItems="center" mb={2}>
                                    <Typography
                                        variant="h6"
                                        color="primary"
                                        fontWeight="bold"
                                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                    >
                                        <SubjectIcon />
                                        Subject {index + 1}
                                    </Typography>
                                    {index > 0 && (
                                        <IconButton
                                            color="error"
                                            onClick={handleRemoveSubject(index)}
                                            sx={{ ml: 'auto' }}
                                        >
                                            <RemoveCircleOutline />
                                        </IconButton>
                                    )}
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Subject Name"
                                            variant="outlined"
                                            value={subject.subName}
                                            onChange={handleSubjectNameChange(index)}
                                            sx={styles.inputField}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <SubjectIcon
                                                        sx={{
                                                            color: theme.palette.primary.main,
                                                            mr: 1
                                                        }}
                                                    />
                                                ),
                                            }}
                                            placeholder="e.g., Mathematics"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Subject Code"
                                            variant="outlined"
                                            value={subject.subCode}
                                            onChange={handleSubjectCodeChange(index)}
                                            sx={styles.inputField}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <Code
                                                        sx={{
                                                            color: theme.palette.secondary.main,
                                                            mr: 1
                                                        }}
                                                    />
                                                ),
                                            }}
                                            placeholder="e.g., 1221"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Session"
                                            variant="outlined"
                                            type="number"
                                            inputProps={{ min: 0 }}
                                            value={subject.sessions}
                                            onChange={handleSessionsChange(index)}
                                            sx={styles.inputField}
                                            required
                                            InputProps={{
                                                startAdornment: (
                                                    <Schedule
                                                        sx={{
                                                            color: theme.palette.info.main,
                                                            mr: 1
                                                        }}
                                                    />
                                                ),
                                            }}
                                            placeholder="e.g., 2025"
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}

                        {/* Add Subject Button */}
                        <Box display="flex" justifyContent="center" mb={4}>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleAddSubject}
                                startIcon={<AddCircleOutline />}
                                sx={{
                                    py: 1.5,
                                    px: 4,
                                    borderRadius: 3,
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                    }
                                }}
                            >
                                Add Another Subject
                            </Button>
                        </Box>

                        {/* Action Buttons */}
                        <Box display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={() => navigate("/Admin/subjects")}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 'bold'
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleOpenMasterList}
                                startIcon={<ListAlt />}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#45a049',
                                    }
                                }}
                            >
                                Master List
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={loader}
                                startIcon={loader ? <CircularProgress size={20} /> : <Save />}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                                    boxShadow: theme.shadows[4],
                                    '&:hover': {
                                        boxShadow: theme.shadows[8],
                                    }
                                }}
                            >
                                {loader ? "Saving..." : "Save All Subjects"}
                            </Button>
                        </Box>

                        {/* Info Alert */}
                        <Alert
                            severity="info"
                            sx={{
                                mt: 3,
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.info.main, 0.1)
                            }}
                        >
                            <Typography variant="body2">
                                <strong>Tip:</strong> Subject codes are automatically converted to uppercase.
                                You can use the Master List to quickly add multiple subjects with auto-generated codes.
                            </Typography>
                        </Alert>
                    </CardContent>
                </Card>
            </form>

            {/* Master List Dialog */}
            <Dialog
                open={masterListOpen}
                onClose={handleCloseMasterList}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        boxShadow: theme.shadows[10]
                    }
                }}
            >
                <DialogTitle sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <ListAlt />
                    Master Subject List
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {loadingMasterList ? (
                        <Box display="flex" justifyContent="center" py={4}>
                            <CircularProgress />
                        </Box>
                    ) : masterSubjects.length === 0 ? (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            No subjects in master list. Contact your administrator to add subjects.
                        </Alert>
                    ) : (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="body2" color="text.secondary">
                                    Select subjects to add ({selectedMasterSubjects.length} selected)
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={handleSelectAll}
                                    sx={{ textTransform: 'none' }}
                                >
                                    {selectedMasterSubjects.length === 0 ? 'Select All' :
                                        selectedMasterSubjects.length === masterSubjects.length ? 'Deselect All' : 'Clear Selection'}
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                                {masterSubjects.map((subject) => (
                                    <ListItem
                                        key={subject._id}
                                        sx={{
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            borderRadius: 2,
                                            mb: 1,
                                            backgroundColor: selectedMasterSubjects.includes(subject._id)
                                                ? alpha('#4caf50', 0.1)
                                                : 'transparent',
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.primary.main, 0.05)
                                            }
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={selectedMasterSubjects.includes(subject._id)}
                                                onChange={() => handleToggleMasterSubject(subject._id)}
                                                sx={{
                                                    color: '#4caf50',
                                                    '&.Mui-checked': {
                                                        color: '#4caf50',
                                                    }
                                                }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={subject.subName}
                                            primaryTypographyProps={{
                                                fontWeight: selectedMasterSubjects.includes(subject._id) ? 'bold' : 'normal'
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button
                        onClick={handleCloseMasterList}
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGenerateCodesAndAdd}
                        variant="contained"
                        disabled={selectedMasterSubjects.length === 0}
                        startIcon={<Shuffle />}
                        sx={{
                            borderRadius: 2,
                            backgroundColor: '#4caf50',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: '#45a049',
                            },
                            '&:disabled': {
                                backgroundColor: alpha('#4caf50', 0.3),
                            }
                        }}
                    >
                        Generate Codes & Add
                    </Button>
                </DialogActions>
            </Dialog>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </Container>
    );
}

export default SubjectForm

const styles = {
    inputField: {
        '& .MuiInputLabel-root': {
            fontWeight: 'bold',
            color: '#666',
        },
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover fieldset': {
                borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: 2,
            },
        },
        '& .MuiOutlinedInput-input': {
            padding: '12px 14px',
        },
    },
};