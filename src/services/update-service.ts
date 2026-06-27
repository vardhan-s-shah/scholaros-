import { apiClient } from './api-client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const MOCK_UPDATES_KEY = 'mock_updates_db';

export interface UpdateEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  createdAt: string;
}

// ---------- Mock helpers ----------
const getMockUpdates = (): UpdateEntry[] => {
  try {
    const stored = localStorage.getItem(MOCK_UPDATES_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  // Default seed data
  const defaults: UpdateEntry[] = [
    {
      id: 'upd-1',
      title: 'CSBS Syllabus Changes',
      category: 'Curriculum Update',
      description: 'Humanities-I and Humanities-II have been removed from Semesters 1 & 2. Introductory Topics in Statistics, Probability and Calculus is now updated to 4 credits in Semester 1.',
      createdAt: '2026-06-16T10:00:00.000Z',
    },
    {
      id: 'upd-2',
      title: 'SGPA / CGPA Leaderboard Live',
      category: 'New Feature',
      description: 'Compare your SGPA/CGPA with peers of your same branch and semester. Check out the leaderboard to see your current ranking!',
      createdAt: '2026-06-16T10:05:00.000Z',
    },
  ];
  localStorage.setItem(MOCK_UPDATES_KEY, JSON.stringify(defaults));
  return defaults;
};

const saveMockUpdates = (updates: UpdateEntry[]) => {
  localStorage.setItem(MOCK_UPDATES_KEY, JSON.stringify(updates));
};

// ---------- Service ----------
export const updateService = {
  getUpdates: async (): Promise<UpdateEntry[]> => {
    if (USE_MOCK) {
      await delay(400);
      const updates = getMockUpdates();
      return [...updates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const response = await apiClient.get<{ updates: UpdateEntry[] }>('/updates');
    return response.data.updates;
  },

  createUpdate: async (data: { title: string; category: string; description: string }): Promise<UpdateEntry> => {
    if (USE_MOCK) {
      await delay(500);
      const updates = getMockUpdates();
      const newEntry: UpdateEntry = {
        id: 'upd-' + Math.random().toString(36).substring(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
      };
      updates.unshift(newEntry);
      saveMockUpdates(updates);
      return newEntry;
    }
    const response = await apiClient.post<{ update: UpdateEntry }>('/updates', data);
    return response.data.update;
  },

  updateUpdate: async (id: string, data: { title: string; category: string; description: string }): Promise<UpdateEntry> => {
    if (USE_MOCK) {
      await delay(400);
      const updates = getMockUpdates();
      const idx = updates.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error('Update not found.');
      updates[idx] = { ...updates[idx], ...data };
      saveMockUpdates(updates);
      return updates[idx];
    }
    const response = await apiClient.put<{ update: UpdateEntry }>(`/updates/${id}`, data);
    return response.data.update;
  },

  deleteUpdate: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(400);
      const updates = getMockUpdates();
      saveMockUpdates(updates.filter((u) => u.id !== id));
      return;
    }
    await apiClient.delete(`/updates/${id}`);
  },
};
