import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { getAllSclasses } from "../../../redux/sclassRelated/sclassHandle";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DownloadIcon from "@mui/icons-material/Download";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [
    "Period 1",
    "Period 2",
    "Period 3",
    "Period 4",
    "Period 5",
    "Period 6",
    "Period 7",
    "Period 8",
];

const TimetableManager = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { sclassesList, loading: classesLoading } = useSelector(
        (state) => state.sclass
    );
    const { currentUser } = useSelector((state) => state.user);

    const [selectedClass, setSelectedClass] = useState("");
    const [timetable, setTimetable] = useState([]);
    const [loadingTimetable, setLoadingTimetable] = useState(false);
    const [breakAfterPeriod, setBreakAfterPeriod] = useState(0); // 0 means no break

    // Fetch classes when component mounts
    useEffect(() => {
        if (currentUser?._id) {
            dispatch(getAllSclasses(currentUser._id, "sclass"));
        }
    }, [dispatch, currentUser]);
    
    // Automatically select the first class when classes are loaded
    useEffect(() => {
        if (sclassesList && sclassesList.length > 0 && !selectedClass) {
            setSelectedClass(sclassesList[0]._id);
        }
    }, [sclassesList, selectedClass]);

    // Fetch timetable when a class is selected
    useEffect(() => {
        if (!selectedClass) return;

        const fetchTimetable = async () => {
            setLoadingTimetable(true);
            try {
                const res = await axios.get(
                    `${process.env.REACT_APP_BASE_URL}/timetable/class/${selectedClass}`
                );
                console.log("Fetched timetable data:", res.data);
                
                // Extract break position from response (assuming backend returns it)
                if (res.data.length > 0 && res.data[0].breakAfterPeriod !== undefined) {
                    setBreakAfterPeriod(res.data[0].breakAfterPeriod);
                } else {
                    setBreakAfterPeriod(0); // No break if not set
                }
                
                setTimetable(res.data);
            } catch (err) {
                console.error("Error fetching timetable:", err);
                setTimetable([]);
                setBreakAfterPeriod(0);
            }
            setLoadingTimetable(false);
        };

        fetchTimetable();
    }, [selectedClass]);

    const getCellData = (day, periodIndex) => {
        const entry = timetable.find(
            (t) => t.day === day && t.periodNumber === periodIndex + 1
        );
        
        if (!entry) return "-";

        const subjectName = entry.subjectName || "Unknown Subject";
        return subjectName;
    };

    // Function to download timetable as PDF
    const downloadTimetablePDF = () => {
        const doc = new jsPDF();
        
        // Get selected class name
        const selectedClassName = sclassesList?.find(cls => cls._id === selectedClass)?.sclassName || "Class";
        
        // Add title
        doc.setFontSize(18);
        doc.text(`${selectedClassName} - Timetable`, 14, 20);
        
        // Add date
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);
        
        // Prepare table headers with break column
        const tableHeaders = ["Day"];
        periods.forEach((period, index) => {
            tableHeaders.push(period);
            if (index + 1 === breakAfterPeriod) {
                tableHeaders.push("BREAK");
            }
        });
        
        // Prepare table data with break column
        const tableData = days.map(day => {
            const rowData = [day];
            periods.forEach((_, periodIndex) => {
                rowData.push(getCellData(day, periodIndex));
                if (periodIndex + 1 === breakAfterPeriod) {
                    rowData.push("Break");
                }
            });
            return rowData;
        });
        
        // Prepare column styles
        const columnStyles = {
            0: { fontStyle: 'bold', halign: 'left', cellWidth: 20 }
        };
        
        // Add special styling for break column
        let breakColumnIndex = breakAfterPeriod;
        if (breakColumnIndex > 0) {
            columnStyles[breakColumnIndex] = {
                fillColor: [245, 245, 245],
                textColor: [25, 118, 210],
                fontStyle: 'italic',
                halign: 'center'
            };
        }
        
        // Generate table using autoTable
        autoTable(doc, {
            startY: 35,
            head: [tableHeaders],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [63, 81, 181],
                fontSize: 11,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 10,
                halign: 'center'
            },
            columnStyles: columnStyles,
            margin: { left: 14, right: 14 }
        });
        
        // Save the PDF
        doc.save(`${selectedClassName}_Timetable.pdf`);
    };

    // Helper function to render table headers with break column
    const renderTableHeaders = () => {
        const headers = [];
        headers.push(
            <TableCell key="day" sx={{ 
                ...headerCellStyle, 
                minWidth: 150,
            }}>
                Day
            </TableCell>
        );

        periods.forEach((period, index) => {
            headers.push(
                <TableCell 
                    key={index} 
                    align="center"
                    sx={headerCellStyle}
                >
                    {period}
                </TableCell>
            );

            // Add break column after the selected period
            if (index + 1 === breakAfterPeriod) {
                headers.push(
                    <TableCell
                        key="break"
                        align="center"
                        sx={{
                            ...headerCellStyle,
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                        }}
                    >
                        BREAK
                    </TableCell>
                );
            }
        });

        return headers;
    };

    // Helper function to render table cells with break column
    const renderTableCells = (day, rowIndex) => {
        const cells = [];

        periods.forEach((_, colIndex) => {
            cells.push(
                <TableCell 
                    key={colIndex} 
                    align="center"
                    sx={{
                        ...regularCellStyle,
                        borderTop: rowIndex === 0 ? '1px solid #7c7c7c00' : '1px solid #e0e0e0',
                        borderBottom: rowIndex === days.length - 1 ? '1px solid #7c7c7c00' : '1px solid #e0e0e0',
                        borderRight: colIndex === periods.length - 1 ? '1px solid #7c7c7c00' : '1px solid #e0e0e0',
                        borderLeft: colIndex === 0 ? '1px solid #7c7c7c00' : '1px solid #e0e0e0'
                    }}
                >
                    {getCellData(day, colIndex)}
                </TableCell>
            );

            // Add break cell after the selected period
            if (colIndex + 1 === breakAfterPeriod) {
                cells.push(
                    <TableCell
                        key="break"
                        align="center"
                        sx={{
                            ...regularCellStyle,
                            backgroundColor: '#f5f5f5',
                            fontStyle: 'italic',
                            color: '#666',
                            borderTop: rowIndex === 0 ? '1px solid #7c7c7c00' : '1px solid #e0e0e0',
                            borderBottom: rowIndex === days.length - 1 ? '1px solid #7c7c7c00' : '1px solid #e0e0e0',
                        }}
                    >
                        Break
                    </TableCell>
                );
            }
        });

        return cells;
    };

    // Styles for the day row and column
    const headerCellStyle = {
        fontWeight: 'bold',
        fontSize: '16px',
        border: '1px solid #0000006e',
        padding: '12px 16px',
    };

    const dayColumnStyle = {
        fontWeight: 'bold',
        fontSize: '16px',
        border: '1px solid #0000006e',
        padding: '12px 16px',
        position: 'sticky',
        left: 0,
        zIndex: 1,
    };

    const regularCellStyle = {
        border: '1px solid #e0e0e0',
        padding: '8px 16px',
        fontSize: '14px',
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Class Timetable
            </Typography>

            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate("/timetable/create")}
                >
                    Create Timetable
                </Button>
                
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadIcon />}
                    onClick={downloadTimetablePDF}
                    disabled={!selectedClass || timetable.length === 0 || loadingTimetable}
                >
                    Download PDF
                </Button>
            </Box>

            {/* Class Selector */}
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Class</InputLabel>
                <Select
                    value={selectedClass}
                    label="Select Class"
                    onChange={(e) => setSelectedClass(e.target.value)}
                >
                    {sclassesList &&
                        sclassesList.map((cls) => (
                            <MenuItem key={cls._id} value={cls._id}>
                                {cls.sclassName}
                            </MenuItem>
                        ))}
                </Select>
            </FormControl>

            {classesLoading || loadingTimetable ? (
                <CircularProgress />
            ) : timetable.length === 0 ? (
                <Box 
                    sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        backgroundColor: '#fafafa'
                    }}
                >
                    <Typography variant="h6" color="text.secondary">
                        No timetable assigned yet
                    </Typography>
                </Box>
            ) : (
                <TableContainer 
                    component={Paper} 
                    sx={{ 
                        maxHeight: '80vh',
                        overflow: 'auto',
                        position: 'relative'
                    }}
                >
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                {renderTableHeaders()}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {days.map((day, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    <TableCell 
                                        sx={{
                                            ...dayColumnStyle,
                                            borderBottom: rowIndex === days.length - 1 ? 'none' : '1px solid #ccc',
                                        }}
                                    >
                                        {day}
                                    </TableCell>
                                    {renderTableCells(day, rowIndex)}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default TimetableManager;