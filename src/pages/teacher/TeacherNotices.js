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
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Chip,
    Stack,
    useMediaQuery,
    useTheme,
    Container,
    IconButton,
    Button
} from '@mui/material';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import { getAllNotices } from '../../redux/noticeRelated/noticeHandle';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import ScrollToTop from '../../components/ScrollToTop';

const TeacherShowNotices = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        if (currentUser?._id) {
            // Fetch notices with Teacher role filter
            dispatch(getAllNotices(currentUser.school._id || currentUser.school, "Notice", "Teacher"));
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

    // Mobile Card View
    const MobileNoticeCard = ({ notice }) => {
        return (
            <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                    <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', flex: 1 }}>
                                {notice.title}
                            </Typography>
                            <Chip 
                                icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />}
                                label={notice.date}
                                size="small"
                                sx={{ bgcolor: '#f5f5f5' }}
                            />
                        </Box>
                        
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            {notice.details}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                                label={notice.targetAudience === 'Both' ? 'All' : notice.targetAudience}
                                size="small"
                                sx={{ 
                                    bgcolor: notice.targetAudience === 'Teachers' ? '#e8f5e9' : '#f3e5f5',
                                    color: notice.targetAudience === 'Teachers' ? '#2e7d32' : '#7b1fa2'
                                }}
                            />
                            
                            {notice.pdfFile && (
                                <Button
                                    variant="contained"
                                    startIcon={<PictureAsPdfIcon />}
                                    onClick={() => handleDownloadPDF(notice.pdfFile.url, notice.title)}
                                    size="small"
                                    sx={{
                                        bgcolor: '#d32f2f',
                                        '&:hover': { bgcolor: '#b71c1c' },
                                        textTransform: 'none'
                                    }}
                                >
                                    View PDF
                                </Button>
                            )}
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        );
    };

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
                                            bgcolor: row.targetAudience === 'Teachers' ? '#e8f5e9' : '#f3e5f5',
                                            color: row.targetAudience === 'Teachers' ? '#2e7d32' : '#7b1fa2'
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
                {isMobile ? (
                    <Box>
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#000', color: 'white', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <AnnouncementIcon sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    School Notices
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {noticeRows.length} {noticeRows.length === 1 ? 'notice' : 'notices'} available
                            </Typography>
                        </Box>

                        {noticeRows.map((notice) => (
                            <MobileNoticeCard key={notice.id} notice={notice} />
                        ))}
                    </Box>
                ) : (
                    <DesktopNoticesTable />
                )}
            </Container>
        </>
    );
};

export default TeacherShowNotices;