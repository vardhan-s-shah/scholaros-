import { create } from 'zustand';
import type { MarkEntry } from '../types/auth.types';
import { marksService } from '../services/marks-service';

interface MarksState {
  marks: MarkEntry[];
  isLoading: boolean;
  error: string | null;
  fetchMarks: () => Promise<void>;
  addMark: (mark: Omit<MarkEntry, 'id'>) => Promise<void>;
  updateMark: (id: string, mark: Partial<MarkEntry>) => Promise<void>;
  deleteMark: (id: string) => Promise<void>;
  clearMarks: () => void;
}

export const useMarksStore = create<MarksState>((set) => ({
  marks: [],
  isLoading: false,
  error: null,

  fetchMarks: async () => {
    set({ isLoading: true, error: null });
    try {
      const marks = await marksService.getMarks();
      set({ marks, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch marks', isLoading: false });
    }
  },

  addMark: async (markData) => {
    set({ isLoading: true, error: null });
    try {
      const newMark = await marksService.addMark(markData);
      set((state) => ({
        marks: [...state.marks, newMark],
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to add mark', isLoading: false });
      throw err;
    }
  },

  updateMark: async (id, markData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMark = await marksService.updateMark(id, markData);
      set((state) => ({
        marks: state.marks.map((m) => (m.id === id ? updatedMark : m)),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update mark', isLoading: false });
      throw err;
    }
  },

  deleteMark: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await marksService.deleteMark(id);
      set((state) => ({
        marks: state.marks.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete mark', isLoading: false });
      throw err;
    }
  },

  clearMarks: () => {
    set({ marks: [], error: null });
  },
}));
