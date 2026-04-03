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
  Collapse,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  ShareOutlined,
  MoreHoriz,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const PromotionCard = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [liked, setLiked] = useState(post.likes?.includes(user?.id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [sharesCount, setSharesCount] = useState(post.shares?.length || 0);
  const [shared, setShared] = useState(post.shares?.includes(user?.id));
  const [commentsCount] = useState(post.comments?.length || 0);

  // Parse promotion data from post
  const parsePromotionData = () => {
    const lines = post.text?.split('\n') || [];
    return {
      title: lines[0] || 'Promotion',
      description: lines.slice(1, -1).join('\n') || '',
      buttonText: 'Download Now',
      buttonLink: '#',
    };
  };

  const promoData = parsePromotionData();

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await api.post(`/posts/${post._id}/like`);
      setLiked(response.data.isLiked);
      setLikesCount(response.data.likes);
      onUpdate?.();
    } catch (error) {
      console.error('Error liking post:', error);
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

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(245, 166, 35, 0.3)',
        overflow: 'visible',
        border: '2px solid #F5A623',
        background: 'linear-gradient(135deg, #FFFBF0 0%, #FFF8E7 100%)',
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
                border: '2px solid #F5A623',
              }}
              onClick={() => navigate(`/profile/${post.userId}`)}
            >
              {post.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2, color: '#333' }}
              >
                {post.username}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#666', display: 'block' }}
              >
                @{post.username?.toLowerCase().replace(/\s+/g, '')}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#999', fontSize: '0.7rem' }}
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
              <MoreHoriz sx={{ color: '#666' }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Promotion Content */}
      <CardContent sx={{ pt: 1, pb: 1 }}>
        {/* App Name Badge */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <Chip
            label={post.appName || "Cash 11 - Play & Earn Money"}
            size="small"
            sx={{
              bgcolor: '#FFF8E7',
              color: '#B8860B',
              border: '1px solid #F5A623',
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: 2,
            }}
          />
        </Box>

        {/* Promotion Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#B8860B',
            mb: 1,
            fontSize: '1.1rem',
          }}
        >
          {promoData.title}
        </Typography>

        {/* Promotion Description */}
        <Typography
          variant="body1"
          sx={{
            color: '#333',
            mb: 2,
            whiteSpace: 'pre-wrap',
          }}
        >
          {promoData.description}
        </Typography>

        {/* Refer and Earn Tags */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label="Refer And Earn"
            size="small"
            sx={{
              bgcolor: '#E8F5E9',
              color: '#2E7D32',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
          <Chip
            label="Simple Tasks"
            size="small"
            sx={{
              bgcolor: '#E3F2FD',
              color: '#1565C0',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          />
        </Box>

        {/* Download Button */}
        <Button
          fullWidth
          variant="contained"
          href={promoData.buttonLink}
          target="_blank"
          sx={{
            borderRadius: 3,
            py: 1.5,
            textTransform: 'uppercase',
            fontWeight: 700,
            fontSize: '0.95rem',
            letterSpacing: 1,
            bgcolor: '#D4AF37',
            background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
            boxShadow: '0 4px 8px rgba(184, 134, 11, 0.3)',
            '&:hover': {
              bgcolor: '#B8860B',
              boxShadow: '0 6px 12px rgba(184, 134, 11, 0.4)',
            },
          }}
          endIcon={<span style={{ fontSize: '1.2rem' }}>→</span>}
        >
          {promoData.buttonText}
        </Button>
      </CardContent>

      {/* Actions */}
      <Box sx={{ px: 2, py: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1,
            borderTop: '1px solid rgba(245, 166, 35, 0.3)',
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
                  <Favorite sx={{ color: '#FF3040', fontSize: 24 }} />
                ) : (
                  <FavoriteBorder sx={{ color: '#666', fontSize: 24 }} />
                )}
              </IconButton>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                {likesCount}
              </Typography>
            </Box>

            {/* Comment Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                size="small"
                sx={{ p: 0.5 }}
              >
                <ChatBubbleOutline sx={{ color: '#666', fontSize: 22 }} />
              </IconButton>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
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
                <ShareOutlined sx={{ color: shared ? '#1877F2' : '#666', fontSize: 22 }} />
              </IconButton>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                {sharesCount}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default PromotionCard;
