import React, { useEffect, useState } from 'react';
import { getClassStudents, getSubjectDetails } from '../../../redux/sclassRelated/sclassHandle';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, Divider, Tab, Paper } from '@mui/material';
import TableTemplate from '../../../components/TableTemplate';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

const ViewSubject = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const { subloading, subjectDetails, sclassStudents, error } = useSelector((state) => state.sclass);

  const { classID, subjectID } = params;

  const [tabValue, setTabValue] = useState('1');

  useEffect(() => {
    dispatch(getSubjectDetails(subjectID, "Subject"));
    dispatch(getClassStudents(classID));
  }, [dispatch, subjectID, classID]);

  if (error) console.log(error);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const studentColumns = [
    { id: 'rollNum', label: 'Roll Number', minWidth: 100 },
    { id: 'studentId', label: 'Student ID', minWidth: 150 },
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'sclass', label: 'Class', minWidth: 120 },
  ];

  const studentRows = sclassStudents.map(student => ({
    rollNum: student.rollNum,
    studentId: student.studentId || `STU-${student._id.slice(-6)}`,
    name: student.name,
    sclass: student.sclassName?.sclassName || subjectDetails?.sclassName?.sclassName || 'Not Assigned',
    id: student._id,
  }));

  const EmptyButton = () => null;

  const SubjectDetailsSection = () => {
    const numberOfStudents = sclassStudents.length;

    return (
      <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2, mb: 8 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
            Subject Details
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            <strong>Subject Name:</strong> {subjectDetails?.subName}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Subject Code:</strong> {subjectDetails?.subCode}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Sessions:</strong> {subjectDetails?.sessions}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Number of Students:</strong> {numberOfStudents}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Class:</strong> {sclassStudents[0]?.sclassName?.sclassName || subjectDetails?.sclassName?.sclassName || 'Not Assigned'}
          </Typography>
          <Typography variant="h6" gutterBottom>
            <strong>Teacher:</strong> {subjectDetails?.teacher ? subjectDetails.teacher.name : "Not Assigned"}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {subloading ? (
        <div>Loading...</div>
      ) : (
        <Box sx={{ width: '100%', typography: 'body1', marginBottom: "3rem" }}>
          <TabContext value={tabValue}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <TabList onChange={handleTabChange} centered>
                <Tab label="Details" value="1" />
                <Tab label="Students" value="2" />
              </TabList>
            </Box>

            <Container sx={{ marginTop: "2rem", marginBottom: "3rem" }}>
              <TabPanel value="1">
                <SubjectDetailsSection />
              </TabPanel>

              <TabPanel value="2">
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  Students List
                </Typography>
                <TableTemplate
                  columns={studentColumns}
                  rows={studentRows}
                  buttonHaver={() => null}
                />

              </TabPanel>
            </Container>
          </TabContext>
        </Box>
      )}
    </>
  );
};

export default ViewSubject;
