import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  Button,
  Chip,
  TextField,
  Divider,
  Collapse,
  Fade,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  ShareOutlined,
  BookmarkBorder,
  Bookmark,
  Send,
  MoreHoriz,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const PostCard = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [liked, setLiked] = useState(post.likes?.includes(user?.id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [saved, setSaved] = useState(post.savedBy?.includes(user?.id));
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.comments?.length || 0);
  const [sharesCount, setSharesCount] = useState(post.shares?.length || 0);
  const [shared, setShared] = useState(post.shares?.includes(user?.id));
  const [animatingLike, setAnimatingLike] = useState(false);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setAnimatingLike(true);
    try {
      const response = await api.post(`/posts/${post._id}/like`);
      setLiked(response.data.isLiked);
      setLikesCount(response.data.likes);
      setTimeout(() => setAnimatingLike(false), 300);
      onUpdate?.();
    } catch (error) {
      console.error('Error liking post:', error);
      setAnimatingLike(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await api.post(`/posts/${post._id}/save`);
      setSaved(response.data.isSaved);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleShare = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await api.post(`/posts/${post._id}/share`);
      setShared(response.data.isShared);
      setSharesCount(response.data.shares);
      onUpdate?.();
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handleComment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!commentText.trim()) return;

    try {
      const response = await api.post(`/posts/${post._id}/comment`, {
        text: commentText,
      });
      setComments([...comments, response.data.comment]);
      setCommentsCount(response.data.commentsCount);
      setCommentText('');
      onUpdate?.();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).toLowerCase();
  };

  // Parse hashtags from text
  const renderTextWithHashtags = (text) => {
    if (!text) return null;
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <Typography
            key={index}
            component="span"
            sx={{
              color: '#1877F2',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => navigate(`/search?q=${part.slice(1)}`)}
          >
            {part}
          </Typography>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        overflow: 'visible',
        animation: 'fadeIn 0.3s ease-in',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={post.userAvatar}
              sx={{
                width: 48,
                height: 48,
                cursor: 'pointer',
                border: '2px solid #E4E6EB',
              }}
              onClick={() => navigate(`/profile/${post.userId}`)}
            >
              {post.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.2 }}
              >
                {post.username}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#65676B', display: 'block' }}
              >
                @{post.username?.toLowerCase().replace(/\s+/g, '')}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#8C939D', fontSize: '0.7rem' }}
              >
                {formatDate(post.createdAt)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user && user.id !== post.userId && (
              <Button
                variant="contained"
                size="small"
                sx={{
                  borderRadius: 20,
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 2,
                  bgcolor: '#1877F2',
                  '&:hover': { bgcolor: '#0D5BC4' },
                }}
              >
                Follow
              </Button>
            )}
            <IconButton size="small">
              <MoreHoriz sx={{ color: '#65676B' }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <CardContent sx={{ pt: 1, pb: 1 }}>
        <Typography variant="body1" sx={{ mb: 1.5, whiteSpace: 'pre-wrap' }}>
          {renderTextWithHashtags(post.text)}
        </Typography>

        {/* Image */}
        {post.image && (
          <Box
            component="img"
            src={post.image}
            alt="Post"
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: 2,
              mt: 1,
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}

        {/* Category Badge for Promotions */}
        {post.category === 'promotion' && (
          <Chip
            label="PROMOTION"
            size="small"
            sx={{
              mt: 1,
              bgcolor: '#FFF3E0',
              color: '#F57C00',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        )}
      </CardContent>

      {/* Actions */}
      <Box sx={{ px: 2, py: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1,
            borderTop: '1px solid #E4E6EB',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Like Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                onClick={handleLike}
                size="small"
                sx={{ 
                  p: 0.5,
                  transition: 'transform 0.2s',
                  '&:active': { transform: 'scale(1.2)' },
                }}
              >
                {liked ? (
                  <Favorite sx={{ 
                    color: '#FF3040', 
                    fontSize: 24,
                    animation: animatingLike ? 'pulse 0.3s ease' : 'none',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.3)' },
                    },
                  }} />
                ) : (
                  <FavoriteBorder sx={{ color: '#65676B', fontSize: 24 }} />
                )}
              </IconButton>
              <Typography variant="body2" sx={{ color: '#65676B', fontWeight: 500 }}>
                {likesCount}
              </Typography>
            </Box>

            {/* Comment Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                onClick={() => setShowComments(!showComments)}
                size="small"
                sx={{ p: 0.5 }}
              >
                <ChatBubbleOutline sx={{ color: '#65676B', fontSize: 22 }} />
              </IconButton>
              <Typography variant="body2" sx={{ color: '#65676B', fontWeight: 500 }}>
                {commentsCount}
              </Typography>
            </Box>

            {/* Share Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                onClick={handleShare}
                size="small"
                sx={{ p: 0.5 }}
              >
                <ShareOutlined sx={{ color: shared ? '#1877F2' : '#65676B', fontSize: 22 }} />
              </IconButton>
              <Typography variant="body2" sx={{ color: '#65676B', fontWeight: 500 }}>
                {sharesCount}
              </Typography>
            </Box>
          </Box>

          {/* Save Button */}
          <IconButton onClick={handleSave} size="small">
            {saved ? (
              <Bookmark sx={{ color: '#1877F2', fontSize: 24 }} />
            ) : (
              <BookmarkBorder sx={{ color: '#65676B', fontSize: 24 }} />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* Comments Section */}
      <Collapse in={showComments}>
        <Box sx={{ px: 2, pb: 2, bgcolor: '#F8F9FA' }}>
          <Divider sx={{ mb: 2 }} />
          
          {/* Comments List */}
          {comments.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {comments.map((comment, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    mb: 1.5,
                    p: 1.5,
                    bgcolor: '#fff',
                    borderRadius: 2,
                  }}
                >
                  <Avatar
                    src={comment.userAvatar}
                    sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
                  >
                    {comment.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                      {comment.username}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#333' }}>
                      {comment.text}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8C939D', fontSize: '0.65rem' }}>
                      {formatDate(comment.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {/* Add Comment */}
          {user && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Avatar
                src={user.avatar}
                sx={{ width: 32, height: 32, fontSize: '0.875rem' }}
              >
                {user.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 20,
                      bgcolor: '#fff',
                    },
                  }}
                />
                <IconButton
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                  sx={{
                    bgcolor: commentText.trim() ? '#1877F2' : '#E4E6EB',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: commentText.trim() ? '#0D5BC4' : '#E4E6EB',
                    },
                  }}
                >
                  <Send sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default PostCard;
