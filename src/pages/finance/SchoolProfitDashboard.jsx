import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Paper, Box, Typography, Grid, Card, CardContent, FormControl,
    InputLabel, Select, MenuItem, Stack, Divider, CircularProgress
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReceiptIcon from '@mui/icons-material/Receipt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PaidIcon from '@mui/icons-material/Paid';
import { getProfitSummary } from '../../redux/ProfitRelated/profitHandle';

const SchoolProfitDashboard = () => {
    const dispatch = useDispatch();
    const { profitData, loading, error } = useSelector((state) => state.profit);
    const { currentUser } = useSelector((state) => state.user);

    const [dateRange, setDateRange] = useState('all');

    useEffect(() => {
        loadProfitData();
    }, [dateRange, dispatch, currentUser]);

    const loadProfitData = () => {
        const filters = {};
        
        if (dateRange !== 'all') {
            const today = new Date();
            let startDate;
            
            switch(dateRange) {
                case 'today':
                    startDate = new Date(today.setHours(0, 0, 0, 0));
                    filters.startDate = startDate.toISOString();
                    filters.endDate = new Date().toISOString();
                    break;
                case 'week':
                    startDate = new Date(today.setDate(today.getDate() - 7));
                    filters.startDate = startDate.toISOString();
                    filters.endDate = new Date().toISOString();
                    break;
                case 'month':
                    startDate = new Date(today.setMonth(today.getMonth() - 1));
                    filters.startDate = startDate.toISOString();
                    filters.endDate = new Date().toISOString();
                    break;
                case 'year':
                    startDate = new Date(today.setFullYear(today.getFullYear() - 1));
                    filters.startDate = startDate.toISOString();
                    filters.endDate = new Date().toISOString();
                    break;
            }
        }
        
        // Check if currentUser is Finance or Admin
        const isFinanceUser = currentUser.role === 'Finance' || currentUser.school;
        
        console.log('Current User:', currentUser);
        
        if (isFinanceUser && currentUser.school) {
            // Finance user - use school name
            console.log('Using school name:', currentUser.school);
            dispatch(getProfitSummary(currentUser.school, filters, true)); // true = isSchoolName
        } else {
            // Admin user - use admin ID
            console.log('Using admin ID:', currentUser._id);
            dispatch(getProfitSummary(currentUser._id, filters, false)); // false = is ID
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading profit summary...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    Error loading profit summary: {error}
                </Typography>
            </Box>
        );
    }

    const revenue = profitData?.revenue || { studentFees: { amount: 0 }, bookSalesProfit: { amount: 0 }, total: 0 };
    const expenses = profitData?.expenses || { schoolExpenses: { amount: 0 }, teacherSalaries: { amount: 0 }, total: 0 };
    const netProfit = profitData?.netProfit || 0;
    const profitMargin = profitData?.profitMargin || 0;

    const isProfit = netProfit >= 0;

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        School Profit Dashboard
                    </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                    Complete financial overview of school revenue, expenses, and net profit
                </Typography>
            </Box>

            {/* Date Range Filter */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel>Date Range</InputLabel>
                    <Select
                        value={dateRange}
                        label="Date Range"
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">Last 7 Days</MenuItem>
                        <MenuItem value="month">Last 30 Days</MenuItem>
                        <MenuItem value="year">Last Year</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            {/* Main Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Total Revenue */}
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ 
                        bgcolor: '#e8f5e9', 
                        borderLeft: '6px solid #4caf50',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 32, mr: 1 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Total Revenue
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
                                Rs. {revenue.total.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Income from all sources
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total Expenses */}
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ 
                        bgcolor: '#ffebee', 
                        borderLeft: '6px solid #f44336',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrendingDownIcon sx={{ color: '#f44336', fontSize: 32, mr: 1 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Total Expenses
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336', mb: 1 }}>
                                Rs. {expenses.total.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                All operational costs
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Net Profit/Loss */}
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ 
                        bgcolor: isProfit ? '#e3f2fd' : '#fff3e0', 
                        borderLeft: `6px solid ${isProfit ? '#2196f3' : '#ff9800'}`,
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <AccountBalanceWalletIcon sx={{ color: isProfit ? '#2196f3' : '#ff9800', fontSize: 32, mr: 1 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    {isProfit ? 'Net Profit' : 'Net Loss'}
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: isProfit ? '#2196f3' : '#ff9800', mb: 1 }}>
                                Rs. {Math.abs(netProfit).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Revenue - Expenses
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Profit Margin */}
                <Grid item xs={12} md={6} lg={3}>
                    <Card sx={{ 
                        bgcolor: '#f3e5f5', 
                        borderLeft: '6px solid #9c27b0',
                        height: '100%'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TrendingUpIcon sx={{ color: '#9c27b0', fontSize: 32, mr: 1 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Profit Margin
                                </Typography>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#9c27b0', mb: 1 }}>
                                {profitMargin}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Profitability ratio
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            {/* Revenue Breakdown */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                    Revenue Breakdown
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <ReceiptIcon sx={{ color: '#2196f3', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Student Fees
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3', mb: 1 }}>
                                    Rs. {revenue.studentFees.amount.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {revenue.studentFees.count} fee payments
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    {revenue.total > 0 
                                        ? `${((revenue.studentFees.amount / revenue.total) * 100).toFixed(1)}% of total revenue`
                                        : '0% of total revenue'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <MenuBookIcon sx={{ color: '#4caf50', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Book Sales Profit
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50', mb: 1 }}>
                                    Rs. {revenue.bookSalesProfit.amount.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {revenue.bookSalesProfit.count} book sales
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    {revenue.total > 0 
                                        ? `${((revenue.bookSalesProfit.amount / revenue.total) * 100).toFixed(1)}% of total revenue`
                                        : '0% of total revenue'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>

            {/* Expense Breakdown */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                    Expense Breakdown
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <MoneyOffIcon sx={{ color: '#ff9800', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        School Expenses
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800', mb: 1 }}>
                                    Rs. {expenses.schoolExpenses.amount.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {expenses.schoolExpenses.count} expense records
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    {expenses.total > 0 
                                        ? `${((expenses.schoolExpenses.amount / expenses.total) * 100).toFixed(1)}% of total expenses`
                                        : '0% of total expenses'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PaidIcon sx={{ color: '#f44336', mr: 1 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Teacher Salaries
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336', mb: 1 }}>
                                    Rs. {expenses.teacherSalaries.amount.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {expenses.teacherSalaries.count} salary payments
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                    {expenses.total > 0 
                                        ? `${((expenses.teacherSalaries.amount / expenses.total) * 100).toFixed(1)}% of total expenses`
                                        : '0% of total expenses'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default SchoolProfitDashboard;