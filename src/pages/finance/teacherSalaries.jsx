// src/pages/finance/TeacherSalaries.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
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
  CircularProgress,
  Snackbar,
  TextField,
  Divider,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import PaidIcon from "@mui/icons-material/Paid";
import PendingIcon from "@mui/icons-material/Pending";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import GroupsIcon from "@mui/icons-material/Groups";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";

// Import Redux actions
import { getAllSalaries, getSalarySummary, createOrUpdateSalary, updateSalaryStatus } from "../../redux/salariesRelated/salariesHandle";

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

// Custom Salary Input Component
const SalaryInputField = ({ 
  teacherId, 
  currentValue, 
  onSave, 
  disabled,
  localLoading 
}) => {
  const [value, setValue] = useState(currentValue || "");
  const [isChanged, setIsChanged] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(currentValue || "");
    setIsChanged(false);
  }, [currentValue]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    setIsChanged(newValue !== currentValue);
  };

  const handleSave = () => {
    if (isChanged && value !== "") {
      onSave(teacherId, value);
      setIsChanged(false);
    }
  };

  const handleCancel = () => {
    setValue(currentValue || "");
    setIsChanged(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Auto-save on blur only if value is valid
    if (isChanged && value !== "" && !isNaN(parseFloat(value)) && parseFloat(value) > 0) {
      handleSave();
    } else if (isChanged) {
      // If invalid, revert
      handleCancel();
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        inputRef={inputRef}
        type="number"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        size="small"
        placeholder="Enter amount"
        sx={{ width: 130 }}
        disabled={disabled || localLoading}
        InputProps={{
          startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
          inputProps: { 
            min: 0, 
            step: "0.01",
            pattern: "[0-9]*[.]?[0-9]*"
          }
        }}
      />
      {isChanged && (
        <>
          <Tooltip title="Save">
            <IconButton
              size="small"
              onClick={handleSave}
              disabled={disabled || localLoading}
              color="primary"
              sx={{ 
                width: 30, 
                height: 30,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton
              size="small"
              onClick={handleCancel}
              disabled={disabled || localLoading}
              color="error"
              sx={{ 
                width: 30, 
                height: 30,
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' }
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Box>
  );
};

const TeacherSalaries = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { salariesList, salarySummary, loading, error, response } = useSelector((state) => state.salaries);
  
  // State for teachers and local loading
  const [teachers, setTeachers] = useState([]);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [salaryInputs, setSalaryInputs] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [savingTeacherId, setSavingTeacherId] = useState(null);

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

  // Fetch teachers from backend (using your original approach)
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!adminID) {
        setSnack({ open: true, message: "Admin ID not found. Please log in again.", severity: "error" });
        return;
      }

      setTeachersLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/Teachers/${adminID}`);
        const data = await response.json();
        
        if (data && !data.message) {
          setTeachers(data);
          console.log("✅ Teachers loaded:", data.length);
        } else {
          setTeachers([]);
          console.log("ℹ️ No teachers found");
        }
      } catch (error) {
        console.error("❌ Error fetching teachers:", error);
        setSnack({ open: true, message: "Failed to load teachers", severity: "error" });
        setTeachers([]);
      } finally {
        setTeachersLoading(false);
      }
    };

    if (adminID) {
      fetchTeachers();
    }
  }, [adminID]);

  // Fetch salaries when adminID or filters change
  useEffect(() => {
    if (adminID && monthFilter) {
      dispatch(getAllSalaries(adminID, { month: monthFilter, status: filterStatus }));
      dispatch(getSalarySummary(adminID, monthFilter));
    }
  }, [dispatch, adminID, monthFilter, filterStatus]);

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

  const firstSalaryMonth = useMemo(() => {
    if (!salariesList.length) {
      // If no salary data exists, start from current month
      return getCurrentMonthYear();
    }

    const months = salariesList.map(s => s.month).filter(Boolean);
    if (!months.length) {
      return getCurrentMonthYear();
    }

    const earliest = months
      .map(parseMonthYear)
      .sort((a, b) => a - b)[0];

    return formatMonthYear(earliest);
  }, [salariesList]);

  const monthOptions = useMemo(() => {
    const startDate = parseMonthYear(firstSalaryMonth);
    const currentMonthYear = getCurrentMonthYear();
    const list = [];

    // Generate 8 months starting from the earliest salary month
    for (let i = 0; i < 8; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      const monthYear = formatMonthYear(d);
      const isCurrent = monthYear === currentMonthYear;
      list.push({ value: monthYear, isCurrent });
    }

    return list;
  }, [firstSalaryMonth]);

  // Set initial month filter
  useEffect(() => {
    if (!monthFilter && monthOptions.length) {
      setMonthFilter(monthOptions[0].value);
    }
  }, [monthOptions, monthFilter]);

  // Initialize salary inputs from Redux data
  useEffect(() => {
    if (salariesList.length > 0 && teachers.length > 0) {
      const inputs = {};
      salariesList.forEach(salary => {
        if (salary.month === monthFilter) {
          // Handle both populated teacher object and teacher ID string
          const teacherId = salary.teacher?._id || salary.teacher;
          if (teacherId) {
            inputs[teacherId] = {
              amount: salary.amount || "",
              status: salary.status || "unpaid",
              paymentDate: salary.paymentDate || null,
              _id: salary._id
            };
          }
        }
      });
      setSalaryInputs(inputs);
    } else if (teachers.length > 0) {
      // Initialize empty inputs for all teachers
      const inputs = {};
      teachers.forEach(teacher => {
        inputs[teacher._id] = {
          amount: "",
          status: "unpaid",
          paymentDate: null,
          _id: null
        };
      });
      setSalaryInputs(inputs);
    }
  }, [salariesList, teachers, monthFilter]);

  const handleSalaryChange = async (teacherId, value) => {
    if (!adminID) {
      setSnack({ open: true, message: "Admin ID not found", severity: "error" });
      return;
    }

    if (!value || parseFloat(value) <= 0) {
      setSnack({ open: true, message: "Please enter a valid amount", severity: "warning" });
      return;
    }

    setSavingTeacherId(teacherId);
    setLocalLoading(true);

    try {
      const salaryData = {
        teacher: teacherId,
        month: monthFilter,
        amount: parseFloat(value),
        status: "unpaid",
        school: adminID
      };

      // If salary record already exists, include its ID
      if (salaryInputs[teacherId]?._id) {
        salaryData._id = salaryInputs[teacherId]._id;
      }

      await dispatch(createOrUpdateSalary(salaryData));
      
      // Update local state with new data
      setSalaryInputs(prev => ({
        ...prev,
        [teacherId]: {
          ...prev[teacherId],
          amount: value,
          _id: salaryData._id || prev[teacherId]?._id
        }
      }));
    } catch (err) {
      console.error("Failed to save salary:", err);
      setSnack({ open: true, message: "Failed to save salary", severity: "error" });
    } finally {
      setLocalLoading(false);
      setSavingTeacherId(null);
    }
  };

  const handleStatusChange = async (teacherId, status) => {
    const teacherSalary = salaryInputs[teacherId];
    if (!teacherSalary?.amount || parseFloat(teacherSalary.amount) <= 0) {
      setSnack({ open: true, message: "Please enter salary amount first", severity: "warning" });
      return;
    }

    setSavingTeacherId(teacherId);
    setLocalLoading(true);

    try {
      const salaryId = teacherSalary._id;
      let result;

      if (salaryId) {
        // Update existing salary
        const statusData = { 
          status,
          paymentDate: status === "paid" ? new Date().toISOString() : null
        };
        result = await dispatch(updateSalaryStatus(salaryId, statusData));
      } else {
        // Create new salary record
        const salaryData = {
          teacher: teacherId,
          month: monthFilter,
          amount: parseFloat(teacherSalary.amount),
          status: status,
          school: adminID,
          paymentDate: status === "paid" ? new Date().toISOString() : null
        };
        result = await dispatch(createOrUpdateSalary(salaryData));
      }

      // Update local state
      if (result?._id) {
        setSalaryInputs(prev => ({
          ...prev,
          [teacherId]: {
            ...prev[teacherId],
            _id: result._id,
            status: status,
            paymentDate: status === "paid" ? new Date().toISOString() : null
          }
        }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setSnack({ open: true, message: "Failed to update status", severity: "error" });
    } finally {
      setLocalLoading(false);
      setSavingTeacherId(null);
    }
  };

  const filteredTeachers = useMemo(() => {
    if (!teachers.length) return [];

    return teachers.filter(teacher => {
      const searchMatch = search
        ? teacher.name?.toLowerCase().includes(search.toLowerCase()) ||
          teacher.email?.toLowerCase().includes(search.toLowerCase())
        : true;

      const teacherSalary = salaryInputs[teacher._id];
      const status = teacherSalary?.status || "unpaid";
      const statusMatch = filterStatus ? status === filterStatus : true;

      return searchMatch && statusMatch;
    });
  }, [teachers, search, filterStatus, salaryInputs]);

  const computedSummary = useMemo(() => {
    let totalTeachers = teachers.length;
    let paidCount = 0;
    let unpaidCount = 0;
    let totalAmount = 0;
    let paidAmount = 0;

    teachers.forEach(teacher => {
      const teacherSalary = salaryInputs[teacher._id];
      if (teacherSalary?.amount && parseFloat(teacherSalary.amount) > 0) {
        totalAmount += parseFloat(teacherSalary.amount);
        
        if (teacherSalary.status === "paid") {
          paidCount++;
          paidAmount += parseFloat(teacherSalary.amount);
        } else {
          unpaidCount++;
        }
      }
    });

    return { totalTeachers, paidCount, unpaidCount, totalAmount, paidAmount };
  }, [teachers, salaryInputs]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircleIcon fontSize="small" /> };
      case 'unpaid': return { bg: '#fff3e0', color: '#ed6c02', icon: <HourglassEmptyIcon fontSize="small" /> };
      case 'pending': return { bg: '#e3f2fd', color: '#1976d2', icon: <PendingIcon fontSize="small" /> };
      default: return { bg: '#f5f5f5', color: '#616161', icon: <HourglassEmptyIcon fontSize="small" /> };
    }
  };

  const isLoading = loading || localLoading || teachersLoading;

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: '#1976d2', mr: 2, width: 56, height: 56 }}>
            <AccountBalanceIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="#1976d2">
              Teacher Salaries
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage teacher salary payments and records
            </Typography>
          </Box>
        </Box>
        <Divider />
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, backgroundColor: 'white', boxShadow: 1 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Month</InputLabel>
              <Select
                label="Month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                disabled={isLoading}
              >
                {monthOptions.map(({ value, isCurrent }) => (
                  <MenuItem key={value} value={value}>
                    {value} {isCurrent && "(current)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={isLoading}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>

            <OutlinedInput
              placeholder="Search teacher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ minWidth: 250 }}
              disabled={isLoading}
              endAdornment={
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </Box>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderLeft: '4px solid #1976d2', boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Teachers
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#1976d2">
                    {computedSummary.totalTeachers}
                  </Typography>
                </Box>
                <GroupsIcon sx={{ fontSize: 48, color: '#1976d2', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderLeft: '4px solid #2e7d32', boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Paid Salaries
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                    {computedSummary.paidCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rs. {computedSummary.paidAmount.toLocaleString()}
                  </Typography>
                </Box>
                <PaidIcon sx={{ fontSize: 48, color: '#2e7d32', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderLeft: '4px solid #616161', boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Unpaid Salaries
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#616161">
                    {computedSummary.unpaidCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rs. {(computedSummary.totalAmount - computedSummary.paidAmount).toLocaleString()}
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 48, color: '#616161', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: 'white', borderLeft: '4px solid #ed6c02', boxShadow: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Amount
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#ed6c02">
                    Rs. {computedSummary.totalAmount.toLocaleString()}
                  </Typography>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 48, color: '#ed6c02', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Teachers Table */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{
            p: 2,
            backgroundColor: '#1976d2',
            color: 'white',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          }}>
            <Typography variant="h6" fontWeight="600">
              Teacher Salary Records {filteredTeachers.length > 0 && `(${filteredTeachers.length})`}
            </Typography>
            {monthFilter && (
              <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                Month: {monthFilter}
              </Typography>
            )}
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#fafafa' }}>
                <TableRow>
                  <TableCell><strong>Teacher Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Salary Amount (Rs.)</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Payment Date</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading && filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Loading data...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : teachersLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Loading teachers...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : teachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <GroupsIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No teachers found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Please add teachers first
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredTeachers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <GroupsIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No teachers match your filters
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {search || filterStatus ? 'Try adjusting your filters' : 'No teachers registered yet'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeachers.map((teacher) => {
                    const teacherSalary = salaryInputs[teacher._id] || { amount: "", status: "unpaid", paymentDate: null };
                    const statusColors = getStatusColor(teacherSalary.status);
                    const isSaving = savingTeacherId === teacher._id;

                    return (
                      <TableRow
                        key={teacher._id}
                        hover
                        sx={{ '&:last-child td': { borderBottom: 0 } }}
                      >
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="500">
                            {teacher.name || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {teacher.email || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SalaryInputField
                              teacherId={teacher._id}
                              currentValue={teacherSalary.amount}
                              onSave={handleSalaryChange}
                              disabled={isSaving}
                              localLoading={isSaving}
                            />
                            {isSaving && <CircularProgress size={20} />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={teacherSalary.status}
                            onChange={(e) => handleStatusChange(teacher._id, e.target.value)}
                            size="small"
                            disabled={!teacherSalary.amount || isSaving}
                            sx={{
                              minWidth: 120,
                              backgroundColor: statusColors.bg,
                              color: statusColors.color,
                              '& .MuiSelect-icon': { color: statusColors.color }
                            }}
                          >
                            <MenuItem value="unpaid">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HourglassEmptyIcon fontSize="small" />
                                Unpaid
                              </Box>
                            </MenuItem>
                            <MenuItem value="paid">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon fontSize="small" />
                                Paid
                              </Box>
                            </MenuItem>
                            <MenuItem value="pending">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PendingIcon fontSize="small" />
                                Pending
                              </Box>
                            </MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {teacherSalary.paymentDate ? (
                            <Chip
                              label={formatDate(teacherSalary.paymentDate)}
                              variant="outlined"
                              color="success"
                              size="small"
                              icon={<CheckCircleIcon />}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredTeachers.length > 0 && (
            <Box sx={{ 
              p: 3, 
              backgroundColor: '#f5f5f5',
              borderTop: '2px solid #e0e0e0'
            }}>
              
            </Box>
          )}
        </CardContent>
      </Card>

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

export default TeacherSalaries;