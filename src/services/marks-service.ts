import { apiClient } from './api-client';
import type { MarkEntry } from '../types/auth.types';
import { useAuthStore } from '../store/auth-store';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_USERS_KEY = 'mock_users_db';
const getMockUsers = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  } catch {
    return [];
  }
};
const saveMockUsers = (users: any[]) => {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
};

export const marksService = {
  getMarks: async (): Promise<MarkEntry[]> => {
    if (USE_MOCK) {
      await delay(600);
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('Not authenticated.');
      
      const users = getMockUsers();
      const dbUser = users.find(u => u.id === user.id);
      return dbUser?.marks || [];
    } else {
      const response = await apiClient.get<{ marks: MarkEntry[] }>('/marks');
      return response.data.marks;
    }
  },

  addMark: async (markData: Omit<MarkEntry, 'id'>): Promise<MarkEntry> => {
    if (USE_MOCK) {
      await delay(800);
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('Not authenticated.');

      const users = getMockUsers();
      const index = users.findIndex(u => u.id === user.id);
      if (index === -1) throw new Error('User not found.');

      const newMark: MarkEntry = {
        ...markData,
        id: Math.random().toString(36).substring(2, 11),
      };

      const dbUser = users[index];
      dbUser.marks = dbUser.marks || [];
      dbUser.marks.push(newMark);
      
      users[index] = dbUser;
      saveMockUsers(users);
      return newMark;
    } else {
      const response = await apiClient.post<{ mark: MarkEntry }>('/marks', markData);
      return response.data.mark;
    }
  },

  updateMark: async (id: string, markData: Partial<MarkEntry>): Promise<MarkEntry> => {
    if (USE_MOCK) {
      await delay(800);
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('Not authenticated.');

      const users = getMockUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex === -1) throw new Error('User not found.');

      const dbUser = users[userIndex];
      dbUser.marks = dbUser.marks || [];
      const markIndex = dbUser.marks.findIndex((m: any) => m.id === id);
      if (markIndex === -1) throw new Error('Mark entry not found.');

      const updatedMark = {
        ...dbUser.marks[markIndex],
        ...markData,
      };

      dbUser.marks[markIndex] = updatedMark;
      users[userIndex] = dbUser;
      saveMockUsers(users);
      return updatedMark;
    } else {
      const response = await apiClient.put<{ mark: MarkEntry }>(`/marks/${id}`, markData);
      return response.data.mark;
    }
  },

  deleteMark: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(600);
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('Not authenticated.');

      const users = getMockUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex === -1) throw new Error('User not found.');

      const dbUser = users[userIndex];
      dbUser.marks = dbUser.marks || [];
      dbUser.marks = dbUser.marks.filter((m: any) => m.id !== id);
      
      users[userIndex] = dbUser;
      saveMockUsers(users);
      return;
    } else {
      await apiClient.delete(`/marks/${id}`);
    }
  }
};
