import { useEffect, useState } from 'react';
import { Box, CircularProgress, Stack, TextField, Typography, Paper, Container, useMediaQuery, useTheme } from '@mui/material';
import Popup from '../../components/Popup';
import { BlackButton } from '../../components/buttonStyles';
import { addStuff } from '../../redux/userRelated/userHandle';
import { useDispatch, useSelector } from 'react-redux';
import ScrollToTop from '../../components/ScrollToTop';

const StudentComplain = () => {
    const [complaint, setComplaint] = useState("");
    const [date, setDate] = useState("");

    const dispatch = useDispatch()
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { status, currentUser, error } = useSelector(state => state.user);

    const user = currentUser._id
    const school = currentUser.school._id
    const address = "Complain"

    const [loader, setLoader] = useState(false)
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const fields = {
        user,
        date,
        complaint,
        school,
    };

    const submitHandler = (event) => {
        event.preventDefault()
        setLoader(true)
        dispatch(addStuff(fields, address))
    };

    useEffect(() => {
        if (status === "added") {
            setLoader(false)
            setShowPopup(true)
            setMessage("Done Successfully")
        }
        else if (error) {
            setLoader(false)
            setShowPopup(true)
            setMessage("Network Error")
        }
    }, [status, error])

    return (
        <>
            <ScrollToTop />
            <Container 
                maxWidth={false} 
                sx={{ 
                    width: '85%', 
                    marginLeft: 'auto', 
                    marginRight: 'auto',
                    mt: 2,
                    mb: 4,
                    '@media (max-width: 600px)': {
                        width: '95%',
                        padding: 0,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }
                }}
            >
                <Box
                    sx={{
                        flex: '1 1 auto',
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        backgroundColor: '#ffffff',
                        minHeight: '60vh',
                        padding: 2,
                        '@media (max-width: 600px)': {
                            padding: 1,
                            minHeight: '70vh',
                        }
                    }}
                >
                    <Paper
                        elevation={3}
                        sx={{
                            maxWidth: 550,
                            px: { xs: 3, sm: 4 },
                            py: { xs: 3, sm: 4 },
                            width: '100%',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            '@media (max-width: 600px)': {
                                maxWidth: '100%',
                                width: '100%',
                                px: 3,
                                py: 3,
                                margin: 0,
                                borderRadius: { xs: 0, sm: 2 },
                                boxShadow: { xs: 'none', sm: '0 2px 8px rgba(0, 0, 0, 0.1)' },
                                border: { xs: 'none', sm: 'inherit' }
                            }
                        }}
                    >
                        <Stack spacing={1} sx={{ mb: 3 }}>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    fontWeight: 'bold', 
                                    textAlign: 'center',
                                    fontSize: { xs: '1.75rem', sm: '2.125rem' }
                                }}
                            >
                                Submit Complaint
                            </Typography>
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    color: '#666', 
                                    textAlign: 'center',
                                    fontSize: { xs: '0.95rem', sm: '1rem' }
                                }}
                            >
                                Please fill out the form below to submit your complaint
                            </Typography>
                        </Stack>
                        <form onSubmit={submitHandler}>
                            <Stack spacing={3}>
                                <TextField
                                    fullWidth
                                    label="Select Date"
                                    type="date"
                                    value={date}
                                    onChange={(event) => setDate(event.target.value)} 
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Write your complaint"
                                    variant="outlined"
                                    value={complaint}
                                    onChange={(event) => {
                                        setComplaint(event.target.value);
                                    }}
                                    required
                                    multiline
                                    rows={isMobile ? 6 : 4}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        },
                                        '@media (max-width: 600px)': {
                                            '& .MuiInputBase-root': {
                                                fontSize: '1rem',
                                            }
                                        }
                                    }}
                                />
                            </Stack>
                            <BlackButton
                                fullWidth
                                size="large"
                                sx={{ 
                                    mt: 3,
                                    borderRadius: 2,
                                    padding: '12px 0',
                                    fontWeight: 'bold',
                                    fontSize: { xs: '1rem', sm: 'inherit' }
                                }}
                                variant="contained"
                                type="submit"
                                disabled={loader}
                            >
                                {loader ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Submit Complaint"}
                            </BlackButton>
                        </form>
                    </Paper>
                </Box>
            </Container>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default StudentComplain;