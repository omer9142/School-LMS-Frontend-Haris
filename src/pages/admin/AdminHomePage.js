import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Grid, Paper, Table, TableBody, TableContainer, TableHead } from '@mui/material';
import Students from "../../assets/img1.png";
import Classes from "../../assets/img2.png";
import Teachers from "../../assets/img3.png";
import styled from 'styled-components';
import CountUp from 'react-countup';
import { getAllSclasses } from '../../redux/sclassRelated/sclassHandle';
import { getAllStudents } from '../../redux/studentRelated/studentHandle';
import { getAllTeachers } from '../../redux/teacherRelated/teacherHandle';
import { getAllNotices } from '../../redux/noticeRelated/noticeHandle';
import { StyledTableCell, StyledTableRow } from '../../components/styles';
import { GreenButton } from '../../components/buttonStyles';
import Box from '@mui/material/Box';

const AdminHomePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { studentsList } = useSelector((state) => state.student);
    const { sclassesList } = useSelector((state) => state.sclass);
    const { teachersList } = useSelector((state) => state.teacher);
    const { currentUser } = useSelector(state => state.user);
    const { noticesList, loading, error, response } = useSelector((state) => state.notice);

    const adminID = currentUser._id;

    useEffect(() => {
        dispatch(getAllStudents(adminID));
        dispatch(getAllSclasses(adminID, "Sclass"));
        dispatch(getAllTeachers(adminID));
        dispatch(getAllNotices(adminID, "Notice"));
    }, [adminID, dispatch]);

    if (error) {
        console.log(error);
    }

    const numberOfStudents = studentsList && studentsList.length;
    const numberOfClasses = sclassesList && sclassesList.length;
    const numberOfTeachers = teachersList && teachersList.length;

    const noticeColumns = [
        { id: 'title', label: 'Title', minWidth: 80 },
        { id: 'details', label: 'Details', minWidth: 120 },
        { id: 'date', label: 'Date', minWidth: 80 },
    ];

    const noticeRows = noticesList && noticesList.length > 0 && noticesList.map((notice) => {
        const date = new Date(notice.date);
        const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
        return {
            title: notice.title,
            details: notice.details,
            date: dateString,
            id: notice._id,
        };
    });

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Students} alt="Students" />
                            <Title>
                                Total Students
                            </Title>
                            <Data start={0} end={numberOfStudents} duration={0.2} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Classes} alt="Classes" />
                            <Title>
                                Total Classes
                            </Title>
                            <Data start={0} end={numberOfClasses} duration={0.2} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={3} lg={3}>
                        <StyledPaper>
                            <img src={Teachers} alt="Teachers" />
                            <Title>
                                Total Teachers
                            </Title>
                            <Data start={0} end={numberOfTeachers} duration={0.2} />
                        </StyledPaper>
                    </Grid>
                 
                    <Grid item xs={12} md={12} lg={12}>
                        {loading ? (
                            <div>Loading...</div>
                        ) : (
                            <>
                                {response ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                        <GreenButton 
                                            variant="contained"
                                            onClick={() => navigate("/Admin/addnotice")}
                                        >
                                            Add Notice
                                        </GreenButton>
                                    </Box>
                                ) : (
                                    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                                        {Array.isArray(noticesList) && noticesList.length > 0 && (
                                            <TableContainer sx={{ maxHeight: 440, overflowX: 'auto' }}>
                                                <Table stickyHeader aria-label="sticky table" sx={{ minWidth: { xs: 'auto', sm: 650 } }}>
                                                    <TableHead>
                                                        <StyledTableRow>
                                                            {noticeColumns.map((column) => (
                                                                <StyledTableCell
                                                                    key={column.id}
                                                                    align={column.align}
                                                                    sx={{ 
                                                                        minWidth: { xs: column.id === 'details' ? 120 : 80, sm: column.minWidth },
                                                                        maxWidth: { xs: column.id === 'details' ? 150 : 90, sm: 'none' },
                                                                        padding: { xs: '8px 4px', sm: '16px' },
                                                                    }}
                                                                >
                                                                    {column.label}
                                                                </StyledTableCell>
                                                            ))}
                                                        </StyledTableRow>
                                                    </TableHead>

                                                    <TableBody>
                                                        {noticeRows.map((row) => (
                                                            <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                                {noticeColumns.map((column) => {
                                                                    const value = row[column.id];
                                                                    return (
                                                                        <StyledTableCell 
                                                                            key={column.id} 
                                                                            align={column.align}
                                                                            sx={{
                                                                                whiteSpace: 'normal',
                                                                                wordWrap: 'break-word',
                                                                                overflow: 'hidden',
                                                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                                                padding: { xs: '8px 4px', sm: '16px' },
                                                                                minWidth: { xs: column.id === 'details' ? 120 : 80, sm: column.minWidth },
                                                                                maxWidth: { xs: column.id === 'details' ? 150 : 90, sm: 'none' },
                                                                            }}
                                                                        >
                                                                            {column.format && typeof value === 'number'
                                                                                ? column.format(value)
                                                                                : value}
                                                                        </StyledTableCell>
                                                                    );
                                                                })}
                                                            </StyledTableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        )}
                                     
                                    </Paper>
                                )}
                            </>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

const StyledPaper = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  font-size: 1rem;
`;

const Data = styled(CountUp)`
  font-size: calc(1.3rem + .6vw);
  color: green;
`;

export default AdminHomePage;