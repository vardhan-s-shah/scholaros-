import { apiClient } from './api-client';

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

export interface LeaderboardEntry {
  id: string;
  name: string;
  branch: string;
  semester: string;
  cgpa: number;
  sgpa: number;
}

const getPdeuTotal = (mid: number, ia: number, endSem?: number): number | null => {
  if (endSem === undefined) return null;
  return endSem / 2 + mid + ia;
};

const getGradePoints = (total: number, endSem?: number): number => {
  if (endSem !== undefined && endSem <= 35) return 0;
  if (total >= 80) return 10;
  if (total >= 70) return 9;
  if (total >= 60) return 8;
  if (total >= 55) return 7;
  if (total >= 50) return 6;
  if (total >= 45) return 5;
  if (total >= 40) return 4;
  return 0;
};

export const leaderboardService = {
  getLeaderboard: async (branch?: string, semester?: string): Promise<LeaderboardEntry[]> => {
    if (USE_MOCK) {
      await delay(800);
      const allUsers = getMockUsers();
      
      let filteredUsers = allUsers.filter(u => u.role === 'student' && u.verified && u.branch);
      
      if (branch) {
        filteredUsers = filteredUsers.filter(u => u.branch === branch);
      }
      if (semester) {
        filteredUsers = filteredUsers.filter(u => u.semester === semester);
      }
      
      const leaderboard = filteredUsers.map(u => {
        let cgpaTotalCredits = 0;
        let cgpaTotalPoints = 0;
        let sgpaTotalCredits = 0;
        let sgpaTotalPoints = 0;
        
        const targetSem = semester ? String(semester) : u.semester;

        (u.marks || []).forEach((m: any) => {
          const total = getPdeuTotal(m.midSemMarks, m.internalMarks, m.endSemMarks);
          if (total !== null) {
            const gp = getGradePoints(total, m.endSemMarks);
            cgpaTotalCredits += m.credits;
            cgpaTotalPoints += gp * m.credits;
            
            if (m.semester === targetSem) {
              sgpaTotalCredits += m.credits;
              sgpaTotalPoints += gp * m.credits;
            }
          }
        });
        
        const cgpa = cgpaTotalCredits > 0 ? (cgpaTotalPoints / cgpaTotalCredits) : 0;
        const sgpa = sgpaTotalCredits > 0 ? (sgpaTotalPoints / sgpaTotalCredits) : 0;
        
        return {
          id: u.id,
          name: u.name,
          branch: u.branch,
          semester: u.semester,
          cgpa: Math.round(cgpa * 100) / 100,
          sgpa: Math.round(sgpa * 100) / 100,
        };
      });
      
      leaderboard.sort((a, b) => {
        if (b.cgpa !== a.cgpa) return b.cgpa - a.cgpa;
        return b.sgpa - a.sgpa;
      });
      
      return leaderboard;
    } else {
      const response = await apiClient.get<{ leaderboard: LeaderboardEntry[] }>('/leaderboard', {
        params: { branch, semester }
      });
      return response.data.leaderboard;
    }
  }
};
