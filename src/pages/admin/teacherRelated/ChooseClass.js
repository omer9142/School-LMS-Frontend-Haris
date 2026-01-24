import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { assignTeacherToClass } from '../../../redux/teacherRelated/teacherHandle';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { useNavigate, useLocation } from 'react-router-dom';
import { PurpleButton } from '../../../components/buttonStyles';
import TableTemplate from '../../../components/TableTemplate';

const ChooseClass = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const stateSituation = location.state?.situation; // "Teacher" | "AddTeacher" | "Subject"
  const stateTeacherId = location.state?.teacherId;

  const situation = useMemo(() => {
    if (stateSituation) return stateSituation;
    const lower = location.pathname.toLowerCase();
    return lower.includes('/subjects/') ? 'Subject' : 'Teacher';
  }, [stateSituation, location.pathname]);

  const teacherId = useMemo(() => {
    if (stateTeacherId) return stateTeacherId;
    const params = new URLSearchParams(location.search);
    return params.get('teacherId');
  }, [stateTeacherId, location.search]);

  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');

  const { sclassesList, loading, error, getresponse } = useSelector((state) => state.sclass);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getAllSclasses(currentUser._id, 'Sclass'));
  }, [currentUser._id, dispatch]);

  if (error) console.error(error);

  const navigateHandler = async (classID) => {
    setAssignmentError('');
    setAssignmentSuccess('');

   

    // FIXED: Navigate to AddTeacher page with classId when creating new teacher
    if (situation === 'AddTeacher' || (situation === 'Teacher' && !teacherId)) {
      console.log('Navigating to AddTeacher with classId:', classID); // Debug log
      navigate(`/Admin/addteacher`, {
        state: { 
          classId: classID,
          situation: 'AddTeacher'
        }
      });
      return;
    }

    // Existing teacher assignment flow
    if (situation === 'Teacher' && teacherId) {
      setAssignmentLoading(true);
      try {
        await dispatch(assignTeacherToClass(teacherId, classID));
        setAssignmentSuccess('Teacher assigned successfully!');
        setTimeout(() => {
          navigate('/Admin/teachers', {
            state: { refreshNeeded: true, successMessage: 'Class assigned successfully!' },
          });
        }, 800);
      } catch (err) {
        console.error('Assignment failed:', err);
        setAssignmentError(
          err?.response?.data?.message || err?.message || 'Failed to assign teacher'
        );
      } finally {
        setAssignmentLoading(false);
      }
    } else if (situation === 'Subject') {
      // SUBJECT FLOW: Admin adding subject to class
      navigate(`/Admin/addsubject/${classID}`);
    }
  };

  const sclassColumns = [{ id: 'name', label: 'Class Name', minWidth: 170 }];
  const sclassRows = Array.isArray(sclassesList)
    ? sclassesList.map((sclass) => ({
        name: sclass.sclassName,
        id: sclass._id,
      }))
    : [];

  const SclassButtonHaver = ({ row }) => (
    <PurpleButton
      variant="contained"
      onClick={() => navigateHandler(row.id)}
      disabled={assignmentLoading}
    >
      {assignmentLoading ? 'Working...' : 'Choose'}
    </PurpleButton>
  );

  return (
    <Paper elevation={4} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
        {situation === 'Teacher' || situation === 'AddTeacher'
          ? 'Choose a Class'
          : 'Choose a Class to Add Subject'}
      </Typography>

     

      {assignmentError && <Alert severity="error" sx={{ mb: 2 }}>{assignmentError}</Alert>}
      {assignmentSuccess && <Alert severity="success" sx={{ mb: 2 }}>{assignmentSuccess}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : getresponse ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" onClick={() => navigate('/Admin/addclass')}>
            Add New Class
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
            {(situation === 'Teacher' || situation === 'AddTeacher')
              ? 'Select a class to create a new teacher for.'
              : 'Select a class to add a new subject.'}
          </Typography>

          {sclassRows.length > 0 ? (
            <TableTemplate buttonHaver={SclassButtonHaver} columns={sclassColumns} rows={sclassRows} />
          ) : (
            <Typography variant="body1" color="textSecondary" align="center">
              No classes available. Please add a class first.
            </Typography>
          )}
        </>
      )}
    </Paper>
  );
};

export default ChooseClass;