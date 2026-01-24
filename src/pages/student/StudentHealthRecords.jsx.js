import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Container, Typography, Paper } from '@mui/material';
import StudentHealthDisplay from '../admin/studentRelated/StudentHealthDisplay';

const StudentHealthRecords = () => {
  const { currentUser } = useSelector((state) => state.user);
  
  // Get student ID from currentUser
  const studentId = currentUser?._id;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            mb: 3,
            fontWeight: 600,
            color: '#1976d2'
          }}
        >
          My Health Records
        </Typography>

        <StudentHealthDisplay 
          studentId={studentId}
          userRole="Student"
          canEdit={false}  // Students cannot edit their health records
          onEditClick={null}
        />
      </Paper>
    </Container>
  );
};

export default StudentHealthRecords;