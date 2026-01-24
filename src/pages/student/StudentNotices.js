import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Paper,
    Box,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    Typography,
    CircularProgress,
    Alert,
    Chip,
    useMediaQuery,
    useTheme,
    Container,
    Divider,
    Button,
    IconButton
} from '@mui/material';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { getAllNotices } from '../../redux/noticeRelated/noticeHandle';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import ScrollToTop from '../../components/ScrollToTop';

const StudentShowNotices = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        if (currentUser?._id) {
            // Fetch notices with Student role filter
            dispatch(getAllNotices(currentUser.school._id || currentUser.school, "Notice", "Student"));
        }
    }, [currentUser, dispatch]);

    const handleDownloadPDF = async (url, title) => {
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading notices...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Error loading notices: {error}
                </Alert>
            </Box>
        );
    }

    if (response || !noticesList || noticesList.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <AnnouncementIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                    No notices available at the moment
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Check back later for updates from the administration
                </Typography>
            </Box>
        );
    }

    // Format notices data
    const noticeRows = noticesList.map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" 
            ? date.toISOString().substring(0, 10) 
            : "Invalid Date";
        
        return {
            title: notice.title,
            details: notice.details,
            date: dateString,
            id: notice._id,
            targetAudience: notice.targetAudience,
            pdfFile: notice.pdfFile
        };
    });

    // Mobile View
    const MobileNoticesView = () => (
        <Paper 
            sx={{ 
                width: '100%',
                overflow: 'hidden',
                borderRadius: 2,
                boxShadow: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}
        >
            <Box sx={{ 
                p: 2.5, 
                bgcolor: '#000', 
                color: 'white',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <AnnouncementIcon sx={{ mr: 1.5, fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.4rem' }}>
                        School Notices
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                        {noticeRows.length} {noticeRows.length === 1 ? 'notice' : 'notices'} available
                    </Typography>
                    <Chip 
                        icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
                        label="Latest Updates"
                        size="small"
                        sx={{ 
                            bgcolor: 'rgba(255,255,255,0.15)', 
                            color: 'white',
                            fontWeight: 500
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ 
                maxHeight: '70vh',
                overflowY: 'auto',
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' },
                '&::-webkit-scrollbar-thumb:hover': { background: '#555' }
            }}>
                {noticeRows.map((notice, index) => (
                    <Box key={notice.id}>
                        <Box sx={{ p: 2.5 }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                justifyContent: 'space-between',
                                mb: 1.5 
                            }}>
                                <Box sx={{ flex: 1, mr: 1 }}>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            color: 'text.primary',
                                            fontSize: '1.1rem',
                                            lineHeight: 1.3
                                        }}
                                    >
                                        {notice.title}
                                    </Typography>
                                </Box>
                                <Chip 
                                    icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                                    label={notice.date}
                                    size="small"
                                    sx={{ 
                                        bgcolor: 'grey.100',
                                        color: 'grey.800',
                                        fontWeight: 500,
                                        fontSize: '0.8rem',
                                        minWidth: '85px'
                                    }}
                                />
                            </Box>

                            <Box sx={{ 
                                bgcolor: 'grey.50',
                                borderRadius: 1.5,
                                p: 2,
                                border: '1px solid',
                                borderColor: 'grey.200'
                            }}>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        color: 'text.secondary',
                                        fontSize: '0.95rem',
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-line'
                                    }}
                                >
                                    {notice.details}
                                </Typography>
                            </Box>

                            {notice.pdfFile && (
                                <Box sx={{ mt: 1.5 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<PictureAsPdfIcon />}
                                        endIcon={<DownloadIcon />}
                                        onClick={() => handleDownloadPDF(notice.pdfFile.url, notice.title)}
                                        size="small"
                                        sx={{
                                            bgcolor: '#d32f2f',
                                            '&:hover': { bgcolor: '#b71c1c' },
                                            textTransform: 'none',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        View/Download PDF
                                    </Button>
                                </Box>
                            )}

                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mt: 1.5
                            }}>
                                <Chip 
                                    label={notice.targetAudience === 'Both' ? 'All' : notice.targetAudience}
                                    size="small"
                                    sx={{ 
                                        bgcolor: notice.targetAudience === 'Students' ? '#e3f2fd' : '#f3e5f5',
                                        color: notice.targetAudience === 'Students' ? '#1976d2' : '#7b1fa2',
                                        fontSize: '0.75rem'
                                    }}
                                />
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: 'grey.600',
                                        fontSize: '0.75rem',
                                        fontStyle: 'italic'
                                    }}
                                >
                                    Notice #{index + 1}
                                </Typography>
                            </Box>
                        </Box>
                        
                        {index < noticeRows.length - 1 && (
                            <Divider sx={{ mx: 2.5, borderColor: 'grey.300', opacity: 0.6 }} />
                        )}
                    </Box>
                ))}
            </Box>

            <Box sx={{ 
                p: 2, 
                bgcolor: 'grey.50',
                borderTop: '1px solid',
                borderColor: 'divider',
                textAlign: 'center'
            }}>
                <Typography variant="caption" sx={{ color: 'grey.600', fontSize: '0.8rem' }}>
                    All notices are official communications from the school administration
                </Typography>
            </Box>
        </Paper>
    );

    // Desktop Table View
    const DesktopNoticesTable = () => (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: '#000', color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AnnouncementIcon sx={{ mr: 1, fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        School Notices
                    </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                    Important announcements and updates from the administration
                </Typography>
            </Box>

            <TableContainer>
                <Table stickyHeader aria-label="notices table">
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                Title
                            </StyledTableCell>
                            <StyledTableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                Details
                            </StyledTableCell>
                            <StyledTableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                Date
                            </StyledTableCell>
                            <StyledTableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                For
                            </StyledTableCell>
                            <StyledTableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                Attachment
                            </StyledTableCell>
                        </StyledTableRow>
                    </TableHead>

                    <TableBody>
                        {noticeRows.map((row) => (
                            <StyledTableRow hover key={row.id}>
                                <StyledTableCell sx={{ fontWeight: '500' }}>
                                    {row.title}
                                </StyledTableCell>
                                <StyledTableCell>
                                    {row.details}
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Chip 
                                        icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
                                        label={row.date}
                                        size="small"
                                        sx={{ bgcolor: '#f5f5f5' }}
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    <Chip 
                                        label={row.targetAudience === 'Both' ? 'All' : row.targetAudience}
                                        size="small"
                                        sx={{ 
                                            bgcolor: row.targetAudience === 'Students' ? '#e3f2fd' : '#f3e5f5',
                                            color: row.targetAudience === 'Students' ? '#1976d2' : '#7b1fa2'
                                        }}
                                    />
                                </StyledTableCell>
                                <StyledTableCell>
                                    {row.pdfFile ? (
                                        <IconButton
                                            onClick={() => handleDownloadPDF(row.pdfFile.url, row.title)}
                                            sx={{ color: '#d32f2f' }}
                                        >
                                            <PictureAsPdfIcon />
                                        </IconButton>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            No file
                                        </Typography>
                                    )}
                                </StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    return (
        <>
            <ScrollToTop />
            <Container 
                maxWidth={false} 
                sx={{ 
                    width: '85%', 
                    marginLeft: 'auto', 
                    marginRight: 'auto',
                    mt: 2,
                    mb: 4
                }}
            >
                {isMobile ? <MobileNoticesView /> : <DesktopNoticesTable />}
            </Container>
        </>
    );
};

export default StudentShowNotices;