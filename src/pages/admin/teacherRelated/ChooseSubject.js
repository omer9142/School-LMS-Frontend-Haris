// ChooseSubject.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Table, 
  TableBody, 
  TableContainer, 
  TableHead, 
  Typography, 
  Paper,
  Chip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom';
import { getTeacherFreeClassSubjects } from '../../../redux/sclassRelated/sclassHandle';
import { updateTeachSubject } from '../../../redux/teacherRelated/teacherHandle';
import { GreenButton, PurpleButton } from '../../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const ChooseSubject = ({ situation }) => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [classID, setClassID] = useState("");
  const [teacherID, setTeacherID] = useState("");
  const [submittingId, setSubmittingId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [chosenSubjects, setChosenSubjects] = useState(new Set());

  const { subjectsList, loading, error, response } = useSelector((state) => state.sclass);

  useEffect(() => {
    if (situation === "Norm") {
      const id = params.id;
      setClassID(id);
      dispatch(getTeacherFreeClassSubjects(id));
    } else if (situation === "Teacher") {
      const { classID: cid, teacherID: tid } = params;
      setClassID(cid);
      setTeacherID(tid);
      dispatch(getTeacherFreeClassSubjects(cid));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [situation, params]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
      <CircularProgress />
      <Typography sx={{ ml: 2 }}>Loading subjects...</Typography>
    </Box>
  );
  
  if (response) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="textSecondary" gutterBottom>
          All subjects have teachers assigned already
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <PurpleButton variant="contained" onClick={() => navigate("/Admin/addsubject/" + classID)}>
            Add New Subjects
          </PurpleButton>
        </Box>
      </Box>
    );
  }
  
  if (error) console.log(error);

  const updateSubjectHandler = async (teacherId, subjectId, subjectName) => {
    setSubmittingId(subjectId);
    setSelectedSubject(subjectName);
    
    try {
      await dispatch(updateTeachSubject(teacherId, subjectId));
      // Add to chosen subjects set without showing green popup
      setChosenSubjects(prev => new Set([...prev, subjectId]));
      // Don't show success alert
      // setShowSuccess(true); // REMOVED
    } catch (error) {
      console.error("Failed to assign subject:", error);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleChooseSubject = (subjectId, subjectName) => {
    if (situation === "Norm") {
      navigate("/Admin/teachers/addteacher/" + subjectId);
    } else {
      updateSubjectHandler(teacherID, subjectId, subjectName);
    }
  };

  const isSubjectChosen = (subjectId) => {
    return chosenSubjects.has(subjectId);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', p: 3 }}>
      {/* REMOVED Success Message Snackbar */}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Choose a Subject
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {situation === "Teacher" 
              ? "Select subjects to assign to this teacher" 
              : "Select a subject to add a teacher"}
          </Typography>
        </Box>
        <PurpleButton variant="outlined" onClick={() => navigate(-1)}>
          Done
        </PurpleButton>
      </Box>

      {/* Chosen Subjects Indicator - Simplified without green background */}
      {situation === "Teacher" && chosenSubjects.size > 0 && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
            ✅ {chosenSubjects.size} subject(s) assigned
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {subjectsList
              .filter(subject => chosenSubjects.has(subject._id))
              .map(subject => (
                <Chip
                  key={subject._id}
                  label={`${subject.subName} (${subject.subCode})`}
                  variant="outlined"
                  size="small"
                />
              ))
            }
          </Box>
        </Box>
      )}

      <TableContainer>
        <Table aria-label="subjects table">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>#</StyledTableCell>
              <StyledTableCell align="center">Status</StyledTableCell>
              <StyledTableCell align="center">Subject Name</StyledTableCell>
              <StyledTableCell align="center">Subject Code</StyledTableCell>
              <StyledTableCell align="center">Actions</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(subjectsList) && subjectsList.length > 0 && subjectsList.map((subject, index) => {
              const isChosen = isSubjectChosen(subject._id);
              const isSubmitting = submittingId === subject._id;
              
              return (
                <StyledTableRow 
                  key={subject._id}
                  sx={{
                    // REMOVED green background styling
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <StyledTableCell component="th" scope="row">
                    {index + 1}
                  </StyledTableCell>
                  
                  <StyledTableCell align="center">
                    {isChosen ? (
                      <CheckCircleIcon color="primary" sx={{ fontSize: 24 }} /> // Changed from success to primary
                    ) : (
                      <RadioButtonUncheckedIcon color="disabled" sx={{ fontSize: 24 }} />
                    )}
                  </StyledTableCell>
                  
                  <StyledTableCell align="center">
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: isChosen ? 600 : 400,
                        // REMOVED green text color
                      }}
                    >
                      {subject.subName}
                    </Typography>
                  </StyledTableCell>
                  
                  <StyledTableCell align="center">
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontFamily: 'monospace',
                      }}
                    >
                      {subject.subCode}
                    </Typography>
                  </StyledTableCell>
                  
                  <StyledTableCell align="center">
                    {situation === "Norm" ? (
                      <GreenButton
                        variant="contained"
                        onClick={() => handleChooseSubject(subject._id, subject.subName)}
                        startIcon={<RadioButtonUncheckedIcon />}
                      >
                        Choose
                      </GreenButton>
                    ) : (
                      <GreenButton
                        variant={isChosen ? "outlined" : "contained"}
                        disabled={isSubmitting || isChosen}
                        onClick={() => handleChooseSubject(subject._id, subject.subName)}
                        startIcon={isChosen ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                        sx={{
                          // Simplified button styling without green colors
                        }}
                      >
                        {isSubmitting ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : isChosen ? (
                          'Assigned'
                        ) : (
                          'Choose Subject'
                        )}
                      </GreenButton>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Empty State */}
      {(!subjectsList || subjectsList.length === 0) && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No available subjects found
          </Typography>
          <PurpleButton 
            variant="contained" 
            onClick={() => navigate("/Admin/addsubject/" + classID)}
            sx={{ mt: 2 }}
          >
            Add New Subjects
          </PurpleButton>
        </Box>
      )}
    </Paper>
  );
};

export default ChooseSubject;