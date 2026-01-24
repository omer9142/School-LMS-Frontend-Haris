import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAllStudents, removeStuff } from '../../../redux/studentRelated/studentHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';

import {
    Paper, Box, IconButton, TextField, Typography, Table, TableBody, TableContainer, TableHead,
    FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';

import * as React from 'react';
import Popup from '../../../components/Popup';

// Add the student ID formatting function
const getDisplayStudentId = (student) => {
  const explicit =
    student?.studentId ||
    student?.studentID ||
    student?.student_id ||
    student?.registrationId ||
    student?.admissionId ||
    student?.sid;
  if (explicit) return explicit;

  // fallback to short form from Mongo _id
  const id = student?._id;
  if (!id) return 'N/A';
  const lastSix = String(id).slice(-6);
  return `STU-${lastSix}`;
};

const ShowStudents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const { studentsList, loading, error, response } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { currentUser } = useSelector(state => state.user);

    // Initialize state from URL params
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || "All Classes");
    const [classes, setClasses] = useState(["All Classes"]);

    useEffect(() => {
        dispatch(getAllStudents());
        dispatch(getAllSclasses(currentUser._id, "Sclass"));
    }, [dispatch, currentUser._id]);

    // Extract all classes from sclassesList
    useEffect(() => {
        if (Array.isArray(sclassesList)) {
            const sortedClasses = [...sclassesList]
                .sort((a, b) => {
                    if (a.createdAt && b.createdAt) {
                        return new Date(a.createdAt) - new Date(b.createdAt);
                    }
                    if (a._id && b._id) {
                        return a._id.localeCompare(b._id);
                    }
                    return 0;
                })
                .map(sclass => sclass?.sclassName)
                .filter(className => className);
            
            setClasses(["All Classes", ...sortedClasses]);
        }
    }, [sclassesList]);

    // Update URL params when filters change
    useEffect(() => {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (selectedClass && selectedClass !== "All Classes") params.class = selectedClass;
        setSearchParams(params);
    }, [searchTerm, selectedClass, setSearchParams]);

    if (error) {
        console.log(error);
    }

    const [showPopup, setShowPopup] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const deleteHandler = (deleteID, address) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            dispatch(removeStuff(deleteID, address))
                .then(() => {
                    dispatch(getAllStudents());
                })
                .catch(err => {
                    console.error(err);
                    setMessage("Failed to delete student.");
                    setShowPopup(true);
                });
        }
    };

    // Filter students based on search term and selected class
    const filteredStudents = Array.isArray(studentsList)
        ? studentsList.filter(student => {
            const matchesSearch = 
                student.name?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesClass = 
                selectedClass === "All Classes" || 
                student?.sclassName?.sclassName === selectedClass;
            
            return matchesSearch && matchesClass;
          })
        : [];

    // Sort students by class in chronological order, then by roll number
    const sortedStudents = [...filteredStudents].sort((a, b) => {
        const classNameA = a?.sclassName?.sclassName || "Not Assigned";
        const classNameB = b?.sclassName?.sclassName || "Not Assigned";
        
        const classIndexA = classes.findIndex(cls => cls === classNameA);
        const classIndexB = classes.findIndex(cls => cls === classNameB);
        
        if (classIndexA !== -1 && classIndexB !== -1) {
            if (classIndexA !== classIndexB) {
                return classIndexA - classIndexB;
            }
        } else if (classIndexA !== -1 && classIndexB === -1) {
            return -1;
        } else if (classIndexA === -1 && classIndexB !== -1) {
            return 1;
        } else if (classNameA === "Not Assigned" && classNameB !== "Not Assigned") {
            return 1;
        } else if (classNameA !== "Not Assigned" && classNameB === "Not Assigned") {
            return -1;
        } else {
            return classNameA.localeCompare(classNameB);
        }
        
        const rollA = parseInt(a.rollNum) || 0;
        const rollB = parseInt(b.rollNum) || 0;
        return rollA - rollB;
    });

    const studentColumns = [
        { id: 'name', label: 'Name', minWidth: 170 },
        { id: 'rollNum', label: 'Roll Number', minWidth: 140 },
        { id: 'sclassName', label: 'Class', minWidth: 130 },
    ];

    const studentRows = sortedStudents.map((student) => ({
        name: student.name,
        rollNum: student.rollNum,
        sclassName: student?.sclassName?.sclassName ?? "Not Assigned",
        studentId: getDisplayStudentId(student),
        id: student._id,
    }));

    const actions = [
        {
            icon: <PersonAddAlt1Icon color="primary" />, name: 'Add New Student',
            action: () => navigate("/Admin/addstudents")
        },
        {
            icon: <PersonRemoveIcon color="error" />, name: 'Delete All Students',
            action: () => deleteHandler(currentUser._id, "Students")
        },
    ];

    // Clear search filter
    const handleClearSearch = () => {
        setSearchTerm("");
    };

    // Navigate to student view with current filters preserved in URL
    const handleViewStudent = (studentId) => {
        const currentParams = searchParams.toString();
        navigate(`student/${studentId}${currentParams ? `?${currentParams}` : ''}`);
    };

    return (
        <>
            {loading ?
                <div>Loading...</div>
                :
                <>
                    {response ?
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained" onClick={() => navigate("/Admin/addstudents")}>
                                Add Students
                            </GreenButton>
                        </Box>
                        :
                        <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
                            {/* Search Bar with Clear Button */}
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search by name"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                                        endAdornment: searchTerm && (
                                            <IconButton
                                                onClick={handleClearSearch}
                                                edge="end"
                                                size="small"
                                                sx={{ mr: 0.5 }}
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        )
                                    }}
                                    sx={{ mb: 2 }}
                                />
                                
                                {/* Class Filter Dropdown */}
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel id="class-filter-label">Filter by Class</InputLabel>
                                    <Select
                                        labelId="class-filter-label"
                                        value={selectedClass}
                                        label="Filter by Class"
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        startAdornment={
                                            <SortIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                        }
                                    >
                                        {classes.map((className, index) => (
                                            <MenuItem 
                                                key={className || index} 
                                                value={className}
                                                sx={{
                                                    fontWeight: className === "All Classes" ? 'bold' : 'normal',
                                                    backgroundColor: className === "All Classes" ? 'action.selected' : 'inherit'
                                                }}
                                            >
                                                {className}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                
                                {/* Summary */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {filteredStudents.length} student(s) found
                                        {searchTerm && ` for "${searchTerm}"`}
                                        {selectedClass !== "All Classes" && ` in ${selectedClass}`}
                                    </Typography>
                                    
                                    {(searchTerm || selectedClass !== "All Classes") && (
                                        <Chip
                                            label="Clear All Filters"
                                            onClick={() => {
                                                setSearchTerm("");
                                                setSelectedClass("All Classes");
                                            }}
                                            color="default"
                                            variant="outlined"
                                            size="small"
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    )}
                                </Box>
                                
                                {/* Current Filters */}
                                {(searchTerm || selectedClass !== "All Classes") && (
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        {searchTerm && (
                                            <Chip
                                                label={`Search: "${searchTerm}"`}
                                                onDelete={() => setSearchTerm("")}
                                                size="small"
                                            />
                                        )}
                                        {selectedClass !== "All Classes" && (
                                            <Chip
                                                label={`Class: ${selectedClass}`}
                                                onDelete={() => setSelectedClass("All Classes")}
                                                size="small"
                                            />
                                        )}
                                    </Box>
                                )}
                            </Box>

                            {sortedStudents.length > 0 ? (
                                <TableContainer>
                                    <Table stickyHeader aria-label="sticky table">
                                        <TableHead>
                                            <StyledTableRow>
                                                {studentColumns.map((column) => (
                                                    <StyledTableCell
                                                        key={column.id}
                                                        align={column.align}
                                                        style={{ minWidth: column.minWidth }}
                                                    >
                                                        {column.label}
                                                    </StyledTableCell>
                                                ))}
                                                <StyledTableCell 
                                                    align="center"
                                                    style={{ minWidth: '200px' }}
                                                >
                                                    Actions
                                                </StyledTableCell>
                                            </StyledTableRow>
                                        </TableHead>

                                        <TableBody>
                                            {studentRows.map((row) => (
                                                <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                    {studentColumns.map((column) => {
                                                        const value = row[column.id];
                                                        return (
                                                            <StyledTableCell key={column.id} align={column.align}>
                                                                {column.format && typeof value === 'number'
                                                                    ? column.format(value)
                                                                    : value}
                                                            </StyledTableCell>
                                                        );
                                                    })}
                                                    <StyledTableCell align="center">
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                            <IconButton onClick={() => deleteHandler(row.id, "Student")}>
                                                                <PersonRemoveIcon color="error" />
                                                            </IconButton>
                                                            <BlueButton
                                                                variant="contained"
                                                                type="button"
                                                                onClick={() => handleViewStudent(row.id)}
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
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        {searchTerm || selectedClass !== "All Classes" 
                                            ? 'No students found matching your filters.' 
                                            : 'No students found.'}
                                    </Typography>
                                    
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

export default ShowStudents;