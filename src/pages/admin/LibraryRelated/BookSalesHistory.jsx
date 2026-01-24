import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Paper, Box, TextField, Typography, Table, TableBody, 
    TableContainer, TableHead, Chip, IconButton, Stack,
    FormControl, InputLabel, Select, MenuItem, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SortIcon from '@mui/icons-material/Sort';
import { StyledTableCell, StyledTableRow } from '../../../components/styles';

const BookSalesHistory = () => {
    const { salesList, loading } = useSelector((state) => state.library);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("date-desc"); // date-desc, date-asc, amount-desc, amount-asc
    const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month

    // Get date ranges for filtering
    const getDateRange = (filter) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch(filter) {
            case 'today':
                return { start: today, end: new Date() };
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return { start: weekAgo, end: new Date() };
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return { start: monthAgo, end: new Date() };
            default:
                return null;
        }
    };

    // Filter sales
    const filteredSales = Array.isArray(salesList)
        ? salesList.filter(sale => {
            // Search filter
            const matchesSearch = 
                sale.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.student?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Date filter
            let matchesDate = true;
            if (dateFilter !== 'all') {
                const range = getDateRange(dateFilter);
                const saleDate = new Date(sale.soldAt);
                matchesDate = saleDate >= range.start && saleDate <= range.end;
            }
            
            return matchesSearch && matchesDate;
          })
        : [];

    // Sort sales
    const sortedSales = [...filteredSales].sort((a, b) => {
        switch(sortBy) {
            case 'date-desc':
                return new Date(b.soldAt) - new Date(a.soldAt);
            case 'date-asc':
                return new Date(a.soldAt) - new Date(b.soldAt);
            case 'amount-desc':
                return (b.sellingPriceAtSale * b.quantity) - (a.sellingPriceAtSale * a.quantity);
            case 'amount-asc':
                return (a.sellingPriceAtSale * a.quantity) - (b.sellingPriceAtSale * b.quantity);
            default:
                return 0;
        }
    });

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    const salesColumns = [
        { id: 'date', label: 'Date', minWidth: 120 },
        { id: 'book', label: 'Book Title', minWidth: 180 },
        { id: 'author', label: 'Author', minWidth: 150 },
        { id: 'student', label: 'Sold To', minWidth: 150 },
        { id: 'quantity', label: 'Qty', minWidth: 80 },
        { id: 'unitPrice', label: 'Unit Price', minWidth: 110 },
        { id: 'totalAmount', label: 'Total Amount', minWidth: 130 },
        { id: 'profit', label: 'Profit', minWidth: 110 },
    ];

    const salesRows = sortedSales.map((sale) => {
        const date = new Date(sale.soldAt);
        const dateString = date.toString() !== "Invalid Date" 
            ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : "Invalid Date";
        
        const totalAmount = sale.sellingPriceAtSale * sale.quantity;
        
        return {
            date: dateString,
            book: sale.book?.title || 'N/A',
            author: sale.book?.author || 'N/A',
            student: `${sale.student?.name || 'N/A'} (Roll: ${sale.student?.rollNum || 'N/A'})`,
            quantity: sale.quantity,
            unitPrice: `Rs. ${sale.sellingPriceAtSale?.toFixed(2)}`,
            totalAmount: `Rs. ${totalAmount.toFixed(2)}`,
            profit: `Rs. ${sale.profitAtSale?.toFixed(2)}`,
            profitValue: sale.profitAtSale,
            id: sale._id,
        };
    });

    // Calculate totals
    const totalRevenue = sortedSales.reduce((sum, sale) => 
        sum + (sale.sellingPriceAtSale * sale.quantity), 0
    );
    const totalProfit = sortedSales.reduce((sum, sale) => 
        sum + sale.profitAtSale, 0
    );

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', p: 2, mt: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ReceiptLongIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    Sales History
                </Typography>
            </Box>

            {/* Filters Section */}
            <Stack spacing={2} sx={{ mb: 3 }}>
                {/* Search Bar */}
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search by book title or student name"
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

                {/* Filters Row */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {/* Date Filter */}
                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                        <InputLabel>Date Range</InputLabel>
                        <Select
                            value={dateFilter}
                            label="Date Range"
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Time</MenuItem>
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="week">Last 7 Days</MenuItem>
                            <MenuItem value="month">Last 30 Days</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Sort By */}
                    <FormControl sx={{ minWidth: 200, flex: 1 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortBy}
                            label="Sort By"
                            onChange={(e) => setSortBy(e.target.value)}
                            startAdornment={<SortIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                        >
                            <MenuItem value="date-desc">Date (Newest First)</MenuItem>
                            <MenuItem value="date-asc">Date (Oldest First)</MenuItem>
                            <MenuItem value="amount-desc">Amount (High to Low)</MenuItem>
                            <MenuItem value="amount-asc">Amount (Low to High)</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* Summary */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        {sortedSales.length} sale(s) found
                        {searchTerm && ` for "${searchTerm}"`}
                    </Typography>
                    
                    {sortedSales.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Chip 
                                label={`Revenue: Rs. ${totalRevenue.toFixed(2)}`}
                                color="primary"
                                variant="outlined"
                            />
                            <Chip 
                                label={`Profit: Rs. ${totalProfit.toFixed(2)}`}
                                color="success"
                                variant="outlined"
                            />
                        </Box>
                    )}
                </Box>

                {/* Active Filters */}
                {(searchTerm || dateFilter !== 'all') && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {searchTerm && (
                            <Chip
                                label={`Search: "${searchTerm}"`}
                                onDelete={() => setSearchTerm("")}
                                size="small"
                            />
                        )}
                        {dateFilter !== 'all' && (
                            <Chip
                                label={`Date: ${dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'Last 7 Days' : 'Last 30 Days'}`}
                                onDelete={() => setDateFilter('all')}
                                size="small"
                            />
                        )}
                    </Box>
                )}
            </Stack>

            <Divider sx={{ mb: 3 }} />

            {/* Sales Table */}
            {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography>Loading sales history...</Typography>
                </Box>
            ) : sortedSales.length > 0 ? (
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <StyledTableRow>
                                {salesColumns.map((column) => (
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
                            {salesRows.map((row) => (
                                <StyledTableRow hover key={row.id}>
                                    {salesColumns.map((column) => {
                                        const value = row[column.id];
                                        
                                        // Highlight profit column
                                        if (column.id === 'profit') {
                                            return (
                                                <StyledTableCell key={column.id}>
                                                    <Typography 
                                                        sx={{ 
                                                            color: row.profitValue > 0 ? 'success.main' : 'error.main',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {value}
                                                    </Typography>
                                                </StyledTableCell>
                                            );
                                        }
                                        
                                        // Highlight total amount
                                        if (column.id === 'totalAmount') {
                                            return (
                                                <StyledTableCell key={column.id}>
                                                    <Typography sx={{ fontWeight: 600 }}>
                                                        {value}
                                                    </Typography>
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
                    <ReceiptLongIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        {searchTerm || dateFilter !== 'all'
                            ? 'No sales found matching your filters.' 
                            : 'No sales recorded yet.'}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default BookSalesHistory;