import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';

// Common pages
import Homepage from './pages/Homepage';
import ChooseUser from './pages/ChooseUser';
import LoginPage from './pages/LoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import FinanceDashboard from './pages/finance/financedashboard'; // 💰 NEW import

const App = () => {
  const { currentRole } = useSelector(state => state.user);

  return (
    <Router>
      {currentRole === null && (
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/choose" element={<ChooseUser visitor="normal" />} />
          <Route path="/chooseasguest" element={<ChooseUser visitor="guest" />} />

          {/* Role-based login routes */}
          <Route path="/Adminlogin" element={<LoginPage role="Admin" />} />
          <Route path="/Studentlogin" element={<LoginPage role="Student" />} />
          <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />
          <Route path="/Financelogin" element={<LoginPage role="Finance" />} /> {/* 💰 Added Finance Login */}

          {/* Admin register */}
          <Route path="/Adminregister" element={<AdminRegisterPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}

      {/* Private dashboards after login */}
      {currentRole === "Admin" && (
        <>
          <AdminDashboard />
        </>
      )}

      {currentRole === "Student" && (
        <>
          <StudentDashboard />
        </>
      )}

      {currentRole === "Teacher" && (
        <>
          <TeacherDashboard />
        </>
      )}

      {currentRole === "Finance" && (
        <>
          <FinanceDashboard /> {/* 💰 NEW Finance dashboard route */}
        </>
      )}
    </Router>
  );
};

export default App;
