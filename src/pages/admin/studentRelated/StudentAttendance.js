import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getUserDetails } from '../../../redux/userRelated/userHandle';
import { getSubjectList } from '../../../redux/sclassRelated/sclassHandle';
import { updateStudentFields, getStudentAttendance } from '../../../redux/studentRelated/studentHandle';

import {
    Box, InputLabel,
    MenuItem, Select,
    Typography, Stack,
    TextField, CircularProgress, FormControl
} from '@mui/material';
import { PurpleButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';

const StudentAttendance = ({ situation }) => {
    const dispatch = useDispatch();
    const { currentUser, userDetails, loading } = useSelector((state) => state.user);
    const { subjectsList } = useSelector((state) => state.sclass);
    const { attendance, response, error, statestatus } = useSelector((state) => state.student);
    const params = useParams();

    const [studentID, setStudentID] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [chosenSubName, setChosenSubName] = useState("");
    const [status, setStatus] = useState('');
    const [date, setDate] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    // Fetch student details + attendance
    useEffect(() => {
        if (situation === "Student") {
            const stdID = params.id;
            setStudentID(stdID);
            dispatch(getUserDetails(stdID, "Student"));
            dispatch(getStudentAttendance(stdID)); // 👈 fetch attendance
        } else if (situation === "Subject") {
            const { studentID, subjectID } = params;
            setStudentID(studentID);
            dispatch(getUserDetails(studentID, "Student"));
            dispatch(getStudentAttendance(studentID)); // 👈 fetch attendance
            setChosenSubName(subjectID);
        }
    }, [situation]);

    // Fetch subject list when userDetails available
    useEffect(() => {
        if (userDetails && userDetails.sclassName && situation === "Student") {
            dispatch(getSubjectList(userDetails.sclassName._id, "ClassSubjects"));
        }
    }, [dispatch, userDetails]);

    const changeHandler = (event) => {
        const selectedSubject = subjectsList.find(
            (subject) => subject.subName === event.target.value
        );
        setSubjectName(selectedSubject.subName);
        setChosenSubName(selectedSubject._id);
    };

    const fields = { subName: chosenSubName, status, date };

    const submitHandler = (event) => {
        event.preventDefault();
        setLoader(true);
        dispatch(updateStudentFields(studentID, fields, "StudentAttendance"));
    };

    // Handle responses
    useEffect(() => {
        if (response) {
            setLoader(false);
            setShowPopup(true);
            setMessage(response);
        } else if (error) {
            setLoader(false);
            setShowPopup(true);
            setMessage("Error");
        } else if (statestatus === "added") {
            setLoader(false);
            setShowPopup(true);
            setMessage("Done Successfully");
        }
    }, [response, statestatus, error]);

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <Box
                        sx={{
                            flex: '1 1 auto',
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                    >
                        <Box
                            sx={{
                                maxWidth: 650,
                                px: 3,
                                py: '50px',
                                width: '100%'
                            }}
                        >
                            {/* Student Info */}
                            <Stack spacing={1} sx={{ mb: 3 }}>
                                <Typography variant="h4">
                                    Student Name: {userDetails.name}
                                </Typography>
                                {currentUser.teachSubject && (
                                    <Typography variant="h5">
                                        Subject Name: {currentUser.teachSubject?.subName}
                                    </Typography>
                                )}
                            </Stack>

                            {/* Attendance Form */}
                            <form onSubmit={submitHandler}>
                                <Stack spacing={3}>
                                    {situation === "Student" && (
                                        <FormControl fullWidth>
                                            <InputLabel>Select Subject</InputLabel>
                                            <Select
                                                value={subjectName}
                                                onChange={changeHandler}
                                                required
                                            >
                                                {subjectsList && subjectsList.length > 0 ? (
                                                    subjectsList.map((subject, index) => (
                                                        <MenuItem key={index} value={subject.subName}>
                                                            {subject.subName}
                                                        </MenuItem>
                                                    ))
                                                ) : (
                                                    <MenuItem value="">
                                                        Add Subjects For Attendance
                                                    </MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    )}

                                    <FormControl fullWidth>
                                        <InputLabel>Attendance Status</InputLabel>
                                        <Select
                                            value={status}
                                            onChange={(event) => setStatus(event.target.value)}
                                            required
                                        >
                                            <MenuItem value="Present">Present</MenuItem>
                                            <MenuItem value="Absent">Absent</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <FormControl>
                                        <TextField
                                            label="Select Date"
                                            type="date"
                                            value={date}
                                            onChange={(event) => setDate(event.target.value)}
                                            required
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </FormControl>
                                </Stack>

                                <PurpleButton
                                    fullWidth
                                    size="large"
                                    sx={{ mt: 3 }}
                                    variant="contained"
                                    type="submit"
                                    disabled={loader}
                                >
                                    {loader ? <CircularProgress size={24} color="inherit" /> : "Submit"}
                                </PurpleButton>
                            </form>

                            {/* Attendance Records */}
                            <Box sx={{ mt: 5 }}>
  <Typography variant="h6" gutterBottom>
    Attendance Records:
  </Typography>

  {attendance && attendance.length > 0 ? (
    attendance
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // show latest first
      .map((att) => (
        <Typography key={att._id}>
          <strong>{att.sclassName}</strong> – {att.status} (
          {new Date(att.date).toLocaleDateString()})
          {att.markedBy && ` | Marked by: ${att.markedBy}`}
        </Typography>
      ))
  ) : (
    <Typography>No attendance records found.</Typography>
  )}
</Box>

                        </Box>
                    </Box>

                    <Popup
                        message={message}
                        setShowPopup={setShowPopup}
                        showPopup={showPopup}
                    />
                </>
            )}
        </>
    );
};

export default StudentAttendance;
