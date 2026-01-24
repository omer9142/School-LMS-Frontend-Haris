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
import TeacherSideBar from './TeacherSideBar';
import { Navigate, Route, Routes } from 'react-router-dom';
import Logout from '../Logout';
import AccountMenu from '../../components/AccountMenu';
import { AppBar, Drawer } from '../../components/styles';
import StudentAttendance from '../admin/studentRelated/StudentAttendance';

import TeacherClassDetails from './TeacherClassDetails';
import TeacherComplain from './TeacherComplain';
import TeacherHomePage from './TeacherHomePage';
import TeacherProfile from './TeacherProfile';
import TeacherViewStudent from './TeacherViewStudent';
import StudentExamMarks from '../admin/studentRelated/StudentExamMarks';
import TeacherSubjects from './TeacherSubjects';
import TeacherTimeTable from './TeacherTimetable';
import MarksPage from './MarksPage';
import ClassAttendance from './ClassAttendance';
import ScrollWrapper from '../../components/ScrollWrapper';
import TeacherShowNotices from './TeacherNotices';
import StudentHealthForm from '../admin/studentRelated/StudentHealthForm';

import { useSelector } from 'react-redux';

const TeacherDashboard = () => {
    const [open, setOpen] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { currentUser } = useSelector((state) => state.user);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    const isClassTeacher = Boolean(currentUser?.classTeacherOf);

    return (
        <>
            <Box sx={{ display: 'flex', borderRadius: '10px', overflow: 'hidden' }}>
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
                                {/* empty placeholder (student had this) */}
                            </IconButton>
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        <AccountMenu />
                    </Toolbar>
                </AppBar>

                {/* permanent drawer only on desktop */}
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
                            <TeacherSideBar open={open} />
                        </List>
                    </Drawer>
                )}

                {/* mobile: render the floating toggle (TeacherSideBar handles the drawer) */}
                {isMobile && (
                    <Box
                        sx={{
                            position: 'fixed',
                            top: 16,
                            left: 16,
                            zIndex: 1300,
                        }}
                    >
                        <TeacherSideBar />
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
                        <Route path="/" element={<TeacherHomePage />} />
                        <Route path='*' element={<Navigate to="/" />} />
                        <Route path="/Teacher/dashboard" element={<TeacherHomePage />} />
                        <Route path="/Teacher/profile" element={<TeacherProfile />} />
                        <Route path="/Teacher/complain" element={<TeacherComplain />} />
                        <Route path="/Teacher/class" element={<TeacherClassDetails />} />
                        <Route path="/Teacher/subjects" element={<TeacherSubjects />} />
                        <Route path="/Teacher/class/student/:id" element={<TeacherViewStudent />} />

                        <Route path="/Teacher/class/student/attendance/:studentID/:subjectID" element={<StudentAttendance situation="Subject" />} />
                        <Route path="/Teacher/class/student/marks/:studentID/:subjectID" element={<StudentExamMarks situation="Subject" />} />
                        <Route path="/Teacher/notices" element={<TeacherShowNotices />} />
                        {isClassTeacher && (
                            <Route path="/Teacher/attendance" element={<ClassAttendance />} />
                        )}

                        <Route path="/Teacher/timetable" element={<TeacherTimeTable />} />
                        <Route path="/Teacher/marks" element={<MarksPage />} />
                       <Route path="/Teacher/students/:studentId/health" element={<StudentHealthForm />} />

                        <Route path="/logout" element={<Logout />} />
                    </Routes>
                    </ScrollWrapper>
                </Box>
            </Box>
        </>
    );
};

export default TeacherDashboard;

const styles = {
    boxStyled: {
        backgroundColor: '#ffffff',
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        paddingTop: '5px',
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
};
