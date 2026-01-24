import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentFees } from "../../redux/feeRelated/feeHandle";
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
  Chip,
  CircularProgress,
  Avatar,
  Divider,
  LinearProgress,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidIcon from "@mui/icons-material/Paid";
import PendingIcon from "@mui/icons-material/Pending";
import WarningIcon from "@mui/icons-material/Warning";
import ScrollToTop from "../../components/ScrollToTop";

const getStatusColor = (status) => {
  switch (status) {
    case "Paid":
      return "success";
    case "Unpaid":
      return "warning";
    case "Overdue":
      return "error";
    default:
      return "default";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Paid":
      return <PaidIcon />;
    case "Unpaid":
      return <PendingIcon />;
    case "Overdue":
      return <WarningIcon />;
    default:
      return <PendingIcon />;
  }
};

const StudentFeesDashboard = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const { studentFees = [], loading, error } = useSelector(
    (state) => state.fee
  ) || {};

  useEffect(() => {
    if (currentUser?._id) {
      dispatch(fetchStudentFees(currentUser._id));
    }
  }, [dispatch, currentUser]);

  // Calculate summary
  const totalFees = studentFees.length;
  const paidFees = studentFees.filter((f) => f.status === "Paid").length;
  const unpaidFees = studentFees.filter((f) => f.status === "Unpaid").length;
  const overdueFees = studentFees.filter((f) => f.status === "Overdue").length;

  const totalAmount = studentFees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const paidAmount = studentFees
    .filter((f) => f.status === "Paid")
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const paymentPercentage =
    totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <>
      <ScrollToTop />
      <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar sx={{ bgcolor: "black", mr: 2, width: 56, height: 56 }}>
              <AccountBalanceWalletIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="black">
                My Fees
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Track your monthly fees and payments
              </Typography>
            </Box>
          </Box>
          <Divider />
        </Box>

        {error && (
          <Box sx={{ mb: 2, p: 2, backgroundColor: "#ffebee", borderRadius: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {/* Summary Cards - Blue/White with status colors */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                bgcolor: "black",
                color: "white",
                boxShadow: 2,
                border: "1px solid",
                borderColor: "primary.dark"
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {totalFees}
                    </Typography>
                    <Typography variant="body2">
                      Total Fees
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                bgcolor: "white",
                boxShadow: 2,
                border: "2px solid",
                borderColor: "success.main"
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PaidIcon sx={{ fontSize: 40, mr: 2, color: "success.main" }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {paidFees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Paid
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                bgcolor: "white",
                boxShadow: 2,
                border: "2px solid",
                borderColor: "grey.400"
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PendingIcon sx={{ fontSize: 40, mr: 2, color: "grey.600" }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="grey.700">
                      {unpaidFees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unpaid
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                bgcolor: "white",
                boxShadow: 2,
                border: "2px solid",
                borderColor: "error.main"
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <WarningIcon sx={{ fontSize: 40, mr: 2, color: "error.main" }} />
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="error.main">
                      {overdueFees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overdue
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>



        {/* Fees Table */}
        <Card sx={{ boxShadow: 2, bgcolor: "white" }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                p: 2,
                backgroundColor: "Black",
                color: "white",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
            >
              <Typography variant="h6" fontWeight="600">
                Monthly Fee Records {studentFees.length > 0 && `(${studentFees.length})`}
              </Typography>
            </Box>

            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>
                      <strong>Month</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Amount</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Due Date</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Payment Date</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Remarks</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          Loading your fees...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : studentFees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <AccountBalanceWalletIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No fee records found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Your fees will appear here once created
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    [...studentFees]
                      .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
                      .map((fee) => (
                        <TableRow key={fee._id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="500">
                              {fee.month || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3 }}>
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              color="primary.main"
                            >
                              {fee.amount || "—"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : "-"}
                              variant="outlined"
                              size="small"
                              sx={{ borderColor: "grey.400", color: "text.primary" }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fee.status}
                              icon={getStatusIcon(fee.status)}
                              color={getStatusColor(fee.status)}
                              variant="filled"
                              size="small"
                            />
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
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fee.remarks || "-"}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default StudentFeesDashboard;