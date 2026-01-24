import styles from './AddTeacher.module.css';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getSubjectDetails, getClassDetails } from '../../../redux/sclassRelated/sclassHandle';
import { CircularProgress, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const AddTeacher = () => {
  const params = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subjectID = params.id;
  const search = new URLSearchParams(location.search);
  const classIdFromQS = search.get('classId');
  const classIdFromState = location.state?.classId;

  const { status, response, error, currentUser } = useSelector((state) => state.user);
  const { subjectDetails, classDetails } = useSelector((state) => state.sclass);

  // Load subject & class details
  useEffect(() => {
    if (subjectID) {
      dispatch(getSubjectDetails(subjectID, 'Subject'));
    }
  }, [dispatch, subjectID]);

  useEffect(() => {
    const classId = classIdFromQS || classIdFromState;
    if (classId) {
      dispatch(getClassDetails(classId));
    }
  }, [dispatch, classIdFromQS, classIdFromState]);

  // ===== Form State =====
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [address, setAddress] = useState('');

  const [showPassword, setShowPassword] = useState(false); // 👈 NEW
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(false);

  const role = 'Teacher';
  const adminID = currentUser?._id;

  const subjectClassId =
    subjectDetails?.sclass?._id || subjectDetails?.sclassName?._id || null;
  const teachSclass = subjectID
    ? subjectClassId
    : classIdFromQS || classIdFromState || undefined;
  const teachSubject = subjectID ? subjectDetails?._id : undefined;

  // ===== Submit =====
  const submitHandler = (event) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage('Name, Email, and Password are required');
      setShowPopup(true);
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setShowPopup(true);
      return;
    }
    const emailRegex = /.+\@.+\..+/;
    if (!emailRegex.test(email)) {
      setMessage('Enter a valid email address');
      setShowPopup(true);
      return;
    }
    if (phoneNumber && phoneNumber.length < 10) {
      setMessage('Enter a valid phone number');
      setShowPopup(true);
      return;
    }

    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18 || age > 80) {
        setMessage('Enter a valid date of birth (18–80 yrs)');
        setShowPopup(true);
        return;
      }
    }

    setLoader(true);

    const fields = {
      name: name.trim(),
      fatherName: fatherName.trim(),
      dob,
      phoneNumber: phoneNumber.trim(),
      emergencyContact: emergencyContact.trim(),
      address: address.trim(),
      email: email.trim(),
      password,
      role,
      adminID,
      ...(teachSubject ? { teachSubject } : {}),
      ...(teachSclass ? { teachSclass } : {}),
    };

    console.log('Submitting teacher data:', { ...fields, password: '***' });

    dispatch(registerUser(fields, role));
  };

  // ===== Status Watcher =====
  useEffect(() => {
    if (status === 'added') {
      dispatch(underControl());
      navigate('/Admin/teachers', {
        state: {
          refreshNeeded: true,
          successMessage: 'Teacher created successfully!',
        },
      });
    } else if (status === 'failed') {
      setMessage(response);
      setShowPopup(true);
      setLoader(false);
    } else if (status === 'error') {
      setMessage('Network Error');
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, response, error, dispatch, navigate]);


const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };
  return (
    <>
      <div className={styles.register}>
        <form className={styles.registerForm} onSubmit={submitHandler}>
          <span className={styles.registerTitle}>Add Teacher</span>

          {subjectID && (
            <>
              <p>Subject: {subjectDetails?.subName || '...'}</p>
              <p>
                Class:{' '}
                {subjectDetails?.sclass?.sclassName ||
                  subjectDetails?.sclassName?.sclassName}
              </p>
            </>
          )}

          {/* Basic Info */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionHeading}>Basic Information</h3>

            <label>Name *</label>
            <input
              className={`${styles.registerInput} ${styles.capitalizeInput}`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Father's Name</label>
            <input
              className={`${styles.registerInput} ${styles.capitalizeInput}`}
              type="text"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
            />

            <label>Date of Birth</label>
            <input
              className={styles.registerInput}
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />

            {/* Password with toggle 👇 */}
            <label>Password *</label>
           <div className={styles.passwordContainer}>
                            <input 
                                className={styles.registerInput} 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter student's password..."
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="new-password" 
                                required 
                            />
                            <span 
                                className={styles.passwordToggle}
                                onClick={handleTogglePassword}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleTogglePassword();
                                    }
                                }}
                            >
                                {showPassword ? <Visibility /> : <VisibilityOff /> }
                            </span>
                        </div>

          </div>

          {/* Contact Info */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionHeading}>Contact Information</h3>

            <label>Email *</label>
            <input
              className={styles.registerInput}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Phone Number</label>
            <input
              className={styles.registerInput}
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <label>Emergency Contact</label>
            <input
              className={styles.registerInput}
              type="tel"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
            />

            <label>Address</label>
            <textarea
              className={`${styles.registerInput} ${styles.capitalizeInput}`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows="3"
            />
          </div>

          <button
            className={styles.registerButton}
            type="submit"
            disabled={loader}
          >
            {loader ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Register Teacher'
            )}
          </button>
        </form>
      </div>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </>
  );
};

export default AddTeacher;
