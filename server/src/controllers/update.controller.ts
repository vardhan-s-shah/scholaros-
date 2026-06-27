import { Response } from 'express';
import { UpdateModel } from '../models/update.model.js';

export const UpdateController = {
  /**
   * Get all updates (public to all authenticated users)
   */
  getUpdates: async (_req: any, res: Response): Promise<void> => {
    try {
      const updates = await UpdateModel.findAll();
      res.status(200).json({ updates });
    } catch (error) {
      console.error('Get updates error:', error);
      res.status(500).json({ message: 'Failed to fetch updates.' });
    }
  },

  /**
   * Create a new update (admin only)
   */
  createUpdate: async (req: any, res: Response): Promise<void> => {
    try {
      const { title, category, description } = req.body;

      if (!title || !category || !description) {
        res.status(400).json({ message: 'Title, category, and description are required.' });
        return;
      }

      const newUpdate = await UpdateModel.create({ title, category, description });
      res.status(201).json({ message: 'Update created successfully.', update: newUpdate });
    } catch (error) {
      console.error('Create update error:', error);
      res.status(500).json({ message: 'Failed to create update.' });
    }
  },

  /**
   * Modify an existing update (admin only)
   */
  updateUpdate: async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, category, description } = req.body;

      const existing = await UpdateModel.findById(id);
      if (!existing) {
        res.status(404).json({ message: 'Update not found.' });
        return;
      }

      const updated = await UpdateModel.update(id, { title, category, description });
      res.status(200).json({ message: 'Update modified successfully.', update: updated });
    } catch (error) {
      console.error('Update update error:', error);
      res.status(500).json({ message: 'Failed to modify update.' });
    }
  },

  /**
   * Delete an update (admin only)
   */
  deleteUpdate: async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const success = await UpdateModel.delete(id);
      if (!success) {
        res.status(404).json({ message: 'Update not found.' });
        return;
      }

      res.status(200).json({ message: 'Update deleted successfully.' });
    } catch (error) {
      console.error('Delete update error:', error);
      res.status(500).json({ message: 'Failed to delete update.' });
    }
  }
};
