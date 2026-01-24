import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import {
    Paper, Box, IconButton, Table, TableBody, TableContainer, TableHead, 
    useMediaQuery, Chip, Tooltip
} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getAllNotices, deleteNotice } from '../../../redux/noticeRelated/noticeHandle';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import { GreenButton } from '../../../components/buttonStyles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';

const ShowNotices = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector(state => state.user);

    useEffect(() => {
        dispatch(getAllNotices(currentUser._id, "Notice"));
    }, [currentUser._id, dispatch]);

    if (error) {
        console.log(error);
    }

    const deleteHandler = (deleteID) => {
        if (window.confirm("Are you sure you want to delete this notice?")) {
            dispatch(deleteNotice(deleteID))
                .then(() => {
                    dispatch(getAllNotices(currentUser._id, "Notice"));
                })
                .catch(err => {
                    console.error("Failed to delete notice:", err);
                });
        }
    };

    const handleViewPDF = async (url, title) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download error:', error);
            // Fallback to opening in new tab if download fails
            window.open(url, '_blank');
        }
    };

    const noticeColumns = [
        { id: 'title', label: 'Title', minWidth: isMobile ? 80 : 150 },
        { id: 'details', label: 'Details', minWidth: isMobile ? 100 : 200 },
        { id: 'date', label: 'Date', minWidth: isMobile ? 70 : 120 },
        { id: 'targetAudience', label: 'For', minWidth: isMobile ? 60 : 100 },
        { id: 'attachment', label: 'PDF', minWidth: isMobile ? 50 : 80 },
    ];

    const noticeRows = noticesList && noticesList.length > 0 && noticesList.map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
        return {
            title: notice.title,
            details: notice.details,
            date: dateString,
            targetAudience: notice.targetAudience || 'Both',
            pdfFile: notice.pdfFile,
            id: notice._id,
        };
    });

    const actions = [
        {
            icon: <NoteAddIcon color="primary" />, 
            name: 'Add New Notice',
            action: () => navigate("/Admin/addnotice")
        },
        {
            icon: <DeleteIcon color="error" />, 
            name: 'Delete All Notices',
            action: () => deleteHandler(currentUser._id, "Notices")
        }
    ];

    const getAudienceColor = (audience) => {
        switch(audience) {
            case 'Teachers':
                return { bgcolor: '#e8f5e9', color: '#2e7d32' };
            case 'Students':
                return { bgcolor: '#e3f2fd', color: '#1976d2' };
            case 'Both':
                return { bgcolor: '#f3e5f5', color: '#7b1fa2' };
            default:
                return { bgcolor: '#f5f5f5', color: '#666' };
        }
    };

    return (
        <>
            {loading ?
                <div>Loading...</div>
                :
                <>
                    {response ?
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained"
                                onClick={() => navigate("/Admin/addnotice")}>
                                Add Notice
                            </GreenButton>
                        </Box>
                        :
                        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                            {Array.isArray(noticesList) && noticesList.length > 0 && (
                                <TableContainer sx={{ overflowX: 'auto' }}>
                                    <Table stickyHeader aria-label="sticky table" sx={{ minWidth: { xs: 'auto', sm: 650 } }}>
                                        <TableHead>
                                            <StyledTableRow>
                                                {noticeColumns.map((column) => (
                                                    <StyledTableCell
                                                        key={column.id}
                                                        align={column.align}
                                                        sx={{
                                                            minWidth: column.minWidth,
                                                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                            padding: { xs: '6px 4px', sm: '16px' },
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {column.label}
                                                    </StyledTableCell>
                                                ))}
                                                <StyledTableCell 
                                                    align="center"
                                                    sx={{
                                                        minWidth: { xs: 80, sm: 120 },
                                                        fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                        padding: { xs: '6px 4px', sm: '16px' },
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    Actions
                                                </StyledTableCell>
                                            </StyledTableRow>
                                        </TableHead>

                                        <TableBody>
                                            {noticeRows.map((row) => (
                                                <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                    <StyledTableCell 
                                                        sx={{
                                                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                                                            padding: { xs: '8px 4px', sm: '16px' },
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        {row.title}
                                                    </StyledTableCell>
                                                    
                                                    <StyledTableCell 
                                                        sx={{
                                                            fontSize: { xs: '0.65rem', sm: '0.875rem' },
                                                            padding: { xs: '8px 4px', sm: '16px' },
                                                            whiteSpace: 'normal',
                                                            wordWrap: 'break-word',
                                                            maxWidth: { xs: '150px', sm: '300px' }
                                                        }}
                                                    >
                                                        {row.details}
                                                    </StyledTableCell>

                                                    <StyledTableCell 
                                                        sx={{
                                                            fontSize: { xs: '0.65rem', sm: '0.875rem' },
                                                            padding: { xs: '8px 4px', sm: '16px' }
                                                        }}
                                                    >
                                                        {row.date}
                                                    </StyledTableCell>

                                                    <StyledTableCell 
                                                        sx={{
                                                            fontSize: { xs: '0.65rem', sm: '0.875rem' },
                                                            padding: { xs: '8px 4px', sm: '16px' }
                                                        }}
                                                    >
                                                        <Chip 
                                                            label={row.targetAudience === 'Both' ? 'All' : row.targetAudience}
                                                            size="small"
                                                            sx={{ 
                                                                ...getAudienceColor(row.targetAudience),
                                                                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                                height: { xs: '20px', sm: '24px' },
                                                                fontWeight: 500
                                                            }}
                                                        />
                                                    </StyledTableCell>

                                                    <StyledTableCell 
                                                        align="center"
                                                        sx={{
                                                            fontSize: { xs: '0.65rem', sm: '0.875rem' },
                                                            padding: { xs: '8px 4px', sm: '16px' }
                                                        }}
                                                    >
                                                        {row.pdfFile ? (
                                                            <Tooltip title="View/Download PDF">
                                                                <IconButton
                                                                    onClick={() => handleViewPDF(row.pdfFile.url, row.title)}
                                                                    size={isMobile ? "small" : "medium"}
                                                                    sx={{ color: '#d32f2f' }}
                                                                >
                                                                    <PictureAsPdfIcon fontSize={isMobile ? "small" : "medium"} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : (
                                                            <span style={{ 
                                                                color: '#999', 
                                                                fontSize: isMobile ? '0.65rem' : '0.75rem' 
                                                            }}>
                                                                —
                                                            </span>
                                                        )}
                                                    </StyledTableCell>

                                                    <StyledTableCell 
                                                        align="center"
                                                        sx={{
                                                            padding: { xs: '8px 4px', sm: '16px' }
                                                        }}
                                                    >
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            gap: { xs: '0.2rem', sm: '0.5rem' }
                                                        }}>
                                                            <Tooltip title="Delete Notice">
                                                                <IconButton 
                                                                    onClick={() => deleteHandler(row.id)}
                                                                    size={isMobile ? "small" : "medium"}
                                                                >
                                                                    <DeleteIcon 
                                                                        color="error" 
                                                                        fontSize={isMobile ? "small" : "medium"}
                                                                    />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                            <SpeedDialTemplate actions={actions} />
                        </Paper>
                    }
                </>
            }
        </>
    );
};

export default ShowNotices;