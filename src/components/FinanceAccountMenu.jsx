import React, { useState } from 'react';
import { Box, Avatar, Menu, MenuItem, ListItemIcon, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import { Settings, Logout, Person, Dashboard } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/userRelated/userHandle';

const FinanceAccountMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentUser } = useSelector(state => state.user);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate('/');
        handleClose();
    };

    const getUserName = () => {
        return currentUser?.name || currentUser?.email?.split('@')[0] || 'Finance Officer';
    };

    const getUserInitials = () => {
        if (currentUser?.name) return currentUser.name.charAt(0).toUpperCase();
        if (currentUser?.email) return currentUser.email.charAt(0).toUpperCase();
        return 'F';
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title="Finance Account">
                    <IconButton
                        onClick={handleClick}
                        size="small"
                        sx={{ ml: 2 }}
                        aria-controls={open ? 'finance-account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Avatar 
                            sx={{ 
                                width: 36, 
                                height: 36,
                                bgcolor: '#1976d2',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            }}
                        >
                            {getUserInitials()}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="finance-account-menu"
                open={open}
                onClose={handleClose}
                PaperProps={{
                    elevation: 3,
                    sx: styles.styledPaper,
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* Finance User Info */}
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="#1976d2">
                        {getUserName()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Finance Officer
                    </Typography>
                    {currentUser?.email && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {currentUser.email}
                        </Typography>
                    )}
                </Box>
                <Divider />

                {/* Finance-specific menu items */}
                <MenuItem 
                    onClick={handleClose}
                    component={Link}
                    to="/Finance/dashboard"
                    sx={{ py: 1.5 }}
                >
                    <ListItemIcon>
                        <Dashboard fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2">Dashboard</Typography>
                </MenuItem>

                <MenuItem 
                    onClick={handleClose}
                    component={Link}
                    to="/Finance/profile"
                    sx={{ py: 1.5 }}
                >
                    <ListItemIcon>
                        <Person fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2">My Profile</Typography>
                </MenuItem>

                <Divider />

                {/* Logout */}
                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2">Logout</Typography>
                </MenuItem>
            </Menu>
        </>
    );
}

export default FinanceAccountMenu;

const styles = {
    styledPaper: {
        overflow: 'visible',
        filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.15))',
        mt: 1.5,
        minWidth: 220,
        borderRadius: 2,
        '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            zIndex: 0,
        },
    }
};