import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, getMyDetails } from '../../services/auth';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const token = localStorage.getItem('accessToken');

const initialState: AuthState = {
  user: null,
  token: token || null,
  loading: false,
  error: null,
};

// Async Thunk for Login
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await loginUser(credentials);
      
      const data = response.data || response; 

      if (!data.accessToken) {
        throw new Error("Access token not found in response");
      }

      // Save tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      return data;
    } catch (error: any) {
      console.error("Redux Login Error:", error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyDetails();
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue('Session expired');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Handling
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.accessToken;
        if (action.payload.user) {
            state.user = action.payload.user;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Load User Handling
      .addCase(loadUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;