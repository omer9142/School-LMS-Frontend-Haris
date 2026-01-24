import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Divider,
    IconButton,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import StudentSideBar from './StudentSideBar';
import { Navigate, Route, Routes } from 'react-router-dom';
import StudentHomePage from './StudentHomePage';
import StudentProfile from './StudentProfile';
import ViewStdAttendance from './ViewStdAttendance';
import StudentComplain from './StudentComplain';
import StudentMarks from './StudentMarks';
import Logout from '../Logout'
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';
import StudentTimeTable from './StudentTimeTable';
import StudentMarksPage from './StudentMarks';
import StudentFeesDashboard from './StudentFees';
import StudentShowNotices from './StudentNotices';
import ScrollWrapper from '../../components/ScrollWrapper';
import StudentHealthRecords from './StudentHealthRecords.jsx';

const StudentDashboard = () => {
    const [open, setOpen] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <>
            <Box sx={{ display: 'flex', borderRadius: '10px', overflow: 'hidden'}}>
                <CssBaseline />
                <AppBar 
                    open={open} 
                    position='fixed' 
                    sx={{ 
                        backgroundColor: '#F5F4F9',
                        color: 'black',
                        zIndex: 1200,
                        marginLeft: open && !isMobile ? '240px' : !isMobile ? '80px' : '0px',
                        width: open && !isMobile ? 'calc(100% - 240px)' : !isMobile ? 'calc(100% - 80px)' : '100%',
                        transition: 'margin-left 0.3s ease, width 0.3s ease',
                    }}
                >
                    <Toolbar sx={{ pr: '24px' }}>
                        {isMobile && (
                            <IconButton
                                edge="start"
                                sx={{ 
                                    color: 'black',
                                    mr: 2
                                }}
                            >
                            </IconButton>
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        <AccountMenu />
                    </Toolbar>
                </AppBar>

                {!isMobile && (
                    <Drawer variant="permanent" open={open} sx={open ? styles.drawerStyled : styles.hideDrawer}>
                        <Toolbar sx={styles.toolBarStyled}>
                            <IconButton 
                                onClick={toggleDrawer} 
                                sx={{ 
                                    color: 'white',
                                    display: 'block'
                                }}
                            >
                                {open ? <ChevronLeftIcon /> : <MenuIcon />}
                            </IconButton>
                        </Toolbar>
                        <Divider sx={{ backgroundColor: '#333' }} />
                        <List component="nav">
                            <StudentSideBar open={open} />
                        </List>
                    </Drawer>
                )}

                {isMobile && (
                    <Box
                        sx={{
                            position: 'fixed',
                            top: 16,
                            left: 16,
                            zIndex: 1300,
                        }}
                    >
                        <StudentSideBar />
                    </Box>
                )}

                <Box component="main" sx={{
                    ...styles.boxStyled,
                    marginLeft: open && !isMobile ? '240px' : !isMobile ? '80px' : '0px',
                    width: open && !isMobile ? 'calc(100% - 240px)' : !isMobile ? 'calc(100% - 80px)' : '100%',
                    transition: 'margin-left 0.3s ease, width 0.3s ease',
                }}>
                    <Toolbar />
                    <ScrollWrapper sx={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                    <Routes>
                        <Route path="/" element={<StudentHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Student/dashboard" element={<StudentHomePage />} />
                        <Route path="/Student/profile" element={<StudentProfile />} />

                        <Route path="/Student/attendance" element={<ViewStdAttendance />} />
                        <Route path="/Student/complain" element={<StudentComplain />} />

                        <Route path="/Student/timetable" element={<StudentTimeTable />} />
                        <Route path="/Student/Marks" element={<StudentMarksPage sidebarOpen={open} />} />
                        <Route path="/Student/fees" element={<StudentFeesDashboard />} />
                        <Route path="/Student/notices" element={<StudentShowNotices />} />
                        <Route path="/Student/health" element={<StudentHealthRecords />} />

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                    </ScrollWrapper>
                </Box>
            </Box>
        </>
    );
}

export default StudentDashboard

const styles = {
    boxStyled: {
        backgroundColor: '#ffffff',
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        paddingTop: '4px',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        px: [1],
        backgroundColor: 'black',
    },
    drawerStyled: {
        display: "flex",
        '& .MuiDrawer-paper': {
            backgroundColor: 'black',
            color: 'white',
            position: 'fixed',
            whiteSpace: 'nowrap',
            width: 240,
            transition: 'width 0.3s ease',
            zIndex: 1300,
            height: '100vh',
            top: 0,
            left: 0,
        },
    },
    hideDrawer: {
        display: 'flex',
        '& .MuiDrawer-paper': {
            backgroundColor: 'black',
            color: 'white',
            position: 'fixed',
            whiteSpace: 'nowrap',
            width: 80,
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            zIndex: 1300,
            height: '100vh',
            top: 0,
            left: 0,
        },
    },
}