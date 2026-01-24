import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getClassStudents,
  getClassDetails,
} from "../../redux/sclassRelated/sclassHandle";
import {
  Paper,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  Container,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { BlackButton } from "../../components/buttonStyles";
import { getTeacherDetails } from "../../redux/teacherRelated/teacherHandle";
import TableTemplate from "../../components/TableTemplate";
import ScrollToTop from "../../components/ScrollToTop";
import MenuItem from "@mui/material/MenuItem";
const TeacherClassDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { sclassStudents, loading, error, getresponse, classDetails } =
    useSelector((state) => state.sclass);
  const { currentUser } = useSelector((state) => state.user);
  const { teacherDetails, loading: teacherLoading } = useSelector(
    (state) => state.teacher
  );

  // fetch teacher details once
  useEffect(() => {
    if (currentUser?._id) {
      dispatch(getTeacherDetails(currentUser._id));
    }
  }, [dispatch, currentUser?._id]);

  // normalize classes
  const teacherClasses = useMemo(() => {
    const raw = teacherDetails?.teachSclass;
    return raw ? (Array.isArray(raw) ? raw : [raw]) : [];
  }, [teacherDetails?.teachSclass]);

  // memoized class IDs
  const classIDs = useMemo(
    () =>
      teacherClasses
        .map((c) => (typeof c === "string" ? c : c._id || c))
        .filter(Boolean),
    [teacherClasses]
  );

  const [selectedClassId, setSelectedClassId] = useState(null);

  // ensure selectedClassId always has a value
  useEffect(() => {
    if (!selectedClassId && classIDs.length > 0) {
      setSelectedClassId(classIDs[0]);
    }
  }, [classIDs, selectedClassId]);

  // fetch students + class details
  useEffect(() => {
    if (selectedClassId) {
      dispatch(getClassStudents(selectedClassId));
      dispatch(getClassDetails(selectedClassId));
    }
  }, [dispatch, selectedClassId]);

  if (error) console.log(error);

  /** ---------------- STUDENTS TABLE ---------------- */
  const studentColumns = [
    { id: "name", label: "Name", minWidth: 120 },
    { id: "rollNum", label: "Roll No", minWidth: 80 },
  ];

  const studentRows = Array.isArray(sclassStudents)
    ? sclassStudents.map((student) => ({
        name: student.name,
        rollNum: student.rollNum,
        id: student._id,
      }))
    : [];

  /** ---------------- HELPERS ---------------- */
  const selectedClassObj = teacherClasses.find(
    (c) => (typeof c === "string" ? c : c._id || c) === selectedClassId
  );

  const classLabel =
    (selectedClassObj &&
      (typeof selectedClassObj === "string"
        ? selectedClassObj
        : selectedClassObj.sclassName)) ||
    (classDetails && classDetails._id === selectedClassId
      ? classDetails.sclassName
      : selectedClassId);

  /** ---------------- BUTTON HAVER ---------------- */
  const StudentsButtonHaver = ({ row }) => {
    return (
      <BlackButton
        variant="contained"
        onClick={() => navigate("/Teacher/class/student/" + row.id)}
        sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, px: { xs: 1, sm: 2 } }}
      >
        View
      </BlackButton>
    );
  };

  /** ---------------- MOBILE CARD VIEW ---------------- */
  const MobileStudentCard = ({ student }) => {
    return (
      <Card 
        sx={{ 
          mb: 2, 
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          borderRadius: 2,
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
            {student.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Roll No: <strong>{student.rollNum}</strong>
          </Typography>
        </CardContent>
        <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/Teacher/class/student/" + student.id)}
            sx={{ 
              textTransform: 'none',
              fontSize: '0.875rem',
              px: 2,
              py: 0.75,
              borderRadius: 1.5,
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#333',
              }
            }}
          >
            View Details
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <>
      <ScrollToTop />
      <Container 
        maxWidth={false} 
        sx={{ 
          width: { xs: '100%', sm: '95%', md: '90%', lg: '85%' },
          marginLeft: 'auto', 
          marginRight: 'auto',
          mt: 2,
          mb: 4,
          px: { xs: 2, sm: 2 },
        }}
      >
        {loading || teacherLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Typography variant="h6">Loading...</Typography>
          </Box>
        ) : (
          <>
            <Typography 
              variant="h4" 
              align="center" 
              gutterBottom 
              sx={{ 
                mb: 3, 
                fontSize: { xs: '1.5rem', sm: '2rem' },
                fontWeight: 600,
              }}
            >
              Class Details {classLabel ? ` - ${classLabel}` : ""}
            </Typography>

            {/* class selector if multiple classes */}
            {classIDs.length > 1 && (
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                  <InputLabel id="teacher-class-select">Class</InputLabel>
                  <Select
                    labelId="teacher-class-select"
                    value={selectedClassId || ""}
                    label="Class"
                    onChange={(e) => setSelectedClassId(e.target.value || null)}
                  >
                    {classIDs.map((id) => {
                      const cObj = teacherClasses.find(
                        (c) => (typeof c === "string" ? c : c._id || c) === id
                      );
                      const label =
                        cObj &&
                          (typeof cObj === "string"
                            ? cObj
                            : cObj.sclassName) || id;
                      return (
                        <MenuItem key={id} value={id}>
                          {label}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* Students List */}
            {getresponse ? (
              <Box sx={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "200px",
                mt: 3
              }}>
                <Typography variant="h6">No Students Found</Typography>
              </Box>
            ) : (
              <Paper sx={{ 
                width: "100%", 
                overflow: "hidden", 
                mb: 3,
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 },
                  textAlign: { xs: 'center', sm: 'left' }
                }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: { xs: '1.1rem', sm: '1.5rem' } 
                    }}
                  >
                    Students List
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      color: '#fff',
                      fontSize: { xs: '0.85rem', sm: '0.95rem' },
                      fontWeight: 500,
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 0.5, sm: 0.75 },
                      backgroundColor: 'black',
                     
                      borderRadius: 2,
                    }}
                  >
                    Total: {studentRows.length}
                  </Typography>
                </Box>

                {studentRows.length > 0 && (
                  <>
                    {/* Mobile View - Card Layout */}
                    {isMobile ? (
                      <Box sx={{ mt: 2 }}>
                        {studentRows.map((student) => (
                          <MobileStudentCard key={student.id} student={student} />
                        ))}
                      </Box>
                    ) : (
                      /* Desktop View - Table Layout */
                      <Box sx={{ 
                        width: '100%', 
                        overflowX: 'auto',
                        mt: 2,
                        '&::-webkit-scrollbar': {
                          height: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#f1f1f1',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#888',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: '#555',
                        }
                      }}>
                        <TableTemplate
                          buttonHaver={StudentsButtonHaver}
                          columns={studentColumns}
                          rows={studentRows}
                        />
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default TeacherClassDetails;