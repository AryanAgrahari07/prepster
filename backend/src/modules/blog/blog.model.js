const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    content: { type: String, required: true }, // Markdown content
    excerpt: { type: String }, // Short summary
    coverImage: { type: String }, // Cloudinary URL
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    readTime: { type: Number, default: 5 }, // in minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
