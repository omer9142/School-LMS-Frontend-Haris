import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Paper, Box, IconButton, TextField, Typography, Table, TableBody, 
    TableContainer, TableHead, Chip, Dialog, DialogTitle, DialogContent,
    DialogActions, Stack, FormControl, InputLabel, OutlinedInput,
    InputAdornment, Grid, Card, CardContent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EditIcon from '@mui/icons-material/Edit';
import { GreenButton, PurpleButton } from '../../../components/buttonStyles';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';
import SpeedDialTemplate from '../../../components/SpeedDialTemplate';
import Popup from '../../../components/Popup';
import { getAllBooks, createBook, getAllBookSales, updateBook, deleteBook } from '../../../redux/libraryRelated/libraryHandle';
import { underControl } from '../../../redux/libraryRelated/librarySlice';
import BookSalesHistory from './BookSalesHistory';

const ShowLibraryBooks = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { booksList, salesList, loading, error, response, statestatus } = useSelector((state) => state.library);
    const { currentUser } = useSelector((state) => state.user);

    const [searchTerm, setSearchTerm] = useState("");
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    // Form state for adding book
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [isbn, setIsbn] = useState("");
    const [costPrice, setCostPrice] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [quantityAvailable, setQuantityAvailable] = useState("");
    const [loader, setLoader] = useState(false);

    useEffect(() => {
        dispatch(getAllBooks(currentUser._id));
        dispatch(getAllBookSales(currentUser._id));
    }, [dispatch, currentUser._id]);

    useEffect(() => {
        if (statestatus === 'added') {
            setLoader(false);
            setMessage("Book added successfully!");
            setShowPopup(true);
            handleCloseDialog();
            dispatch(getAllBooks(currentUser._id));
            dispatch(underControl());
        } else if (error) {
            setLoader(false);
            setMessage(typeof error === 'string' ? error : 'An error occurred');
            setShowPopup(true);
            dispatch(underControl());
        }
    }, [statestatus, error, dispatch, currentUser._id]);

    // Calculate statistics from sales
    const totalSales = Array.isArray(salesList) ? salesList.length : 0;
    const totalBooksSold = Array.isArray(salesList) 
        ? salesList.reduce((sum, sale) => sum + sale.quantity, 0)
        : 0;
    const totalCostPrice = Array.isArray(salesList) 
        ? salesList.reduce((sum, sale) => sum + (sale.costPriceAtSale * sale.quantity), 0)
        : 0;
    const totalSellingPrice = Array.isArray(salesList)
        ? salesList.reduce((sum, sale) => sum + (sale.sellingPriceAtSale * sale.quantity), 0)
        : 0;
    const totalProfit = Array.isArray(salesList)
        ? salesList.reduce((sum, sale) => sum + sale.profitAtSale, 0)
        : 0;

    // Filter books based on search
    const filteredBooks = Array.isArray(booksList)
        ? booksList.filter(book =>
            book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : [];

    const handleOpenDialog = () => {
        setOpenAddDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenAddDialog(false);
        // Reset form
        setTitle("");
        setAuthor("");
        setIsbn("");
        setCostPrice("");
        setSellingPrice("");
        setQuantityAvailable("");
    };

    const handleSubmitBook = (e) => {
        e.preventDefault();
        setLoader(true);

        const bookData = {
            title,
            author,
            isbn,
            costPrice: parseFloat(costPrice),
            sellingPrice: parseFloat(sellingPrice),
            quantityAvailable: parseInt(quantityAvailable),
            school: currentUser._id
        };

        if (editingBook) {
            dispatch(updateBook(editingBook._id, bookData));
        } else {
            dispatch(createBook(bookData));
        }
    };

    const handleOpenEditDialog = (book) => {
        setEditingBook(book);
        setTitle(book.title);
        setAuthor(book.author || "");
        setIsbn(book.isbn || "");
        setCostPrice(book.costPrice.toString());
        setSellingPrice(book.sellingPrice.toString());
        setQuantityAvailable(book.quantityAvailable.toString());
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditingBook(null);
        setTitle("");
        setAuthor("");
        setIsbn("");
        setCostPrice("");
        setSellingPrice("");
        setQuantityAvailable("");
    };

    const handleDeleteBook = (bookId) => {
        if (window.confirm("Are you sure you want to delete this book?")) {
            dispatch(deleteBook(bookId))
                .then(() => {
                    setMessage("Book deleted successfully!");
                    setShowPopup(true);
                })
                .catch(err => {
                    console.error("Failed to delete book:", err);
                });
        }
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    const bookColumns = [
        { id: 'title', label: 'Title', minWidth: 200 },
        { id: 'author', label: 'Author', minWidth: 150 },
        { id: 'isbn', label: 'ISBN', minWidth: 130 },
        { id: 'costPrice', label: 'Cost Price', minWidth: 120 },
        { id: 'sellingPrice', label: 'Selling Price', minWidth: 120 },
        { id: 'quantityAvailable', label: 'Stock', minWidth: 100 },
        { id: 'status', label: 'Status', minWidth: 120 },
        { id: 'actions', label: 'Actions', minWidth: 150 },
    ];

    const bookRows = filteredBooks.map((book) => ({
        title: book.title,
        author: book.author || 'N/A',
        isbn: book.isbn || 'N/A',
        costPrice: `Rs. ${book.costPrice?.toFixed(2)}`,
        sellingPrice: `Rs. ${book.sellingPrice?.toFixed(2)}`,
        quantityAvailable: book.quantityAvailable,
        status: book.status,
        id: book._id,
        bookData: book, // Store full book object for editing
    }));

    const actions = [
        {
            icon: <AddIcon color="primary" />,
            name: 'Add New Book',
            action: handleOpenDialog
        },
        {
            icon: <PointOfSaleIcon color="success" />,
            name: 'Sell Book',
            action: () => navigate('/Admin/library/sell')
        },
    ];

    const getStatusColor = (status) => {
        return status === 'active' 
            ? { bgcolor: '#e8f5e9', color: '#2e7d32' }
            : { bgcolor: '#ffebee', color: '#c62828' };
    };

    return (
        <>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <Typography>Loading...</Typography>
                </Box>
            ) : (
                <>
                    {response ? (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                            <GreenButton variant="contained" onClick={handleOpenDialog}>
                                Add Book
                            </GreenButton>
                        </Box>
                    ) : (
                        <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
                            {/* Statistics Cards */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                {/* Total Sales */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ 
                                        bgcolor: '#e3f2fd', 
                                        borderLeft: '4px solid #2196f3',
                                        height: '100%'
                                    }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <ShoppingCartIcon sx={{ color: '#2196f3', mr: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Sales
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                                                {totalSales}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Sales ({totalBooksSold} books sold)
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Total Cost */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ 
                                        bgcolor: '#f3e5f5', 
                                        borderLeft: '4px solid #a5a5a5e1',
                                        height: '100%'
                                    }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <AttachMoneyIcon sx={{ color: '#000000', mr: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Cost Price
                                                </Typography>
                                            </Box>
                                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000000' }}>
                                                Rs. {totalCostPrice.toFixed(2)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Investment
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Total Sales Price */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ 
                                        bgcolor: '#f3e5f5', 
                                        borderLeft: '4px solid #747474e1',
                                        height: '100%'
                                    }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <AttachMoneyIcon sx={{ color: '#000000', mr: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Revenue
                                                </Typography>
                                            </Box>
                                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#000000' }}>
                                                Rs. {totalSellingPrice.toFixed(2)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                From sales
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Total Profit */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ 
                                        bgcolor: '#e8f5e9', 
                                        borderLeft: '4px solid #4caf50',
                                        height: '100%'
                                    }}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <TrendingUpIcon sx={{ color: '#4caf50', mr: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Profit
                                                </Typography>
                                            </Box>
                                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                                Rs. {totalProfit.toFixed(2)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Net earnings
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <MenuBookIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                    Library Books Inventory
                                </Typography>
                            </Box>

                            {/* Search Bar */}
                            <Box sx={{ mb: 3 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search by title, author, or ISBN"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                                        endAdornment: searchTerm && (
                                            <IconButton
                                                onClick={handleClearSearch}
                                                edge="end"
                                                size="small"
                                            >
                                                <ClearIcon />
                                            </IconButton>
                                        )
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {filteredBooks.length} book(s) found
                                    {searchTerm && ` for "${searchTerm}"`}
                                </Typography>
                            </Box>

                            {/* Books Table */}
                            {filteredBooks.length > 0 ? (
                                <TableContainer>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <StyledTableRow>
                                                {bookColumns.map((column) => (
                                                    <StyledTableCell
                                                        key={column.id}
                                                        style={{ minWidth: column.minWidth }}
                                                    >
                                                        {column.label}
                                                    </StyledTableCell>
                                                ))}
                                            </StyledTableRow>
                                        </TableHead>
                                        <TableBody>
                                            {bookRows.map((row) => (
                                                <StyledTableRow hover key={row.id}>
                                                    {bookColumns.map((column) => {
                                                        if (column.id === 'actions') {
                                                            return (
                                                                <StyledTableCell key={column.id}>
                                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                                        <IconButton
                                                                            onClick={() => handleOpenEditDialog(row.bookData)}
                                                                            color="primary"
                                                                            size="small"
                                                                        >
                                                                            <EditIcon />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            onClick={() => handleDeleteBook(row.id)}
                                                                            color="error"
                                                                            size="small"
                                                                        >
                                                                            <DeleteIcon />
                                                                        </IconButton>
                                                                    </Box>
                                                                </StyledTableCell>
                                                            );
                                                        }
                                                        
                                                        const value = row[column.id];
                                                        if (column.id === 'status') {
                                                            return (
                                                                <StyledTableCell key={column.id}>
                                                                    <Chip
                                                                        label={value === 'active' ? 'Active' : 'Out of Stock'}
                                                                        size="small"
                                                                        sx={{
                                                                            ...getStatusColor(value),
                                                                            fontWeight: 500
                                                                        }}
                                                                    />
                                                                </StyledTableCell>
                                                            );
                                                        }
                                                        return (
                                                            <StyledTableCell key={column.id}>
                                                                {value}
                                                            </StyledTableCell>
                                                        );
                                                    })}
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <MenuBookIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary">
                                        {searchTerm 
                                            ? 'No books found matching your search.' 
                                            : 'No books in inventory. Add your first book!'}
                                    </Typography>
                                </Box>
                            )}

                            <SpeedDialTemplate actions={actions} />
                        </Paper>
                    )}

                    {/* Sales History Section */}
                    {!response && <BookSalesHistory />}
                </>
            )}

            {/* Add Book Dialog */}
            <Dialog 
                open={openAddDialog} 
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Add New Book
                    </Typography>
                </DialogTitle>
                <form onSubmit={handleSubmitBook}>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField
                                label="Book Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                fullWidth
                            />
                            
                            <TextField
                                label="Author"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                fullWidth
                            />

                            <TextField
                                label="ISBN"
                                value={isbn}
                                onChange={(e) => setIsbn(e.target.value)}
                                fullWidth
                            />

                            <FormControl fullWidth required>
                                <InputLabel>Cost Price</InputLabel>
                                <OutlinedInput
                                    type="number"
                                    value={costPrice}
                                    onChange={(e) => setCostPrice(e.target.value)}
                                    startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                                    label="Cost Price"
                                    inputProps={{ step: "0.01", min: "0" }}
                                />
                            </FormControl>

                            <FormControl fullWidth required>
                                <InputLabel>Selling Price</InputLabel>
                                <OutlinedInput
                                    type="number"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                                    label="Selling Price"
                                    inputProps={{ step: "0.01", min: "0" }}
                                />
                            </FormControl>

                            <TextField
                                label="Quantity Available"
                                type="number"
                                value={quantityAvailable}
                                onChange={(e) => setQuantityAvailable(e.target.value)}
                                required
                                fullWidth
                                inputProps={{ min: "0" }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <PurpleButton onClick={handleCloseDialog}>
                            Cancel
                        </PurpleButton>
                        <GreenButton 
                            type="submit" 
                            variant="contained"
                            disabled={loader}
                        >
                            {loader ? 'Adding...' : 'Add Book'}
                        </GreenButton>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Edit Book Dialog */}
            <Dialog 
                open={openEditDialog} 
                onClose={handleCloseEditDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Edit Book
                    </Typography>
                </DialogTitle>
                <form onSubmit={handleSubmitBook}>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <TextField
                                label="Book Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                fullWidth
                            />
                            
                            <TextField
                                label="Author"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                fullWidth
                            />

                            <TextField
                                label="ISBN"
                                value={isbn}
                                onChange={(e) => setIsbn(e.target.value)}
                                fullWidth
                            />

                            <FormControl fullWidth required>
                                <InputLabel>Cost Price</InputLabel>
                                <OutlinedInput
                                    type="number"
                                    value={costPrice}
                                    onChange={(e) => setCostPrice(e.target.value)}
                                    startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                                    label="Cost Price"
                                    inputProps={{ step: "0.01", min: "0" }}
                                />
                            </FormControl>

                            <FormControl fullWidth required>
                                <InputLabel>Selling Price</InputLabel>
                                <OutlinedInput
                                    type="number"
                                    value={sellingPrice}
                                    onChange={(e) => setSellingPrice(e.target.value)}
                                    startAdornment={<InputAdornment position="start">Rs.</InputAdornment>}
                                    label="Selling Price"
                                    inputProps={{ step: "0.01", min: "0" }}
                                />
                            </FormControl>

                            <TextField
                                label="Quantity Available"
                                type="number"
                                value={quantityAvailable}
                                onChange={(e) => setQuantityAvailable(e.target.value)}
                                required
                                fullWidth
                                inputProps={{ min: "0" }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <PurpleButton onClick={handleCloseEditDialog}>
                            Cancel
                        </PurpleButton>
                        <GreenButton 
                            type="submit" 
                            variant="contained"
                            disabled={loader}
                        >
                            {loader ? 'Updating...' : 'Update Book'}
                        </GreenButton>
                    </DialogActions>
                </form>
            </Dialog>

            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </>
    );
};

export default ShowLibraryBooks;