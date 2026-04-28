import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/api';

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, thunkAPI) => {
    try {
      const response = await api.post("/users/register/", userData);
      return response.data;
    } catch (error) {
      // Return the backend error messages (e.g. { "username": ["This field is required"] })
      return thunkAPI.rejectWithValue(error.response?.data || { detail: "Something went wrong" });
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, thunkAPI) => {
    try {
      const response = await api.post("/users/login/", credentials);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { detail: "Invalid credentials" });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/users/logout/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { detail: "Something went wrong" });
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/users/me/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { detail: "Something went wrong" });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.success = false;
      // Note: Backend logout should be called to clear cookies
    },
    resetAuthState: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.success = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null; // Clear user if fetch fails
      })
  }
});

export const { logout, resetAuthState } = authSlice.actions;
export default authSlice.reducer;
