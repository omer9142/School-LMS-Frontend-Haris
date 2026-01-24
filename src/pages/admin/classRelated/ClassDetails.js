import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
import {
  getClassDetails,
  getClassStudents,
  getSubjectList,
  removeStudentFromClass,
  getUnassignedStudents,
  assignStudentToClass,
  deleteSubject,
  deleteAllSubjects,
  removeAllStudentsFromClass,
} from "../../../redux/sclassRelated/sclassHandle";
import {
  Box, Container, Typography, Tab, IconButton, Card,
  CardContent, Grid, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, Button,
  TextField, Table, TableBody, TableContainer,
  TableHead, Paper, Checkbox
} from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { BlueButton, GreenButton } from "../../../components/buttonStyles";
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SpeedDialTemplate from "../../../components/SpeedDialTemplate";
import Popup from "../../../components/Popup";
import DeleteIcon from "@mui/icons-material/Delete";
import PostAddIcon from '@mui/icons-material/PostAdd';
import SearchIcon from '@mui/icons-material/Search';

// Add the student ID formatting function from ViewStudent
const getDisplayStudentId = (student) => {
  const explicit =
    student?.studentId ||
    student?.studentID ||
    student?.student_id ||
    student?.registrationId ||
    student?.admissionId ||
    student?.sid;
  if (explicit) return explicit;

  // fallback to short form from Mongo _id
  const id = student?._id;
  if (!id) return 'N/A';
  const lastSix = String(id).slice(-6);
  return `STU-${lastSix}`;
};

const ClassDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    subjectsList,
    sclassStudents,
    sclassDetails,
    loading,
    error,
    response,
    getresponse,
    unassignedStudents
  } = useSelector((state) => state.sclass);

  const classID = params.id;
  const schoolID = sclassDetails?.school?._id;

  useEffect(() => {
    dispatch(getClassDetails(classID, "Sclass"));
    dispatch(getSubjectList(classID, "ClassSubjects"));
    dispatch(getClassStudents(classID));
  }, [dispatch, classID]);

  if (error) console.log(error);

  const [value, setValue] = useState('1');
  const handleChange = (event, newValue) => setValue(newValue);

  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  // =============== Unassigned Students Modal ===============
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const openModal = () => {
    if (schoolID) {
      dispatch(getUnassignedStudents(schoolID));
    }
    setSelectedStudents([]);
    setSearchTerm("");
    setOpenAssignModal(true);
  };
  
  const closeModal = () => {
    setOpenAssignModal(false);
    setSelectedStudents([]);
    setSearchTerm("");
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssignSelected = async () => {
    if (selectedStudents.length === 0) {
      setMessage("Please select at least one student to assign.");
      setShowPopup(true);
      return;
    }

    try {
      for (const studentId of selectedStudents) {
        await dispatch(assignStudentToClass(classID, studentId));
      }
      
      dispatch(getClassStudents(classID));
      if (schoolID) {
        dispatch(getUnassignedStudents(schoolID));
      }
      
      setMessage(`Successfully assigned ${selectedStudents.length} student(s) to the class.`);
      setShowPopup(true);
      closeModal();
    } catch (error) {
      setMessage("Error assigning students. Please try again.");
      setShowPopup(true);
    }
  };

  // Filter unassigned students based on search term
  const filteredUnassignedStudents = unassignedStudents?.filter(student => 
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNum?.toString().includes(searchTerm) ||
    getDisplayStudentId(student)?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // =============== Handle Student Delete ===============
  const handleDeleteClick = async (row) => {
    // Find the full student object
    const student = sclassStudents.find(s => s._id === row.id);
    const studentName = student?.name || row.name;
    const studentRollNum = student?.rollNum || row.rollNum;

    // Use browser's confirm dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to remove "${studentName}" (Roll No: ${studentRollNum || 'N/A'}) from this class?\n\n` 
      
    );

    if (!isConfirmed) return;

    try {
      await dispatch(removeStudentFromClass(classID, row.id));
      dispatch(getClassStudents(classID));
      if (schoolID) {
        dispatch(getUnassignedStudents(schoolID));
      }
      
      setMessage(`Student "${studentName}" has been removed from the class.`);
      setShowPopup(true);
    } catch (error) {
      setMessage("Error removing student. Please try again.");
      setShowPopup(true);
    }
  };

  // =============== Subjects Section ===============
  const subjectColumns = [
    { id: 'name', label: 'Subject Name', minWidth: 170 },
    { id: 'code', label: 'Subject Code', minWidth: 100 },
  ];

  const subjectRows = subjectsList?.map((subject) => ({
    name: subject.subName,
    code: subject.subCode,
    id: subject._id,
  })) || [];

  const SubjectsButtonHaver = ({ row }) => (
    <>
      <IconButton
        onClick={async () => {
          // Use browser's confirm dialog for subject deletion
          const isConfirmed = window.confirm(
            `Are you sure you want to delete the subject "${row.name}" (${row.code})?\n\n` 
          );

          if (isConfirmed) {
            try {
              await dispatch(deleteSubject(row.id, "Subject"));
              dispatch(getSubjectList(classID, "ClassSubjects"));
              setMessage(`Subject "${row.name}" has been deleted successfully.`);
              setShowPopup(true);
            } catch (error) {
              setMessage("Error deleting subject. Please try again.");
              setShowPopup(true);
            }
          }
        }}
      >
        <DeleteIcon color="error" />
      </IconButton>
      <BlueButton
        variant="contained"
        onClick={() => navigate(`/Admin/class/subject/${classID}/${row.id}`)}
      >
        View
      </BlueButton>
    </>
  );

  const handleDeleteAllSubjects = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to remove ALL subjects from this class?\n\n` 
    );

    if (!isConfirmed) return;

    try {
      await dispatch(deleteAllSubjects(classID));
      dispatch(getSubjectList(classID, "ClassSubjects"));
      setMessage(`All subjects (${subjectsList?.length || 0}) have been deleted from the class.`);
      setShowPopup(true);
    } catch (error) {
      setMessage("Error deleting subjects. Please try again.");
      setShowPopup(true);
    }
  };

  const subjectActions = [
    {
      icon: <PostAddIcon color="primary" />, name: 'Add New Subject',
      action: () => navigate("/Admin/addsubject/" + classID)
    },
    {
      icon: <DeleteIcon color="error" />, name: 'Delete All Subjects',
      action: handleDeleteAllSubjects
    }
  ];

  const ClassSubjectsSection = () => (
    <Card sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        {response ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <GreenButton
              variant="contained"
              onClick={() => navigate("/Admin/addsubject/" + classID)}
            >
              Add Subjects
            </GreenButton>
          </Box>
        ) : (
          <>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Subjects List
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <StyledTableRow>
                    {subjectColumns.map((column) => (
                      <StyledTableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </StyledTableCell>
                    ))}
                    <StyledTableCell 
                      align="right"
                      style={{ 
                        minWidth: '300px',
                        paddingRight: '60px',
                        textAlign: 'right'
                      }}
                    >
                      Actions
                    </StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {subjectRows.map((row) => (
                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {subjectColumns.map((column) => {
                        const value = row[column.id];
                        return (
                          <StyledTableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                          </StyledTableCell>
                        );
                      })}
                      <StyledTableCell 
                        align="right"
                        style={{ 
                          textAlign: 'right',
                          paddingRight: '40px'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          width: '100%',
                          gap: '1rem'
                        }}>
                          <SubjectsButtonHaver row={row} />
                        </div>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <SpeedDialTemplate actions={subjectActions} />
          </>
        )}
      </CardContent>
    </Card>
  );

  // =============== Students Section ===============
  const studentColumns = [
    { id: 'index', label: '#', minWidth: 50 },
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
  ];

  const studentRows = sclassStudents.map((student, index) => ({
    index: index + 1,
    name: student.name,
    rollNum: student.rollNum,
    id: student._id,
  }));

  const StudentsButtonHaver = ({ row }) => (
    <>
      <IconButton 
        onClick={() => handleDeleteClick(row)}
      >
        <PersonRemoveIcon color="error" />
      </IconButton>
      <BlueButton
        variant="contained"
        onClick={() => navigate("/Admin/students/student/" + row.id)}
      >
        View
      </BlueButton>
    </>
  );

  const handleRemoveAllStudents = async () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to remove ALL students from this class?\n\n` 
    );

    if (!isConfirmed) return;

    try {
      const result = await dispatch(removeAllStudentsFromClass(classID));
      
      if (result.success) {
        setMessage(`All students (${sclassStudents.length}) have been removed from the class.`);
        setShowPopup(true);
        
        dispatch(getClassStudents(classID));
        if (schoolID) {
          dispatch(getUnassignedStudents(schoolID));
        }
      } else {
        setMessage(result.error || "Failed to remove students");
        setShowPopup(true);
      }
      
    } catch (error) {
      console.error('Remove all students error:', error);
      setMessage("Error removing students. Please try again.");
      setShowPopup(true);
    }
  };

  const studentActions = [
    {
      icon: <PersonAddAlt1Icon color="primary" />, 
      name: 'Add Students',
      action: openModal
    },
    {
      icon: <PersonRemoveIcon color="error" />,
      name: 'Remove All Students',
      action: handleRemoveAllStudents
    },
  ];

  const ClassStudentsSection = () => (
    <Card sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        {getresponse ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <GreenButton
              variant="contained"
              onClick={openModal}
            >
              Add Students
            </GreenButton>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Students List
              </Typography>
              <Typography variant="body1" color="primary" sx={{ fontWeight: 500, backgroundColor: '#e3f2fd', px: 2, py: 0.5, borderRadius: 1 }}>
                Total Students: {sclassStudents.length}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <StyledTableRow>
                    {studentColumns.map((column) => (
                      <StyledTableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </StyledTableCell>
                    ))}
                    <StyledTableCell 
                      align="right"
                      style={{ 
                        minWidth: '300px',
                        paddingRight: '60px',
                        textAlign: 'right'
                      }}
                    >
                      Actions
                    </StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {studentRows.map((row) => (
                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {studentColumns.map((column) => {
                        const value = row[column.id];
                        return (
                          <StyledTableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                          </StyledTableCell>
                        );
                      })}
                      <StyledTableCell 
                        align="right"
                        style={{ 
                          textAlign: 'right',
                          paddingRight: '40px'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          width: '100%',
                          gap: '1rem'
                        }}>
                          <StudentsButtonHaver row={row} />
                        </div>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <SpeedDialTemplate actions={studentActions} />
          </>
        )}
      </CardContent>
    </Card>
  );

  // =============== Teachers Section ===============
  const ClassTeachersSection = () => {
    const teachers = sclassDetails?.teachers || [];
    const teacherColumns = [
      { id: 'name', label: 'Name', minWidth: 170 },
      { id: 'email', label: 'Email', minWidth: 200 },
    ];
    
    const teacherRows = teachers.map((teacher) => ({
      name: teacher.name,
      email: teacher.email,
      id: teacher._id,
    }));

    const TeachersButtonHaver = ({ row }) => (
      <BlueButton
        variant="contained"
        onClick={() => navigate("/Admin/teachers/teacher/" + row.id)}
      >
        View
      </BlueButton>
    );

    return (
      <Card sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Teachers List
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <StyledTableRow>
                  {teacherColumns.map((column) => (
                    <StyledTableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </StyledTableCell>
                  ))}
                  <StyledTableCell 
                    align="right"
                    style={{ 
                      minWidth: '300px',
                      paddingRight: '60px',
                      textAlign: 'right'
                    }}
                  >
                    Actions
                  </StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {teacherRows.map((row) => (
                  <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {teacherColumns.map((column) => {
                      const value = row[column.id];
                      return (
                        <StyledTableCell key={column.id} align={column.align}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </StyledTableCell>
                      );
                    })}
                    <StyledTableCell 
                      align="right"
                      style={{ 
                        textAlign: 'right',
                        paddingRight: '40px'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        width: '100%',
                        gap: '1rem'
                      }}>
                        <TeachersButtonHaver row={row} />
                      </div>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  // =============== Class Details Section ===============
  const ClassDetailsSection = () => {
    const numberOfSubjects = subjectsList.length;
    const numberOfStudents = sclassStudents.length;
    const numberOfTeachers = sclassDetails?.teachers ? sclassDetails.teachers.length : 0;
    return (
      <Card sx={{ p: 3, boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
            Class Details
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Class: {sclassDetails?.sclassName}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Subjects: {numberOfSubjects}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Students: {numberOfStudents}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h6">Teachers: {numberOfTeachers}</Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            {getresponse &&
              <GreenButton
                variant="contained"
                onClick={openModal}
              >
                Add Students
              </GreenButton>
            }
            {response &&
              <GreenButton
                variant="contained"
                onClick={() => navigate("/Admin/addsubject/" + classID)}
              >
                Add Subjects
              </GreenButton>
            }
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Box sx={{ width: '100%', typography: 'body1' }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <TabList onChange={handleChange} sx={{ px: 2 }}>
                <Tab label="Details" value="1" />
                <Tab label="Subjects" value="2" />
                <Tab label="Students" value="3" />
                <Tab label="Teachers" value="4" />
              </TabList>
            </Box>
            <Container sx={{ mt: 3, mb: 4 }}>
              <TabPanel value="1" sx={{ p: 0 }}><ClassDetailsSection /></TabPanel>
              <TabPanel value="2" sx={{ p: 0 }}><ClassSubjectsSection /></TabPanel>
              <TabPanel value="3" sx={{ p: 0 }}><ClassStudentsSection /></TabPanel>
              <TabPanel value="4" sx={{ p: 0 }}><ClassTeachersSection /></TabPanel>
            </Container>
          </TabContext>
        </Box>
      )}

      {/* Modal for selecting unassigned students */}
      <Dialog open={openAssignModal} onClose={closeModal} fullWidth maxWidth="lg">
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Select Students to Assign to Class
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ minHeight: '500px' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Loading unassigned students...</Typography>
            </Box>
          ) : (!unassignedStudents || unassignedStudents.length === 0) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography color="text.secondary">
                No unassigned students found.
              </Typography>
            </Box>
          ) : (
            <>
              {/* Search Bar */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by name, Guardian's name, roll number, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  }}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {filteredUnassignedStudents.length} student(s) found
                </Typography>
              </Box>

              {/* Students Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <StyledTableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <StyledTableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedStudents.length > 0 && 
                            selectedStudents.length < filteredUnassignedStudents.length
                          }
                          checked={
                            filteredUnassignedStudents.length > 0 && 
                            selectedStudents.length === filteredUnassignedStudents.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(filteredUnassignedStudents.map(student => student._id));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                        />
                      </StyledTableCell>
                      <StyledTableCell sx={{ fontWeight: 600 }}>NAME</StyledTableCell>
                      <StyledTableCell sx={{ fontWeight: 600 }}>GUARDIAN'S NAME</StyledTableCell>
                      <StyledTableCell sx={{ fontWeight: 600 }}>ROLL NUMBER</StyledTableCell>
                      <StyledTableCell sx={{ fontWeight: 600 }}>STUDENT ID</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUnassignedStudents.map((student) => (
                      <StyledTableRow
                        key={student._id}
                        hover
                        onClick={() => handleStudentToggle(student._id)}
                        sx={{
                          cursor: 'pointer',
                          '&:last-child td, &:last-child th': { border: 0 },
                          backgroundColor: selectedStudents.includes(student._id) ? '#e3f2fd' : 'inherit'
                        }}
                      >
                        <StyledTableCell padding="checkbox">
                          <Checkbox
                            checked={selectedStudents.includes(student._id)}
                            onChange={() => handleStudentToggle(student._id)}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {student.name || 'N/A'}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography variant="body2">
                            {student.fatherName || 'N/A'}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography variant="body2">
                            {student.rollNum || 'Not assigned'}
                          </Typography>
                        </StyledTableCell>
                        <StyledTableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            {getDisplayStudentId(student)}
                          </Typography>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedStudents.length > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e8', borderRadius: 1, border: '1px solid #c8e6c9' }}>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#2e7d32' }}>
                    {selectedStudents.length} student(s) selected for assignment
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={closeModal} color="inherit" variant="outlined">
            Cancel
          </Button>
          <GreenButton
            onClick={handleAssignSelected}
            disabled={selectedStudents.length === 0 || loading}
            variant="contained"
            startIcon={<PersonAddAlt1Icon />}
          >
            Assign Selected ({selectedStudents.length})
          </GreenButton>
        </DialogActions>
      </Dialog>

      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default ClassDetails;