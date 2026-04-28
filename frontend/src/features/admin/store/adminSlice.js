import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/api';

export const adminDashboard = createAsyncThunk(
  "admin/adminDashboard",
  async (credentials, thunkAPI) => {
    try {
      const response = await api.get("/admin/dashboard/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { detail: "Something went wrong" });
    }
  }
);

