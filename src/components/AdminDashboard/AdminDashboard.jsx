import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  AppBar,
  Button,
  Avatar,
} from '@mui/material';
import {
  People,
  TrendingUp,
  Payment,
  AdminPanelSettings,
  School,
  Assessment,
  Refresh,
} from '@mui/icons-material';
import {
  getAllUsers,
  getAllPayments,
  getAllCommissions,
  getTopAgents,
  getSystemStats,
  clearError,
  resetState,
} from '../../store/slices/adminSlice';
import CourseManagement from './CourseManagement';
import UserManagement from './UserManagement';
import PaymentManagement from './PaymentManagement';
import CommissionManagement from './CommissionManagement';
import PayoutRequestsManagement from './PayoutRequestsManagement';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`admin-tabpanel-${index}`}
    aria-labelledby={`admin-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    systemStats, 
    loading, 
    error,
    lastFetchTime
  } = useSelector((state) => state.admin);

  // Memoize the fetch functions to prevent unnecessary re-renders
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (hasLoaded && !isRefresh) return; // Prevent re-fetching if already loaded
    
    try {
      if (isRefresh) {
        setIsRefreshing(true);
        dispatch(resetState());
      }
      
      await Promise.all([
        dispatch(getAllUsers()),
        dispatch(getAllPayments()),
        dispatch(getAllCommissions()),
        dispatch(getTopAgents()),
        dispatch(getSystemStats())
      ]);
      
      if (!hasLoaded) {
        setHasLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  }, [dispatch, hasLoaded]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const stats = [
    {
      title: 'Total Users',
      value: systemStats?.users?.total || 0,
      icon: <People />,
      color: 'primary.main',
    },
    {
      title: 'Total Revenue',
      value: `£${systemStats?.payments?.totalRevenue || 0}`,
      icon: <Payment />,
      color: 'success.main',
    },
    {
      title: 'Total Referrals',
      value: systemStats?.referrals?.totalPayments || 0,
      icon: <TrendingUp />,
      color: 'warning.main',
    },
    {
      title: 'Active Agents',
      value: systemStats?.users?.activeAgents || 0,
      icon: <AdminPanelSettings />,
      color: 'info.main',
    },
  ];

  if (loading && !hasLoaded && !isRefreshing) {
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, courses, payments, and system statistics
          </Typography>
          {lastFetchTime && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={isRefreshing ? <CircularProgress size={16} /> : <Refresh />}
          onClick={handleRefresh}
          disabled={isRefreshing || loading}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="h4" component="div" color={stat.color}>
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

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
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
            <Tab label="Course Management" />
            <Tab label="User Management" />
            <Tab label="Payments" />
            <Tab label="Commissions" />
            <Tab label="Payout Requests" />
          </Tabs>
        </AppBar>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            System Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to the admin dashboard. Use the tabs above to manage different aspects of the system.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CourseManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <UserManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <PaymentManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <CommissionManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <PayoutRequestsManagement />
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminDashboard; 