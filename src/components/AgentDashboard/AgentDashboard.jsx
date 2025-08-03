import React, { useEffect, useState } from 'react';
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
import {
  getReferralStats,
  getReferralHistory,
  getCommissionHistory,
  getReferralCode,
  requestPayout,
  updateAgentProfile,
} from '../../store/slices/referralSlice';

const AgentDashboard = () => {
  const dispatch = useDispatch();
  const [payoutDialog, setPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('bank_transfer');
  const [profileDialog, setProfileDialog] = useState(false);
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
    if (user?.role === 'agent') {
      dispatch(getReferralStats());
      dispatch(getReferralHistory());
      dispatch(getCommissionHistory());
      dispatch(getReferralCode());
    }
  }, [dispatch, user]);

  // Debug logging
  useEffect(() => {
    console.log('Referral Code State:', referralCode);
    console.log('Referral Stats State:', referralStats);
    console.log('Referral History State:', referralHistory);
  }, [referralCode, referralStats, referralHistory]);

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
      dispatch(requestPayout({
        amount: parseFloat(payoutAmount),
        payoutMethod,
      }));
      setPayoutDialog(false);
      setPayoutAmount('');
    }
  };

  const handleUpdateProfile = () => {
    dispatch(updateAgentProfile(profileData));
    setProfileDialog(false);
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
                                {referral.firstName?.[0] || referral.username?.[0]}
                              </Avatar>
                              <Typography variant="body2">
                                {referral.firstName} {referral.lastName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {new Date(referral.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={referral.hasPurchased ? 'Purchased' : 'Registered'}
                              color={referral.hasPurchased ? 'success' : 'default'}
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

        {/* Recent Commissions */}
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
                        <TableCell>Referral</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {commissionHistory?.slice(0, 5).map((commission) => (
                        <TableRow key={commission._id}>
                          <TableCell>
                            <Typography variant="body2">
                              {commission.referral?.firstName} {commission.referral?.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="success.main">
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

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Payment />}
          onClick={() => setPayoutDialog(true)}
          disabled={!referralStats?.pendingCommission || referralStats?.pendingCommission <= 0}
        >
          Request Payout
        </Button>
        <Button
          variant="outlined"
          startIcon={<History />}
          onClick={() => setProfileDialog(true)}
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