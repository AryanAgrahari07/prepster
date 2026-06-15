const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const Bookmark = require('./bookmark.model');

// All routes require auth
router.use(authenticate);

// GET /v1/bookmarks — list all bookmarks, optionally filtered by itemType
router.get('/', async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.itemType) filter.itemType = req.query.itemType;

    const bookmarks = await Bookmark.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: { bookmarks } });
  } catch (err) { next(err); }
});

// POST /v1/bookmarks — add a bookmark
router.post('/', async (req, res, next) => {
  try {
    const { itemType, itemId, snapshot } = req.body;
    if (!itemType || !itemId) {
      return res.status(400).json({ success: false, error: { message: 'itemType and itemId are required' } });
    }

    // upsert to avoid duplicates
    const bookmark = await Bookmark.findOneAndUpdate(
      { userId: req.user._id, itemId },
      { userId: req.user._id, itemType, itemId, snapshot: snapshot || {} },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: { bookmark } });
  } catch (err) { next(err); }
});

// DELETE /v1/bookmarks/:itemId — remove a bookmark by itemId
router.delete('/:itemId', async (req, res, next) => {
  try {
    await Bookmark.findOneAndDelete({ userId: req.user._id, itemId: req.params.itemId });
    res.json({ success: true, message: 'Bookmark removed' });
  } catch (err) { next(err); }
});

// GET /v1/bookmarks/check/:itemId — check if a specific item is bookmarked
router.get('/check/:itemId', async (req, res, next) => {
  try {
    const exists = await Bookmark.exists({ userId: req.user._id, itemId: req.params.itemId });
    res.json({ success: true, data: { isBookmarked: !!exists } });
  } catch (err) { next(err); }
});

module.exports = router;
