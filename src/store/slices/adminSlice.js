import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

// Helper function to add retry logic
const apiCallWithRetry = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      if (error.response?.status === 429) {
        // Wait longer for rate limit errors
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
};

// Async thunks
export const getAllUsers = createAsyncThunk(
  'admin/getAllUsers',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.get(`${API_URL}/admin/users`, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const getAllPayments = createAsyncThunk(
  'admin/getAllPayments',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params
      };
      
      const response = await apiCallWithRetry(() => 
        axios.get(`${API_URL}/admin/payments`, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const getAllCommissions = createAsyncThunk(
  'admin/getAllCommissions',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params
      };
      
      const response = await apiCallWithRetry(() => 
        axios.get(`${API_URL}/admin/commissions`, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error fetching commissions:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch commissions');
    }
  }
);

export const getTopAgents = createAsyncThunk(
  'admin/getTopAgents',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.get(`${API_URL}/referrals/top-agents`, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error fetching top agents:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top agents');
    }
  }
);

export const approveAgent = createAsyncThunk(
  'admin/approveAgent',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.put(`${API_URL}/admin/users/${userId}/approve-agent`, {}, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error approving agent:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to approve agent');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role, commissionRate, isActiveAgent }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.put(`${API_URL}/admin/users/${userId}/role`, 
          { role, commissionRate, isActiveAgent }, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.delete(`${API_URL}/admin/users/${userId}`, config)
      );
      
      return { userId, ...response?.data?.data };
    } catch (error) {
      console.error('Error deleting user:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const updateCommissionStatus = createAsyncThunk(
  'admin/updateCommissionStatus',
  async ({ commissionId, status, payoutMethod, payoutNotes }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.put(`${API_URL}/admin/commissions/${commissionId}/status`, 
          { status, payoutMethod, payoutNotes }, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error updating commission status:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to update commission status');
    }
  }
);

export const processBulkPayout = createAsyncThunk(
  'admin/processBulkPayout',
  async ({ commissionIds, payoutMethod, payoutNotes }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.post(`${API_URL}/admin/commissions/bulk-payout`, 
          { commissionIds, payoutMethod, payoutNotes }, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error processing bulk payout:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to process bulk payout');
    }
  }
);

export const getSystemStats = createAsyncThunk(
  'admin/getSystemStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.get(`${API_URL}/admin/stats/overview`, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system stats');
    }
  }
);

export const processManualPayout = createAsyncThunk(
  'admin/processManualPayout',
  async (payoutData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.post(`${API_URL}/admin/commissions/payout`, payoutData, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error processing payout:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to process payout');
    }
  }
);

export const performBulkActions = createAsyncThunk(
  'admin/performBulkActions',
  async ({ action, ids, data }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.post(`${API_URL}/admin/bulk-actions`, 
          { action, ids, data }, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error performing bulk action:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to perform bulk action');
    }
  }
);

export const getAllPayoutRequests = createAsyncThunk(
  'admin/getAllPayoutRequests',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params
      };
      
      const response = await apiCallWithRetry(() => 
        axios.get(`${API_URL}/admin/payout-requests`, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payout requests');
    }
  }
);

export const processPayoutRequest = createAsyncThunk(
  'admin/processPayoutRequest',
  async ({ requestId, status, adminNotes, payoutReference, rejectionReason }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.put(`${API_URL}/admin/payout-requests/${requestId}/process`, 
          { status, adminNotes, payoutReference, rejectionReason }, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error processing payout request:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to process payout request');
    }
  }
);

export const createPayoutRequest = createAsyncThunk(
  'admin/createPayoutRequest',
  async (payoutData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.post(`${API_URL}/admin/payout-requests`, payoutData, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error creating payout request:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create payout request');
    }
  }
);

export const verifyAgentBankDetails = createAsyncThunk(
  'admin/verifyAgentBankDetails',
  async ({ userId, isVerified, verificationNotes }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.put(`${API_URL}/admin/users/${userId}/verify-bank-details`, 
          { isVerified, verificationNotes }, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error verifying bank details:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to verify bank details');
    }
  }
);

export const processBankTransfer = createAsyncThunk(
  'admin/processBankTransfer',
  async ({ agentId, amount, notes, transferReference }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.post(`${API_URL}/admin/commissions/bank-transfer`, 
          { agentId, amount, notes, transferReference }, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error processing bank transfer:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to process bank transfer');
    }
  }
);

