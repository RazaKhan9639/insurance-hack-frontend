import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Async thunks
export const getReferralStats = createAsyncThunk(
  'referral/getReferralStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get(`${API_URL}/referrals/stats`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch referral stats');
    }
  }
);

export const getReferralHistory = createAsyncThunk(
  'referral/getReferralHistory',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get(`${API_URL}/referrals/my-referrals`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch referral history');
    }
  }
);

export const getCommissionHistory = createAsyncThunk(
  'referral/getCommissionHistory',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      // Use the agent dashboard endpoint which includes commission history
      const response = await axios.get(`${API_URL}/referrals/agent-dashboard`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch commission history');
    }
  }
);

export const requestPayout = createAsyncThunk(
  'referral/requestPayout',
  async (payoutData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.post(`${API_URL}/referrals/request-payout`, payoutData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to request payout');
    }
  }
);

export const getReferralCode = createAsyncThunk(
  'referral/getReferralCode',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get(`${API_URL}/referrals/code`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get referral code');
    }
  }
);

export const validateReferralCode = createAsyncThunk(
  'referral/validateReferralCode',
  async (code, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/referrals/validate/${code}`);
      return response?.data?.data?.referralCode;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Invalid referral code');
    }
  }
);

export const becomeAgent = createAsyncThunk(
  'referral/becomeAgent',
  async (agentData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.post(`${API_URL}/referrals/become-agent`, agentData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to submit agent application');
    }
  }
);

export const updateAgentProfile = createAsyncThunk(
  'referral/updateAgentProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.put(`${API_URL}/referrals/agent-profile`, profileData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update agent profile');
    }
  }
);

const initialState = {
  referralStats: null,
  referralHistory: [],
  commissionHistory: [],
  referralCode: null,
  agentProfile: null,
  loading: false,
  error: null,
  success: false,
};

const referralSlice = createSlice({
  name: 'referral',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Referral Stats
      .addCase(getReferralStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReferralStats.fulfilled, (state, action) => {
        state.loading = false;
        state.referralStats = action.payload?.data?.stats || action.payload?.stats;
      })
      .addCase(getReferralStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Referral History
      .addCase(getReferralHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReferralHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.referralHistory = action.payload?.data?.referrals || action.payload?.referrals || [];
      })
      .addCase(getReferralHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Commission History
      .addCase(getCommissionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCommissionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.commissionHistory = action.payload?.data?.dashboard?.recentCommissions || action.payload?.dashboard?.recentCommissions || [];
      })
      .addCase(getCommissionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Request Payout
      .addCase(requestPayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPayout.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(requestPayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Referral Code
      .addCase(getReferralCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReferralCode.fulfilled, (state, action) => {
        state.loading = false;
        state.referralCode = action.payload?.data?.referralCode || action.payload?.referralCode;
      })
      .addCase(getReferralCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Validate Referral Code
      .addCase(validateReferralCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateReferralCode.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(validateReferralCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Become Agent
      .addCase(becomeAgent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(becomeAgent.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(becomeAgent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Agent Profile
      .addCase(updateAgentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAgentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.agentProfile = action.payload?.data?.agentProfile || action.payload?.agentProfile;
        state.success = true;
      })
      .addCase(updateAgentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = referralSlice.actions;
export default referralSlice.reducer; 