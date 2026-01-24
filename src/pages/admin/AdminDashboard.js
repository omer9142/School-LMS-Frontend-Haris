import { useState } from 'react';
import {
    CssBaseline,
    Box,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    useMediaQuery,
    Drawer as MuiDrawer,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppBar, Drawer } from '../../components/styles';
import Logout from '../Logout';
import SideBar from './SideBar';
import AdminProfile from './AdminProfile';
import AdminHomePage from './AdminHomePage';

import AddStudent from './studentRelated/AddStudent';
import SeeComplains from './studentRelated/SeeComplains';
import ShowStudents from './studentRelated/ShowStudents';
import StudentAttendance from './studentRelated/StudentAttendance';
import StudentExamMarks from './studentRelated/StudentExamMarks';
import ViewStudent from './studentRelated/ViewStudent';

import AddNotice from './noticeRelated/AddNotice';
import ShowNotices from './noticeRelated/ShowNotices';

import ShowSubjects from './subjectRelated/ShowSubjects';
import SubjectForm from './subjectRelated/SubjectForm';
import ViewSubject from './subjectRelated/ViewSubject';
import MasterSubjectManager from './subjectRelated/MasterSubjectManager';

import AddTeacher from './teacherRelated/AddTeacher';
import ChooseClass from './teacherRelated/ChooseClass';
import ChooseSubject from './teacherRelated/ChooseSubject';
import ShowTeachers from './teacherRelated/ShowTeachers';
import TeacherDetails from './teacherRelated/TeacherDetails';

import AddClass from './classRelated/AddClass';
import ClassDetails from './classRelated/ClassDetails';
import ShowClasses from './classRelated/ShowClasses';
import AccountMenu from '../../components/AccountMenu';

import TimetableManager from './timetableRelated/TimetableManager';
import TimetableCreate from './timetableRelated/TimetableCreator';
import AddFinance from './FinanceRelated/AddFinance';
import FinanceHome from '../finance/FinanceHome';
import ScrollToTop from '../../components/ScrollToTop';
import ScrollWrapper from '../../components/ScrollWrapper';

import AdminAttendanceTracker from './AttendanceTracker/AdminAttendanceTracker';

import StudentHealthForm from './studentRelated/StudentHealthForm';

import ShowLibraryBooks from './LibraryRelated/ShowLibraryBooks';
import SellBook from './LibraryRelated/SellBook';

const AdminDashboard = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    // Open by default on desktop, closed on mobile
    const [open, setOpen] = useState(!isMobile);

    const toggleDrawer = () => setOpen(!open);

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <ScrollToTop />
            <AppBar open={!isMobile && open} position="absolute">
                <Toolbar sx={{ pr: '24px' }}>
                    {/* Menu icon LEFT side now */}
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{
                            marginRight: '20px',
                            ...(open && !isMobile && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        sx={{ flexGrow: 1 }}
                    >
                        Admin Dashboard
                    </Typography>
                    <AccountMenu />
                </Toolbar>
            </AppBar>

            {/* DESKTOP DRAWER */}
            {!isMobile && (
                <Drawer variant="permanent" open={open}>
                    <Toolbar sx={styles.toolBarStyled}>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List component="nav">
                        <SideBar />
                    </List>
                </Drawer>
            )}

            {/* MOBILE DRAWER */}
            {isMobile && (
                <MuiDrawer
                    anchor="left"
                    open={open}
                    onClose={toggleDrawer}
                    ModalProps={{ keepMounted: true }}
                >
                    <Box sx={{ width: 250 }}>
                        <Toolbar sx={styles.toolBarStyled}>
                            <IconButton onClick={toggleDrawer}>
                                <ChevronLeftIcon />
                            </IconButton>
                        </Toolbar>
                        <Divider />
                        <List component="nav">
                            <SideBar />
                        </List>
                    </Box>
                </MuiDrawer>
            )}

            {/* MAIN CONTENT */}
            <Box component="main" sx={styles.boxStyled}>
                <Toolbar />
                 <ScrollWrapper sx={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                <Routes>
                    <Route path="/" element={<AdminHomePage />} />
                    <Route path="*" element={<Navigate to="/" />} />
                    <Route path="/Admin/dashboard" element={<AdminHomePage />} />
                    <Route path="/Admin/profile" element={<AdminProfile />} />
                    <Route path="/Admin/complains" element={<SeeComplains />} />
                    <Route path="/Admin/attendance-tracker" element={<AdminAttendanceTracker />} />
                    {/* Notice */}
                    <Route path="/Admin/addnotice" element={<AddNotice />} />
                    <Route path="/Admin/notices" element={<ShowNotices />} />

                    {/* Subject */}
                    <Route path="/Admin/subjects" element={<ShowSubjects />} />
                    <Route path="/Admin/subjects/subject/:classID/:subjectID" element={<ViewSubject />} />
                    <Route path="/Admin/subjects/chooseclass" element={<ChooseClass situation="Subject" />} />
                    <Route path="/Admin/addsubject/:id" element={<SubjectForm />} />
                    <Route path="/Admin/mastersubjects" element={<MasterSubjectManager />} />


                    {/* Class */}
                    <Route path="/Admin/addclass" element={<AddClass />} />
                    <Route path="/Admin/classes" element={<ShowClasses />} />
                    <Route path="/Admin/classes/class/:id" element={<ClassDetails />} />
                    <Route path="/Admin/class/addstudents/:id" element={<AddStudent situation="Class" />} />

                    {/* Student */}
                    <Route path="/Admin/addstudents" element={<AddStudent situation="Student" />} />
                    <Route path="/Admin/students" element={<ShowStudents />} />
                    <Route path="/Admin/students/student/:id" element={<ViewStudent />} />
                    <Route path="/Admin/students/student/attendance/:id" element={<StudentAttendance situation="Student" />} />
                    <Route path="/Admin/students/student/marks/:id" element={<StudentExamMarks situation="Student" />} />

                    {/* Teacher */}
                    <Route path="/Admin/teachers" element={<ShowTeachers />} />
                    <Route path="/Admin/teachers/teacher/:id" element={<TeacherDetails />} />
                    <Route path="/Admin/teachers/chooseclass" element={<ChooseClass situation="Teacher" />} />
                    <Route path="/Admin/teachers/choosesubject/:id" element={<ChooseSubject situation="Norm" />} />
                    <Route path="/Admin/teachers/choosesubject/:classID/:teacherID" element={<ChooseSubject situation="Teacher" />} />
                    <Route path="/Admin/addteacher" element={<AddTeacher />} />
                    <Route path="/Admin/addteacher/:id" element={<AddTeacher />} />
                    

                    {/* Timetable */}
                    <Route path="/Admin/timetable" element={<TimetableManager />} />
                    <Route path="/timetable/create" element={<TimetableCreate />} />

                    {/* Finance */}
                    <Route path="/Admin/addfinance" element={<AddFinance />} />
                    <Route path="/Admin/fees" element={<FinanceHome />} />

                    {/* Student Health Management */}
                    <Route path="/Admin/students/:studentId/health" element={<StudentHealthForm />} />

                    {/* Library Management */}
                    <Route path="/Admin/library/books" element={<ShowLibraryBooks />} />
                    <Route path="/Admin/library/sell" element={<SellBook />} />

                    <Route path="/logout" element={<Logout />} />
                </Routes>
                </ScrollWrapper>
            </Box>
        </Box>
    );
};

export default AdminDashboard;

const styles = {
    boxStyled: {
        backgroundColor: (theme) =>
            theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    toolBarStyled: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        px: [1],
    },
};