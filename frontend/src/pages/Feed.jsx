import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Avatar,
  IconButton,
  Chip,
  CircularProgress,
  Skeleton,
  Fab,
} from '@mui/material';
import {
  Image,
  EmojiEmotions,
  Poll,
  Campaign,
  Search,
  Add,
} from '@mui/icons-material';
import PostCard from '../components/PostCard';
import PromotionCard from '../components/PromotionCard';
import EmojiPicker from '../components/EmojiPicker';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Feed = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, for-you, most-liked, most-commented
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, post, promotion
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [createPostText, setCreatePostText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const observer = useRef();
  const lastPostRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const fetchPosts = async (pageNum = 1, filterType = filter) => {
    try {
      let url = `/posts?page=${pageNum}&limit=10&filter=${filterType}`;
      if (categoryFilter !== 'all') {
        url = `/posts/category/${categoryFilter}?page=${pageNum}&limit=10`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (err) {
      console.error('Error fetching posts:', err);
      throw err;
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    
    try {
      const data = await fetchPosts(1, filter);
      setPosts(data.posts);
      setHasMore(data.currentPage < data.totalPages);
      setPage(1);
    } catch (err) {
      console.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const data = await fetchPosts(nextPage, filter);
      
      setPosts(prev => [...prev, ...data.posts]);
      setHasMore(data.currentPage < data.totalPages);
      setPage(nextPage);
    } catch (err) {
      console.error('Error loading more posts');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [filter, categoryFilter]);

  const handleCreatePost = () => {
    if (createPostText.trim()) {
      navigate('/create', { state: { initialText: createPostText } });
    } else {
      navigate('/create');
    }
  };

  const handleCreatePromotion = () => {
    navigate('/create', { state: { mode: 'promotion' } });
  };

  const handleEmojiSelect = (emoji) => {
    setCreatePostText((prev) => prev + emoji);
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'refer-earn', label: 'Refer and earn' },
    { id: 'crypto', label: 'Crypto' },
  ];

  const feedFilters = [
    { id: 'for-you', label: 'For You' },
    { id: 'most-liked', label: 'Most Liked' },
    { id: 'most-commented', label: 'Most Commented' },
  ];

  return (
    <Box sx={{ pb: 2 }}>
      {/* Search Bar */}
      <Box sx={{ px: 2, py: 2 }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: '2px 4px',
            borderRadius: 30,
            bgcolor: '#F0F2F5',
            border: '1px solid #E4E6EB',
          }}
        >
          <TextField
            fullWidth
            placeholder="Search promotions, users, posts..."
            variant="standard"
            size="small"
            onClick={() => navigate('/search')}
            InputProps={{
              disableUnderline: true,
              sx: { px: 2 },
            }}
          />
          <IconButton
            sx={{
              bgcolor: '#1877F2',
              color: '#fff',
              '&:hover': { bgcolor: '#0D5BC4' },
              mr: 0.5,
            }}
            onClick={() => navigate('/search')}
          >
            <Search />
          </IconButton>
        </Paper>
      </Box>

      {/* Create Post Card */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: '#fff',
          }}
        >
          {/* Header with Tabs */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              Create Post
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="All Posts"
                onClick={() => setCategoryFilter('all')}
                sx={{
                  bgcolor: categoryFilter === 'all' ? '#1877F2' : '#F0F2F5',
                  color: categoryFilter === 'all' ? '#fff' : '#65676B',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: categoryFilter === 'all' ? '#0D5BC4' : '#E4E6EB',
                  },
                }}
              />
              <Chip
                label="Create"
                onClick={() => navigate('/create', { state: { mode: 'promotion' } })}
                sx={{
                  bgcolor: '#1877F2',
                  color: '#fff',
                  fontWeight: 500,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#0D5BC4',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Input */}
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="What's on your mind?"
            value={createPostText}
            onChange={(e) => setCreatePostText(e.target.value)}
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            sx={{
              mb: 2,
              '& .MuiInputBase-root': {
                fontSize: '1rem',
              },
            }}
          />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" sx={{ color: '#1877F2' }}>
                <Image />
              </IconButton>
              
              {/* Emoji Picker */}
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              
              <IconButton size="small" sx={{ color: '#E94F89' }}>
                <Poll />
              </IconButton>
              <IconButton 
                size="small" 
                sx={{ color: '#1877F2' }}
                onClick={handleCreatePromotion}
              >
                <Campaign />
              </IconButton>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#1877F2', 
                  ml: 0.5,
                  alignSelf: 'center',
                  fontWeight: 500,
                }}
              >
                Promote
              </Typography>
            </Box>
            <Button
              variant="contained"
              disabled={!createPostText.trim()}
              onClick={handleCreatePost}
              sx={{
                borderRadius: 20,
                px: 3,
                textTransform: 'none',
                bgcolor: createPostText.trim() ? '#1877F2' : '#E4E6EB',
                '&:hover': {
                  bgcolor: createPostText.trim() ? '#0D5BC4' : '#E4E6EB',
                },
              }}
            >
              Post
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Category Filter Tabs */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {filters.map((f) => (
          <Button
            key={f.id}
            onClick={() => setCategoryFilter(f.id)}
            sx={{
              borderRadius: 20,
              px: 2,
              py: 0.5,
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              bgcolor: categoryFilter === f.id ? '#1877F2' : '#fff',
              color: categoryFilter === f.id ? '#fff' : '#65676B',
              border: categoryFilter === f.id ? 'none' : '1px solid #E4E6EB',
              '&:hover': {
                bgcolor: categoryFilter === f.id ? '#0D5BC4' : '#F0F2F5',
              },
            }}
          >
            {f.label}
          </Button>
        ))}
      </Box>

      {/* Feed Filter Tabs */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          borderBottom: '1px solid #E4E6EB',
          pb: 2,
        }}
      >
        {feedFilters.map((f) => (
          <Button
            key={f.id}
            onClick={() => setFilter(f.id)}
            sx={{
              borderRadius: 20,
              px: 2,
              py: 0.5,
              textTransform: 'none',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              bgcolor: filter === f.id ? '#1877F2' : '#fff',
              color: filter === f.id ? '#fff' : '#65676B',
              border: filter === f.id ? 'none' : '1px solid #E4E6EB',
              '&:hover': {
                bgcolor: filter === f.id ? '#0D5BC4' : '#F0F2F5',
              },
            }}
          >
            {f.label}
          </Button>
        ))}
      </Box>

      {/* Posts Feed */}
      <Box sx={{ px: 2, pt: 2 }}>
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Paper key={i} sx={{ mb: 2, p: 2, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ ml: 1 }}>
                  <Skeleton variant="text" width={120} />
                  <Skeleton variant="text" width={80} />
                </Box>
              </Box>
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 1, borderRadius: 2 }} />
            </Paper>
          ))
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No posts yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Be the first to create a post!
            </Typography>
          </Box>
        ) : (
          <>
            {posts.map((post, index) => {
              const CardComponent = post.category === 'promotion' ? PromotionCard : PostCard;
              
              if (posts.length === index + 1) {
                return (
                  <div ref={lastPostRef} key={post._id}>
                    <CardComponent post={post} onUpdate={loadPosts} />
                  </div>
                );
              }
              return <CardComponent key={post._id} post={post} onUpdate={loadPosts} />;
            })}

            {loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            )}

            {!hasMore && posts.length > 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                You've reached the end of the feed
              </Typography>
            )}
          </>
        )}
      </Box>

      {/* Floating Action Button for Quick Post */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 20,
          bgcolor: '#1877F2',
          '&:hover': { bgcolor: '#0D5BC4' },
        }}
        onClick={() => navigate('/create')}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Feed;
