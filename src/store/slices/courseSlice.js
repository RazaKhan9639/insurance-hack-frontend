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
export const fetchCourses = createAsyncThunk(
  'course/fetchCourses',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() =>
        axios.get(`${API_URL}/courses`, config)
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const getCourseById = createAsyncThunk(
  'course/getCourseById',
  async (courseId, { rejectWithValue, getState }) => {
    try {
  
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() =>
        axios.get(`${API_URL}/courses/${courseId}`, config)
      );
      
      
      return response.data;
    } catch (error) {
      console.error('getCourseById error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course');
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'course/enrollInCourse',
  async (courseId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() =>
        axios.post(`${API_URL}/courses/${courseId}/enroll`, {}, config)
      );
      
      return response.data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to enroll in course');
    }
  }
);

export const getEnrolledCourses = createAsyncThunk(
  'course/getEnrolledCourses',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() =>
        axios.get(`${API_URL}/courses/enrolled`, config)
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch enrolled courses');
    }
  }
);

export const getCourseContent = createAsyncThunk(
  'course/getCourseContent',
  async (courseId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await apiCallWithRetry(() =>
        axios.get(`${API_URL}/courses/${courseId}/content`, config)
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching course content:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course content');
    }
  }
);

// Admin functions
export const createCourse = createAsyncThunk(
  'course/createCourse',
  async (courseData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      const formData = new FormData();
      Object.keys(courseData).forEach(key => {
        if (key === 'pdf' && courseData[key]) {
          formData.append('pdf', courseData[key]);
        } else {
          formData.append(key, courseData[key]);
        }
      });
      const response = await axios.post(`${API_URL}/courses`, formData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create course');
    }
  }
);

export const updateCourse = createAsyncThunk(
  'course/updateCourse',
  async ({ courseId, courseData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.put(`${API_URL}/courses/${courseId}`, courseData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update course');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'course/deleteCourse',
  async (courseId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token || localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.delete(`${API_URL}/courses/${courseId}`, config);
      return { courseId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete course');
    }
  }
);

const initialState = {
  courses: [],
  enrolledCourses: [],
  currentCourse: null,
  courseContent: null,
  loading: false,
  error: null,
  success: false,
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload;
    },
    clearCourseContent: (state) => {
      state.courseContent = null;
    },
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload?.data?.courses || [];
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Course By ID
      .addCase(getCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload?.data?.course;
      })
      .addCase(getCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Enroll in Course
      .addCase(enrollInCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.enrolledCourses = [...state.enrolledCourses, action.payload?.data?.course];
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Enrolled Courses
      .addCase(getEnrolledCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEnrolledCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.enrolledCourses = action.payload?.data?.courses || [];
      })
      .addCase(getEnrolledCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Course Content
      .addCase(getCourseContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourseContent.fulfilled, (state, action) => {
        state.loading = false;
        state.courseContent = action.payload?.data?.content;
      })
      .addCase(getCourseContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.courses = [...state.courses, action.payload?.data?.course];
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.courses.findIndex(course => course._id === action.payload?.data?.course?._id);
        if (index !== -1) {
          state.courses[index] = action.payload.data.course;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Course
      .addCase(deleteCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.courses = state.courses.filter(course => course._id !== action.payload?.data?.courseId);
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, setCurrentCourse, clearCourseContent, resetState } = courseSlice.actions;
export default courseSlice.reducer; 