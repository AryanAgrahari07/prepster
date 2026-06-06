const express = require('express');
const router = express.Router();
const Blog = require('./blog.model');
const { AppError } = require('../../middleware/errorHandler');

// GET /v1/blogs - List published blogs
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.tag) filter.tags = req.query.tag;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'profile.firstName profile.lastName profile.avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { blogs },
      pagination: { page, limit, total, hasNext: skip + limit < total },
    });
  } catch (err) {
    next(err);
  }
});

// GET /v1/blogs/:slug - Get single published blog
router.get('/:slug', async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true })
      .populate('author', 'profile.firstName profile.lastName profile.avatar')
      .lean();
      
    if (!blog) {
      throw new AppError('Blog post not found', 404, 4004);
    }

    res.json({ success: true, data: { blog } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