export const processStripePayout = createAsyncThunk(
  'admin/processStripePayout',
  async ({ agentId, amount, notes, transferReference }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() => 
        axios.post(`${API_URL}/admin/commissions/stripe-payout`, 
          { agentId, amount, notes, transferReference }, config)
      );
      
      return response?.data?.data;
    } catch (error) {
      console.error('Error processing Stripe payout:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to process Stripe payout');
    }
  }
);

const initialState = {
  users: [],
  payments: [],
  commissions: [],
  payoutRequests: [],
  topAgents: [],
  systemStats: null,
  loading: false,
  error: null,
  success: false,
  lastFetchTime: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload?.users || [];
        state.lastFetchTime = Date.now();
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Payments
      .addCase(getAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload || { payments: [], pagination: {}, summary: {} };
        state.lastFetchTime = Date.now();
      })
      .addCase(getAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Commissions
      .addCase(getAllCommissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCommissions.fulfilled, (state, action) => {
        state.loading = false;
        state.commissions = action.payload || { commissions: [], pagination: {}, summary: {}, agentSummary: [] };
        state.lastFetchTime = Date.now();
      })
      .addCase(getAllCommissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Top Agents
      .addCase(getTopAgents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTopAgents.fulfilled, (state, action) => {
        state.loading = false;
        state.topAgents = action.payload?.agents || [];
        state.lastFetchTime = Date.now();
      })
      .addCase(getTopAgents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve Agent
      .addCase(approveAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveAgent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update user in the list
        const index = state.users.findIndex(user => user._id === action.payload?.user?._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
      })
      .addCase(approveAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User Role
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update user in the list
        const index = state.users.findIndex(user => user._id === action.payload?.user?._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Remove user from the list
        state.users = state.users.filter(user => user._id !== action.payload.userId);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Commission Status
      .addCase(updateCommissionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCommissionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update commission in the list
        const index = state.commissions.findIndex(commission => commission._id === action.payload?.commission?._id);
        if (index !== -1) {
          state.commissions[index] = action.payload.commission;
        }
      })
      .addCase(updateCommissionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Process Bulk Payout
      .addCase(processBulkPayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processBulkPayout.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(processBulkPayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Process Manual Payout
      .addCase(processManualPayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processManualPayout.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(processManualPayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get System Stats
      .addCase(getSystemStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSystemStats.fulfilled, (state, action) => {
        state.loading = false;
        state.systemStats = action.payload?.stats;
        state.lastFetchTime = Date.now();
      })
      .addCase(getSystemStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Perform Bulk Actions
      .addCase(performBulkActions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performBulkActions.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(performBulkActions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Payout Requests
      .addCase(getAllPayoutRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPayoutRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.payoutRequests = action.payload || { payoutRequests: [], pagination: {}, summary: {} };
        state.lastFetchTime = Date.now();
      })
      .addCase(getAllPayoutRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Process Payout Request
      .addCase(processPayoutRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayoutRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update payout request in the list
        const index = state.payoutRequests.payoutRequests?.findIndex(request => request._id === action.payload?.payoutRequest?._id);
        if (index !== -1) {
          state.payoutRequests.payoutRequests[index] = action.payload.payoutRequest;
        }
      })
      .addCase(processPayoutRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Payout Request
      .addCase(createPayoutRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayoutRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createPayoutRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Agent Bank Details
      .addCase(verifyAgentBankDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyAgentBankDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Update user in the list
        const index = state.users.findIndex(user => user._id === action.payload?.user?._id);
        if (index !== -1) {
          state.users[index] = action.payload.user;
        }
      })
      .addCase(verifyAgentBankDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Process Bank Transfer
      .addCase(processBankTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processBankTransfer.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Refresh commissions after successful transfer
        state.lastFetchTime = Date.now();
      })
      .addCase(processBankTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Process Stripe Payout
      .addCase(processStripePayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processStripePayout.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Refresh commissions after successful payout
        state.lastFetchTime = Date.now();
      })
      .addCase(processStripePayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetState } = adminSlice.actions;
export default adminSlice.reducer; 