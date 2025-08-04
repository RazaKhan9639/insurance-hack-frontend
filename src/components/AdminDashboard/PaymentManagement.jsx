import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Visibility,
  Receipt,
  TrendingUp,
  AccountBalance,
  Payment as PaymentIcon,
  FilterList,
  Refresh,
  Download,
  Search
} from '@mui/icons-material';
import { getAllPayments } from '../../store/slices/adminSlice';

const PaymentManagement = () => {
  const dispatch = useDispatch();
  const { payments, loading, error } = useSelector((state) => state.admin);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    referral: '',
    agentId: '',
    courseId: '',
    dateRange: ''
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(getAllPayments({ ...filters, page: page + 1, limit: rowsPerPage }));
  }, [dispatch, filters, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const handlePaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setPaymentDetailsOpen(true);
  };

  const handleExportPayments = () => {
    const csvData = payments?.payments?.map(payment => ({
      'Transaction ID': payment.transactionId,
      'User': `${payment.user?.firstName} ${payment.user?.lastName}`,
      'Email': payment.user?.email,
      'Course': payment.course?.title,
      'Amount': formatCurrency(payment.amount),
      'Status': payment.status,
      'Referral Agent': payment.referralAgent ? `${payment.referralAgent.firstName} ${payment.referralAgent.lastName}` : 'Direct',
      'Commission': payment.commission ? formatCurrency(payment.commission.amount) : 'N/A',
      'Date': formatDate(payment.createdAt)
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return `£${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Payment Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(payments?.summary?.totalAmount || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
                <PaymentIcon color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="success.main">
                    {payments?.summary?.totalPayments || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Payments
                  </Typography>
                </Box>
                <Receipt color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="info.main">
                    {payments?.summary?.referralPayments || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Referral Payments
                  </Typography>
                </Box>
                <TrendingUp color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" color="warning.main">
                    {formatCurrency(payments?.summary?.referralAmount || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Referral Revenue
                  </Typography>
                </Box>
                <AccountBalance color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Filters
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportPayments}
            disabled={!payments?.payments?.length}
          >
            Export CSV
          </Button>
        </Box>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              placeholder="Search by user, course, or transaction ID"
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Referral</InputLabel>
              <Select
                value={filters.referral}
                label="Referral"
                onChange={(e) => handleFilterChange('referral', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Referral Payments</MenuItem>
                <MenuItem value="false">Direct Payments</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filters.dateRange}
                label="Date Range"
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <MenuItem value="">All Time</MenuItem>
                <MenuItem value="last7days">Last 7 Days</MenuItem>
                <MenuItem value="last30days">Last 30 Days</MenuItem>
                <MenuItem value="last90days">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setFilters({
                status: '',
                referral: '',
                agentId: '',
                courseId: '',
                dateRange: ''
              });
              setSearchTerm('');
              setPage(0);
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Payments Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Referral Agent</TableCell>
                <TableCell>Commission</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments?.payments
                ?.filter(payment => {
                  if (!searchTerm) return true;
                  const searchLower = searchTerm.toLowerCase();
                  return (
                    payment.user?.firstName?.toLowerCase().includes(searchLower) ||
                    payment.user?.lastName?.toLowerCase().includes(searchLower) ||
                    payment.user?.email?.toLowerCase().includes(searchLower) ||
                    payment.course?.title?.toLowerCase().includes(searchLower) ||
                    payment.transactionId?.toLowerCase().includes(searchLower)
                  );
                })
                .map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {payment.user?.firstName} {payment.user?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.user?.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payment.course?.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(payment.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {payment.referralAgent ? (
                      <Box>
                        <Typography variant="body2">
                          {payment.referralAgent.firstName} {payment.referralAgent.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payment.referralAgent.commissionRate}% commission
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Direct
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {payment.commission ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(payment.commission.amount)}
                        </Typography>
                        <Chip
                          label={payment.commission.status}
                          color={getStatusColor(payment.commission.status)}
                          size="small"
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(payment.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handlePaymentDetails(payment)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={payments?.pagination?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Payment Details Dialog */}
      <Dialog
        open={paymentDetailsOpen}
        onClose={() => setPaymentDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box>
              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Payment Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Transaction ID
                    </Typography>
                    <Typography variant="body1">
                      {selectedPayment.transactionId}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(selectedPayment.amount)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedPayment.status}
                      color={getStatusColor(selectedPayment.status)}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedPayment.createdAt)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    User Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {selectedPayment.user?.firstName} {selectedPayment.user?.lastName}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedPayment.user?.email}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Course
                    </Typography>
                    <Typography variant="body1">
                      {selectedPayment.course?.title}
                    </Typography>
                  </Box>
                  {selectedPayment.referralAgent && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Referral Information
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Referral Agent
                        </Typography>
                        <Typography variant="body1">
                          {selectedPayment.referralAgent.firstName} {selectedPayment.referralAgent.lastName}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Commission Rate
                        </Typography>
                        <Typography variant="body1">
                          {selectedPayment.referralAgent.commissionRate}%
                        </Typography>
                      </Box>
                      {selectedPayment.commission && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Commission Amount
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {formatCurrency(selectedPayment.commission.amount)}
                          </Typography>
                          <Chip
                            label={selectedPayment.commission.status}
                            color={getStatusColor(selectedPayment.commission.status)}
                            size="small"
                          />
                        </Box>
                      )}
                    </>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentManagement; 