import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Stack,
} from '@mui/material';
import {
  People,
  TrendingUp,
  Payment,
  ContentCopy,
  Share,
  AccountBalance,
  History,
  PersonAdd,
  MonetizationOn,
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import {
  Tabs,
  Tab,
  AppBar,
} from '@mui/material';
import {
  getReferralStats,
  getReferralHistory,
  getCommissionHistory,
  getReferralCode,
  updateAgentProfile,
} from '../../store/slices/referralSlice';
import { createPayoutRequest } from '../../store/slices/adminSlice';
import BankDetails from './BankDetails';

const AgentDashboard = () => {
  const dispatch = useDispatch();
  const [payoutDialog, setPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [profileDialog, setProfileDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      swiftCode: '',
    },
  });
  
  const hasInitialized = useRef(false);
  const { user } = useSelector((state) => state.auth);
  const { 
    referralStats, 
    referralHistory, 
    commissionHistory, 
    referralCode, 
    loading, 
    error, 
    success 
  } = useSelector((state) => state.referral);

  useEffect(() => {
    if (user?.role === 'agent' && user?._id && !hasInitialized.current) {
      hasInitialized.current = true;
      dispatch(getReferralStats());
      dispatch(getReferralHistory());
      dispatch(getCommissionHistory());
      dispatch(getReferralCode());
    }

    // Cleanup function to reset ref when component unmounts
    return () => {
      hasInitialized.current = false;
    };
  }, [dispatch, user?.role, user?._id]);



  // Debug logging - only log when data changes significantly
  useEffect(() => {
    if (user && user.bankDetails && user.bankDetails.isVerified) {
      console.log('User Bank Details Verified:', user.bankDetails);
    }
  }, [user?.bankDetails?.isVerified]);

  useEffect(() => {
    if (referralStats && referralStats.pendingCommission > 0) {
      console.log('Pending Commission Available:', referralStats.pendingCommission);
    }
  }, [referralStats?.pendingCommission]);

  useEffect(() => {
    if (commissionHistory) {
      console.log('Commission History Data:', commissionHistory);
    }
  }, [commissionHistory]);

  const handleCopyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
    }
  };

  const handleShareReferralCode = () => {
    if (referralCode) {
      const shareUrl = `${window.location.origin}/register?ref=${referralCode}`;
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const handlePayoutRequest = () => {
    if (payoutAmount && payoutMethod) {
      dispatch(createPayoutRequest({
        amount: parseFloat(payoutAmount),
        notes: `Payout request for ${payoutAmount}`,
        commissionIds: [] // Will be populated from pending commissions
      }));
      setPayoutDialog(false);
      setPayoutAmount('');
    }
  };

  const handleUpdateProfile = () => {
    dispatch(updateAgentProfile(profileData));
    setProfileDialog(false);
  };

  const handleOpenProfileDialog = () => {
    // Load current user data into the form
    setProfileData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      country: user?.country || '',
      bankDetails: {
        accountName: user?.bankDetails?.accountHolderName || '',
        accountNumber: user?.bankDetails?.accountNumber || '',
        bankName: user?.bankDetails?.bankName || '',
        swiftCode: user?.bankDetails?.swiftCode || '',
      },
    });
    setProfileDialog(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const stats = [
    {
      title: 'Total Referrals',
      value: referralStats?.totalReferrals || 0,
      icon: <People />,
      color: 'primary.main',
    },
    {
      title: 'Total Commission',
      value: `£${referralStats?.totalCommission || 0}`,
      icon: <TrendingUp />,
      color: 'success.main',
    },
    {
      title: 'Pending Commission',
      value: `£${referralStats?.pendingCommission || 0}`,
      icon: <Payment />,
      color: 'warning.main',
    },
    {
      title: 'Paid Commission',
      value: `£${referralStats?.paidCommission || 0}`,
      icon: <AccountBalance />,
      color: 'info.main',
    },
  ];

  if (user?.role !== 'agent') {
    return (
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h4" gutterBottom>
            Become a Referral Agent
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Earn commissions by referring others to our courses. Join our referral program today!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PersonAdd />}
            onClick={() => setProfileDialog(true)}
          >
            Apply to Become an Agent
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Agent Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your referrals and track your commissions.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Action completed successfully!
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h4" component="div" sx={{ color: stat.color }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: stat.color, color: 'white' }}>
                {stat.icon}
              </Avatar>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Referral Code Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Referral Code
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              value={referralCode || (loading ? 'Loading...' : 'No referral code available')}
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{ 
                readOnly: true,
                endAdornment: loading ? <CircularProgress size={16} /> : null
              }}
            />
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={handleCopyReferralCode}
              disabled={!referralCode || loading}
            >
              Copy
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share />}
              onClick={handleShareReferralCode}
              disabled={!referralCode || loading}
            >
              Share
            </Button>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Recent Referrals */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Referrals
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {referralHistory?.slice(0, 5).map((referral) => (
                        <TableRow key={referral._id}>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 24, height: 24 }}>
                                {referral.username?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="body2">
                                {referral.username}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(referral.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={referral.status || 'Active'}
                              color="success"
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Commission History */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Commissions
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {commissionHistory?.slice(0, 5).map((commission) => (
                        <TableRow key={commission._id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              £{commission.amount}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={commission.status}
                              color={commission.status === 'paid' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(commission.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabbed Content */}
      <Paper sx={{ width: '100%', mt: 4 }}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Overview" />
            <Tab label="Bank Details" />
            <Tab label="Commission History" />
            <Tab label="Payout Requests" />
          </Tabs>
        </AppBar>

        {/* Overview Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Agent Overview
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Welcome to your agent dashboard. Use the tabs above to manage your bank details and view commission history.
            </Typography>
            
            {/* Bank Details Status */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Bank Details Status
                </Typography>
                {user?.bankDetails?.accountNumber && user?.bankDetails?.bankName ? (
                  <Box>
                    <Chip
                      label={user?.bankDetails?.isVerified ? 'Verified' : 'Pending Verification'}
                      color={user?.bankDetails?.isVerified ? 'success' : 'warning'}
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Bank: {user.bankDetails.bankName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Account: ****{user.bankDetails.accountNumber.slice(-4)}
                    </Typography>
                    {!user?.bankDetails?.isVerified && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Your bank details are pending verification by admin. You'll be able to request payouts once verified.
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <Alert severity="warning">
                    Please add your bank details in the "Bank Details" tab to receive payouts.
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            {/* Commission Status */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Commission Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Commission: £{referralStats?.pendingCommission || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Commission: £{referralStats?.totalCommission || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Paid Commission: £{referralStats?.paidCommission || 0}
                </Typography>
                {referralStats?.pendingCommission > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    You have £{referralStats.pendingCommission} in pending commissions. 
                    {user?.bankDetails?.isVerified 
                      ? ' You can request a payout once admin processes your commissions.'
                      : ' Please verify your bank details to request payouts.'
                    }
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Bank Details Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <BankDetails />
          </Box>
        )}

        {/* Commission History Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Commission History
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            ) : commissionHistory?.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Referral</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commissionHistory?.map((commission) => (
                      <TableRow key={commission._id}>
                        <TableCell>
                          <Typography variant="body1" fontWeight="medium">
                            £{commission.amount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={commission.status}
                            color={commission.status === 'paid' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {commission.payoutMethod || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(commission.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {commission.referral?.username || 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No commission history available yet.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Commissions will appear here when users purchase courses using your referral code.
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Payout Requests Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payout Requests
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Track your payout requests and their status.
            </Typography>
            <Tooltip title={
              !referralStats?.pendingCommission || referralStats?.pendingCommission <= 0 
                ? 'No pending commission available' 
                : !user?.bankDetails?.accountNumber || !user?.bankDetails?.bankName
                ? 'Please add your bank details first'
                : !user?.bankDetails?.isVerified
                ? 'Your bank details are pending verification'
                : 'Request a payout'
            }>
              <span>
                <Button
                  variant="contained"
                  startIcon={<Payment />}
                  onClick={() => setPayoutDialog(true)}
                  disabled={
                    !referralStats?.pendingCommission || 
                    referralStats?.pendingCommission <= 0 ||
                    !user?.bankDetails?.accountNumber ||
                    !user?.bankDetails?.bankName ||
                    !user?.bankDetails?.isVerified
                  }
                  sx={{ mb: 2 }}
                >
                  Request New Payout
                </Button>
              </span>
            </Tooltip>
            <Typography variant="body2" color="text.secondary">
              Pending Commission: £{referralStats?.pendingCommission || 0}
            </Typography>
            {(!user?.bankDetails?.accountNumber || !user?.bankDetails?.bankName) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Please add your bank details before requesting a payout.
              </Alert>
            )}
            {user?.bankDetails?.accountNumber && user?.bankDetails?.bankName && !user?.bankDetails?.isVerified && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Your bank details are pending verification by admin. You'll be able to request payouts once verified.
              </Alert>
            )}
          </Box>
        )}
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Tooltip title={
          !referralStats?.pendingCommission || referralStats?.pendingCommission <= 0 
            ? 'No pending commission available' 
            : !user?.bankDetails?.accountNumber || !user?.bankDetails?.bankName
            ? 'Please add your bank details first'
            : !user?.bankDetails?.isVerified
            ? 'Your bank details are pending verification'
            : 'Request a payout'
        }>
          <span>
            <Button
              variant="contained"
              startIcon={<Payment />}
              onClick={() => setPayoutDialog(true)}
              disabled={
                !referralStats?.pendingCommission || 
                referralStats?.pendingCommission <= 0 ||
                !user?.bankDetails?.accountNumber ||
                !user?.bankDetails?.bankName ||
                !user?.bankDetails?.isVerified
              }
            >
              Request Payout
            </Button>
          </span>
        </Tooltip>
        <Button
          variant="outlined"
          startIcon={<History />}
          onClick={handleOpenProfileDialog}
        >
          Update Profile
        </Button>
      </Box>

      {/* Payout Dialog */}
      <Dialog open={payoutDialog} onClose={() => setPayoutDialog(false)}>
        <DialogTitle>Request Payout</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Payout Amount"
            type="number"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            required
            InputProps={{
              startAdornment: '£',
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Payout Method</InputLabel>
            <Select
              value={payoutMethod}
              label="Payout Method"
              onChange={(e) => setPayoutMethod(e.target.value)}
            >
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="stripe_payout">Stripe Payout</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayoutDialog(false)}>Cancel</Button>
          <Button onClick={handlePayoutRequest} variant="contained">
            Request Payout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileDialog} onClose={() => setProfileDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Agent Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={profileData.country}
                onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Bank Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Name"
                value={profileData.bankDetails.accountName}
                onChange={(e) => setProfileData({
                  ...profileData,
                  bankDetails: { ...profileData.bankDetails, accountName: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Number"
                value={profileData.bankDetails.accountNumber}
                onChange={(e) => setProfileData({
                  ...profileData,
                  bankDetails: { ...profileData.bankDetails, accountNumber: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                value={profileData.bankDetails.bankName}
                onChange={(e) => setProfileData({
                  ...profileData,
                  bankDetails: { ...profileData.bankDetails, bankName: e.target.value }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Swift Code"
                value={profileData.bankDetails.swiftCode}
                onChange={(e) => setProfileData({
                  ...profileData,
                  bankDetails: { ...profileData.bankDetails, swiftCode: e.target.value }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant="contained">
            Update Profile
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AgentDashboard; 