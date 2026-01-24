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
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScheduleIcon from '@mui/icons-material/Schedule';
import GradeIcon from '@mui/icons-material/Grade';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CampaignIcon from '@mui/icons-material/Campaign'; // Add this icon for Notices

const StudentSideBar = ({ open }) => {
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

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

    // Helper function to check if a route is active
    const isActiveRoute = (route) => {
        return location.pathname === route || location.pathname.startsWith(route + '/');
    };

    // Base sidebar styles with active highlighting
    const getSidebarStyles = (route) => {
        const isActive = isActiveRoute(route);
        
        return {
            backgroundColor: isActive ? "#1a1a1a" : "black",
            color: "white",
            "&:hover": {
                backgroundColor: "#444"
            },
            minHeight: '48px',
            // Add subtle left border for active tab
            borderLeft: isActive ? '4px solid #1976d2' : '4px solid transparent',
            transition: 'all 0.3s ease',
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

    // Mobile Drawer Content (without Class tab)
    const mobileDrawerContent = (
        <Box sx={{ width: 250 }}>
            <br />
            <br />
            <br />
            
            {/* Navigation Items */}
            <React.Fragment>
                <NavItem path="/" icon={HomeIcon} text="Home" />
                
                {/* REMOVED: Class tab - This was the problematic item */}
                {/* <ListItemButton
                    onClick={handleNavigation("/Student/subjects")}
                    sx={getSidebarStyles("/Student/subjects")}
                >
                    <ListItemIcon sx={iconStyles}>
                        <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Class" />
                </ListItemButton> */}

                <NavItem path="/Student/attendance" icon={ClassOutlinedIcon} text="Attendance" />
                <NavItem path="/Student/marks" icon={GradeIcon} text="Grade Report" />
                <NavItem path="/Student/timetable" icon={ScheduleIcon} text="Timetable" />
                <NavItem path="/Student/notices" icon={CampaignIcon} text="Notices" />
                <NavItem path="/Student/health" icon={LocalHospitalIcon} text="Health Records" />
                <NavItem path="/Student/fees" icon={AccountBalanceWalletIcon} text="Fees" />
                <NavItem path="/Student/complain" icon={AnnouncementOutlinedIcon} text="Complain" />
            </React.Fragment>

            <Divider sx={{ backgroundColor: '#333', my: 1 }} />

            <React.Fragment>
                <NavItem path="/Student/profile" icon={AccountCircleOutlinedIcon} text="Profile" />
                <NavItem path="/logout" icon={ExitToAppIcon} text="Logout" />
            </React.Fragment>
        </Box>
    );

    // For mobile view - only return the toggle button
    if (isMobile) {
        return (
            <>
                {/* Mobile Toggle Button */}
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

                {/* Mobile Drawer */}
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

    // For desktop view - return the regular sidebar
    return (
        <>
            {/* Navigation Items */}
            <React.Fragment>
                <ListItemButton
                    onClick={handleNavigation("/")}
                    sx={getSidebarStyles("/")}
                >
                    <ListItemIcon sx={iconStyles}>
                        <HomeIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Home" />}
                </ListItemButton>

                {/* Note: Class tab is already removed from desktop view in your code */}
                {/* If you need to add it back for desktop, uncomment this section */}
                {/* 
                <ListItemButton
                    onClick={handleNavigation("/Student/subjects")}
                    sx={getSidebarStyles("/Student/subjects")}
                >
                    <ListItemIcon sx={iconStyles}>
                        <AssignmentIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Class" />}
                </ListItemButton>
                */}

                <ListItemButton
                    onClick={handleNavigation("/Student/attendance")}
                    sx={getSidebarStyles("/Student/attendance")}
                >
                    <ListItemIcon sx={iconStyles}>
                        <ClassOutlinedIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Attendance" />}
                </ListItemButton>

                <ListItemButton
                    onClick={handleNavigation("/Student/marks")}
                    sx={getSidebarStyles("/Student/marks")}
                >
                    <ListItemIcon sx={iconStyles}>
                        <GradeIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Grade Report" />}
                </ListItemButton>

                <ListItemButton
                    onClick={handleNavigation("/Student/timetable")}
                    sx={getSidebarStyles("/Student/timetable")}
                >
                    <ListItemIcon sx={iconStyles}>
                        <ScheduleIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Timetable" />}
                </ListItemButton>

                <ListItemButton
                    onClick={handleNavigation("/Student/fees")}
                    sx={getSidebarStyles("/Student/fees")}
                >
                    <ListItemIcon sx={iconStyles}>
                        <AccountBalanceWalletIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Fees" />}
                </ListItemButton>

                <ListItemButton
                    onClick={handleNavigation("/Student/complain")}
                    sx={getSidebarStyles("/Student/complain")}
                >
                    <ListItemIcon sx={iconStyles}>
                        <AnnouncementOutlinedIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Complain" />}
                </ListItemButton>
                
                <ListItemButton
                    onClick={handleNavigation("/Student/notices")}
                    sx={getSidebarStyles("/Student/notices")}
                >
                    <ListItemIcon sx={iconStyles}>
                        <CampaignIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Notices" />}
                </ListItemButton>

            </React.Fragment>

            <Divider sx={{ backgroundColor: '#333', my: 1 }} />

            <React.Fragment>
                <ListItemButton
                    onClick={handleNavigation("/Student/profile")}
                    sx={getSidebarStyles("/Student/profile")}
                >
                    <ListItemIcon sx={iconStyles}>
                        <AccountCircleOutlinedIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Profile" />}
                </ListItemButton>

                <ListItemButton
                    onClick={handleNavigation("/logout")}
                    sx={getSidebarStyles("/logout")}
                >
                    <ListItemIcon sx={iconStyles}>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    {open && <ListItemText primary="Logout" />}
                </ListItemButton>
            </React.Fragment>
        </>
    );
}

export default StudentSideBar;