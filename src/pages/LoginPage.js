import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Box,
  Typography,
  Paper,
  TextField,
  CssBaseline,
  IconButton,
  InputAdornment,
  CircularProgress,
  Container,
  useMediaQuery,
  useTheme,
  Avatar,
  Card,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  School as SchoolIcon,
  AdminPanelSettings as AdminIcon,
  AttachMoney as FinanceIcon,
} from '@mui/icons-material';
import bgpic from '../assets/designlogin.jpg';
import { LightPurpleButton } from '../components/buttonStyles';
import styled from 'styled-components';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';

const defaultTheme = createTheme();

const LoginPage = ({ role = 'User' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { status, currentUser, response, error, currentRole } = useSelector(
    (state) => state.user
  );

  const [toggle, setToggle] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');

  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [rollNumberError, setRollNumberError] = useState(false);
  const [studentNameError, setStudentNameError] = useState(false);

  // ------------------------ HANDLERS ------------------------
  const handleSubmit = (event) => {
    event.preventDefault();

    if (role === 'Student') {
      const rollNum = event.target.rollNumber.value.trim();
      const studentName = event.target.studentName.value.trim();
      const password = event.target.password.value.trim();

      if (!rollNum || !studentName || !password) {
        if (!rollNum) setRollNumberError(true);
        if (!studentName) setStudentNameError(true);
        if (!password) setPasswordError(true);
        return;
      }

      setLoader(true);
      dispatch(loginUser({ rollNum, studentName, password }));
    } else {
      const email = event.target.email.value.trim();
      const password = event.target.password.value.trim();

      if (!email || !password) {
        if (!email) setEmailError(true);
        if (!password) setPasswordError(true);
        return;
      }

      setLoader(true);
      dispatch(loginUser({ email, password }));
    }
  };

  const handleInputChange = (event) => {
    const { name } = event.target;
    if (name === 'email') setEmailError(false);
    if (name === 'password') setPasswordError(false);
    if (name === 'rollNumber') setRollNumberError(false);
    if (name === 'studentName') setStudentNameError(false);
  };

  // ------------------------ EFFECTS ------------------------
  useEffect(() => {
    if (status === 'success' && currentRole) {
      switch ((currentRole || '').trim()) {
        case 'Admin':
          navigate('/Admin/dashboard', { replace: true });
          break;
        case 'Student':
          navigate('/Student/dashboard', { replace: true });
          break;
        case 'Teacher':
          navigate('/Teacher/dashboard', { replace: true });
          break;
        case 'Finance':
          navigate('/Finance/dashboard', { replace: true });
          break;
        default:
          console.warn('Unknown role:', currentRole);
      }
    } else if (status === 'failed') {
      setMessage(response || 'Login failed');
      setShowPopup(true);
      setLoader(false);
    } else if (status === 'error') {
      setMessage(error || 'Network Error');
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, currentRole, currentUser, navigate, response, error]);

  // ------------------------ UI HELPERS ------------------------
  const getRoleIcon = () => {
    switch (role) {
      case 'Admin':
        return <AdminIcon />;
      case 'Teacher':
        return <PersonIcon />;
      case 'Student':
        return <SchoolIcon />;
      case 'Finance':
        return <FinanceIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'Admin':
        return '#d32f2f';
      case 'Teacher':
        return '#1976d2';
      case 'Student':
        return '#388e3c';
      case 'Finance':
        return '#009688'; // Teal for finance
      default:
        return '#7f56da';
    }
  };

  // ------------------------ RENDER ------------------------
  return (
    <ThemeProvider theme={defaultTheme}>
      <Container
        maxWidth={false}
        sx={{
          height: '100vh',
          p: 0,
          background: isMobile
            ? `linear-gradient(135deg, ${getRoleColor()}20 0%, #ffffff 100%)`
            : 'none',
        }}
        disableGutters
      >
        <Grid container sx={{ height: '100vh' }}>
          <CssBaseline />

          {/* Login Form */}
          <Grid
            item
            xs={12}
            md={5}
            component={isMobile ? Card : Paper}
            elevation={isMobile ? 3 : 6}
            square={!isMobile}
            sx={{
              height: isMobile ? 'auto' : '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: isMobile ? 4 : 0,
              m: isMobile ? 2 : 0,
              mt: isMobile ? 4 : 0,
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 400, p: isMobile ? 3 : 4 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  sx={{ bgcolor: getRoleColor(), width: 60, height: 60, mb: 2, mx: 'auto' }}
                >
                  {getRoleIcon()}
                </Avatar>
                <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ mb: 1, fontWeight: 'bold' }}>
                  {role} Login
                </Typography>
                <Typography variant={isMobile ? 'body2' : 'body1'} color="text.secondary">
                  Welcome back! Please enter your details
                </Typography>
              </Box>

              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                {role === 'Student' ? (
                  <>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="rollNumber"
                      label="Roll Number"
                      name="rollNumber"
                      autoComplete="off"
                      type="number"
                      autoFocus={!isMobile}
                      error={rollNumberError}
                      helperText={rollNumberError && 'Roll Number is required'}
                      onChange={handleInputChange}
                      size={isSmallMobile ? 'small' : 'medium'}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="studentName"
                      label="Student Name"
                      name="studentName"
                      autoComplete="name"
                      error={studentNameError}
                      helperText={studentNameError && 'Name is required'}
                      onChange={handleInputChange}
                      size={isSmallMobile ? 'small' : 'medium'}
                      sx={{ mb: 2 }}
                    />
                  </>
                ) : (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus={!isMobile}
                    error={emailError}
                    helperText={emailError && 'Email is required'}
                    onChange={handleInputChange}
                    size={isSmallMobile ? 'small' : 'medium'}
                    sx={{ mb: 2 }}
                  />
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={toggle ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  error={passwordError}
                  helperText={passwordError && 'Password is required'}
                  onChange={handleInputChange}
                  size={isSmallMobile ? 'small' : 'medium'}
                  sx={{ mb: 3 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setToggle(!toggle)}
                          edge="end"
                          size={isSmallMobile ? 'small' : 'medium'}
                        >
                          {toggle ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <LightPurpleButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 1, mb: 2, py: isSmallMobile ? 1 : 1.5, fontSize: isSmallMobile ? '0.875rem' : '1rem' }}
                  disabled={loader}
                >
                  {loader ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </LightPurpleButton>

                {role === 'Admin' && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Don't have an account? <StyledLink to="/Adminregister">Sign up</StyledLink>
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Background Image */}
          {!isMobile && (
            <Grid
              item
              xs={false}
              md={7}
              sx={{
                backgroundImage: `url(${bgpic})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}
            />
          )}
        </Grid>

        <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
      </Container>
    </ThemeProvider>
  );
};

export default LoginPage;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #7f56da;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
  }
`;
