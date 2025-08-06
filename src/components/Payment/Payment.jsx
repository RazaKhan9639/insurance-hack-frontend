import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Badge,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CreditCard,
  CheckCircle,
  School,
  Security,
  AccessTime,
  Star,
  Lock,
  Receipt,
  Shield,
  VerifiedUser,
  LocalShipping,
  Support,
  ArrowBack,
  Refresh,
  Info,
  CheckCircleOutline,
  ErrorOutline,
} from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, confirmPayment } from '../../store/slices/paymentSlice';
import { fetchCourses, getEnrolledCourses } from '../../store/slices/courseSlice';
import { getCurrentUser } from '../../store/slices/authSlice';

// Initialize Stripe - Replace with your actual publishable key
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key';
const stripePromise = stripeKey !== 'pk_test_your_publishable_key' ? loadStripe(stripeKey) : null;

const PaymentForm = ({ course, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Payment system is not configured. Please contact support.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const paymentIntentResult = await dispatch(createPaymentIntent({
        courseId: course._id,
      }));

      if (paymentIntentResult.error) {
        setError(paymentIntentResult.error);
        setLoading(false);
        return;
      }

      const { clientSecret } = paymentIntentResult.payload.data;

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${course.title} Purchase`,
          },
        },
      });

      if (confirmError) {
        setError(confirmError.message);
        onError && onError(confirmError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Call manual payment confirmation
        console.log('Payment succeeded, confirming with backend...');
        const confirmResult = await dispatch(confirmPayment({
          paymentIntentId: paymentIntent.id,
          courseId: course._id
        }));
        
        if (confirmResult.error) {
          const errorMsg = 'Payment succeeded but confirmation failed. Please contact support.';
          setError(errorMsg);
          onError && onError(errorMsg);
        } else {
          setSuccess('Payment confirmed! Redirecting to dashboard...');
          setTimeout(() => {
            onSuccess(paymentIntent);
          }, 1500);
        }
      }

      setLoading(false);
    } catch (err) {
      const errorMsg = 'Payment failed. Please try again.';
      setError(errorMsg);
      onError && onError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent sx={{ p: 0 }}>
        {/* Security Header */}
        <Box sx={{ 
          bgcolor: 'success.light', 
          color: 'success.contrastText', 
          p: 2, 
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Shield fontSize="small" />
          <Typography variant="body2" fontWeight="medium">
            Secure Checkout - Powered by Stripe
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Payment Information
          </Typography>
          
          {loading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                Processing your payment...
              </Box>
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="card">Credit or Debit Card</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, mb: 1 }}>
              Card Details
            </Typography>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                    padding: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fafafa',
                  },
                  invalid: {
                    color: '#9e2146',
                    border: '1px solid #9e2146',
                  },
                },
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!stripe || loading}
            sx={{ 
              mt: 3,
              py: 1.5,
              fontSize: '16px',
              fontWeight: 600,
              bgcolor: '#6772e5',
              '&:hover': {
                bgcolor: '#5469d4',
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Processing Payment...
              </Box>
            ) : (
              `Pay £${course.price}`
            )}
          </Button>

          {/* Security Footer */}
          <Box sx={{ 
            mt: 3, 
            pt: 2, 
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            color: 'text.secondary'
          }}>
            <Lock fontSize="small" />
            <Typography variant="body2">
              Your payment information is encrypted and secure
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </form>
  );
};

const Payment = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { courses, loading: coursesLoading, error: coursesError } = useSelector((state) => state.course);
  const { loading: paymentLoading, error: paymentError } = useSelector((state) => state.payment);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      await dispatch(fetchCourses());
      const foundCourse = courses.find(c => c._id === courseId);
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        setFetchError('Course not found');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setFetchError('Failed to load course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId, dispatch]);

  const handleRetry = () => {
    fetchCourse();
  };

  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentSuccess(true);
    setPaymentProcessing(true);
    setSuccessMessage('🎉 Payment successful! You now have access to the course.');
    
    // Show snackbar
    setSnackbarMessage('Payment successful! You now have access to the course.');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
    
    // Refresh enrolled courses after successful payment
    dispatch(getEnrolledCourses());
    dispatch(getCurrentUser()); // Refresh user profile to ensure latest purchase data
    
    // Show success message for 3 seconds then redirect
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  const handlePaymentError = (errorMsg) => {
    setErrorMessage(errorMsg);
    setSnackbarMessage(errorMsg);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Error state
  if (fetchError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <ErrorOutline sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom color="error.main">
              Course Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {fetchError}
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleRetry}
              sx={{ mr: 2 }}
            >
              Try Again
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }

  // Error message display
  if (errorMessage) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <ErrorOutline sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom color="error.main">
              Payment Failed
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {errorMessage}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setErrorMessage('')}
              sx={{ mr: 2 }}
            >
              Try Again
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading course details...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {fetchError || 'Course not found'}
            </Alert>
            <Button
              variant="contained"
              onClick={handleRetry}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            >
              {loading ? 'Loading...' : 'Retry'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              sx={{ ml: 2 }}
              startIcon={<ArrowBack />}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Success page
  if (paymentSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <CheckCircleOutline sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom color="success.main">
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {successMessage}
            </Typography>
            {paymentProcessing && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Processing your purchase...
                </Typography>
              </Box>
            )}
            <Typography variant="body2" color="text.secondary">
              Redirecting to dashboard in 3 seconds...
            </Typography>
          </Box>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f8fafc',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ color: 'text.secondary' }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Secure Checkout
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Course Details */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: 'fit-content' }}>
              <CardMedia
                component="img"
                height="250"
                image={course.image || 'https://source.unsplash.com/random?course'}
                alt={course.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {course.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  {course.description}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Chip 
                    label={course.category || 'General'} 
                    color="primary" 
                    size="small"
                  />
                  <Chip 
                    label={course.level || 'Beginner'} 
                    color="secondary" 
                    size="small"
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Star sx={{ color: 'warning.main', fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.rating || 4.5} ({course.reviews || 0} reviews)
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  What you'll get:
                </Typography>
                <List dense sx={{ mb: 2 }}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <School color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Full course access with lifetime updates" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <AccessTime color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={`${course.duration || 'Lifetime'} access`} />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Receipt color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Course certificate upon completion" />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Support color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="24/7 support and community access" />
                  </ListItem>
                </List>

                {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      You'll learn:
                    </Typography>
                    <List dense>
                      {course.whatYouWillLearn.slice(0, 3).map((item, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Form */}
          <Grid item xs={12} md={5}>
            <Card sx={{ height: 'fit-content', position: 'sticky', top: 20 }}>
              <CardContent sx={{ p: 0 }}>
                {/* Price Summary */}
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'primary.contrastText', 
                  p: 3,
                  borderRadius: '8px 8px 0 0'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    £{course.price}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    One-time payment
                  </Typography>
                </Box>

                {stripePromise ? (
                  <Elements stripe={stripePromise}>
                    <PaymentForm 
                      course={course} 
                      onSuccess={handlePaymentSuccess}
                      onError={(errorMsg) => handlePaymentError(errorMsg)}
                    />
                  </Elements>
                ) : (
                  <Box sx={{ p: 3 }}>
                    <Alert severity="warning">
                      Payment system is not configured. Please contact support.
                    </Alert>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Security Badges */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Tooltip title="SSL Encrypted">
                <Chip 
                  icon={<Shield />} 
                  label="SSL Encrypted" 
                  size="small" 
                  color="success"
                  variant="outlined"
                />
              </Tooltip>
              <Tooltip title="PCI Compliant">
                <Chip 
                  icon={<VerifiedUser />} 
                  label="PCI Compliant" 
                  size="small" 
                  color="primary"
                  variant="outlined"
                />
              </Tooltip>
              <Tooltip title="Instant Access">
                <Chip 
                  icon={<LocalShipping />} 
                  label="Instant Access" 
                  size="small" 
                  color="secondary"
                  variant="outlined"
                />
              </Tooltip>
            </Box>
          </Grid>
        </Grid>

        {paymentError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {paymentError}
          </Alert>
        )}
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Payment; 