export interface MarkEntry {
  id: string;
  subjectCode: string;
  subjectName: string;
  semester: string;
  credits: number;
  midSemMarks: number;
  midSemMax: number;
  endSemMarks?: number;
  endSemMax: number;
  internalMarks: number;
  internalMax: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'faculty';
  createdAt: string;
  branch?: string;
  division?: string;
  group?: string;
  batch?: string;
  semester?: string;
  profileCompleted?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setRememberMe: (rememberMe: boolean) => void;
}
