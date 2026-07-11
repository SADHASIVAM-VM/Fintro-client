import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  sidebarCollapsed: boolean;
  density: 'compact' | 'comfortable';
  titleSuffix: string;
}

const initialState: SettingsState = {
  sidebarCollapsed: false,
  density: 'comfortable',
  titleSuffix: 'Antigravity Template',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    setDensity(state, action: PayloadAction<'compact' | 'comfortable'>) {
      state.density = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, setDensity } = settingsSlice.actions;
export default settingsSlice.reducer;
