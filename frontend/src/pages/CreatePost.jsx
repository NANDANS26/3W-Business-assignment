import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Image,
  Poll,
  Campaign,
  ArrowBack,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import EmojiPicker from '../components/EmojiPicker';

const CreatePost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  // Mode: 'post' or 'promotion'
  const [mode, setMode] = useState(location.state?.mode || 'post');
  
  // Post fields
  const [text, setText] = useState(location.state?.initialText || '');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Promotion fields
  const [appName, setAppName] = useState('');
  const [promotionTitle, setPromotionTitle] = useState('');
  const [promotionDescription, setPromotionDescription] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [promoCategory, setPromoCategory] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiSelect = (emoji) => {
    if (mode === 'post') {
      setText((prev) => prev + emoji);
    } else {
      setPromotionDescription((prev) => prev + emoji);
    }
  };

  const validateForm = () => {
    if (mode === 'post') {
      if (!text.trim() && !image) {
        setError('Please add some text or an image to your post');
        return false;
      }
    } else {
      if (!appName.trim() || !promotionTitle.trim()) {
        setError('App name and promotion title are required');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      if (mode === 'post') {
        if (text.trim()) formData.append('text', text.trim());
        if (image) formData.append('image', image);
        formData.append('category', 'post');
      } else {
        // Promotion mode
        formData.append('appName', appName);
        formData.append('promotionTitle', promotionTitle);
        formData.append('promotionDescription', promotionDescription);
        formData.append('buttonText', buttonText || 'Download Now');
        formData.append('buttonLink', buttonLink);
        formData.append('promoCategory', promoCategory);
        formData.append('category', 'promotion');
        if (image) formData.append('image', image);
        
        // Create promotion text
        const promoText = `${promotionTitle}\n${promotionDescription}\n\n${buttonText || 'Download Now'}: ${buttonLink || '#'}`;
        formData.append('text', promoText);
      }

      await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F2F5' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, borderBottom: '1px solid #E4E6EB' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton onClick={() => navigate('/')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {mode === 'post' ? 'Create Post' : 'Create Promotion'}
          </Typography>
          <Button
            variant="contained"
            disabled={loading}
            onClick={handleSubmit}
            sx={{
              borderRadius: 20,
              textTransform: 'none',
              px: 3,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (mode === 'post' ? 'Post' : 'Promote')}
          </Button>
        </Box>
      </Paper>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Mode Toggle */}
        <Paper elevation={0} sx={{ p: 1, borderRadius: 3, mb: 2, display: 'flex', gap: 1 }}>
          <Chip
            label="Posts"
            onClick={() => setMode('post')}
            sx={{
              flex: 1,
              py: 1.5,
              bgcolor: mode === 'post' ? '#1877F2' : 'transparent',
              color: mode === 'post' ? '#fff' : '#65676B',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: mode === 'post' ? '#0D5BC4' : '#F0F2F5',
              },
            }}
          />
          <Chip
            label="Promotions"
            onClick={() => setMode('promotion')}
            sx={{
              flex: 1,
              py: 1.5,
              bgcolor: mode === 'promotion' ? '#1877F2' : 'transparent',
              color: mode === 'promotion' ? '#fff' : '#65676B',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: mode === 'promotion' ? '#0D5BC4' : '#F0F2F5',
              },
            }}
          />
        </Paper>

        {mode === 'post' ? (
          // POST MODE
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            {/* User Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                src={user?.avatar}
                sx={{ width: 48, height: 48, bgcolor: '#1877F2' }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user?.username}
                </Typography>
              </Box>
            </Box>

            {/* Text Input */}
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              variant="standard"
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                mb: 2,
                '& .MuiInputBase-root': {
                  fontSize: '1.1rem',
                  lineHeight: 1.5,
                },
              }}
            />

            {/* Image Preview */}
            {imagePreview && (
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
                <IconButton
                  onClick={removeImage}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
            )}

            {/* Action Bar */}
            <Box
              sx={{
                pt: 2,
                borderTop: '1px solid #E4E6EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ color: '#1877F2' }}
                >
                  <Image />
                </IconButton>
                
                {/* Emoji Picker */}
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                
                <IconButton sx={{ color: '#E94F89' }}>
                  <Poll />
                </IconButton>
                <IconButton 
                  sx={{ color: '#1877F2' }}
                  onClick={() => setMode('promotion')}
                >
                  <Campaign />
                </IconButton>
              </Box>
              <Typography variant="caption" sx={{ color: '#65676B' }}>
                {text.length > 0 && `${text.length} chars`}
              </Typography>
            </Box>
          </Paper>
        ) : (
          // PROMOTION MODE
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            {/* App Name */}
            <TextField
              fullWidth
              label="App/Website Name (e.g. TaskPlanet)"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              margin="normal"
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F8F9FA',
                },
              }}
            />

            {/* Promotion Title */}
            <TextField
              fullWidth
              label="Promotion Title"
              value={promotionTitle}
              onChange={(e) => setPromotionTitle(e.target.value)}
              margin="normal"
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F8F9FA',
                },
              }}
            />

            {/* Promotion Description */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Promotion Description..."
              value={promotionDescription}
              onChange={(e) => setPromotionDescription(e.target.value)}
              margin="normal"
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F8F9FA',
                },
              }}
            />

            {/* Button Text & Category Row */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Button Text (e.g. Shop Now)"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#F8F9FA',
                  },
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Select Category</InputLabel>
                <Select
                  value={promoCategory}
                  label="Select Category"
                  onChange={(e) => setPromoCategory(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: '#F8F9FA',
                  }}
                >
                  <MenuItem value="refer-earn">Refer And Earn</MenuItem>
                  <MenuItem value="crypto">Crypto</MenuItem>
                  <MenuItem value="shopping">Shopping</MenuItem>
                  <MenuItem value="gaming">Gaming</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Button Link */}
            <TextField
              fullWidth
              label="Button Link (https://...)"
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
              margin="normal"
              variant="outlined"
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F8F9FA',
                },
              }}
            />

            {/* Image Preview for Promotion */}
            {imagePreview && (
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
                <IconButton
                  onClick={removeImage}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
            )}

            {/* Action Bar */}
            <Box
              sx={{
                pt: 2,
                borderTop: '1px solid #E4E6EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ color: '#1877F2' }}
                >
                  <Image />
                </IconButton>
                
                {/* Emoji Picker */}
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                
                <IconButton sx={{ color: '#E94F89' }}>
                  <Poll />
                </IconButton>
                <Button
                  startIcon={<Campaign />}
                  size="small"
                  sx={{ 
                    color: '#1877F2',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                  onClick={() => {}}
                >
                  Promote
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default CreatePost;
