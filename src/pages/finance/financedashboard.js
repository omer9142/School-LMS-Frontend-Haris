// src/pages/finance/FinanceDashboard.js
import { CssBaseline, Box, Toolbar, IconButton, useTheme, useMediaQuery, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Logout from '../Logout';
import { AppBar } from '../../components/styles';
import FinanceHome from './FinanceHome';
import FinanceProfile from './FinanceProfile';
import Expenses from './Expenses';
import TeacherSalaries from './teacherSalaries';
import SchoolProfitDashboard from './SchoolProfitDashboard';
import ScrollWrapper from '../../components/ScrollWrapper';
import FinanceAccountMenu from '../../components/FinanceAccountMenu';
import FinanceSidebar from './financeSidebar';
import ScrollToTop from '../../components/ScrollToTop'; // Import ScrollToTop

const FinanceDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <>
            {/* Add ScrollToTop at the top level */}
            <ScrollToTop />
            
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />

                {/* Navbar */}
                <AppBar
                    position="fixed"
                    sx={{
                        backgroundColor: '#F5F4F9',
                        color: 'black',
                        zIndex: 1300,
                        width: isMobile ? '100%' : 'calc(100% - 250px)',
                        ml: isMobile ? 0 : '250px',
                    }}
                >
                    <Toolbar sx={{ pr: '24px' }}>
                        {isMobile && (
                            <IconButton
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{
                                    color: 'black',
                                    mr: 2,
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        <FinanceAccountMenu />
                    </Toolbar>
                </AppBar>

                {/* Sidebar - Mobile Drawer */}
                {isMobile ? (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            '& .MuiDrawer-paper': {
                                width: 250,
                                boxSizing: 'border-box',
                            },
                        }}
                    >
                        <FinanceSidebar />
                    </Drawer>
                ) : (
                    <Drawer
                        variant="permanent"
                        sx={{
                            width: 250,
                            flexShrink: 0,
                            '& .MuiDrawer-paper': {
                                width: 250,
                                boxSizing: 'border-box',
                            },
                        }}
                    >
                        <FinanceSidebar />
                    </Drawer>
                )}

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        width: isMobile ? '100%' : 'calc(100% - 250px)',
                        minHeight: '100vh',
                        backgroundColor: '#ffffff',
                    }}
                >
                    <Toolbar />
                    <ScrollWrapper sx={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                        <Routes>
                            <Route path="/" element={<FinanceHome />} />
                            <Route path="/Finance/dashboard" element={<FinanceHome />} />
                            <Route path="/Finance/fees" element={<FinanceHome />} />
                            <Route path="/Finance/expenses" element={<Expenses />} />
                            <Route path="/Finance/teacher-salaries" element={<TeacherSalaries />} />
                            <Route path="/Finance/profile" element={<FinanceProfile />} />
                            <Route path="/logout" element={<Logout />} />
                            <Route path="/Finance/profit-dashboard" element={<SchoolProfitDashboard />} />
                            <Route path="*" element={<Navigate to="/Finance/dashboard" />} />
                        </Routes>
                    </ScrollWrapper>
                </Box>
            </Box>
        </>
    );
};

export default FinanceDashboard;