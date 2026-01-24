// src/components/FinanceSidebar.jsx
import React from "react";
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  List,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import receiptLongIcon from "@mui/icons-material/ReceiptLong";

const FinanceSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <Box sx={{ width: 250, backgroundColor: "#fff", height: "100vh", borderRight: '1px solid #e0e0e0' }}>
      <Box sx={{ p: 2, backgroundColor: '#1976d2', color: 'white' }}>
        <AccountBalanceWalletIcon sx={{ fontSize: 40, mb: 1 }} />
        <ListItemText 
          primary="Finance Portal" 
          primaryTypographyProps={{ 
            fontWeight: 'bold', 
            fontSize: '1.1rem' 
          }} 
        />
      </Box>

      <List>
        <ListItemButton onClick={handleNavigation("/Finance/dashboard")}>
          <ListItemIcon>
            <HomeIcon
              color={
                location.pathname === "/Finance/dashboard" ||
                location.pathname === "/Finance"
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>


        <ListItemButton onClick={handleNavigation("/Finance/expenses")}>
          <ListItemIcon>
            <ShoppingCartIcon
              color={
                location.pathname.startsWith("/Finance/expenses")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Expenses" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/Finance/teacher-salaries")}>
          <ListItemIcon>
            <AccountBalanceWalletIcon
              color={
                location.pathname.startsWith("/Finance/teacher-salaries")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Teacher Salaries" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/Finance/profit-dashboard")}>
          <ListItemIcon>
            <ReceiptLongIcon
              color={
                location.pathname.startsWith("/Finance/profit-dashboard")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="School Profit" />
        </ListItemButton>

        <Divider sx={{ my: 1 }} />

        <ListItemButton onClick={handleNavigation("/Finance/profile")}>
          <ListItemIcon>
            <AccountCircleOutlinedIcon
              color={
                location.pathname.startsWith("/Finance/profile")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/logout")}>
          <ListItemIcon>
            <ExitToAppIcon
              color={
                location.pathname.startsWith("/logout")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default FinanceSidebar;