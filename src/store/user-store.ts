import { create } from 'zustand';
import { secureStorage } from '../utils/secure-storage';

interface UserSettings {
  defaultSemester: string;
  gradeScale: 'GPA' | 'Percentage' | 'CGPA';
  targetGpa: number;
  emailNotifications: boolean;
}

interface UserState {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultSemester: '1',
  gradeScale: 'CGPA',
  targetGpa: 8.5,
  emailNotifications: true,
};

const SETTINGS_KEY = 'user_academic_settings';

export const useUserStore = create<UserState>((set) => ({
  settings: secureStorage.getItem<UserSettings>(SETTINGS_KEY) || DEFAULT_SETTINGS,

  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      secureStorage.setItem(SETTINGS_KEY, updated);
      return { settings: updated };
    });
  },

  resetSettings: () => {
    secureStorage.setItem(SETTINGS_KEY, DEFAULT_SETTINGS);
    set({ settings: DEFAULT_SETTINGS });
  },
}));
