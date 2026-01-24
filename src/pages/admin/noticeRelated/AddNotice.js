import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress } from '@mui/material';
import Popup from '../../../components/Popup';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const AddNotice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const [targetAudience, setTargetAudience] = useState('Both');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  
  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage("Only PDF files are allowed");
        setShowPopup(true);
        event.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setMessage("File size must be less than 10MB");
        setShowPopup(true);
        event.target.value = '';
        return;
      }
      setPdfFile(file);
      setPdfFileName(file.name);
    }
  };

  const removeFile = () => {
    setPdfFile(null);
    setPdfFileName('');
    document.getElementById('pdfFileInput').value = '';
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoader(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('details', details);
      formData.append('date', date);
      formData.append('adminID', currentUser._id);
      formData.append('targetAudience', targetAudience);
      
      if (pdfFile) {
        formData.append('pdfFile', pdfFile);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/NoticeCreate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data) {
        navigate('/Admin/notices');
        dispatch(underControl());
      }
    } catch (error) {
      console.error('Error creating notice:', error);
      setMessage(error.response?.data?.message || "Network Error");
      setShowPopup(true);
      setLoader(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <form style={styles.form} onSubmit={submitHandler}>
          <h2 style={styles.title}>Add Notice</h2>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Title</label>
            <input 
              style={styles.input} 
              type="text" 
              placeholder="Enter notice title..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Details</label>
            <textarea 
              style={{...styles.input, ...styles.textarea}} 
              placeholder="Enter notice details..."
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              required 
              rows={4}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Date</label>
            <input 
              style={styles.input} 
              type="date" 
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Target Audience</label>
            <select 
              style={styles.select} 
              value={targetAudience}
              onChange={(event) => setTargetAudience(event.target.value)}
              required
            >
              <option value="Both">Both (Teachers & Students)</option>
              <option value="Teachers">Teachers Only</option>
              <option value="Students">Students Only</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Attach PDF (Optional)</label>
            <div style={styles.fileUploadContainer}>
              <input
                id="pdfFileInput"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={styles.fileInput}
              />
              <label htmlFor="pdfFileInput" style={styles.fileLabel}>
                <CloudUploadIcon style={{ marginRight: '8px' }} />
                Choose PDF File
              </label>
              {pdfFileName && (
                <div style={styles.fileInfo}>
                  <DescriptionIcon style={{ fontSize: '18px', marginRight: '6px' }} />
                  <span style={styles.fileName}>{pdfFileName}</span>
                  <button 
                    type="button" 
                    onClick={removeFile}
                    style={styles.removeButton}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <p style={styles.hint}>Maximum file size: 10MB</p>
          </div>

          <button style={styles.button} type="submit" disabled={loader}>
            {loader ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Add Notice'
            )}
          </button>
        </form>
      </div>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f8f9fa'
  },
  formContainer: {
    width: '100%',
    maxWidth: '500px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '30px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  title: {
    textAlign: 'center',
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '24px',
    fontWeight: '500'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border 0.2s',
    fontFamily: 'inherit'
  },
  select: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border 0.2s',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    cursor: 'pointer'
  },
  textarea: {
    resize: 'vertical',
    minHeight: '80px'
  },
  fileUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  fileInput: {
    display: 'none'
  },
  fileLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 20px',
    backgroundColor: '#f5f5f5',
    border: '2px dashed #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center'
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    border: '1px solid #90caf9'
  },
  fileName: {
    flex: 1,
    fontSize: '14px',
    color: '#1976d2',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  removeButton: {
    marginLeft: '10px',
    padding: '4px 8px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    margin: '0'
  },
  button: {
    padding: '12px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: '1px solid #1565c0',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px'
  }
};

export default AddNotice;