import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface UpdateSchema {
  id: string;
  title: string;
  category: string;
  description: string;
  createdAt: string;
}

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'updates.json');

const initDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
};

const readUpdates = (): UpdateSchema[] => {
  initDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading JSON updates database:', error);
    return [];
  }
};

const writeUpdates = (updates: UpdateSchema[]): void => {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(updates, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to JSON updates database:', error);
  }
};

export const UpdateModel = {
  /**
   * Find all updates (sorted by createdAt descending)
   */
  findAll: async (): Promise<UpdateSchema[]> => {
    const updates = readUpdates();
    return updates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Find update by ID
   */
  findById: async (id: string): Promise<UpdateSchema | null> => {
    const updates = readUpdates();
    const update = updates.find((u) => u.id === id);
    return update || null;
  },

  /**
   * Create a new update
   */
  create: async (updateData: Omit<UpdateSchema, 'id' | 'createdAt'>): Promise<UpdateSchema> => {
    const updates = readUpdates();
    
    const newUpdate: UpdateSchema = {
      ...updateData,
      id: 'upd-' + Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
    };

    updates.push(newUpdate);
    writeUpdates(updates);
    return newUpdate;
  },

  /**
   * Update an existing update
   */
  update: async (id: string, updateData: Partial<UpdateSchema>): Promise<UpdateSchema | null> => {
    const updates = readUpdates();
    const index = updates.findIndex((u) => u.id === id);
    
    if (index === -1) return null;

    updates[index] = {
      ...updates[index],
      ...updateData,
    };

    writeUpdates(updates);
    return updates[index];
  },

  /**
   * Delete an update
   */
  delete: async (id: string): Promise<boolean> => {
    const updates = readUpdates();
    const filtered = updates.filter((u) => u.id !== id);
    
    if (filtered.length === updates.length) return false;

    writeUpdates(filtered);
    return true;
  }
};
