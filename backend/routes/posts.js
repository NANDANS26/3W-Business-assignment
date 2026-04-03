const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// JWT verification helper
const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const jwt = require('jsonwebtoken');
  try {
    return jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// Create a new post
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const userData = verifyToken(req);
    if (!userData) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { 
      text, 
      category,
      appName,
      promotionTitle,
      promotionDescription,
      buttonText,
      buttonLink,
      promoCategory
    } = req.body;
    
    const userId = userData.userId;
    const username = userData.username;

    if (!text && !req.file) {
      return res.status(400).json({ message: 'Post must contain text or image' });
    }

    const user = await User.findById(userId);

    let imageUrl = '';
    
    if (req.file) {
      try {
        const { uploadImage } = require('../utils/cloudinary');
        imageUrl = await uploadImage(req.file.path);
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        imageUrl = req.file.path;
      }
    }

    // Extract hashtags
    const tags = [];
    const textToParse = text || '';
    const hashtagRegex = /#(\w+)/g;
    let match;
    while ((match = hashtagRegex.exec(textToParse)) !== null) {
      tags.push(match[1]);
    }

    const newPost = new Post({
      userId,
      username,
      userAvatar: user.avatar || '',
      text: text || '',
      image: imageUrl,
      // Promotion fields
      appName: appName || '',
      promotionTitle: promotionTitle || '',
      promotionDescription: promotionDescription || '',
      buttonText: buttonText || 'Download Now',
      buttonLink: buttonLink || '',
      promoCategory: promoCategory || '',
      tags,
      category: category || 'post',
      likes: [],
      likedBy: [],
      comments: [],
      shares: [],
      sharedBy: [],
      savedBy: []
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// Get all posts with filters and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || 'all'; // all, for-you, most-liked, most-commented
    const userData = verifyToken(req);

    let query = {};
    let sort = { createdAt: -1 };

    switch (filter) {
      case 'most-liked':
        sort = { likes: -1, createdAt: -1 };
        break;
      case 'most-commented':
        sort = { comments: -1, createdAt: -1 };
        break;
      case 'for-you':
        if (userData) {
          const user = await User.findById(userData.userId);
          if (user && user.following.length > 0) {
            query = { userId: { $in: [...user.following, userData.userId] } };
          }
        }
        break;
      default:
        sort = { createdAt: -1 };
    }

    const posts = await Post.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// Get posts by category (promotions)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (category === 'refer-earn') {
      query = { promoCategory: 'refer-earn' };
    } else if (category === 'promotion') {
      query = { category: 'promotion' };
    } else if (category === 'post') {
      query = { category: 'post' };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Get category posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike a post
router.post('/:postId/like', async (req, res) => {
  try {
    const userData = verifyToken(req);
    if (!userData) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { postId } = req.params;
    const userId = userData.userId;
    const username = userData.username;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
      post.likedBy = post.likedBy.filter(like => like.userId.toString() !== userId);
    } else {
      post.likes.push(userId);
      post.likedBy.push({ userId, username });
    }

    await post.save();

    res.json({
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes.length,
      likedBy: post.likedBy,
      isLiked: !alreadyLiked
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share a post
router.post('/:postId/share', async (req, res) => {
  try {
    const userData = verifyToken(req);
    if (!userData) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { postId } = req.params;
    const userId = userData.userId;
    const username = userData.username;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyShared = post.shares.includes(userId);

    if (alreadyShared) {
      post.shares = post.shares.filter(id => id.toString() !== userId);
      post.sharedBy = post.sharedBy.filter(share => share.userId.toString() !== userId);
    } else {
      post.shares.push(userId);
      post.sharedBy.push({ userId, username });
    }

    await post.save();

    res.json({
      message: alreadyShared ? 'Post unshared' : 'Post shared',
      shares: post.shares.length,
      isShared: !alreadyShared
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save/Unsave a post
router.post('/:postId/save', async (req, res) => {
  try {
    const userData = verifyToken(req);
    if (!userData) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { postId } = req.params;
    const userId = userData.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadySaved = post.savedBy.includes(userId);

    if (alreadySaved) {
      post.savedBy = post.savedBy.filter(id => id.toString() !== userId);
    } else {
      post.savedBy.push(userId);
    }

    await post.save();

    res.json({
      message: alreadySaved ? 'Post unsaved' : 'Post saved',
      isSaved: !alreadySaved
    });
  } catch (error) {
    console.error('Save post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment
router.post('/:postId/comment', async (req, res) => {
  try {
    const userData = verifyToken(req);
    if (!userData) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { postId } = req.params;
    const { text } = req.body;
    const userId = userData.userId;
    const username = userData.username;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = await User.findById(userId);

    const newComment = {
      userId,
      username,
      userAvatar: user.avatar || '',
      text: text.trim()
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1],
      commentsCount: post.comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search posts
router.get('/search/posts', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json({ posts: [] });
    }

    const posts = await Post.find({
      $or: [
        { text: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { appName: { $regex: query, $options: 'i' } },
        { promotionTitle: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(20);

    res.json({ posts });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
