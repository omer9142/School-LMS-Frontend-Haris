import * as React from 'react';
import { 
  Divider, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Drawer,
  IconButton,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ScheduleIcon from '@mui/icons-material/Schedule';
import GradeIcon from '@mui/icons-material/Grade';

import { useSelector } from 'react-redux';

const TeacherSideBar = ({ open }) => {
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    const { currentUser } = useSelector((state) => state.user);
    const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    };

    // Navigation handler function
    const handleNavigation = (path) => (e) => {
        e.preventDefault();
        navigate(path);
        if (isMobile) {
            setMobileDrawerOpen(false); // Close mobile drawer after navigation
        }
    };

    // ✅ handle class teacher presence (array or single)
    const isClassTeacher = currentUser?.classTeacherOf &&
      (Array.isArray(currentUser.classTeacherOf)
        ? currentUser.classTeacherOf.length > 0
        : Boolean(currentUser.classTeacherOf));

    // Helper function to check if a route is active
    const isActiveRoute = (route) => {
        return location.pathname === route || location.pathname.startsWith(route + '/');
    };

    // Base sidebar styles
    const getSidebarStyles = (route) => {
        const isActive = isActiveRoute(route);
        
        return {
            backgroundColor: isActive ? "#333" : "black",
            color: "white",
            "&:hover": {
                backgroundColor: "#444"
            },
            minHeight: '48px',
            // Add subtle left border for active tab
            borderLeft: isActive ? '4px solid #1976d2' : '4px solid transparent',
            transition: 'all 0.3s ease',
            // Optional: subtle background for active state
            ...(isActive && {
                backgroundColor: '#1a1a1a',
            })
        };
    };

    const iconStyles = {
        color: "white"
    };

    // Helper component for consistent ListItemButton rendering
    const NavItem = ({ path, icon: Icon, text }) => (
        <ListItemButton
            onClick={handleNavigation(path)}
            sx={getSidebarStyles(path)}
        >
            <ListItemIcon sx={iconStyles}>
                <Icon />
            </ListItemIcon>
            <ListItemText primary={text} />
        </ListItemButton>
    );

    // mobile drawer content
    const mobileDrawerContent = (
        <Box sx={{ width: 250 }}>
            <br />
            <br />
            <br />

            <NavItem path="/" icon={HomeIcon} text="Home" />
            <NavItem path="/Teacher/class" icon={ClassOutlinedIcon} text="Classes" />
            <NavItem path="/Teacher/subjects" icon={MenuBookIcon} text="Subjects" />
            <NavItem path="/Teacher/timetable" icon={ScheduleIcon} text="Timetable" />

            {isClassTeacher && (
                <NavItem path="/Teacher/attendance" icon={CheckCircleOutlineIcon} text="Attendance" />
            )}

            <NavItem path="/Teacher/marks" icon={GradeIcon} text="Marks" />
            <NavItem path="/Teacher/notices" icon={AnnouncementOutlinedIcon} text="Notices" />

            <Divider sx={{ backgroundColor: '#333', my: 1 }} />

            <NavItem path="/Teacher/profile" icon={AccountCircleOutlinedIcon} text="Profile" />
            <NavItem path="/logout" icon={ExitToAppIcon} text="Logout" />
        </Box>
    );

    // mobile: only show toggle button + temporary drawer
    if (isMobile) {
        return (
            <>
                <IconButton
                    onClick={handleDrawerToggle}
                    sx={{
                        color: mobileDrawerOpen ? 'white' : 'black',
                        border: mobileDrawerOpen ? '1px solid white' : '1px solid transparent',
                        transition: 'all 0.3s ease',
                        // Add highlight to menu button when drawer is open
                        backgroundColor: mobileDrawerOpen ? 'rgba(25, 118, 210, 0.1)' : 'transparent'
                    }}
                >
                    <MenuIcon />
                </IconButton>

                <Drawer
                    variant="temporary"
                    open={mobileDrawerOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box',
                            width: 250,
                            backgroundColor: 'black',
                            color: 'white'
                        },
                    }}
                >
                    {mobileDrawerContent}
                </Drawer>
            </>
        );
    }

    // desktop: permanent (icon-only when open === false)
    return (
        <>
            <ListItemButton 
                onClick={handleNavigation("/")} 
                sx={getSidebarStyles("/")}
            >
                <ListItemIcon sx={iconStyles}><HomeIcon /></ListItemIcon>
                {open && <ListItemText primary="Home" />}
            </ListItemButton>

            <ListItemButton 
                onClick={handleNavigation("/Teacher/class")} 
                sx={getSidebarStyles("/Teacher/class")}
            >
                <ListItemIcon sx={iconStyles}><ClassOutlinedIcon /></ListItemIcon>
                {open && <ListItemText primary="Classes" />}
            </ListItemButton>

            <ListItemButton 
                onClick={handleNavigation("/Teacher/subjects")} 
                sx={getSidebarStyles("/Teacher/subjects")}
            >
                <ListItemIcon sx={iconStyles}><MenuBookIcon /></ListItemIcon>
                {open && <ListItemText primary="Subjects" />}
            </ListItemButton>

            <ListItemButton 
                onClick={handleNavigation("/Teacher/timetable")} 
                sx={getSidebarStyles("/Teacher/timetable")}
            >
                <ListItemIcon sx={iconStyles}><ScheduleIcon /></ListItemIcon>
                {open && <ListItemText primary="Timetable" />}
            </ListItemButton>

            {isClassTeacher && (
                <ListItemButton 
                    onClick={handleNavigation("/Teacher/attendance")} 
                    sx={getSidebarStyles("/Teacher/attendance")}
                >
                    <ListItemIcon sx={iconStyles}><CheckCircleOutlineIcon /></ListItemIcon>
                    {open && <ListItemText primary="Attendance" />}
                </ListItemButton>
            )}

            <ListItemButton 
                onClick={handleNavigation("/Teacher/marks")} 
                sx={getSidebarStyles("/Teacher/marks")}
            >
                <ListItemIcon sx={iconStyles}><GradeIcon /></ListItemIcon>
                {open && <ListItemText primary="Marks" />}
            </ListItemButton>

            <ListItemButton 
                onClick={handleNavigation("/Teacher/notices")} 
                sx={getSidebarStyles("/Teacher/notices")}
            >
                <ListItemIcon sx={iconStyles}><AnnouncementOutlinedIcon /></ListItemIcon>
                {open && <ListItemText primary="Notices" />}
            </ListItemButton>

            <Divider sx={{ backgroundColor: '#333', my: 1 }} />

            <ListItemButton 
                onClick={handleNavigation("/Teacher/profile")} 
                sx={getSidebarStyles("/Teacher/profile")}
            >
                <ListItemIcon sx={iconStyles}><AccountCircleOutlinedIcon /></ListItemIcon>
                {open && <ListItemText primary="Profile" />}
            </ListItemButton>

            <ListItemButton 
                onClick={handleNavigation("/logout")} 
                sx={getSidebarStyles("/logout")}
            >
                <ListItemIcon sx={iconStyles}><ExitToAppIcon /></ListItemIcon>
                {open && <ListItemText primary="Logout" />}
            </ListItemButton>
        </>
    );
};

export default TeacherSideBar;