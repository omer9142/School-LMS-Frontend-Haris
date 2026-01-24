import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFees,
  fetchFeeSummary,
  updateFee,
  deleteFee,
  createFee,
  createBulkFees,
  markOverdueFees,
} from "../../redux/feeRelated/feeHandle";
import { getAllSclasses } from "../../redux/sclassRelated/sclassHandle";

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
  Paper,
  Select,
  MenuItem,
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
  Checkbox,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Stack,
  Chip,
  LinearProgress,
  Divider,
  Avatar,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import PendingIcon from "@mui/icons-material/Pending";
import WarningIcon from "@mui/icons-material/Warning";
import GroupsIcon from "@mui/icons-material/Groups";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import DiscountIcon from "@mui/icons-material/Discount";

const exportToCsv = (filename, rows) => {
  if (!rows || !rows.length) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(rows[0]);

  const escapeCSVValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    let stringValue = String(value);
    stringValue = stringValue.replace(/(\r\n|\n|\r)/g, ' ').trim();
    stringValue = stringValue.replace(/"/g, '""');
    return `"${stringValue}"`;
  };

  const csvRows = [];
  csvRows.push(headers.map(escapeCSVValue).join(','));

  rows.forEach(row => {
    const values = headers.map(header => escapeCSVValue(row[header]));
    csvRows.push(values.join(','));
  });

  const csvContent = csvRows.join('\r\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Only Paid and Unpaid status options
const STATUS_OPTIONS = ["Paid", "Unpaid"];

// Helper to check if a fee is overdue
const isOverdueStatus = (fee) => {
  if (fee.status === "Paid") return false;
  if (!fee.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(fee.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  return today > dueDate;
};

// Get computed status (automatic overdue detection)
const getComputedStatus = (fee) => {
  if (fee.status === "Paid") return "Paid";
  if (isOverdueStatus(fee)) return "Overdue";
  return "Unpaid";
};

const getStatusColor = (status, theme) => {
  switch (status) {
    case "Paid": return theme.palette.success.main;
    case "Unpaid": return theme.palette.grey[600];
    case "Overdue": return theme.palette.error.main;
    default: return theme.palette.grey[500];
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Paid": return <PaidIcon />;
    case "Unpaid": return <PendingIcon />;
    case "Overdue": return <WarningIcon />;
    default: return <PendingIcon />;
  }
};

const getReadableClassName = (sclassName, allClasses = []) => {
  if (!sclassName) return "—";

  if (typeof sclassName === "string" && sclassName.length === 24) {
    const foundClass = allClasses.find(cls => cls._id === sclassName);
    return foundClass ? getReadableClassName(foundClass.sclassName) : "—";
  }

  if (typeof sclassName === "string") {
    return sclassName;
  }

  if (typeof sclassName === "object" && sclassName.sclassName) {
    return sclassName.sclassName;
  }

  if (typeof sclassName === "object" && sclassName.name) {
    return sclassName.name;
  }

  return "—";
};

const FinanceHome = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { fees: feeDataWrapper = { fees: [] }, summary = {}, loading, error } = useSelector(
    (state) => state.fee
  ) || {};
  const fees = feeDataWrapper.fees || [];

  const { currentUser } = useSelector((state) => state.user);
  const { sclassesList = [] } = useSelector((state) => state.sclass) || {};

  const getAdminID = () => {
    if (currentUser?.adminID) {
      return currentUser.adminID;
    }

    if (currentUser?._id) {
      return currentUser._id;
    }

    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    if (userInfo?.adminID) {
      return userInfo.adminID;
    }
    if (userInfo?._id) {
      return userInfo._id;
    }
    if (userInfo?.user?.adminID) {
      return userInfo.user.adminID;
    }
    if (userInfo?.user?._id) {
      return userInfo.user._id;
    }

    return null;
  };

  const adminID = getAdminID();

  // UI state
  const [snack, setSnack] = useState({ open: false, message: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [selectedFeeForDiscount, setSelectedFeeForDiscount] = useState(null);
  const [discountedAmount, setDiscountedAmount] = useState("");
  const [newFee, setNewFee] = useState({ student: "", amount: "", dueDate: "", remarks: "" });
  const [bulkParams, setBulkParams] = useState({ classIds: [],  amount: "", dueDate: "",month: new Date().toLocaleString('default', { month: 'long' }), remarks: "" });
  const [selected, setSelected] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth()
  );


  useEffect(() => {
    if (!adminID) {
      setSnack({ open: true, message: "adminID not provided — please re-login" });
      return;
    }
    dispatch(fetchFees(adminID));
    dispatch(fetchFeeSummary(adminID));
    dispatch(getAllSclasses(adminID, "sclass"));
  }, [dispatch, adminID]);

  // FIXED POINT 1: Find the earliest month from fee records and set it as default
  useEffect(() => {
    if (fees.length === 0) return;

    // Extract all months from fees and find the earliest
    const monthYears = fees
      .map(fee => {
        if (!fee.month && !fee.dueDate) return null;

        // Parse month name to get month number
        const monthNames = [
          "january", "february", "march", "april", "may", "june",
          "july", "august", "september", "october", "november", "december"
        ];

        let monthNum = null;
        let year = null;

        // Try to find month name in the fee.month string
        if (fee.month) {
          const feeLower = fee.month.toLowerCase();
          for (let i = 0; i < monthNames.length; i++) {
            if (feeLower.includes(monthNames[i]) || feeLower.includes(monthNames[i].substring(0, 3))) {
              monthNum = i + 1;
              break;
            }
          }

          // Try to extract year from the fee.month string
          const yearMatch = fee.month.match(/\b(20\d{2})\b/);
          if (yearMatch) {
            year = parseInt(yearMatch[1]);
          }
        }

        // If no year found in month string, get it from dueDate
        if (monthNum && !year && fee.dueDate) {
          const dueDate = new Date(fee.dueDate);
          year = dueDate.getFullYear();
        }

        // If still no month/year, try to get both from dueDate
        if (!monthNum && fee.dueDate) {
          const dueDate = new Date(fee.dueDate);
          monthNum = dueDate.getMonth() + 1;
          year = dueDate.getFullYear();
        }

        if (monthNum && year) {
          return { month: monthNum, year: year, value: `${monthNum}/${year}` };
        }
        return null;
      })
      .filter(Boolean);

    if (monthYears.length > 0) {
      // Sort to find the earliest month
      monthYears.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      // Set the earliest month as default
      setSelectedMonth(monthYears[0].value);
    } else {
      // Fallback to current month if no valid months found
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      setSelectedMonth(`${currentMonth}/${currentYear}`);
    }
  }, [fees]);

  useEffect(() => {
    if (error) setSnack({ open: true, message: error });
  }, [error]);
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const MONTH_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const formatMonthForCSV = (monthYear) => {
    // expects "1/2026"
    if (!monthYear) return "N/A";

    const [month, year] = monthYear.split("/").map(Number);
    if (!month || !year) return monthYear;

    return `${MONTH_SHORT[month - 1]}-${year}`;
  };


  const formatMonthLabel = (monthYear, isCurrent = false) => {
    const [month, year] = monthYear.split('/').map(Number);
    const label = `${MONTH_NAMES[month - 1]} ${year}`;
    return isCurrent ? `${label} (Current)` : label;
  };

  // FIXED POINT 1: Generate month options starting from earliest fee record month
  const monthOptions = useMemo(() => {
    if (fees.length === 0) {
      // Fallback to current month if no fees
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      return [{ value: `${currentMonth}/${currentYear}`, label: `${currentMonth}/${currentYear} (Current)` }];
    }

    // Extract all months from fees
    const monthYears = fees
      .map(fee => {
        if (!fee.month && !fee.dueDate) return null;

        const monthNames = [
          "january", "february", "march", "april", "may", "june",
          "july", "august", "september", "october", "november", "december"
        ];

        let monthNum = null;
        let year = null;

        // Try to find month name in the fee.month string
        if (fee.month) {
          const feeLower = fee.month.toLowerCase();
          for (let i = 0; i < monthNames.length; i++) {
            if (feeLower.includes(monthNames[i]) || feeLower.includes(monthNames[i].substring(0, 3))) {
              monthNum = i + 1;
              break;
            }
          }

          // Try to extract year from the fee.month string
          const yearMatch = fee.month.match(/\b(20\d{2})\b/);
          if (yearMatch) {
            year = parseInt(yearMatch[1]);
          }
        }

        // If no year found in month string, get it from dueDate
        if (monthNum && !year && fee.dueDate) {
          const dueDate = new Date(fee.dueDate);
          year = dueDate.getFullYear();
        }

        // If still no month/year, try to get both from dueDate
        if (!monthNum && fee.dueDate) {
          const dueDate = new Date(fee.dueDate);
          monthNum = dueDate.getMonth() + 1;
          year = dueDate.getFullYear();
        }

        if (monthNum && year) {
          return { month: monthNum, year: year };
        }
        return null;
      })
      .filter(Boolean);

    if (monthYears.length === 0) {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      return [{ value: `${currentMonth}/${currentYear}`, label: `${currentMonth}/${currentYear} (Current)` }];
    }

    // Sort to find earliest
    monthYears.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    const earliestMonth = monthYears[0].month;
    const earliestYear = monthYears[0].year;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Get unique month/year combinations that exist in the data
    const uniqueMonthYears = new Set();
    monthYears.forEach(my => {
      uniqueMonthYears.add(`${my.month}/${my.year}`);
    });

    const options = [];

    // Generate months from earliest to current + 6 months forward
    let tempMonth = earliestMonth;
    let tempYear = earliestYear;

    while (tempYear < currentYear || (tempYear === currentYear && tempMonth <= currentMonth + 6)) {
      const monthYearValue = `${tempMonth}/${tempYear}`;
      const isCurrent = tempMonth === currentMonth && tempYear === currentYear;

      // Only add months that have data OR are current/future months
      if (uniqueMonthYears.has(monthYearValue) || tempYear > currentYear ||
        (tempYear === currentYear && tempMonth >= currentMonth)) {
        options.push({
          value: monthYearValue,
          label: formatMonthLabel(`${tempMonth}/${tempYear}`, isCurrent)

        });
      }

      tempMonth++;
      if (tempMonth > 12) {
        tempMonth = 1;
        tempYear++;
      }
    }

    return options;
  }, [fees]);

  const allMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredFees = useMemo(() => {
    let filtered = fees;

    // ✅ FIX: Only filter by month if selectedMonth exists AND is not empty string
    if (selectedMonth && selectedMonth !== "") {
      const [month, year] = selectedMonth.split('/').map(Number);
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthName = monthNames[month - 1];

      filtered = filtered.filter((fee) => {
        if (!fee.month) return false;

        const feeMonth = fee.month.toLowerCase();
        const checkMonth = monthName.toLowerCase();

        return feeMonth.includes(checkMonth) ||
          feeMonth.includes(checkMonth.substring(0, 3)) ||
          feeMonth.includes(year.toString());
      });
    }

    if (search || filterStatus) {
      filtered = filtered.filter((fee) => {
        const searchMatch = search ?
          (fee.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
            fee.student?.rollNum?.toString().includes(search)) :
          true;

        const status = fee.status || "Unpaid";
        const displayStatus = getComputedStatus(fee);

        let statusMatch = true;
        if (filterStatus) {
          if (filterStatus === "Paid") {
            statusMatch = status === "Paid";
          } else if (filterStatus === "Unpaid") {
            statusMatch = status === "Unpaid";
          } else if (filterStatus === "Overdue") {
            statusMatch = displayStatus === "Overdue";
          }
        }

        return searchMatch && statusMatch;
      });
    }

    return filtered;
  }, [fees, search, filterStatus, selectedMonth]);


  const computedSummary = useMemo(() => {
    const filteredByMonth = selectedMonth
  ? fees.filter(fee => {
      if (!fee.month) return false;
      const [month, year] = selectedMonth.split('/').map(Number);
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const feeMonth = fee.month.toLowerCase();
      const checkMonth = monthNames[month - 1].toLowerCase();
      return feeMonth.includes(checkMonth) || feeMonth.includes(checkMonth.substring(0,3)) || feeMonth.includes(year.toString());
    })
  : fees;


    const totalFees = filteredByMonth.length;
    let paidCount = 0;
    let unpaidCount = 0;
    let overdueCount = 0;

    filteredByMonth.forEach((fee) => {
      const status = fee.status || "Unpaid";
      const displayStatus = getComputedStatus(fee);

      if (status === "Paid") paidCount++;
      if (displayStatus === "Overdue") overdueCount++;
      if (status === "Unpaid" && displayStatus !== "Overdue") unpaidCount++;
    });

    return { totalFees, paidCount, unpaidCount, overdueCount };
  }, [fees, filteredFees, selectedMonth]);

  const getTotalAccumulatedAmount = useMemo(() => {
    const filteredByMonth = selectedMonth
  ? fees.filter(fee => {
      if (!fee.month) return false;
      const [month, year] = selectedMonth.split('/').map(Number);
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const feeMonth = fee.month.toLowerCase();
      const checkMonth = monthNames[month - 1].toLowerCase();
      return feeMonth.includes(checkMonth) || feeMonth.includes(checkMonth.substring(0,3)) || feeMonth.includes(year.toString());
    })
  : fees;


    const totalAmount = filteredByMonth.reduce((sum, fee) => {
      return sum + (parseFloat(fee.amount) || 0);
    }, 0);

    const accumulatedAmount = filteredByMonth.reduce((sum, fee) => {
      const status = fee.status || "Unpaid";

      if (status === "Paid") {
        return sum + (parseFloat(fee.amount) || 0);
      }
      return sum;
    }, 0);

    return {
      totalAmount: totalAmount,
      accumulatedAmount: accumulatedAmount,
      count: filteredByMonth.length
    };
  }, [fees, filteredFees, selectedMonth]);

  const applyFilters = () => {
    // Client-side filtering is automatic
  };

  const clearFilters = () => {
    setFilterStatus("");
    setSearch("");
  };

  const handleStatusChange = async (feeId, newStatus, fee) => {
    try {
      setLoadingAction(true);
      const paymentDate = newStatus === "Paid" ? new Date().toISOString() : null;
      const updateData = {
        status: newStatus,
        paymentDate
      };

      await dispatch(updateFee(feeId, updateData));
      setSnack({ open: true, message: "Status updated" });
      await dispatch(fetchFeeSummary(adminID));
      await dispatch(fetchFees(adminID));
    } catch (err) {
      setSnack({ open: true, message: err.message || "Failed to update" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDiscountClick = (fee) => {
    setSelectedFeeForDiscount(fee);
    setDiscountedAmount("");
    setDiscountDialogOpen(true);
  };

  const handleDiscountSubmit = async () => {
    if (!discountedAmount || discountedAmount <= 0) {
      setSnack({ open: true, message: "Please enter a valid amount" });
      return;
    }

    if (parseFloat(discountedAmount) > parseFloat(selectedFeeForDiscount.amount)) {
      setSnack({ open: true, message: "Discounted amount cannot exceed original amount" });
      return;
    }

    try {
      setLoadingAction(true);

      console.log("Applying discount - updating amount to:", discountedAmount);

      await dispatch(updateFee(selectedFeeForDiscount._id, {
        amount: parseFloat(discountedAmount)
      }));

      setSnack({ open: true, message: "Discount applied successfully. Amount updated." });
      setDiscountDialogOpen(false);
      setSelectedFeeForDiscount(null);
      setDiscountedAmount("");

      await dispatch(fetchFees(adminID));
      await dispatch(fetchFeeSummary(adminID));
    } catch (err) {
      console.error("Error applying discount:", err);
      setSnack({ open: true, message: err.message || "Failed to apply discount" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDelete = async (feeId) => {
    if (!window.confirm("Delete this fee record?")) return;
    try {
      setLoadingAction(true);
      await dispatch(deleteFee(feeId));
      setSnack({ open: true, message: "Deleted" });
      await dispatch(fetchFeeSummary(adminID));
      await dispatch(fetchFees(adminID));
    } catch (err) {
      setSnack({ open: true, message: err.message || "Failed to delete" });
    } finally {
      setLoadingAction(false);
    }
  };

  const openCreateDialog = () => setCreateOpen(true);
  const closeCreateDialog = () => {
    setCreateOpen(false);
    setNewFee({ student: "", amount: "", dueDate: "", remarks: "" });
  };

  const handleCreateSubmit = async () => {
    if (!newFee.student || !newFee.amount || !newFee.dueDate) {
      setSnack({ open: true, message: "Please fill required fields" });
      return;
    }
    try {
      setLoadingAction(true);
      await dispatch(createFee(newFee));
      setSnack({ open: true, message: "Fee record created" });
      closeCreateDialog();
      await dispatch(fetchFeeSummary(adminID));
      await dispatch(fetchFees(adminID));
    } catch (err) {
      setSnack({ open: true, message: err.message || "Failed to create" });
    } finally {
      setLoadingAction(false);
    }
  };

  const openBulkDialog = () => setBulkOpen(true);
  const closeBulkDialog = () => {
    setBulkOpen(false);
    setBulkParams({ classIds: [], amount: "", dueDate: "", month: "", remarks: "" });
  };

  const handleBulkCreate = async () => {
  // Validate required fields
  if (!bulkParams.classIds || bulkParams.classIds.length === 0) {
    setSnack({ open: true, message: "Please select at least one class" });
    return;
  }
  
  if (!bulkParams.amount || !bulkParams.dueDate || !bulkParams.month) {
    setSnack({ open: true, message: "Please provide amount, due date, and month" });
    return;
  }
  
  try {
    setLoadingAction(true);
    const payload = {
      adminID,
      classIds: bulkParams.classIds,  // Send array of class IDs
      amount: bulkParams.amount,
      dueDate: bulkParams.dueDate,
      month: bulkParams.month,
      remarks: bulkParams.remarks,
    };
    
    const result = await dispatch(createBulkFees(payload));
    
    // Show detailed success message
    const classCount = bulkParams.classIds.length;
    const studentCount = result?.createdCount || 0;
    
    setSnack({ 
      open: true, 
      message: `Successfully created ${studentCount} fee record(s) for ${classCount} class${classCount > 1 ? 'es' : ''}` 
    });
    
    closeBulkDialog();
    await dispatch(fetchFeeSummary(adminID));
    await dispatch(fetchFees(adminID));
  } catch (err) {
    setSnack({ open: true, message: err.message || "Failed to create bulk fees" });
  } finally {
    setLoadingAction(false);
  }
};

  const toggleSelect = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setSelected(s);
  };

  const selectAllOnPage = () => {
    const s = new Set();
    filteredFees.forEach((f) => s.add(f._id));
    setSelected(s);
  };
  const clearSelection = () => setSelected(new Set());

  const handleBulkMarkPaid = async () => {
    if (selected.size === 0) {
      setSnack({ open: true, message: "No rows selected" });
      return;
    }
    try {
      setLoadingAction(true);
      const paymentDate = new Date().toISOString();

      await Promise.all(
        Array.from(selected).map((id) =>
          dispatch(updateFee(id, { status: "Paid", paymentDate }))
        )
      );

      setSnack({ open: true, message: "Selected marked Paid" });
      clearSelection();

      await dispatch(fetchFees(adminID));
      await dispatch(fetchFeeSummary(adminID));
    } catch (err) {
      setSnack({ open: true, message: err.message || "Bulk update failed" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleExportSelected = () => {
    const selectedFees = filteredFees.filter((f) => selected.has(f._id));

    if (selectedFees.length === 0) {
      setSnack({ open: true, message: "No fees selected for export" });
      return;
    }

    const rows = selectedFees.map((fee) => {
      const studentName = fee.student?.name || "N/A";
      const rollNum = fee.student?.rollNum?.toString() || "N/A";
      const className = getReadableClassName(fee.student?.sclassName, sclassesList);

      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
          const date = new Date(dateStr);
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        } catch (e) {
          return "";
        }
      };

      const dueDate = formatDate(fee.dueDate);
      const paymentDate = formatDate(fee.paymentDate);
      const status = getComputedStatus(fee);

      return {
        "Student Name": studentName,
        "Class": className,
        "Roll Number": rollNum,
        "Month": selectedMonth
          ? formatMonthForCSV(selectedMonth)
          : fee.month || "N/A",

        "Amount": fee.amount || "",
        "Due Date": dueDate,
        "Status": status,
        "Payment Date": paymentDate,
      };
    });
    const MONTH_SHORT = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formatMonthForCSV = (monthYear) => {
      // expects "1/2026"
      if (!monthYear) return "N/A";

      const [month, year] = monthYear.split("/").map(Number);
      if (!month || !year) return monthYear;

      return `${MONTH_SHORT[month - 1]}-${year}`;
    };

    // FIXED POINT 3: Use selected month for filename in MM-YYYY format
    let filenameMonth = '';
    if (selectedMonth) {
      const [month, year] = selectedMonth.split('/');
      filenameMonth = `${month.padStart(2, '0')}-${year}`;
    } else {
      const date = new Date();
      filenameMonth = `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    }

    exportToCsv(`selected_fees_${filenameMonth}.csv`, rows);
    setSnack({ open: true, message: `${selectedFees.length} record(s) exported successfully` });
  };

  const handleExportAll = () => {
    if (filteredFees.length === 0) {
      setSnack({ open: true, message: "No fee records to export" });
      return;
    }

    const rows = filteredFees.map((fee) => {
      const studentName = fee.student?.name || "N/A";
      const rollNum = fee.student?.rollNum?.toString() || "N/A";
      const className = getReadableClassName(fee.student?.sclassName, sclassesList);

      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
          const date = new Date(dateStr);
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        } catch (e) {
          return "";
        }
      };

      const dueDate = formatDate(fee.dueDate);
      const paymentDate = formatDate(fee.paymentDate);
      const status = getComputedStatus(fee);

      return {
        "Student Name": studentName,
        "Class": className,
        "Roll Number": rollNum,
        "Month": selectedMonth
          ? formatMonthForCSV(selectedMonth)
          : fee.month || "N/A",

        "Amount": fee.amount || "",
        "Due Date": dueDate,
        "Status": status,
        "Payment Date": paymentDate,
      };
    });

    // FIXED POINT 3: Use selected month for filename in MM-YYYY format
    let filenameMonth = '';
    if (selectedMonth) {
      const [month, year] = selectedMonth.split('/');
      filenameMonth = formatMonthForCSV(selectedMonth);

    } else {
      const date = new Date();
      filenameMonth = `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    }

    exportToCsv(`all_fees_${filenameMonth}.csv`, rows);
    setSnack({ open: true, message: `${rows.length} record(s) exported successfully` });
  };

  const studentCount = filteredFees.length;
  const totalFees = computedSummary.totalFees;
  const paidCount = computedSummary.paidCount;
  const unpaidCount = computedSummary.unpaidCount;
  const overdueCount = computedSummary.overdueCount;

  const getCurrentMonthName = () => {
    if (selectedMonth) {
      const [month, year] = selectedMonth.split('/').map(Number);
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${monthNames[month - 1]} ${year}`;
    }

    const currentDate = new Date();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[currentDate.getMonth()];
  };

  const currentMonthName = getCurrentMonthName();
  const accumulatedData = getTotalAccumulatedAmount;

  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: '#1976d2', mr: 2, width: 56, height: 56 }}>
            <AccountBalanceWalletIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="#1976d2">
              Fee Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage student fee accounts and payment tracking
            </Typography>
          </Box>
        </Box>
        <Divider />
      </Box>

      {/* Quick Actions Bar */}
      <Card sx={{ mb: 3, backgroundColor: 'white', boxShadow: 1 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Quick Actions
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  startIcon={<ReceiptLongIcon />}
                  onClick={openBulkDialog}
                  size="small"
                >
                  Generate Challans
                </Button>


              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Select Month</InputLabel>
                  <Select
                    label="Select Month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >

                    {monthOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>



               

                <Button variant="outlined" onClick={applyFilters} size="small">
                  Apply
                </Button>
                <Button onClick={clearFilters} size="small">
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* FIXED POINT 2: Summary Cards with consistent height */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: 'white',
            borderLeft: '4px solid #1976d2',
            boxShadow: 1,
            height: '100%',
            minHeight: 140
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#1976d2">
                    {totalFees}
                  </Typography>
                  {selectedMonth && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {currentMonthName}
                    </Typography>
                  )}
                </Box>
                <GroupsIcon sx={{ fontSize: 48, color: '#1976d2', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: 'white',
            borderLeft: '4px solid #2e7d32',
            boxShadow: 1,
            height: '100%',
            minHeight: 140
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Paid Fees
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                    {paidCount}
                  </Typography>
                  {selectedMonth && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {currentMonthName}
                    </Typography>
                  )}
                </Box>
                <PaidIcon sx={{ fontSize: 48, color: '#2e7d32', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: 'white',
            borderLeft: '4px solid #616161',
            boxShadow: 1,
            height: '100%',
            minHeight: 140
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Unpaid Fees
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#616161">
                    {unpaidCount}
                  </Typography>
                  {selectedMonth && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {currentMonthName}
                    </Typography>
                  )}
                </Box>
                <PendingIcon sx={{ fontSize: 48, color: '#616161', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            backgroundColor: 'white',
            borderLeft: '4px solid #d32f2f',
            boxShadow: 1,
            height: '100%',
            minHeight: 140
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Overdue Students
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#d32f2f">
                    {overdueCount}
                  </Typography>
                  {selectedMonth && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {currentMonthName}
                    </Typography>
                  )}
                </Box>
                <WarningIcon sx={{ fontSize: 48, color: '#d32f2f', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Payment Progress */}
      <Card sx={{ mb: 3, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom sx={{ mb: 3 }}>
            Payment Collection Rate {selectedMonth ? `- ${currentMonthName}` : "(All Months)"}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{
                backgroundColor: '#e3f2fd',
                borderLeft: '4px solid #1976d2',
                height: '100%'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {selectedMonth ? "Selected Month" : "Current Month"}
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="#1976d2">
                        {currentMonthName}
                      </Typography>
                      {selectedMonth && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Showing data for selected month
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}>
                      {selectedMonth ? selectedMonth.split('/')[0] : new Date().getMonth() + 1}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{
                backgroundColor: '#e8f5e9',
                borderLeft: '4px solid #2e7d32',
                height: '100%'
              }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Fee Collection for {selectedMonth ? currentMonthName : "All Months"}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="#616161">
                      Rs. {accumulatedData.totalAmount.toLocaleString()}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Accumulated Amount (Collected)
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                      Rs. {accumulatedData.accumulatedAmount.toLocaleString()}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                    {accumulatedData.count} fee record(s) {selectedMonth && `for ${currentMonthName}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{
            mt: 3,
            pt: 2,
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 2
          }}>
            {/* Collected and Pending side by side on the left */}
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flex: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Collected
                </Typography>
                <Typography variant="body1" fontWeight="600" color="#2e7d32">
                  {paidCount} / {totalFees}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Pending
                </Typography>
                <Typography variant="body1" fontWeight="600" color="#616161">
                  {unpaidCount + overdueCount}
                </Typography>
              </Box>
            </Box>

            {/* Filter and Export grouped together on the right */}
            <Box sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
               <OutlinedInput
                  placeholder="Search by name or roll number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  sx={{ minWidth: 200 }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton onClick={applyFilters} edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  label="Status Filter"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Unpaid">Unpaid</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportAll}
                size="small"
              >
                Export All
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Fees Table */}
      <Card sx={{ boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{
            p: 2,
            backgroundColor: '#1976d2',
            color: 'white',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h6" fontWeight="600">
                  Student Fee Records {selectedMonth ? `- ${currentMonthName}` : ""} {filteredFees.length > 0 && `(${filteredFees.length})`}
                </Typography>
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<DoneAllIcon />}
                    onClick={handleBulkMarkPaid}
                    disabled={selected.size === 0}
                    size="small"
                    sx={{
                      backgroundColor: selected.size > 0 ? '#4caf50' : '#e0f2e9',
                      color: selected.size > 0 ? 'white' : '#757575',
                      '&:hover': selected.size > 0 ? {
                        backgroundColor: '#388e3c',
                      } : {},
                      '&.Mui-disabled': {
                        backgroundColor: '#f5f5f5',
                        color: '#bdbdbd',
                      }
                    }}
                  >
                    Mark Paid ({selected.size})
                  </Button>

                  <Button
                    size="small"
                    onClick={filteredFees.length > 0 && selected.size === filteredFees.length ? clearSelection : selectAllOnPage}
                    sx={{ color: 'white', borderColor: 'white' }}
                    variant="outlined"
                  >
                    {filteredFees.length > 0 && selected.size === filteredFees.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#fafafa' }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.size > 0 && selected.size < filteredFees.length}
                      checked={filteredFees.length > 0 && selected.size === filteredFees.length}
                      onChange={selected.size === filteredFees.length ? clearSelection : selectAllOnPage}
                    />
                  </TableCell>
                  <TableCell><strong>Student</strong></TableCell>
                  <TableCell><strong>Class</strong></TableCell>
                  <TableCell><strong>Roll No.</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                  <TableCell><strong>Month</strong></TableCell>
                  <TableCell><strong>Due Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Payment Date</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Loading fee records...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                      <ReceiptLongIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No fee records found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {selectedMonth ? `No records for ${currentMonthName}` : (filterStatus || search ? 'Try adjusting your filters' : 'Start by generating fee challans')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFees.map((fee) => {
                    const isSelected = selected.has(fee._id);
                    const actualStatus = fee.status || "Unpaid";
                    const displayStatus = getComputedStatus(fee);
                    const isOverdue = displayStatus === "Overdue";

                    return (
                      <TableRow
                        key={fee._id}
                        hover
                        selected={isSelected}
                        sx={{
                          backgroundColor: isSelected ? '#e3f2fd' : 'inherit',
                          '&:last-child td': { borderBottom: 0 }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => toggleSelect(fee._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="500">
                            {fee.student?.name ?? "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">
                            {getReadableClassName(fee.student?.sclassName, sclassesList)}
                          </Typography>
                        </TableCell>
                        <TableCell>{fee.student?.rollNum ?? "—"}</TableCell>

                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="600">
                            {fee.amount || "—"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {fee.month || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "-"}
                            variant={isOverdue ? "filled" : "outlined"}
                            color={isOverdue ? "error" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={actualStatus}
                            onChange={(e) => handleStatusChange(fee._id, e.target.value, fee)}
                            size="small"
                            disabled={isOverdue}
                            sx={{
                              minWidth: 120,
                              backgroundColor: getStatusColor(actualStatus, theme) + '15',
                              '& .MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center',
                                color: getStatusColor(actualStatus, theme)
                              }
                            }}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <MenuItem
                                key={s}
                                value={s}
                                sx={{ color: getStatusColor(s, theme) }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getStatusIcon(s)}
                                  {s}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell>
                          {fee.paymentDate ? (
                            <Chip
                              label={new Date(fee.paymentDate).toLocaleDateString()}
                              variant="outlined"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Apply Discount">
                              <IconButton
                                onClick={() => handleDiscountClick(fee)}
                                size="small"
                                color="primary"
                                disabled={actualStatus === "Paid"}
                              >
                                <DiscountIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete record">
                              <IconButton
                                onClick={() => handleDelete(fee._id)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create single fee dialog */}
      <Dialog open={createOpen} onClose={closeCreateDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          Create Fee Record
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <TextField
            label="Student ID"
            value={newFee.student}
            onChange={(e) => setNewFee((p) => ({ ...p, student: e.target.value }))}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Amount"
            value={newFee.amount}
            onChange={(e) => setNewFee((p) => ({ ...p, amount: e.target.value }))}
            type="number"
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Due Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newFee.dueDate}
            onChange={(e) => setNewFee((p) => ({ ...p, dueDate: e.target.value }))}
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Remarks"
            value={newFee.remarks}
            onChange={(e) => setNewFee((p) => ({ ...p, remarks: e.target.value }))}
            fullWidth
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeCreateDialog}>Cancel</Button>
          <Button onClick={handleCreateSubmit} variant="contained">
            Create Fee Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk create dialog */}
      <Dialog open={bulkOpen} onClose={closeBulkDialog} fullWidth maxWidth="sm">
  <DialogTitle sx={{
    backgroundColor: '#1976d2',
    color: 'white',
    borderBottom: 1,
    borderColor: 'divider',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <Typography variant="h6" component="span">
      Generate Challans for Selected Classes
    </Typography>
    <IconButton
      onClick={closeBulkDialog}
      sx={{
        color: 'white',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }
      }}
      size="small"
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent dividers sx={{ p: 3 }}>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      Select one or more classes to create fee records for all active students with the specified amount and due date.
    </Typography>

    <FormControl fullWidth margin="normal">
      <InputLabel>Select Classes *</InputLabel>
      <Select
        label="Select Classes *"
        multiple
        value={bulkParams.classIds || []}
        onChange={(e) => {
          const value = e.target.value;
          // Handle "Select All" option
          if (value.includes('select-all')) {
            if (bulkParams.classIds?.length === sclassesList.length) {
              // If all are selected, deselect all
              setBulkParams((p) => ({ ...p, classIds: [] }));
            } else {
              // Select all classes
              setBulkParams((p) => ({ 
                ...p, 
                classIds: sclassesList.map(cls => cls._id) 
              }));
            }
          } else {
            setBulkParams((p) => ({ ...p, classIds: value }));
          }
        }}
        renderValue={(selected) => {
          if (selected.length === 0) return "-- Choose classes --";
          if (selected.length === sclassesList.length) return "All Classes Selected";
          return `${selected.length} class${selected.length > 1 ? 'es' : ''} selected`;
        }}
      >
        {/* Select All Option */}
        <MenuItem value="select-all">
          <Checkbox 
            checked={bulkParams.classIds?.length === sclassesList.length && sclassesList.length > 0}
            indeterminate={bulkParams.classIds?.length > 0 && bulkParams.classIds?.length < sclassesList.length}
          />
          <Typography fontWeight="bold" color="primary">
            Select All Classes
          </Typography>
        </MenuItem>
        
        <Divider />
        
        {/* Individual Class Options */}
        {sclassesList && sclassesList.length > 0 ? (
          sclassesList.map((sclass) => (
            <MenuItem key={sclass._id} value={sclass._id}>
              <Checkbox checked={bulkParams.classIds?.indexOf(sclass._id) > -1} />
              {getReadableClassName(sclass.sclassName)}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No classes available</MenuItem>
        )}
      </Select>
      
      {bulkParams.classIds && bulkParams.classIds.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          {bulkParams.classIds.length} class{bulkParams.classIds.length > 1 ? 'es' : ''} selected
        </Typography>
      )}
    </FormControl>

    <FormControl fullWidth margin="normal">
      <InputLabel>Month *</InputLabel>
      <Select
        label="Month *"
        value={bulkParams.month}
        onChange={(e) => setBulkParams((p) => ({ ...p, month: e.target.value }))}
      >
        <MenuItem value="">-- Select Month --</MenuItem>
        {allMonths.map((month) => (
          <MenuItem 
            key={month} 
            value={month}
            sx={month === new Date().toLocaleString('default', { month: 'long' }) ? 
              { fontWeight: 'bold', backgroundColor: '#e3f2fd' } : {}}
          >
            {month}
            {month === new Date().toLocaleString('default', { month: 'long' }) && 
              " (Current)"}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <TextField
      label="Amount per Student"
      value={bulkParams.amount}
      onChange={(e) => setBulkParams((p) => ({ ...p, amount: e.target.value }))}
      type="number"
      fullWidth
      margin="normal"
      variant="outlined"
    />
    
    <TextField
      label="Due Date"
      type="date"
      InputLabelProps={{ shrink: true }}
      value={bulkParams.dueDate}
      onChange={(e) => setBulkParams((p) => ({ ...p, dueDate: e.target.value }))}
      fullWidth
      margin="normal"
      variant="outlined"
    />
    
    <TextField
      label="Remarks (optional)"
      value={bulkParams.remarks}
      onChange={(e) => setBulkParams((p) => ({ ...p, remarks: e.target.value }))}
      fullWidth
      margin="normal"
      variant="outlined"
      multiline
      rows={2}
    />
  </DialogContent>
  <DialogActions sx={{ p: 2 }}>
    <Button onClick={closeBulkDialog}>Cancel</Button>
    <Button 
      onClick={handleBulkCreate} 
      variant="contained"
      disabled={!bulkParams.classIds || bulkParams.classIds.length === 0}
    >
      Generate Challans
    </Button>
  </DialogActions>
</Dialog>

      {/* Discount Amount Dialog */}
      <Dialog open={discountDialogOpen} onClose={() => setDiscountDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          borderBottom: 1,
          borderColor: 'divider'
        }}>
          Apply Discount
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedFeeForDiscount && (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Student:</strong> {selectedFeeForDiscount.student?.name || "—"}
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                <strong>Current Amount:</strong> Rs. {selectedFeeForDiscount.amount}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter the new discounted amount. This will replace the current fee amount. When you mark this fee as "Paid", the discounted amount will be counted in the accumulated total.
              </Typography>

              <TextField
                label="Discounted Amount *"
                value={discountedAmount}
                onChange={(e) => setDiscountedAmount(e.target.value)}
                type="number"
                fullWidth
                margin="normal"
                variant="outlined"
                placeholder="Enter discounted amount"
                autoFocus
                inputProps={{
                  min: 0,
                  max: selectedFeeForDiscount.amount,
                  step: "0.01"
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Note: This will update the fee amount. The original amount (Rs. {selectedFeeForDiscount.amount}) will be replaced.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDiscountDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDiscountSubmit} variant="contained" disabled={loadingAction}>
            {loadingAction ? <CircularProgress size={24} /> : "Apply Discount"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ open: false, message: "" })}
        message={snack.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default FinanceHome;