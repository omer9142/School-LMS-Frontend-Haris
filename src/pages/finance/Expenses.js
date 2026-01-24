// src/pages/finance/Expenses.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Avatar,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import CategoryIcon from "@mui/icons-material/Category";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// Import Redux actions
import { 
  getAllExpenses, 
  getExpenseSummary, 
  addNewExpense, 
  updateExpenseDetails, 
  deleteExpenseRecord 
} from "../../redux/expensesRelated/expensesHandle";

/* ===================== MONTH HELPERS ===================== */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const parseMonthYear = (monthYear) => {
  const [month, year] = monthYear.split(" ");
  return new Date(Number(year), MONTH_NAMES.indexOf(month), 1);
};

const formatMonthYear = (date) => {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
};

/* ========================================================= */

const Expenses = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { expensesList, expenseSummary, loading, error, response } = useSelector((state) => state.expenses);

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({
    item: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    category: "other"
  });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [monthFilter, setMonthFilter] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const getAdminID = () => {
    if (currentUser?.adminID) return currentUser.adminID;
    if (currentUser?._id) return currentUser._id;

    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    if (userInfo?.adminID) return userInfo.adminID;
    if (userInfo?._id) return userInfo._id;
    if (userInfo?.user?.adminID) return userInfo.user.adminID;
    if (userInfo?.user?._id) return userInfo.user._id;

    return null;
  };

  const adminID = getAdminID();

  // Get current month
  const getCurrentMonthYear = () => {
    const now = new Date();
    return formatMonthYear(now);
  };

  // Fetch expenses when adminID or filters change
  useEffect(() => {
    if (adminID) {
      dispatch(getAllExpenses(adminID, { 
        month: monthFilter, 
        category: categoryFilter, 
        search 
      }));
      
      if (monthFilter) {
        dispatch(getExpenseSummary(adminID, monthFilter));
      }
    }
  }, [dispatch, adminID, monthFilter, categoryFilter, search]);

  // Show error/response messages from Redux
  useEffect(() => {
    if (error) {
      setSnack({ open: true, message: error, severity: "error" });
    }
    if (response) {
      setSnack({ open: true, message: response, severity: "success" });
    }
  }, [error, response]);

  /* ===================== SMART MONTH LOGIC ===================== */

  const firstExpenseMonth = useMemo(() => {
    if (!expensesList.length) {
      // If no expenses exist, start from current month
      return getCurrentMonthYear();
    }

    const dates = expensesList
      .map(exp => new Date(exp.date))
      .filter(date => !isNaN(date.getTime()));

    if (!dates.length) {
      const now = new Date();
      return formatMonthYear(now);
    }

    const earliest = dates.sort((a, b) => a - b)[0];
    return formatMonthYear(earliest);
  }, [expensesList]);

  const monthOptions = useMemo(() => {
    const startDate = parseMonthYear(firstExpenseMonth);
    const list = [];

    // Generate 8 months starting from the earliest expense month
    for (let i = 0; i < 8; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      list.push(formatMonthYear(d));
    }

    return list;
  }, [firstExpenseMonth]);

  // Set initial month filter
  useEffect(() => {
    if (!monthFilter && monthOptions.length) {
      setMonthFilter(monthOptions[0]);
    }
  }, [monthOptions, monthFilter]);

  /* ===================== FILTERED EXPENSES ===================== */

  const filteredExpenses = useMemo(() => {
    return expensesList.filter(expense => {
      // Month filter
      const expenseDate = new Date(expense.date);
      const expenseMonthYear = formatMonthYear(expenseDate);
      const monthMatch = monthFilter ? expenseMonthYear === monthFilter : true;

      // Search filter
      const searchMatch = search
        ? expense.item?.toLowerCase().includes(search.toLowerCase()) ||
          expense.description?.toLowerCase().includes(search.toLowerCase())
        : true;

      // Category filter
      const categoryMatch = categoryFilter 
        ? expense.category === categoryFilter 
        : true;

      return monthMatch && searchMatch && categoryMatch;
    });
  }, [expensesList, monthFilter, search, categoryFilter]);

  /* ===================== SUMMARY CALCULATIONS ===================== */

  const getTotalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  }, [filteredExpenses]);

  const getSelectedMonthExpenses = useMemo(() => {
    if (!monthFilter) return 0;
    
    return expensesList
      .filter(exp => {
        const expenseDate = new Date(exp.date);
        const expenseMonthYear = formatMonthYear(expenseDate);
        return expenseMonthYear === monthFilter;
      })
      .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  }, [expensesList, monthFilter]);

  /* ===================== HANDLERS ===================== */

  const handleOpenDialog = () => {
    setEditMode(false);
    setCurrentExpense(null);
    setNewExpense({
      item: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      category: "other"
    });
    setOpenDialog(true);
  };

  const handleEditExpense = (expense) => {
    setEditMode(true);
    setCurrentExpense(expense);
    setNewExpense({
      item: expense.item,
      amount: expense.amount,
      date: expense.date.split('T')[0],
      description: expense.description || "",
      category: expense.category || "other"
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentExpense(null);
    setNewExpense({
      item: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      category: "other"
    });
  };

  const handleAddExpense = async () => {
    if (!newExpense.item || !newExpense.amount) {
      setSnack({ open: true, message: "Please fill in item name and amount", severity: "warning" });
      return;
    }

    if (parseFloat(newExpense.amount) <= 0) {
      setSnack({ open: true, message: "Amount must be greater than 0", severity: "warning" });
      return;
    }

    if (!adminID) {
      setSnack({ open: true, message: "Admin ID not found. Please log in again.", severity: "error" });
      return;
    }

    try {
      const expenseData = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: new Date(newExpense.date).toISOString(),
        school: adminID
      };

      if (editMode && currentExpense) {
        // Update existing expense
        await dispatch(updateExpenseDetails(currentExpense._id, expenseData));
      } else {
        // Add new expense
        await dispatch(addNewExpense(expenseData));
      }

      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save expense:", err);
      setSnack({ open: true, message: "Failed to save expense", severity: "error" });
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    if (!adminID) {
      setSnack({ open: true, message: "Admin ID not found", severity: "error" });
      return;
    }

    try {
      await dispatch(deleteExpenseRecord(expenseId, adminID));
    } catch (err) {
      console.error("Failed to delete expense:", err);
      setSnack({ open: true, message: "Failed to delete expense", severity: "error" });
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateStr;
    }
  };

  const categoryOptions = [
    { value: "stationery", label: "Stationery", color: "#1976d2" },
    { value: "electricity", label: "Electricity", color: "#2e7d32" },
    { value: "rent", label: "Rent", color: "#ed6c02" },
    { value: "maintenance", label: "Maintenance", color: "#9c27b0" },
    { value: "salary", label: "Salary", color: "#d32f2f" },
    { value: "other", label: "Other", color: "#616161" }
  ];

  const getCategoryColor = (category) => {
    const found = categoryOptions.find(c => c.value === category);
    return found ? found.color : "#616161";
  };

  const getCategorySummary = () => {
    const summary = {};
    categoryOptions.forEach(cat => {
      const total = filteredExpenses
        .filter(exp => exp.category === cat.value)
        .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      summary[cat.value] = total;
    });
    return summary;
  };

  const categorySummary = getCategorySummary();

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: '#1976d2', mr: 2, width: 56, height: 56 }}>
            <ShoppingCartIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="#1976d2">
              School Expenses
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Track and manage all school expenditures
            </Typography>
          </Box>
        </Box>
        <Divider />
      </Box>

      {/* Filters Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ backgroundColor: 'white', boxShadow: 1 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    label="Month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    disabled={loading}
                  >
                    {monthOptions.map(m => (
                      <MenuItem key={m} value={m}>{m}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categoryOptions.map(cat => (
                      <MenuItem key={cat.value} value={cat.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cat.color }} />
                          {cat.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <OutlinedInput
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  sx={{ minWidth: 200 }}
                  disabled={loading}
                  endAdornment={
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  }
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            fullWidth
            size="large"
            disabled={loading}
            sx={{ 
              height: '100%',
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            Add New Expense
          </Button>
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{
            backgroundColor: 'white',
            borderLeft: '4px solid #1976d2',
            boxShadow: 1
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Expenses
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#1976d2">
                    Rs. {getTotalExpenses.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {filteredExpenses.length} items
                  </Typography>
                </Box>
                <ReceiptIcon sx={{ fontSize: 48, color: '#1976d2', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{
            backgroundColor: 'white',
            borderLeft: '4px solid #2e7d32',
            boxShadow: 1
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {monthFilter || "Selected Month"}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                    Rs. {getSelectedMonthExpenses.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    For selected month
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, color: '#2e7d32', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{
            backgroundColor: 'white',
            borderLeft: '4px solid #9c27b0',
            boxShadow: 1
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Categories
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#9c27b0">
                    {Object.keys(categorySummary).filter(cat => categorySummary[cat] > 0).length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active categories
                  </Typography>
                </Box>
                <CategoryIcon sx={{ fontSize: 48, color: '#9c27b0', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Category Breakdown */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon /> Category Breakdown
          </Typography>
          <Grid container spacing={2}>
            {categoryOptions.map(cat => {
              const total = categorySummary[cat.value] || 0;
              if (total === 0) return null;
              
              const percentage = getTotalExpenses > 0 ? (total / getTotalExpenses * 100).toFixed(1) : 0;
              
              return (
                <Grid item xs={6} sm={4} md={2} key={cat.value}>
                  <Card sx={{ 
                    backgroundColor: cat.color + '10', 
                    border: `1px solid ${cat.color}20`,
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {cat.label}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color={cat.color}>
                        Rs. {total.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {percentage}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{
            p: 2,
            backgroundColor: '#1976d2',
            color: 'white',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" fontWeight="600">
              Expense Records {filteredExpenses.length > 0 && `(${filteredExpenses.length})`}
            </Typography>
            {monthFilter && (
              <Chip 
                label={`Viewing: ${monthFilter}`}
                size="small"
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            )}
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#fafafa' }}>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Item Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell align="right"><strong>Amount (Rs.)</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading && filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Loading expenses...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <ShoppingCartIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No expenses found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {search || monthFilter !== monthOptions[0] || categoryFilter
                          ? 'Try adjusting your filters' 
                          : 'Click "Add New Expense" to get started'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow 
                      key={expense._id}
                      hover
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell>
                        <Chip 
                          label={formatDate(expense.date)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="500">
                          {expense.item}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={categoryOptions.find(c => c.value === expense.category)?.label || "Other"}
                          size="small"
                          sx={{
                            backgroundColor: getCategoryColor(expense.category) + '20',
                            color: getCategoryColor(expense.category),
                            fontWeight: 500
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {expense.description || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="600" color="#1976d2">
                          Rs. {parseFloat(expense.amount).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Edit expense">
                            <IconButton
                              onClick={() => handleEditExpense(expense)}
                              size="small"
                              color="primary"
                              disabled={loading}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete expense">
                            <IconButton
                              onClick={() => handleDeleteExpense(expense._id)}
                              size="small"
                              color="error"
                              disabled={loading}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredExpenses.length > 0 && (
            <Box sx={{ 
              p: 3, 
              backgroundColor: '#f5f5f5',
              borderTop: '2px solid #e0e0e0'
            }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Showing {filteredExpenses.length} of {expensesList.length} expenses
                    {monthFilter && ` for ${monthFilter}`}
                  </Typography>
                </Grid>
                <Grid item>
                  <Card sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                    <CardContent sx={{ py: 1, px: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Filtered Total
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        Rs. {getTotalExpenses.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Expense Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          {editMode ? 'Edit Expense' : 'Add New Expense'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <TextField
            label="Item Name *"
            value={newExpense.item}
            onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })}
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="e.g., Stationery, Electricity Bill"
            disabled={loading}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Amount (Rs.) *"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                type="number"
                fullWidth
                margin="normal"
                variant="outlined"
                inputProps={{ min: 0, step: "0.01" }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category *</InputLabel>
                <Select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  label="Category *"
                  disabled={loading}
                >
                  {categoryOptions.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: cat.color }} />
                        {cat.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            label="Date *"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newExpense.date}
            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            fullWidth
            margin="normal"
            variant="outlined"
            disabled={loading}
          />
          
          <TextField
            label="Description"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            fullWidth
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
            placeholder="Additional details about this expense"
            disabled={loading}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddExpense} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {editMode ? 'Update Expense' : 'Add Expense'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ open: false, message: "", severity: "success" })}
        message={snack.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: snack.severity === 'error' ? '#d32f2f' : 
                            snack.severity === 'warning' ? '#ed6c02' : '#2e7d32'
          }
        }}
      />
    </Box>
  );
};

export default Expenses;