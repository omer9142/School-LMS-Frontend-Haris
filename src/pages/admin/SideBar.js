import React from "react";
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  List,
  useMediaQuery,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import SupervisorAccountOutlinedIcon from "@mui/icons-material/SupervisorAccountOutlined";
import ReportIcon from "@mui/icons-material/Report";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUp from "@mui/icons-material/TrendingUp";
import MasterSubjectManager from "./subjectRelated/MasterSubjectManager";
import { LibraryBooks } from "@mui/icons-material";


const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleNavigation = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <Box sx={{ width: 250, backgroundColor: "#fff", height: "50%" }}>
      <List>
        <ListItemButton onClick={handleNavigation("/")}>
          <ListItemIcon>
            <HomeIcon
              color={
                location.pathname === "/" ||
                location.pathname === "/Admin/dashboard"
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/Admin/classes")}>
          <ListItemIcon>
            <ClassOutlinedIcon
              color={
                location.pathname.startsWith("/Admin/classes")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Classes" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/Admin/subjects")}>
          <ListItemIcon>
            <AssignmentIcon
              color={
                location.pathname.startsWith("/Admin/subjects")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Subjects" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/Admin/teachers")}>
          <ListItemIcon>
            <SupervisorAccountOutlinedIcon
              color={
                location.pathname.startsWith("/Admin/teachers")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Teachers" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/Admin/students")}>
          <ListItemIcon>
            <PersonOutlineIcon
              color={
                location.pathname.startsWith("/Admin/students")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Students" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/Admin/timetable")}>
          <ListItemIcon>
            <ScheduleIcon
              color={
                location.pathname.startsWith("/Admin/timetable")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Timetable" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/Admin/addfinance")}>
          <ListItemIcon>
            <AccountBalanceWalletIcon
              color={
                location.pathname.startsWith("/Admin/addfinance")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Finance" />
        </ListItemButton>

      

        <ListItemButton onClick={handleNavigation("/Admin/attendance-tracker")}>
          <ListItemIcon>
            <TrendingUp
              color={
                location.pathname.startsWith("/Admin/attendance-tracker")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Attendance Tracker" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/Admin/fees")}>
          <ListItemIcon>
            <AccountBalanceWalletIcon
              color={
                location.pathname.startsWith("/Admin/fees")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Fees" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/Admin/mastersubjects")}>
          <ListItemIcon>
            <AssignmentIcon
              color={
                location.pathname.startsWith("/Admin/mastersubjects")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Subject Manager" />
        </ListItemButton>
        <ListItemButton onClick={handleNavigation("/Admin/library/books")}>
          <ListItemIcon>
            <LibraryBooks
              color={
                location.pathname.startsWith("/Admin/library/books")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Library" />
        </ListItemButton>

        <ListItemButton onClick={handleNavigation("/Admin/complains")}>
          <ListItemIcon>
            <ReportIcon
              color={
                location.pathname.startsWith("/Admin/complains")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Complains" />
        </ListItemButton>

          <ListItemButton onClick={handleNavigation("/Admin/notices")}>
          <ListItemIcon>
            <AnnouncementOutlinedIcon
              color={
                location.pathname.startsWith("/Admin/notices")
                  ? "primary"
                  : "inherit"
              }
            />
          </ListItemIcon>
          <ListItemText primary="Notices" />
        </ListItemButton>

        <Divider sx={{ my: 1 }} />

        <ListItemButton onClick={handleNavigation("/Admin/profile")}>
          <ListItemIcon>
            <AccountCircleOutlinedIcon
              color={
                location.pathname.startsWith("/Admin/profile")
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

export default SideBar;