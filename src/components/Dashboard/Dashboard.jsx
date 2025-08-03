import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  Paper,
  Avatar,
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
  Snackbar,
  IconButton,
} from '@mui/material';
import {
  School,
  PlayArrow,
  Star,
  Person,
  Payment,
  TrendingUp,
  Refresh,
} from '@mui/icons-material';
import { fetchCourses, getEnrolledCourses } from '../../store/slices/courseSlice';
import { becomeAgent, clearSuccess, clearError } from '../../store/slices/referralSlice';
import { getCurrentUser } from '../../store/slices/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [agentDialog, setAgentDialog] = useState(false);
  const [agentData, setAgentData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    experience: '',
    motivation: '',
  });
  
  const { courses, enrolledCourses, loading } = useSelector((state) => state.course);
  const { user } = useSelector((state) => state.auth);
  const { loading: agentLoading, success: agentSuccess, error: agentError } = useSelector((state) => state.referral);

  // Get all user's courses (enrolled + purchased)
  const getAllUserCourses = () => {
    const userCourses = [...enrolledCourses];
    
    // Add purchased courses that might not be in enrolledCourses yet
    if (user?.coursesPurchased) {
      user.coursesPurchased.forEach(purchase => {
        const course = courses.find(c => c._id === purchase.courseId);
        if (course && !userCourses.some(uc => uc._id === course._id)) {
          userCourses.push(course);
        }
      });
    }
    
    return userCourses;
  };

  const userCourses = getAllUserCourses();

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(getEnrolledCourses());
  }, [dispatch]);

  // Refresh enrolled courses when component mounts or when returning from payment
  useEffect(() => {
    const refreshEnrolledCourses = () => {
      dispatch(getEnrolledCourses());
    };

    // Refresh on component mount
    refreshEnrolledCourses();

    // Listen for focus events (when user returns from payment page)
    const handleFocus = () => {
      refreshEnrolledCourses();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard courses:', courses);
    console.log('Dashboard enrolled courses:', enrolledCourses);
    console.log('User courses (enrolled + purchased):', userCourses);
    console.log('User purchase data:', user?.coursesPurchased);
  }, [courses, enrolledCourses, userCourses, user?.coursesPurchased]);

  // Handle agent application success
  useEffect(() => {
    if (agentSuccess) {
      setAgentDialog(false);
      setAgentData({
        firstName: '',
        lastName: '',
        phone: '',
        country: '',
        experience: '',
        motivation: '',
      });
      // Clear success after showing message
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [agentSuccess, dispatch]);

  const handleAgentApplication = async () => {
    try {
      await dispatch(becomeAgent(agentData));
    } catch (error) {
      console.error('Agent application failed:', error);
    }
  };

  const handleCloseDialog = () => {
    setAgentDialog(false);
    dispatch(clearError());
  };

  const handleRefresh = () => {
    dispatch(fetchCourses());
    dispatch(getEnrolledCourses());
    dispatch(getCurrentUser()); // Refresh user profile to get latest purchase data
  };

  const stats = [
    {
      title: 'Enrolled Courses',
      value: userCourses.length,
      icon: <School />,
      color: 'primary.main',
    },
    {
      title: 'Purchased Courses',
      value: user?.coursesPurchased?.length || 0,
      icon: <Payment />,
      color: 'success.main',
    },
    {
      title: 'Total Spent',
      value: `£${userCourses.reduce((sum, course) => sum + (course.price || 0), 0)}`,
      icon: <Payment />,
      color: 'warning.main',
    },
    {
      title: 'Learning Progress',
      value: `${Math.round((userCourses.length / Math.max(courses.length, 1)) * 100)}%`,
      icon: <TrendingUp />,
      color: 'info.main',
    },
  ];

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleRefresh} color="primary" title="Refresh">
              <Refresh />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Track your learning progress and discover new courses.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid xs={12} sm={4} key={index}>
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

      {/* My Courses Section */}
      {userCourses.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            My Enrolled Courses
          </Typography>
          <Grid container spacing={3}>
            {userCourses.map((course) => (
              <Grid xs={12} md={6} lg={4} key={course._id}>
                <Card
                  sx={{
                    height: 400, // Fixed height for all cards
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      transition: 'transform 0.3s ease-in-out',
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="160" // Fixed height for all images
                    image={course.image || 'https://source.unsplash.com/random?course'}
                    alt={course.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="h3"
                      sx={{ 
                        fontWeight: 600,
                        lineHeight: 1.2,
                        mb: 1,
                        // Limit to 2 lines
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {course.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        flexGrow: 1,
                        // Limit to 3 lines
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {course.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Star sx={{ color: 'warning.main', mr: 0.5, fontSize: 16 }} />
                      <Typography variant="body2" color="text.secondary">
                        {course.rating || 4.5} ({course.reviews || 0} reviews)
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label="Enrolled"
                        color="success"
                        size="small"
                      />
                      {user?.coursesPurchased?.some(purchase => purchase.courseId === course._id) && (
                        <Chip
                          label="Purchased"
                          color="primary"
                          size="small"
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => navigate(`/course/${course._id}`)}
                      fullWidth
                    >
                      Continue Learning
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Available Courses Section */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Available Courses
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : courses.length === 0 ? (
          <Alert severity="info">
            No courses available at the moment. Please check back later.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {courses?.filter(course => {
              // Check if course is enrolled
              const isEnrolled = enrolledCourses.some(enrolledCourse => enrolledCourse._id === course._id);
              // Check if course is purchased
              const isPurchased = user?.coursesPurchased?.some(purchase => purchase.courseId === course._id);
              
              console.log(`Course ${course.title} (${course._id}):`, {
                isEnrolled,
                isPurchased,
                enrolledCourses: enrolledCourses.map(c => c._id),
                userPurchases: user?.coursesPurchased?.map(p => p.courseId),
                user: user?.coursesPurchased
              });
              
              // Only show courses that are neither enrolled nor purchased
              return !isEnrolled && !isPurchased;
            }).map((course) => {
              return (
                <Grid xs={12} md={6} lg={4} key={course._id}>
                  <Card
                    sx={{
                      height: 400, // Fixed height for all cards
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.3s ease-in-out',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160" // Fixed height for all images
                      image={course.image || 'https://source.unsplash.com/random?course'}
                      alt={course.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        gutterBottom 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          fontWeight: 600,
                          lineHeight: 1.2,
                          mb: 1,
                          // Limit to 2 lines
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {course.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          flexGrow: 1,
                          // Limit to 3 lines
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {course.description}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Star sx={{ color: 'warning.main', mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary">
                          {course.rating || 4.5} ({course.reviews || 0} reviews)
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                          £{course.price}
                        </Typography>
                        <Chip
                          label={course.category || 'General'}
                          color="secondary"
                          size="small"
                        />
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          console.log('Course object:', course);
                          console.log('Course ID:', course._id);
                          if (course._id) {
                            navigate(`/payment/${course._id}`);
                          } else {
                            console.error('Course ID is undefined');
                          }
                        }}
                        fullWidth
                      >
                        Buy Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Referral Agent Promotion */}
      {user?.role === 'user' && (
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            Become a Referral Agent
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Earn commissions by referring others to our courses. Join our referral program today!
          </Typography>
          <Button
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
            onClick={() => setAgentDialog(true)}
          >
            Apply Now
          </Button>
        </Paper>
      )}

      {/* Agent Application Dialog */}
      <Dialog open={agentDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Apply to Become a Referral Agent</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={agentData.firstName}
                onChange={(e) => setAgentData({ ...agentData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={agentData.lastName}
                onChange={(e) => setAgentData({ ...agentData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={agentData.phone}
                onChange={(e) => setAgentData({ ...agentData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={agentData.country}
                onChange={(e) => setAgentData({ ...agentData, country: e.target.value })}
                required
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Relevant Experience"
                value={agentData.experience}
                onChange={(e) => setAgentData({ ...agentData, experience: e.target.value })}
                multiline
                rows={3}
                placeholder="Describe your experience in sales, marketing, or networking..."
                required
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Motivation"
                value={agentData.motivation}
                onChange={(e) => setAgentData({ ...agentData, motivation: e.target.value })}
                multiline
                rows={3}
                placeholder="Why do you want to become a referral agent?"
                required
              />
            </Grid>
          </Grid>
          {agentError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {agentError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleAgentApplication} 
            variant="contained"
            disabled={agentLoading}
          >
            {agentLoading ? <CircularProgress size={20} /> : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={agentSuccess}
        autoHideDuration={6000}
        onClose={() => dispatch(clearSuccess())}
        message="Agent application submitted successfully! We'll review your application and get back to you soon."
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </Container>
  );
};

export default Dashboard; 