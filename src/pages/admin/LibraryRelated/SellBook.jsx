import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Stack, TextField, FormControl, InputLabel, Select,
    MenuItem, Paper, Divider, Grid, Card, CardContent, CircularProgress,
    InputAdornment
} from '@mui/material';
import { PurpleButton, GreenButton } from '../../../components/buttonStyles';
import Popup from '../../../components/Popup';
import { getAllBooks, sellBook } from '../../../redux/libraryRelated/libraryHandle';
import { getAllStudents } from '../../../redux/studentRelated/studentHandle';
import { underControl } from '../../../redux/libraryRelated/librarySlice';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SellBook = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { booksList, loading, statestatus, error } = useSelector((state) => state.library);
    const { studentsList } = useSelector((state) => state.student);
    const { currentUser } = useSelector((state) => state.user);

    const [selectedBookId, setSelectedBookId] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [loader, setLoader] = useState(false);

    // Fetch books and students on mount
    useEffect(() => {
        dispatch(getAllBooks(currentUser._id));
        dispatch(getAllStudents());
    }, [dispatch, currentUser._id]);

    // Handle sale success/error
    useEffect(() => {
        if (statestatus === 'sold') {
            setLoader(false);
            setMessage("Book sold successfully!");
            setShowPopup(true);
            // Navigate back after popup
            setTimeout(() => {
                dispatch(underControl());
                navigate('/Admin/library/books');
            }, 2000);
        } else if (error) {
            setLoader(false);
            setMessage(typeof error === 'string' ? error : 'An error occurred');
            setShowPopup(true);
            dispatch(underControl());
        }
    }, [statestatus, error, dispatch, navigate]);

    // Get only active books with stock
    const availableBooks = Array.isArray(booksList)
        ? booksList.filter(book => book.status === 'active' && book.quantityAvailable > 0)
        : [];

    // Get selected book details
    const selectedBook = availableBooks.find(book => book._id === selectedBookId);

    // Calculate totals (display only, backend calculates profit)
    const sellingPrice = selectedBook?.sellingPrice || 0;
    const totalAmount = sellingPrice * (parseInt(quantity) || 0);

    // Validation
    const isQuantityValid = quantity && parseInt(quantity) > 0 && parseInt(quantity) <= (selectedBook?.quantityAvailable || 0);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isQuantityValid) {
            setMessage("Invalid quantity. Please check available stock.");
            setShowPopup(true);
            return;
        }

        setLoader(true);

        const saleData = {
            bookId: selectedBookId,
            studentId: selectedStudentId,
            quantity: parseInt(quantity),
            school: currentUser._id,
            soldBy: currentUser._id
        };

        dispatch(sellBook(saleData));
    };

    const handleBookChange = (e) => {
        setSelectedBookId(e.target.value);
        setQuantity(""); // Reset quantity when book changes
    };

    return (
        <>
            <Box
                sx={{
                    flex: '1 1 auto',
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    py: 4
                }}
            >
                <Box
                    sx={{
                        maxWidth: 800,
                        px: 3,
                        width: '100%'
                    }}
                >
                    {/* Header */}
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PointOfSaleIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                Sell Book
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Select a book and student to complete the sale transaction
                        </Typography>
                    </Paper>

                    {/* Sale Form */}
                    <Paper elevation={3} sx={{ p: 4 }}>
                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3}>
                                {/* Select Book */}
                                <FormControl fullWidth required>
                                    <InputLabel>Select Book</InputLabel>
                                    <Select
                                        value={selectedBookId}
                                        onChange={handleBookChange}
                                        label="Select Book"
                                    >
                                        {availableBooks.length > 0 ? (
                                            availableBooks.map((book) => (
                                                <MenuItem key={book._id} value={book._id}>
                                                    {book.title} - {book.author || 'Unknown Author'} 
                                                    {' '}(Stock: {book.quantityAvailable})
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="" disabled>
                                                No books available for sale
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>

                                {/* Select Student */}
                                <FormControl fullWidth required>
                                    <InputLabel>Select Student</InputLabel>
                                    <Select
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        label="Select Student"
                                    >
                                        {Array.isArray(studentsList) && studentsList.length > 0 ? (
                                            studentsList.map((student) => (
                                                <MenuItem key={student._id} value={student._id}>
                                                    {student.name} - Roll: {student.rollNum}
                                                    {student.sclassName?.sclassName && ` (${student.sclassName.sclassName})`}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem value="" disabled>
                                                No students found
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>

                                {/* Quantity */}
                                <TextField
                                    label="Quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    required
                                    fullWidth
                                    inputProps={{
                                        min: 1,
                                        max: selectedBook?.quantityAvailable || 1
                                    }}
                                    helperText={
                                        selectedBook
                                            ? `Available stock: ${selectedBook.quantityAvailable}`
                                            : 'Select a book first'
                                    }
                                    error={quantity && !isQuantityValid}
                                />

                                <Divider />

                                {/* Sale Summary */}
                                {selectedBook && quantity && isQuantityValid && (
                                    <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                                Sale Summary
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Book Title:
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {selectedBook.title}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Author:
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        {selectedBook.author || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Unit Price:
                                                    </Typography>
                                                    <Typography variant="h6" color="primary">
                                                        Rs. {sellingPrice.toFixed(2)}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Quantity:
                                                    </Typography>
                                                    <Typography variant="h6" color="primary">
                                                        {quantity}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Divider sx={{ my: 1 }} />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Total Amount:
                                                    </Typography>
                                                    <Typography variant="h5" color="success.main" sx={{ fontWeight: 700 }}>
                                                        Rs. {totalAmount.toFixed(2)}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Action Buttons */}
                                <Stack direction="row" spacing={2}>
                                    <PurpleButton
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<ArrowBackIcon />}
                                        onClick={() => navigate('/Admin/library/books')}
                                    >
                                        Back to Inventory
                                    </PurpleButton>
                                    <GreenButton
                                        fullWidth
                                        size="large"
                                        variant="contained"
                                        type="submit"
                                        disabled={loader || !selectedBookId || !selectedStudentId || !isQuantityValid}
                                    >
                                        {loader ? <CircularProgress size={24} color="inherit" /> : "Complete Sale"}
                                    </GreenButton>
                                </Stack>
                            </Stack>
                        </form>
                    </Paper>
                </Box>
            </Box>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default SellBook;