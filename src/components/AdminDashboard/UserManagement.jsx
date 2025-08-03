import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit,
  Delete,
  Person,
  AdminPanelSettings,
  TrendingUp,
  Payment,
  Visibility,
} from '@mui/icons-material';
import { 
  getAllUsers, 
  updateUserRole, 
  deleteUser 
} from '../../store/slices/adminSlice';

const UserManagement = () => {
  const dispatch = useDispatch();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const { users, loading, error, success } = useSelector((state) => state.admin);

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    commissionRate: 10,
    isActiveAgent: false,
  });

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Reset commission rate and agent status when role changes
  useEffect(() => {
    if (userData.role !== 'agent') {
      setUserData(prev => ({
        ...prev,
        commissionRate: 0,
        isActiveAgent: false
      }));
    }
  }, [userData.role]);

  const handleOpenEditDialog = (user) => {
    setEditingUser(user);
    setUserData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: user.role || 'user',
      commissionRate: user.commissionRate || 10,
      isActiveAgent: user.isActiveAgent || false,
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
  };

  const handleUpdateUser = async () => {
    if (editingUser) {
      try {
        setUpdating(true);
        console.log('Updating user with data:', {
          userId: editingUser._id, 
          role: userData.role,
          commissionRate: userData.commissionRate,
          isActiveAgent: userData.isActiveAgent,
        });
        
        const result = await dispatch(updateUserRole({ 
          userId: editingUser._id, 
          role: userData.role,
          commissionRate: userData.commissionRate,
          isActiveAgent: userData.isActiveAgent,
        }));
        
        console.log('Update result:', result);
        
        // Check if the action was fulfilled (successful)
        if (updateUserRole.fulfilled.match(result)) {
          console.log('User updated successfully');
          setUpdateSuccess(true);
          handleCloseEditDialog();
          // Refresh the users list
          dispatch(getAllUsers());
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setUpdateSuccess(false);
          }, 3000);
        } else {
          console.log('User update failed:', result.error);
        }
      } catch (error) {
        console.error('Error updating user:', error);
      } finally {
        setUpdating(false);
      }
    }
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      await dispatch(deleteUser(userToDelete._id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'agent':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'agent':
        return <TrendingUp />;
      default:
        return <Person />;
    }
  };

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, agents, and their permissions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {updateSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          User updated successfully!
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Commission Rate</TableCell>
              <TableCell>Agent Status</TableCell>
              <TableCell>Total Referrals</TableCell>
              <TableCell>Total Commission</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>
                      {user.firstName?.[0] || user.username?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    icon={getRoleIcon(user.role)}
                    label={user.role} 
                    size="small" 
                    color={getRoleColor(user.role)}
                  />
                </TableCell>
                <TableCell>
                  {user.role === 'agent' ? `${user.commissionRate || 0}%` : '-'}
                </TableCell>
                <TableCell>
                  {user.role === 'agent' ? (
                    <Chip 
                      label={user.isActiveAgent ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={user.isActiveAgent ? 'success' : 'default'}
                    />
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {user.totalReferrals || 0}
                </TableCell>
                <TableCell>
                  £{user.totalCommission || 0}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenEditDialog(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteClick(user)}
                    disabled={user.role === 'admin'}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={userData.firstName}
                onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={userData.lastName}
                onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                required
                type="email"
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userData.role}
                  label="Role"
                  onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="agent">Agent</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Commission Rate (%)"
                type="number"
                value={userData.commissionRate}
                onChange={(e) => setUserData({ ...userData, commissionRate: parseInt(e.target.value) })}
                disabled={userData.role !== 'agent'}
                InputProps={{
                  endAdornment: '%',
                }}
              />
            </Grid>
            <Grid xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userData.isActiveAgent}
                    onChange={(e) => setUserData({ ...userData, isActiveAgent: e.target.checked })}
                    disabled={userData.role !== 'agent'}
                  />
                }
                label="Active Agent"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateUser} 
            variant="contained"
            disabled={updating}
          >
            {updating ? 'Updating...' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{userToDelete?.firstName} {userToDelete?.lastName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement; 