import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

export interface UserSchema {
  id: string;
  name: string;
  email: string;
  password?: string; // Hashed password
  role: string;
  verified: boolean;
  createdAt: string;
  otp?: {
    code: string;
    expiresAt: number;
  };
  branch?: string;
  division?: string;
  group?: string;
  batch?: string;
  semester?: string;
  profileCompleted?: boolean;
  marks?: MarkEntry[];
}

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure database directory and file exist
const initDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
};

const readUsers = (): UserSchema[] => {
  initDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading JSON database:', error);
    return [];
  }
};

const writeUsers = (users: UserSchema[]): void => {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to JSON database:', error);
  }
};

export const UserModel = {
  /**
   * Find user by email
   */
  findByEmail: async (email: string): Promise<UserSchema | null> => {
    const users = readUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  /**
   * Find user by ID
   */
  findById: async (id: string): Promise<UserSchema | null> => {
    const users = readUsers();
    const user = users.find((u) => u.id === id);
    return user || null;
  },

  /**
   * Create a new user
   */
  create: async (userData: Omit<UserSchema, 'id' | 'createdAt'>): Promise<UserSchema> => {
    const users = readUsers();
    
    const newUser: UserSchema = {
      ...userData,
      id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);
    return newUser;
  },

  /**
   * Update an existing user's data
   */
  update: async (id: string, updateData: Partial<UserSchema>): Promise<UserSchema | null> => {
    const users = readUsers();
    const index = users.findIndex((u) => u.id === id);
    
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updateData,
    };

    writeUsers(users);
    return users[index];
  },

  /**
   * Remove a user (if needed for testing)
   */
  delete: async (id: string): Promise<boolean> => {
    const users = readUsers();
    const filtered = users.filter((u) => u.id !== id);
    
    if (filtered.length === users.length) return false;

    writeUsers(filtered);
    return true;
  },

  /**
   * Find all users
   */
  findAll: async (): Promise<UserSchema[]> => {
    return readUsers();
  }
};
