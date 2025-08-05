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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  Visibility,
  Payment,
  TrendingUp,
  AccountBalance,
  AttachMoney,
  FilterList,
  Refresh,
  Download,
  Search,
  CheckCircle,
  Cancel,
  Warning
} from '@mui/icons-material';
import { getAllPayoutRequests, processPayoutRequest } from '../../store/slices/adminSlice';

const PayoutRequestsManagement = () => {
  const dispatch = useDispatch();
  const { payoutRequests, loading, error } = useSelector((state) => state.admin);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    agentId: '',
    dateRange: ''
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetailsOpen, setRequestDetailsOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processData, setProcessData] = useState({
    status: 'approved',
    adminNotes: '',
    payoutReference: '',
    rejectionReason: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const params = {
      page: page + 1,
      limit: rowsPerPage,
      ...filters
    };
    dispatch(getAllPayoutRequests(params));
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

  const handleRequestDetails = (request) => {
    setSelectedRequest(request);
    setRequestDetailsOpen(true);
  };

  const handleProcessRequest = (request) => {
    setSelectedRequest(request);
    setProcessData({
      status: 'approved',
      adminNotes: '',
      payoutReference: '',
      rejectionReason: ''
    });
    setProcessDialogOpen(true);
  };

  const handleProcessSubmit = async () => {
    try {
      await dispatch(processPayoutRequest({
        requestId: selectedRequest._id,
        ...processData
      }));
      setProcessDialogOpen(false);
      setSelectedRequest(null);
      // Refresh requests
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      };
      dispatch(getAllPayoutRequests(params));
    } catch (error) {
      console.error('Process request error:', error);
    }
  };

  const handleExportRequests = () => {
    const csvData = payoutRequests?.payoutRequests?.map(request => ({
      'Agent': `${request.agent?.firstName} ${request.agent?.lastName}`,
      'Agent Email': request.agent?.email,
      'Amount': formatCurrency(request.amount),
      'Status': request.status,
      'Request Date': formatDate(request.requestDate),
      'Processed Date': request.processedDate ? formatDate(request.processedDate) : 'N/A',
      'Payment Method': request.paymentMethod,
      'Notes': request.notes || 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout_requests_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
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
      case 'approved':
        return 'info';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'approved':
        return <CheckCircle color="info" />;
      case 'pending':
        return <Warning color="warning" />;
      case 'rejected':
        return <Cancel color="error" />;
      default:
        return <Warning />;
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
        Payout Requests Management
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
                    {formatCurrency(payoutRequests?.summary?.totalAmount || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Requested
                  </Typography>
                </Box>
                <AttachMoney color="primary" />
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
                    {formatCurrency(payoutRequests?.summary?.pendingAmount || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Requests
                  </Typography>
                </Box>
                <Payment color="warning" />
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
                    {formatCurrency(payoutRequests?.summary?.approvedAmount || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Requests
                  </Typography>
                </Box>
                <AccountBalance color="info" />
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
                    {formatCurrency(payoutRequests?.summary?.completedAmount || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Payouts
                  </Typography>
                </Box>
                <TrendingUp color="success" />
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
            onClick={handleExportRequests}
            disabled={!payoutRequests?.payoutRequests?.length}
          >
            Export CSV
          </Button>
        </Box>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              placeholder="Search by agent name or email"
            />
          </Grid>
          <Grid xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} sm={6} md={4}>
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
                agentId: '',
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

      {/* Payout Requests Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agent</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Bank Details</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payoutRequests?.payoutRequests
                ?.filter(request => {
                  if (!searchTerm) return true;
                  const searchLower = searchTerm.toLowerCase();
                  return (
                    request.agent?.firstName?.toLowerCase().includes(searchLower) ||
                    request.agent?.lastName?.toLowerCase().includes(searchLower) ||
                    request.agent?.email?.toLowerCase().includes(searchLower)
                  );
                })
                .map((request) => (
                <TableRow key={request._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {request.agent?.firstName} {request.agent?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.agent?.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(request.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(request.status)}
                      <Chip
                        label={request.status}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(request.requestDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {request.agent?.bankDetails ? (
                      <Box>
                        <Typography variant="body2">
                          {request.agent.bankDetails.bankName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ****{request.agent.bankDetails.accountNumber?.slice(-4)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="error">
                        No Bank Details
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleRequestDetails(request)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {request.status === 'pending' && (
                        <Tooltip title="Process Request">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleProcessRequest(request)}
                          >
                            <Payment />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={payoutRequests?.pagination?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Request Details Dialog */}
      <Dialog
        open={requestDetailsOpen}
        onClose={() => setRequestDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Payout Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Request Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(selectedRequest.amount)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(selectedRequest.status)}
                      <Chip
                        label={selectedRequest.status}
                        color={getStatusColor(selectedRequest.status)}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Request Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedRequest.requestDate)}
                    </Typography>
                  </Box>
                  {selectedRequest.processedDate && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Processed Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedRequest.processedDate)}
                      </Typography>
                    </Box>
                  )}
                  {selectedRequest.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Notes
                      </Typography>
                      <Typography variant="body1">
                        {selectedRequest.notes}
                      </Typography>
                    </Box>
                  )}
                </Grid>
                <Grid xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Agent Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.agent?.firstName} {selectedRequest.agent?.lastName}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.agent?.email}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Bank Details
                  </Typography>
                  {selectedRequest.agent?.bankDetails ? (
                    <>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Bank Name
                        </Typography>
                        <Typography variant="body1">
                          {selectedRequest.agent.bankDetails.bankName}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Account Number
                        </Typography>
                        <Typography variant="body1">
                          ****{selectedRequest.agent.bankDetails.accountNumber?.slice(-4)}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Account Holder
                        </Typography>
                        <Typography variant="body1">
                          {selectedRequest.agent.bankDetails.accountHolderName}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <Alert severity="warning">
                      Agent has not provided bank details
                    </Alert>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Request Dialog */}
      <Dialog
        open={processDialogOpen}
        onClose={() => setProcessDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Process Payout Request</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={processData.status}
                  label="Status"
                  onChange={(e) => setProcessData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="approved">Approve</MenuItem>
                  <MenuItem value="completed">Complete</MenuItem>
                  <MenuItem value="rejected">Reject</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {processData.status === 'completed' && (
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Payout Reference"
                  value={processData.payoutReference}
                  onChange={(e) => setProcessData(prev => ({ ...prev, payoutReference: e.target.value }))}
                  placeholder="Enter payout reference number"
                />
              </Grid>
            )}
            {processData.status === 'rejected' && (
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Rejection Reason"
                  value={processData.rejectionReason}
                  onChange={(e) => setProcessData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                  placeholder="Enter reason for rejection"
                  required
                />
              </Grid>
            )}
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Admin Notes"
                multiline
                rows={3}
                value={processData.adminNotes}
                onChange={(e) => setProcessData(prev => ({ ...prev, adminNotes: e.target.value }))}
                placeholder="Add notes about this request..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProcessDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleProcessSubmit}
            disabled={!processData.status || (processData.status === 'rejected' && !processData.rejectionReason)}
          >
            Process Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayoutRequestsManagement; 