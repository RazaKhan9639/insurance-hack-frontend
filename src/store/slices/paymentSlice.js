import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

// Async thunks
export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async (paymentData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.post(`${API_URL}/payments/create-payment-intent`, paymentData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create payment intent');
    }
  }
);

export const getPaymentHistory = createAsyncThunk(
  'payment/getPaymentHistory',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get(`${API_URL}/payments`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch payment history');
    }
  }
);

export const getPaymentById = createAsyncThunk(
  'payment/getPaymentById',
  async (paymentId, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get(`${API_URL}/payments/${paymentId}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get payment details');
    }
  }
);

export const confirmPayment = createAsyncThunk(
  'payment/confirmPayment',
  async (paymentData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.post(`${API_URL}/payments/manual-confirm`, paymentData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to confirm payment');
    }
  }
);

export const getUserCommissions = createAsyncThunk(
  'payment/getUserCommissions',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get(`${API_URL}/payments/commissions`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch commissions');
    }
  }
);

const initialState = {
  paymentIntent: null,
  paymentHistory: [],
  currentPayment: null,
  commissions: [],
  loading: false,
  error: null,
  success: false,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearPaymentIntent: (state) => {
      state.paymentIntent = null;
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Payment Intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentIntent = action.payload.paymentIntent;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Payment History
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload.payments || [];
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Payment By ID
      .addCase(getPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload.payment;
      })
      .addCase(getPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get User Commissions
      .addCase(getUserCommissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserCommissions.fulfilled, (state, action) => {
        state.loading = false;
        state.commissions = action.payload.commissions || [];
      })
      .addCase(getUserCommissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm Payment
      .addCase(confirmPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, clearPaymentIntent, setCurrentPayment } = paymentSlice.actions;
export default paymentSlice.reducer; 