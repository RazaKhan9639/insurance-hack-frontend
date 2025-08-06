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
  Avatar,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
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
  Send,
  CheckCircle,
  ExpandMore,
  AccountBox,
  CreditCard,
  Business,
  Security
} from '@mui/icons-material';
import { getAllCommissions, processManualPayout, processBankTransfer, updateCommissionStatus, processBulkPayout } from '../../store/slices/adminSlice';

const CommissionManagement = () => {
  const dispatch = useDispatch();
  const { commissions, loading, error } = useSelector((state) => state.admin);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: '',
    agentId: '',
    dateRange: ''
  });
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [commissionDetailsOpen, setCommissionDetailsOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutData, setPayoutData] = useState({
    agentId: '',
    amount: '',
    paymentMethod: 'bank_transfer',
    notes: ''
  });
  const [bankTransferDialogOpen, setBankTransferDialogOpen] = useState(false);
  const [bankTransferData, setBankTransferData] = useState({
    agentId: '',
    agentName: '',
    amount: '',
    notes: '',
    transferReference: ''
  });
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New states for enhanced functionality
  const [selectedCommissions, setSelectedCommissions] = useState([]);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [individualStatusDialogOpen, setIndividualStatusDialogOpen] = useState(false);
  const [commissionForStatusUpdate, setCommissionForStatusUpdate] = useState(null);
  const [statusUpdateData, setStatusUpdateData] = useState({
    status: 'paid',
    payoutMethod: 'manual',
    payoutNotes: ''
  });

  useEffect(() => {
    const params = {
      page: page + 1,
      limit: rowsPerPage,
      ...filters
    };
    dispatch(getAllCommissions(params));
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

  const handleCommissionDetails = (commission) => {
    setSelectedCommission(commission);
    setCommissionDetailsOpen(true);
  };

  const handlePayout = (agentId, pendingAmount) => {
    setPayoutData({
      agentId,
      amount: pendingAmount,
      paymentMethod: 'bank_transfer',
      notes: ''
    });
    setPayoutDialogOpen(true);
  };

  const handleProcessPayout = async () => {
    try {
      await dispatch(processManualPayout(payoutData));
      setPayoutDialogOpen(false);
      setPayoutData({ agentId: '', amount: '', paymentMethod: 'bank_transfer', notes: '' });
      // Refresh commissions
      dispatch(getAllCommissions({ ...filters, page: page + 1, limit: rowsPerPage }));
    } catch (error) {
      console.error('Payout error:', error);
    }
  };

  const handleBankTransfer = (agent) => {
    setSelectedAgent(agent);
    setBankTransferData({
      agentId: agent._id,
      agentName: `${agent.firstName} ${agent.lastName}`,
      amount: '',
      notes: '',
      transferReference: ''
    });
    setBankTransferDialogOpen(true);
  };

  const handleProcessBankTransfer = async () => {
    try {
      await dispatch(processBankTransfer(bankTransferData));
      setBankTransferDialogOpen(false);
      setBankTransferData({ agentId: '', agentName: '', amount: '', notes: '', transferReference: '' });
      setSelectedAgent(null);
      // Refresh commissions
      dispatch(getAllCommissions({ ...filters, page: page + 1, limit: rowsPerPage }));
    } catch (error) {
      console.error('Bank transfer error:', error);
    }
  };

  // New functions for enhanced functionality
  const handleCommissionSelection = (commissionId, checked) => {
    if (checked) {
      setSelectedCommissions(prev => [...prev, commissionId]);
    } else {
      setSelectedCommissions(prev => prev.filter(id => id !== commissionId));
    }
  };

  const handleSelectAllCommissions = (checked) => {
    if (checked) {
      const pendingCommissionIds = commissions?.commissions
        ?.filter(commission => commission.status === 'pending')
        ?.map(commission => commission._id) || [];
      setSelectedCommissions(pendingCommissionIds);
    } else {
      setSelectedCommissions([]);
    }
  };

  const handleBulkMarkAsPaid = async () => {
    try {
      await dispatch(processBulkPayout({
        commissionIds: selectedCommissions,
        payoutMethod: 'manual',
        payoutNotes: 'Bulk manual transfer'
      }));
      setBulkActionDialogOpen(false);
      setSelectedCommissions([]);
      // Refresh commissions
      dispatch(getAllCommissions({ ...filters, page: page + 1, limit: rowsPerPage }));
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  const handleIndividualStatusUpdate = (commission) => {
    setCommissionForStatusUpdate(commission);
    setStatusUpdateData({
      status: 'paid',
      payoutMethod: 'manual',
      payoutNotes: ''
    });
    setIndividualStatusDialogOpen(true);
  };

  const handleUpdateIndividualStatus = async () => {
    try {
      await dispatch(updateCommissionStatus({
        commissionId: commissionForStatusUpdate._id,
        ...statusUpdateData
      }));
      setIndividualStatusDialogOpen(false);
      setCommissionForStatusUpdate(null);
      // Refresh commissions
      dispatch(getAllCommissions({ ...filters, page: page + 1, limit: rowsPerPage }));
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const handleExportCommissions = () => {
    const csvData = commissions?.commissions?.map(commission => ({
      'Agent': `${commission.agent?.firstName} ${commission.agent?.lastName}`,
      'Agent Email': commission.agent?.email,
      'Referral': `${commission.referral?.firstName} ${commission.referral?.lastName}`,
      'Amount': formatCurrency(commission.amount),
      'Status': commission.status,
      'Payment Method': commission.payoutMethod || 'N/A',
      'Date': formatDate(commission.createdAt),
      'Paid Date': commission.paidAt ? formatDate(commission.paidAt) : 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions_${new Date().toISOString().split('T')[0]}.csv`;
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
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
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
        Commission Management
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
                    {formatCurrency(commissions?.summary?.totalCommission || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Commission
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
                    {formatCurrency(commissions?.summary?.pendingCommission || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Commission
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
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(commissions?.summary?.paidCommission || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paid Commission
                  </Typography>
                </Box>
                <AccountBalance color="success" />
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
                    {commissions?.summary?.totalCommissions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Commissions
                  </Typography>
                </Box>
                <TrendingUp color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Agent Summary with Enhanced Bank Details */}
      {commissions?.agentSummary && commissions.agentSummary.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Agent Commission Summary
          </Typography>
          <Grid container spacing={2}>
            {commissions.agentSummary.map((agent, index) => (
              <Grid xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {agent.agent.firstName} {agent.agent.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {agent.agent.email}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Total: {formatCurrency(agent.totalCommission)}
                      </Typography>
                      <Typography variant="body2" color="warning.main">
                        Pending: {formatCurrency(agent.pendingCommission)}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        Paid: {formatCurrency(agent.paidCommission)}
                      </Typography>
                    </Box>
                    
                    {/* Enhanced Bank Details Section */}
                    {agent.agent.bankDetails && (
                      <Accordion sx={{ mt: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBox fontSize="small" />
                            <Typography variant="body2">Bank Details</Typography>
                            <Chip
                              label={agent.agent.bankDetails.isVerified ? 'Verified' : 'Pending'}
                              color={agent.agent.bankDetails.isVerified ? 'success' : 'warning'}
                              size="small"
                            />
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack spacing={1}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Bank Name
                              </Typography>
                              <Typography variant="body2">
                                {agent.agent.bankDetails.bankName}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Account Holder
                              </Typography>
                              <Typography variant="body2">
                                {agent.agent.bankDetails.accountHolderName}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Account Number
                              </Typography>
                              <Typography variant="body2" fontFamily="monospace">
                                ****{agent.agent.bankDetails.accountNumber?.slice(-4)}
                              </Typography>
                            </Box>
                            {agent.agent.bankDetails.routingNumber && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Routing Number
                                </Typography>
                                <Typography variant="body2" fontFamily="monospace">
                                  {agent.agent.bankDetails.routingNumber}
                                </Typography>
                              </Box>
                            )}
                            {agent.agent.bankDetails.swiftCode && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  SWIFT Code
                                </Typography>
                                <Typography variant="body2" fontFamily="monospace">
                                  {agent.agent.bankDetails.swiftCode}
                                </Typography>
                              </Box>
                            )}
                            {agent.agent.bankDetails.iban && (
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  IBAN
                                </Typography>
                                <Typography variant="body2" fontFamily="monospace">
                                  {agent.agent.bankDetails.iban}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    )}
                    
                    {agent.pendingCommission > 0 && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Send />}
                          onClick={() => handlePayout(agent.agent._id, agent.pendingCommission)}
                        >
                          Process Payout
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Payment />}
                          onClick={() => handleBankTransfer(agent.agent)}
                          disabled={!agent.agent.bankDetails?.isVerified}
                        >
                          Bank Transfer
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Filters
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedCommissions.length > 0 && (
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={() => setBulkActionDialogOpen(true)}
              >
                Mark {selectedCommissions.length} as Paid
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportCommissions}
              disabled={!commissions?.commissions?.length}
            >
              Export CSV
            </Button>
          </Box>
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
              placeholder="Search by agent or referral name"
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
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
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
              setSelectedCommissions([]);
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Commissions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedCommissions.length === (commissions?.commissions?.filter(c => c.status === 'pending')?.length || 0)}
                    indeterminate={selectedCommissions.length > 0 && selectedCommissions.length < (commissions?.commissions?.filter(c => c.status === 'pending')?.length || 0)}
                    onChange={(e) => handleSelectAllCommissions(e.target.checked)}
                  />
                </TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Referral</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commissions?.commissions
                ?.filter(commission => {
                  if (!searchTerm) return true;
                  const searchLower = searchTerm.toLowerCase();
                  return (
                    commission.agent?.firstName?.toLowerCase().includes(searchLower) ||
                    commission.agent?.lastName?.toLowerCase().includes(searchLower) ||
                    commission.agent?.email?.toLowerCase().includes(searchLower) ||
                    commission.referral?.firstName?.toLowerCase().includes(searchLower) ||
                    commission.referral?.lastName?.toLowerCase().includes(searchLower)
                  );
                })
                .map((commission) => (
                <TableRow key={commission._id}>
                  <TableCell padding="checkbox">
                    {commission.status === 'pending' && (
                      <Checkbox
                        checked={selectedCommissions.includes(commission._id)}
                        onChange={(e) => handleCommissionSelection(commission._id, e.target.checked)}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {commission.agent?.firstName} {commission.agent?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {commission.agent?.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {commission.referral?.firstName} {commission.referral?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {commission.referral?.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {formatCurrency(commission.payment?.amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {commission.payment?.course?.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(commission.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={commission.status}
                      color={getStatusColor(commission.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(commission.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleCommissionDetails(commission)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      {commission.status === 'pending' && (
                        <Tooltip title="Mark as Paid">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleIndividualStatusUpdate(commission)}
                          >
                            <CheckCircle />
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
          count={commissions?.pagination?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Commission Details Dialog */}
      <Dialog
        open={commissionDetailsOpen}
        onClose={() => setCommissionDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Commission Details</DialogTitle>
        <DialogContent>
          {selectedCommission && (
            <Box>
              <Grid container spacing={3}>
                <Grid xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Commission Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(selectedCommission.amount)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedCommission.status}
                      color={getStatusColor(selectedCommission.status)}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Commission Rate
                    </Typography>
                    <Typography variant="body1">
                      {selectedCommission.commissionRate * 100}%
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Date Created
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedCommission.createdAt)}
                    </Typography>
                  </Box>
                  {selectedCommission.paidAt && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Paid Date
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedCommission.paidAt)}
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
                      {selectedCommission.agent?.firstName} {selectedCommission.agent?.lastName}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedCommission.agent?.email}
                    </Typography>
                  </Box>
                  
                  {/* Enhanced Bank Details in Commission Details */}
                  {selectedCommission.agent?.bankDetails && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Bank Details
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Bank Name
                        </Typography>
                        <Typography variant="body1">
                          {selectedCommission.agent.bankDetails.bankName}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Account Holder
                        </Typography>
                        <Typography variant="body1">
                          {selectedCommission.agent.bankDetails.accountHolderName}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Account Number
                        </Typography>
                        <Typography variant="body1" fontFamily="monospace">
                          ****{selectedCommission.agent.bankDetails.accountNumber?.slice(-4)}
                        </Typography>
                      </Box>
                      {selectedCommission.agent.bankDetails.routingNumber && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Routing Number
                          </Typography>
                          <Typography variant="body1" fontFamily="monospace">
                            {selectedCommission.agent.bankDetails.routingNumber}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={selectedCommission.agent.bankDetails.isVerified ? 'Verified' : 'Not Verified'}
                          color={selectedCommission.agent.bankDetails.isVerified ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    </>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Referral Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Referred User
                    </Typography>
                    <Typography variant="body1">
                      {selectedCommission.referral?.firstName} {selectedCommission.referral?.lastName}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Referred User Email
                    </Typography>
                    <Typography variant="body1">
                      {selectedCommission.referral?.email}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Payment Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Amount
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(selectedCommission.payment?.amount)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Course
                    </Typography>
                    <Typography variant="body1">
                      {selectedCommission.payment?.course?.title}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommissionDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payout Dialog */}
      <Dialog
        open={payoutDialogOpen}
        onClose={() => setPayoutDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Process Payout</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={payoutData.amount}
                onChange={(e) => setPayoutData(prev => ({ ...prev, amount: e.target.value }))}
                InputProps={{
                  startAdornment: <Typography>£</Typography>
                }}
              />
            </Grid>
            <Grid xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={payoutData.paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPayoutData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="stripe_payout">Stripe Payout</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={payoutData.notes}
                onChange={(e) => setPayoutData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add notes about this payout..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayoutDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleProcessPayout}
            disabled={!payoutData.amount || !payoutData.paymentMethod}
          >
            Process Payout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bank Transfer Dialog */}
      <Dialog
        open={bankTransferDialogOpen}
        onClose={() => setBankTransferDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Process Bank Transfer</DialogTitle>
        <DialogContent>
          {selectedAgent && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid xs={12}>
                <Typography variant="h6" gutterBottom>
                  Agent: {bankTransferData.agentName}
                </Typography>
              </Grid>
              
              {selectedAgent.bankDetails ? (
                <>
                  <Grid xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Bank Name"
                      value={selectedAgent.bankDetails.bankName || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Account Number"
                      value={`****${selectedAgent.bankDetails.accountNumber?.slice(-4) || ''}`}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Account Holder"
                      value={selectedAgent.bankDetails.accountHolderName || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Routing Number"
                      value={selectedAgent.bankDetails.routingNumber || ''}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid xs={12}>
                    <Chip
                      label={selectedAgent.bankDetails.isVerified ? 'Verified' : 'Not Verified'}
                      color={selectedAgent.bankDetails.isVerified ? 'success' : 'warning'}
                      size="small"
                    />
                  </Grid>
                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      label="Transfer Amount"
                      type="number"
                      value={bankTransferData.amount}
                      onChange={(e) => setBankTransferData(prev => ({ ...prev, amount: e.target.value }))}
                      InputProps={{
                        startAdornment: <Typography>$</Typography>
                      }}
                      required
                    />
                  </Grid>
                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      label="Transfer Reference"
                      value={bankTransferData.transferReference}
                      onChange={(e) => setBankTransferData(prev => ({ ...prev, transferReference: e.target.value }))}
                      placeholder="Bank transfer reference number"
                    />
                  </Grid>
                  <Grid xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={3}
                      value={bankTransferData.notes}
                      onChange={(e) => setBankTransferData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add notes about this transfer..."
                    />
                  </Grid>
                </>
              ) : (
                <Grid xs={12}>
                  <Alert severity="warning">
                    This agent has not provided bank details yet.
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBankTransferDialogOpen(false)}>
            Cancel
          </Button>
          {selectedAgent?.bankDetails?.isVerified && (
            <Button
              variant="contained"
              onClick={handleProcessBankTransfer}
              disabled={!bankTransferData.amount || parseFloat(bankTransferData.amount) <= 0}
            >
              Process Bank Transfer
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog
        open={bulkActionDialogOpen}
        onClose={() => setBulkActionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Bulk Mark as Paid</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to mark {selectedCommissions.length} commission(s) as paid?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action will update the status of all selected commissions to "paid" and record them as manual transfers.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleBulkMarkAsPaid}
          >
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>

      {/* Individual Status Update Dialog */}
      <Dialog
        open={individualStatusDialogOpen}
        onClose={() => setIndividualStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Commission Status</DialogTitle>
        <DialogContent>
          {commissionForStatusUpdate && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid xs={12}>
                <Typography variant="body1" gutterBottom>
                  Commission: {formatCurrency(commissionForStatusUpdate.amount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Agent: {commissionForStatusUpdate.agent?.firstName} {commissionForStatusUpdate.agent?.lastName}
                </Typography>
              </Grid>
              <Grid xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusUpdateData.status}
                    label="Status"
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={statusUpdateData.payoutMethod}
                    label="Payment Method"
                    onChange={(e) => setStatusUpdateData(prev => ({ ...prev, payoutMethod: e.target.value }))}
                  >
                    <MenuItem value="manual">Manual Transfer</MenuItem>
                    <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    <MenuItem value="stripe_payout">Stripe Payout</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={statusUpdateData.payoutNotes}
                  onChange={(e) => setStatusUpdateData(prev => ({ ...prev, payoutNotes: e.target.value }))}
                  placeholder="Add notes about this status update..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIndividualStatusDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateIndividualStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommissionManagement; 