import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { deleteSubject } from '../../../redux/sclassRelated/sclassHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import PostAddIcon from '@mui/icons-material/PostAdd';
import {
    Paper, Box, IconButton, Typography, Table, TableBody, TableContainer, TableHead,
    MenuItem, Select, FormControl, InputLabel, useMediaQuery
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import FilterListIcon from '@mui/icons-material/FilterList';

const ShowSubjects = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { subjectsList, loading, error, response, sclassesList } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    const [selectedClass, setSelectedClass] = useState("");

    useEffect(() => {
        dispatch(getSubjectList(currentUser._id, "AllSubjects"));
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [currentUser._id, dispatch]);

    // Automatically select the first class when sclassesList is available
    useEffect(() => {
        if (sclassesList && sclassesList.length > 0 && !selectedClass) {
            setSelectedClass(sclassesList[0]._id);
        }
    }, [sclassesList, selectedClass]);

    if (error) {
        console.log(error);
    }

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    const deleteHandler = (deleteID, address) => {
        if (window.confirm("Are you sure you want to delete this subject?")) {
            dispatch(deleteSubject(deleteID, address))
                .then(() => {
                    dispatch(getSubjectList(currentUser._id, "AllSubjects")); // refresh subject list
                })
                .catch((err) => {
                    console.error(err);
                    setMessage("Failed to delete subject.");
                    setShowPopup(true);
                });
        }
    };

    // Filter subjects based on selected class
    const filteredSubjects = Array.isArray(subjectsList)
        ? subjectsList.filter(subject => {
            if (!selectedClass) return true; // Show all if no class selected
            return subject?.sclassName?._id === selectedClass;
        })
        : [];

    const subjectColumns = [
        { id: 'subName', label: 'Subject Name', minWidth: isMobile ? 80 : 170 },
        { id: 'sessions', label: 'Sessions', minWidth: isMobile ? 60 : 170 },
        { id: 'sclassName', label: 'Class', minWidth: isMobile ? 70 : 170 },
    ];

    const subjectRows = filteredSubjects.map((subject) => {
        return {
            subName: subject?.subName || "N/A",
            sessions: subject?.sessions || "N/A",
            sclassName: subject?.sclassName?.sclassName || "Unassigned",
            sclassID: subject?.sclassName?._id || "N/A",
            id: subject?._id || "N/A",
        };
    });

    const actions = [
        {
            icon: <PostAddIcon color="primary" />, name: 'Add New Subject',
            action: () => navigate("/Admin/subjects/chooseclass")
        },
        {
            icon: <DeleteIcon color="error" />, name: 'Delete All Subjects',
            action: () => deleteHandler(currentUser._id, "Subjects")
        }
    ];

    return (
        <>
            {loading ?
                <div>Loading...</div>
                :
                <>
                    {response ?
                        // When there are no subjects available
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            minHeight: '60vh',
                            position: 'relative'
                        }}>
                            <Box 
                                sx={{ 
                                    border: '2px solid',
                                    borderColor: 'grey.300',
                                    borderRadius: 2,
                                    p: 6,
                                    textAlign: 'center',
                                    width: '100%',
                                    maxWidth: 800,
                                    boxShadow: 1,
                                    position: 'relative'
                                }}
                            >
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        color: 'text.primary',
                                        mb: 2,
                                        fontWeight: 'medium'
                                    }}
                                >
                                    No subjects available.
                                </Typography>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        color: 'text.secondary',
                                        mb: 4
                                    }}
                                >
                                    Create Subjects to get started
                                </Typography>
                                <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
                                    <GreenButton 
                                        variant="contained"
                                        onClick={() => navigate("/Admin/subjects/chooseclass")}
                                    >
                                        Add Subjects
                                    </GreenButton>
                                </Box>
                            </Box>
                        </Box>
                        :
                        <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
                            {/* Filter by Class */}
                            <Box sx={{ mb: 3 }}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="class-filter-label">Filter by Class</InputLabel>
                                    <Select
                                        labelId="class-filter-label"
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        label="Filter by Class"
                                        startAdornment={<FilterListIcon sx={{ color: 'text.secondary', mr: 1 }} />}
                                        sx={{ mb: 2 }}
                                    >
                                        {Array.isArray(sclassesList) && sclassesList.length > 0 ? (
                                            sclassesList.map((sclass) => (
                                                <MenuItem key={sclass._id} value={sclass._id}>
                                                    {sclass.sclassName}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="" disabled>No classes available</MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                                <Typography variant="body2" color="text.secondary">
                                    {filteredSubjects.length} subject(s) found
                                    {selectedClass && ` in selected class`}
                                </Typography>
                            </Box>

                            {filteredSubjects.length > 0 ? (
                                <TableContainer sx={{ overflowX: 'auto' }}>
                                    <Table stickyHeader aria-label="sticky table" sx={{ minWidth: { xs: 'auto', sm: 650 } }}>
                                        <TableHead>
                                            <StyledTableRow>
                                                {subjectColumns.map((column) => (
                                                    <StyledTableCell
                                                        key={column.id}
                                                        align={column.align}
                                                        sx={{
                                                            minWidth: column.minWidth,
                                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                            padding: { xs: '8px 4px', sm: '16px' }
                                                        }}
                                                    >
                                                        {column.label}
                                                    </StyledTableCell>
                                                ))}
                                                <StyledTableCell
                                                    align="center"
                                                    sx={{
                                                        minWidth: { xs: 120, sm: 200 },
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                        padding: { xs: '8px 4px', sm: '16px' }
                                                    }}
                                                >
                                                    Actions
                                                </StyledTableCell>
                                            </StyledTableRow>
                                        </TableHead>

                                        <TableBody>
                                            {subjectRows.map((row) => (
                                                <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                    {subjectColumns.map((column) => {
                                                        const value = row[column.id];
                                                        return (
                                                            <StyledTableCell 
                                                                key={column.id} 
                                                                align={column.align}
                                                                sx={{
                                                                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                                    padding: { xs: '8px 4px', sm: '16px' },
                                                                    whiteSpace: 'normal',
                                                                    wordWrap: 'break-word'
                                                                }}
                                                            >
                                                                {column.format && typeof value === 'number'
                                                                    ? column.format(value)
                                                                    : value}
                                                            </StyledTableCell>
                                                        );
                                                    })}
                                                    <StyledTableCell 
                                                        align="center"
                                                        sx={{
                                                            padding: { xs: '8px 4px', sm: '16px' }
                                                        }}
                                                    >
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'center', 
                                                            gap: { xs: 0.3, sm: 1 },
                                                            flexWrap: 'nowrap'
                                                        }}>
                                                            <IconButton 
                                                                onClick={() => deleteHandler(row.id, "Subject")}
                                                                size={isMobile ? "small" : "medium"}
                                                            >
                                                                <DeleteIcon 
                                                                    color="error" 
                                                                    fontSize={isMobile ? "small" : "medium"}
                                                                />
                                                            </IconButton>
                                                            <BlueButton
                                                                variant="contained"
                                                                onClick={() => navigate(`/Admin/subjects/subject/${row.sclassID}/${row.id}`)}
                                                                sx={{
                                                                    fontSize: { xs: '0.65rem', sm: '0.875rem' },
                                                                    padding: { xs: '4px 6px', sm: '6px 16px' },
                                                                    minWidth: { xs: '45px', sm: 'auto' }
                                                                }}
                                                            >
                                                                View
                                                            </BlueButton>
                                                        </Box>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                // When there are classes but no subjects in the selected class
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    minHeight: '50vh',
                                    position: 'relative'
                                }}>
                                    <Box 
                                        sx={{ 
                                            border: '2px solid',
                                            borderColor: 'grey.300',
                                            borderRadius: 2,
                                            p: 6,
                                            textAlign: 'center',
                                            width: '100%',
                                            maxWidth: 800,
                                            boxShadow: 1,
                                            position: 'relative'
                                        }}
                                    >
                                        <Typography 
                                            variant="h5" 
                                            sx={{ 
                                                color: 'text.primary',
                                                mb: 2,
                                                fontWeight: 'medium'
                                            }}
                                        >
                                            No subjects available.
                                        </Typography>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                color: 'text.secondary',
                                                mb: 4
                                            }}
                                        >
                                            Create Subjects to get started
                                        </Typography>
                                        <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
                                            <GreenButton 
                                                variant="contained"
                                                onClick={() => navigate("/Admin/subjects/chooseclass")}
                                            >
                                                Add Subjects
                                            </GreenButton>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                            <SpeedDialTemplate actions={actions} />
                        </Paper>
                    }
                </>
            }
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowSubjects;