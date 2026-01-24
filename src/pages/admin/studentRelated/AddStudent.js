import styles from './AddStudent.module.css';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../../redux/userRelated/userHandle';
import Popup from '../../../components/Popup';
import { underControl } from '../../../redux/userRelated/userSlice';
import { getAllSclasses } from '../../../redux/sclassRelated/sclassHandle';
import { CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Add these imports

const AddStudent = ({ situation }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const params = useParams()

    const userState = useSelector(state => state.user);
    const { status, currentUser, response, error } = userState;
    const { sclassesList } = useSelector((state) => state.sclass);

    // Basic Information
    const [name, setName] = useState('');
    const [fatherName, setFatherName] = useState('');
    const [rollNum, setRollNum] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Add this state
    
    // Contact Information
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [address, setAddress] = useState('');
    
    // Class Information
    const [className, setClassName] = useState('')
    const [sclassName, setSclassName] = useState('')

    const adminID = currentUser._id
    const role = "Student"
    const attendance = []
    const examResult = []

    useEffect(() => {
        if (situation === "Class") {
            setSclassName(params.id);
        }
    }, [params.id, situation]);

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false)

    useEffect(() => {
        dispatch(getAllSclasses(adminID, "Sclass"));
    }, [adminID, dispatch]);

    // Toggle password visibility
    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const changeHandler = (event) => {
        if (event.target.value === 'Select Class') {
            setClassName('Select Class');
            setSclassName('');
        } else {
            const selectedClass = sclassesList.find(
                (classItem) => classItem.sclassName === event.target.value
            );
            setClassName(selectedClass.sclassName);
            setSclassName(selectedClass._id);
        }
    }

    const submitHandler = (event) => {
        event.preventDefault()
        
        // Validation
        if (sclassName === "") {
            setMessage("Please select a classname")
            setShowPopup(true)
            return;
        }

        // Password validation - CRITICAL CHECK
        if (!password || password.trim() === "") {
            setMessage("Password is required")
            setShowPopup(true)
            return;
        }

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters long")
            setShowPopup(true)
            return;
        }
        
        // Email validation
        const emailRegex = /.+\@.+\..+/;
        if (!emailRegex.test(email)) {
            setMessage("Please enter a valid email address")
            setShowPopup(true)
            return;
        }

        // Phone number validation (basic)
        if (phoneNumber.length < 10) {
            setMessage("Please enter a valid phone number")
            setShowPopup(true)
            return;
        }

        // Age validation (assuming minimum age of 3 for students)
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 3 || age > 25) {
            setMessage("Please enter a valid date of birth")
            setShowPopup(true)
            return;
        }

        setLoader(true)

        // Create regular object (no FormData needed without file upload)
        const fields = { 
            name: name.trim(),
            fatherName: fatherName.trim(),
            rollNum: rollNum,
            dob: dob,
            phoneNumber: phoneNumber.trim(),
            emergencyContact: emergencyContact.trim(),
            address: address.trim(),
            email: email.trim(),
            password: password,
            sclassName: sclassName,
            adminID: adminID,
            role: role,
            attendance: attendance,
            examResult: examResult
        };

        // Log for debugging
        console.log('Submitting student data:', { ...fields, password: '***HIDDEN***' });

        dispatch(registerUser(fields, role))
    }

    useEffect(() => {
        if (status === 'added') {
            dispatch(underControl())
            navigate(-1)
        }
        else if (status === 'failed') {
            setMessage(response)
            setShowPopup(true)
            setLoader(false)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
            setLoader(false)
        }
    }, [status, navigate, error, response, dispatch]);

    return (
        <>
            <div className={styles.register}>
                <form className={styles.registerForm} onSubmit={submitHandler}>
                    <span className={styles.registerTitle}>Add Student</span>
                    
                    {/* Basic Information Section */}
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionHeading}>Basic Information</h3>
                        
                        <label>Student Name *</label>
                        <input className={styles.registerInput} type="text" placeholder="Enter student's name..."
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            autoComplete="name" required />

                        {/* Class Selection */}
                        {
                            situation === "Student" &&
                            <>
                                <label>Class *</label>
                                <select
                                    className={styles.registerInput}
                                    value={className}
                                    onChange={changeHandler} required>
                                    <option value='Select Class'>Select Class</option>
                                    {sclassesList.map((classItem, index) => (
                                        <option key={index} value={classItem.sclassName}>
                                            {classItem.sclassName}
                                        </option>
                                    ))}
                                </select>
                            </>
                        }

                        <label>Roll Number *</label>
                        <input className={styles.registerInput} type="number" placeholder="Enter student's Roll Number..."
                            value={rollNum}
                            onChange={(event) => setRollNum(event.target.value)}
                            required />

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

                    {/* Personal Information Section */}
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionHeading}>Personal Information</h3>
                        
                        <label>Guardian's Name *</label>
                        <input className={styles.registerInput} type="text" placeholder="Enter Guardian's name..."
                            value={fatherName}
                            onChange={(event) => setFatherName(event.target.value)}
                            required />

                        <label>Date of Birth *</label>
                        <input className={styles.registerInput} type="date"
                            value={dob}
                            onChange={(event) => setDob(event.target.value)}
                            required />

                        <label>Email *</label>
                        <input className={styles.registerInput} type="email" placeholder="Enter student's email..."
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email" required />

                        <label>Phone Number *</label>
                        <input className={styles.registerInput} type="tel" placeholder="Enter phone number..."
                            value={phoneNumber}
                            onChange={(event) => setPhoneNumber(event.target.value)}
                            required />

                        <label>Emergency Contact *</label>
                        <input className={styles.registerInput} type="tel" placeholder="Enter emergency contact..."
                            value={emergencyContact}
                            onChange={(event) => setEmergencyContact(event.target.value)}
                            required />

                        <label>Address *</label>
                        <textarea className={styles.registerInput} placeholder="Enter complete address..."
                            value={address}
                            onChange={(event) => setAddress(event.target.value)}
                            rows="3"
                            required />
                    </div>

                    <button className={styles.registerButton} type="submit" disabled={loader}>
                        {loader ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Add Student'
                        )}
                    </button>
                </form>
            </div>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    )
}

export default AddStudent