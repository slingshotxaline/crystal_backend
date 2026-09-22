const catchAsync = require('../utils/catchAsync');

/**
 * Generic CRUD controller factory used by every CMS-managed content
 * type (Service, Industry, Location, CaseStudy, Insight, Job, Page,
 * Redirect, Document). Keeps route wiring consistent and small while
 * each Mongoose model still enforces its own shape and validation.
 */
function crudFactory(Model, { publicFilter = { isPublished: true } } = {}) {
  return {
    // Public: only published content, newest/ordered first
    listPublic: catchAsync(async (req, res) => {
      const items = await Model.find(publicFilter).sort({ order: 1, createdAt: -1 });
      res.json({ success: true, items });
    }),

    getPublicBySlug: catchAsync(async (req, res) => {
      const item = await Model.findOne({ slug: req.params.slug, ...publicFilter });
      if (!item) return res.status(404).json({ success: false, message: 'Not found.' });
      res.json({ success: true, item });
    }),

    // Admin/editor: everything, with pagination
    listAll: catchAsync(async (req, res) => {
      const { page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const [items, total] = await Promise.all([
        Model.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
        Model.countDocuments(),
      ]);
      res.json({ success: true, total, page: Number(page), limit: Number(limit), items });
    }),

    getOne: catchAsync(async (req, res) => {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'Not found.' });
      res.json({ success: true, item });
    }),

    create: catchAsync(async (req, res) => {
      const item = await Model.create(req.body);
      res.status(201).json({ success: true, item });
    }),

    update: catchAsync(async (req, res) => {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!item) return res.status(404).json({ success: false, message: 'Not found.' });
      res.json({ success: true, item });
    }),

    remove: catchAsync(async (req, res) => {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: 'Not found.' });
      res.json({ success: true, message: 'Deleted.' });
    }),
  };
}

module.exports = crudFactory;
