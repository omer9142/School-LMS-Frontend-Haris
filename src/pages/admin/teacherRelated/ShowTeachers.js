import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { getAllTeachers } from '../../../redux/teacherRelated/teacherHandle';
import { Dialog, DialogTitle, List, ListItemButton, ListItemText, TextField, InputAdornment } from '@mui/material';
import {
    Paper, Table, TableBody, TableContainer,
    TableHead, Button, Box, IconButton, useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { deleteUser } from '../../../redux/userRelated/userHandle';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { BlueButton, GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';

const ShowTeachers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [classPicker, setClassPicker] = useState({ open: false, teacherId: null, classIds: [], classNames: [] });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { teachersList, loading, error } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getAllTeachers(currentUser._id));
    }, [currentUser._id, dispatch]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        console.error(error);
    }

    const openClassPicker = (row) => {
        if (!row.teachSclassID.length) return;
        if (row.teachSclassID.length === 1) {
            navigate(`/Admin/teachers/choosesubject/${row.teachSclassID[0]}/${row.id}`);
        } else {
            setClassPicker({
                open: true,
                teacherId: row.id,
                classIds: row.teachSclassID,
                classNames: row.teachSclassNames,
            });
        }
    };
    const closeClassPicker = () => setClassPicker(s => ({ ...s, open: false }));

    const deleteHandler = (deleteID, address) => {
        if (window.confirm("Are you sure you want to delete this teacher?")) {
            dispatch(deleteUser(deleteID, address))
                .then(() => {
                    dispatch(getAllTeachers(currentUser._id)); // refresh table
                })
                .catch((err) => {
                    console.error(err);
                    setMessage("Failed to delete teacher.");
                    setShowPopup(true);
                });
        }
    };

    const columns = [
        { id: 'name', label: 'Name', minWidth: isMobile ? 80 : 170 },
        { id: 'teachSubject', label: 'Subject', minWidth: isMobile ? 80 : 100 },
        { id: 'teachSclass', label: 'Class', minWidth: isMobile ? 60 : 100 },
    ];

    const rows = teachersList.map((teacher) => {
        const classObjs = teacher.teachSclass || [];
        const subjectObjs = teacher.teachSubject || [];

        return {
            name: teacher.name,
            teachSubject: Array.isArray(subjectObjs)
                ? subjectObjs.map(s => s?.subName).filter(Boolean).join(", ")
                : subjectObjs?.subName || "No subject assigned",
            teachSclass: classObjs.length ? classObjs.map(cls => cls.sclassName).join(", ") : "No class assigned",
            teachSclassID: classObjs.map(cls => cls._id) || [],
            teachSclassNames: classObjs.map(cls => cls.sclassName) || [],
            id: teacher._id,
        };
    });

    // 🔍 Filter rows according to search term
    const filteredRows = rows.filter(row =>
        row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.teachSubject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.teachSclass.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const actions = [
        {
            icon: <PersonAddIcon color="primary" />,
            name: 'Add Teacher',
            action: () => navigate("/Admin/teachers/chooseclass", { state: { situation: "Teacher" } })
        },
        {
            icon: <DeleteIcon color="error" />,
            name: 'Delete All Teachers',
            action: () => deleteHandler(currentUser._id, "Teachers")
        }
    ];

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', p:2 }}>
            {/* 🔍 Search Filter */}
            <Box sx={{ mb:2 }}>
                <TextField
                    size="large"
                    variant="outlined"
                    placeholder="Search by name, subject or class..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                     sx={{ width: '100%' }}
                />
            </Box>

            {/* Total teachers found - between search filter and table */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {filteredRows.length} Teacher(s) found
                </Typography>
            </Box>

            <TableContainer sx={{ overflowX: 'auto' }}>
                <Table stickyHeader aria-label="sticky table" sx={{ minWidth: { xs: 'auto', sm: 650 } }}>
                    <TableHead>
                        <StyledTableRow>
                            {columns.map((column) => (
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
                                    minWidth: { xs: 200, sm: 400 },
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    padding: { xs: '8px 4px', sm: '16px' }
                                }}
                            >
                                Actions
                            </StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows.map((row) => (
                            <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                {columns.map((column) => {
                                    const value = row[column.id];
                                    if (column.id === 'teachSubject') {
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
                                                {value && value !== "No subject assigned" ? (
                                                    value
                                                ) : (
                                                    <Button 
                                                        variant="contained"
                                                        onClick={() => openClassPicker(row)}
                                                        sx={{
                                                            fontSize: { xs: '0.65rem', sm: '0.875rem' },
                                                            padding: { xs: '4px 8px', sm: '6px 16px' }
                                                        }}
                                                    >
                                                        Add Subject
                                                    </Button>
                                                )}
                                            </StyledTableCell>
                                        );
                                    }
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
                                            {value}
                                        </StyledTableCell>
                                    );
                                })}
                                <StyledTableCell 
                                    align="center"
                                    sx={{
                                        padding: { xs: '8px 4px', sm: '16px' }
                                    }}
                                >
                                    <ActionsContainer isMobile={isMobile}>
                                        <IconButton 
                                            onClick={() => deleteHandler(row.id, "Teacher")}
                                            size={isMobile ? "small" : "medium"}
                                        >
                                            <PersonRemoveIcon 
                                                color="error" 
                                                fontSize={isMobile ? "small" : "medium"}
                                            />
                                        </IconButton>
                                        <BlueButton 
                                            variant="contained"
                                            onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}
                                            sx={{
                                                fontSize: { xs: '0.65rem', sm: '0.875rem' },
                                                padding: { xs: '4px 8px', sm: '6px 16px' },
                                                minWidth: { xs: '50px', sm: 'auto' }
                                            }}
                                        >
                                            View
                                        </BlueButton>
                                        <GreenButton 
                                            variant="contained"
                                            onClick={() =>
                                                navigate("/Admin/teachers/chooseclass", {
                                                    state: { situation: "Teacher", teacherId: row.id }
                                                })
                                            }
                                            sx={{
                                                fontSize: { xs: '0.6rem', sm: '0.875rem' },
                                                padding: { xs: '4px 6px', sm: '6px 16px' },
                                                minWidth: { xs: '70px', sm: 'auto' }
                                            }}
                                        >
                                            Assign Class
                                        </GreenButton>
                                    </ActionsContainer>
                                </StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <SpeedDialTemplate actions={actions} />
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />

           {/* Dialog for multiple class selection */}
            <Dialog
                open={classPicker.open}
                onClose={closeClassPicker}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    Select a Class
                </DialogTitle>

                <Box sx={{ px: 3, pb: 3 }}>
                    <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {classPicker.classIds.map((cid, idx) => (
                            <ListItemButton
                                key={cid}
                                sx={{
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    px: 2,
                                    py: 1.2,
                                    '&:hover': {
                                        backgroundColor: 'action.hover',
                                    },
                                }}
                                onClick={() => {
                                    closeClassPicker();
                                    navigate(
                                        `/Admin/teachers/choosesubject/${cid}/${classPicker.teacherId}`
                                    );
                                }}
                            >
                                <ListItemText
                                    primary={classPicker.classNames[idx]}
                                    primaryTypographyProps={{
                                        fontWeight: 500,
                                    }}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Dialog>

        </Paper>
    );
};

export default ShowTeachers;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.isMobile ? '0.3rem' : '0.5rem'};
  flex-wrap: nowrap;
  width: 100%;
`;