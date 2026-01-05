import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getQueueStatus } from "../../services/visit";

interface Visit {
  _id: string;
  patientName: string;
  age: number;
  phone: string;
  appointmentNumber: number;
  status?: 'pending' | 'in_progress' | 'completed';
  visitType?: 'regular' | 'emergency';
  date?: string;
  diagnosis?: string;
  prescription?: string;
}

interface VisitState {
  currentPatient: Visit | null;
  completedList: Visit[];
  totalToday: number;
  loading: boolean;
  error: string | null;
}

const initialState: VisitState = {
  currentPatient: null,
  completedList: [],
  totalToday: 0,
  loading: false,
  error: null,
};

// Async Thunk to fetch queue status
export const fetchQueue = createAsyncThunk("visit/fetchQueue", async (_, { rejectWithValue }) => {
  try {
    const response = await getQueueStatus();
    return response; // Expected to return { currentPatient, completedList, totalToday }
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch queue");
  }
});

const visitSlice = createSlice({
  name: "visit",
  initialState,
  reducers: {
    // We can add reducers here if we need to update state manually without fetching
    clearQueueData: (state) => {
      state.currentPatient = null;
      state.completedList = [];
      state.totalToday = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQueue.pending, (state) => {
        if (state.completedList.length === 0 && !state.currentPatient) {
        state.loading = true;
  }
      })
      .addCase(fetchQueue.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPatient = action.payload.currentPatient || null;
        state.completedList = action.payload.completedList || [];
        state.totalToday = action.payload.totalToday || 0;
      })
      .addCase(fetchQueue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearQueueData } = visitSlice.actions;
export default visitSlice.reducer;