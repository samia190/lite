// routes/performance.js
import express from 'express';
import SchoolPerformance from '../models/SchoolPerformance.js';
import { requireAuth, requireRole } from '../middleware/requireAuth.js';

const router = express.Router();

// Public route - Get all published performance records
router.get('/public', async (req, res) => {
  try {
    const { year, term, category } = req.query;
    
    const filter = { published: true };
    if (year) filter.year = parseInt(year);
    if (term) filter.term = term;
    if (category) filter.category = category;

    const performances = await SchoolPerformance.find(filter)
      .sort({ year: -1, displayOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      performances
    });
  } catch (error) {
    console.error('Error fetching public performances:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance data'
    });
  }
});

// Admin routes
router.use(requireAuth);
router.use(requireRole(['admin', 'super_admin']));

// Get all performance records (admin)
router.get('/admin/all', async (req, res) => {
  try {
    const { year, term, category, published } = req.query;
    
    const filter = {};
    if (year) filter.year = parseInt(year);
    if (term) filter.term = term;
    if (category) filter.category = category;
    if (published !== undefined && published !== '') {
      filter.published = published === 'true';
    }

    const performances = await SchoolPerformance.find(filter)
      .sort({ year: -1, term: 1, displayOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      performances
    });
  } catch (error) {
    console.error('Error fetching performances:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance data'
    });
  }
});

// Create new performance record
router.post('/admin/create', async (req, res) => {
  try {
    const {
      year,
      term,
      category,
      title,
      description,
      metric,
      ranking,
      published,
      displayOrder
    } = req.body;

    // Validation
    if (!year || !term || !category || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Year, term, category, title, and description are required'
      });
    }

    const performance = new SchoolPerformance({
      year,
      term,
      category,
      title,
      description,
      metric: metric || '',
      ranking: ranking || '',
      published: published || false,
      displayOrder: displayOrder || 0
    });

    await performance.save();

    res.status(201).json({
      success: true,
      message: 'Performance record created successfully',
      performance
    });
  } catch (error) {
    console.error('Error creating performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create performance record'
    });
  }
});

// Update performance record
router.put('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: Date.now() };

    const performance = await SchoolPerformance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!performance) {
      return res.status(404).json({
        success: false,
        error: 'Performance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Performance record updated successfully',
      performance
    });
  } catch (error) {
    console.error('Error updating performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update performance record'
    });
  }
});

// Toggle publish status
router.patch('/admin/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { published } = req.body;

    const performance = await SchoolPerformance.findByIdAndUpdate(
      id,
      { published, updatedAt: Date.now() },
      { new: true }
    );

    if (!performance) {
      return res.status(404).json({
        success: false,
        error: 'Performance record not found'
      });
    }

    res.json({
      success: true,
      message: `Performance record ${published ? 'published' : 'unpublished'} successfully`,
      performance
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update publication status'
    });
  }
});

// Delete performance record
router.delete('/admin/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const performance = await SchoolPerformance.findByIdAndDelete(id);

    if (!performance) {
      return res.status(404).json({
        success: false,
        error: 'Performance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Performance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete performance record'
    });
  }
});

export default router;
