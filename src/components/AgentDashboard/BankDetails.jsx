import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  AccountBalance,
  Warning,
  CheckCircle,
  Edit
} from '@mui/icons-material';
import { updateBankDetails } from '../../store/slices/authSlice';

const BankDetails = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankName: '',
    routingNumber: '',
    accountHolderName: '',
    swiftCode: '',
    iban: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.bankDetails) {
      setFormData({
        accountNumber: user.bankDetails.accountNumber || '',
        bankName: user.bankDetails.bankName || '',
        routingNumber: user.bankDetails.routingNumber || '',
        accountHolderName: user.bankDetails.accountHolderName || '',
        swiftCode: user.bankDetails.swiftCode || '',
        iban: user.bankDetails.iban || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateBankDetails(formData));
      setSuccess('Bank details updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error updating bank details:', error);
    }
  };

  const hasBankDetails = user?.bankDetails?.accountNumber && user?.bankDetails?.bankName;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Bank Details
      </Typography>
      
      {!hasBankDetails && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning />
            <Typography>
              Please update your bank details to receive commission payouts. 
              Your bank information is required for processing payments.
            </Typography>
          </Box>
        </Alert>
      )}

      {hasBankDetails && !isEditing && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Current Bank Details
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {user.bankDetails.isVerified ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="Verified"
                    color="success"
                    size="small"
                  />
                ) : (
                  <Chip
                    label="Pending Verification"
                    color="warning"
                    size="small"
                  />
                )}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              </Box>
            </Box>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Bank Name
                </Typography>
                <Typography variant="body1">
                  {user.bankDetails.bankName}
                </Typography>
              </Grid>
              <Grid xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Account Holder
                </Typography>
                <Typography variant="body1">
                  {user.bankDetails.accountHolderName}
                </Typography>
              </Grid>
              <Grid xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Account Number
                </Typography>
                <Typography variant="body1">
                  ****{user.bankDetails.accountNumber.slice(-4)}
                </Typography>
              </Grid>
              {user.bankDetails.routingNumber && (
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Routing Number
                  </Typography>
                  <Typography variant="body1">
                    {user.bankDetails.routingNumber}
                  </Typography>
                </Grid>
              )}
              {user.bankDetails.swiftCode && (
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    SWIFT Code
                  </Typography>
                  <Typography variant="body1">
                    {user.bankDetails.swiftCode}
                  </Typography>
                </Grid>
              )}
              {user.bankDetails.iban && (
                <Grid xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    IBAN
                  </Typography>
                  <Typography variant="body1">
                    {user.bankDetails.iban}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {(isEditing || !hasBankDetails) && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {hasBankDetails ? 'Update Bank Details' : 'Add Bank Details'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Holder Name"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Number"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Routing Number (Optional)"
                  name="routingNumber"
                  value={formData.routingNumber}
                  onChange={handleInputChange}
                  helperText="Required for US bank accounts"
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SWIFT Code (Optional)"
                  name="swiftCode"
                  value={formData.swiftCode}
                  onChange={handleInputChange}
                  helperText="International bank transfer code"
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="IBAN (Optional)"
                  name="iban"
                  value={formData.iban}
                  onChange={handleInputChange}
                  helperText="International Bank Account Number"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <AccountBalance />}
              >
                {loading ? 'Updating...' : 'Save Bank Details'}
              </Button>
              {hasBankDetails && (
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </form>
        </Paper>
      )}

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Security Note:</strong> Your bank details are encrypted and stored securely. 
          We only use this information to process commission payouts. 
          Your account number is partially masked for security.
        </Typography>
      </Alert>
    </Box>
  );
};

export default BankDetails; 