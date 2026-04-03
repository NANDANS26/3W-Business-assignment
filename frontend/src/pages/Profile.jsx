import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  LocationOn,
  Link as LinkIcon,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      // In a real app, you'd have a profile endpoint
      // For now, we'll use the current user or mock data
      if (isOwnProfile && currentUser) {
        setProfile(currentUser);
      } else {
        // Fetch user by ID
        // const response = await api.get(`/auth/user/${userId}`);
        // setProfile(response.data.user);
        setProfile({
          id: userId,
          username: 'User ' + userId?.slice(-4),
          followersCount: 0,
          followingCount: 0,
        });
      }

      // Fetch user's posts
      // const postsResponse = await api.get(`/posts/user/${userId || currentUser?.id}`);
      // setPosts(postsResponse.data.posts);
      setPosts([]);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFollow = async () => {
    try {
      await api.post(`/auth/follow/${userId}`);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F2F5', pb: 8 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0, borderBottom: '1px solid #E4E6EB' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {profile?.username}
          </Typography>
        </Box>
      </Paper>

      {/* Profile Info */}
      <Box sx={{ bgcolor: '#fff', pb: 2 }}>
        {/* Cover Image */}
        <Box
          sx={{
            height: 150,
            bgcolor: 'linear-gradient(135deg, #1877F2 0%, #0D5BC4 100%)',
            background: 'linear-gradient(135deg, #1877F2 0%, #0D5BC4 100%)',
          }}
        />

        {/* Avatar & Actions */}
        <Box sx={{ px: 2, position: 'relative' }}>
          <Avatar
            src={profile?.avatar}
            sx={{
              width: 100,
              height: 100,
              border: '4px solid #fff',
              position: 'absolute',
              top: -50,
              bgcolor: '#1877F2',
              fontSize: '2rem',
            }}
          >
            {profile?.username?.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, pb: 3 }}>
            {isOwnProfile ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                sx={{
                  borderRadius: 20,
                  textTransform: 'none',
                  borderColor: '#1877F2',
                  color: '#1877F2',
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "outlined" : "contained"}
                onClick={handleFollow}
                sx={{
                  borderRadius: 20,
                  textTransform: 'none',
                  px: 3,
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </Box>

          {/* User Info */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {profile?.username}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              @{profile?.username?.toLowerCase().replace(/\s+/g, '')}
            </Typography>

            {/* Stats */}
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Typography variant="body2">
                <strong>{profile?.followingCount || 0}</strong>{' '}
                <span style={{ color: '#65676B' }}>Following</span>
              </Typography>
              <Typography variant="body2">
                <strong>{profile?.followersCount || 0}</strong>{' '}
                <span style={{ color: '#65676B' }}>Followers</span>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid #E4E6EB',
            '& .MuiTabs-indicator': {
              bgcolor: '#1877F2',
            },
          }}
        >
          <Tab label="Posts" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Likes" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Media" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {activeTab === 0 && (
          <Box>
            {posts.length === 0 ? (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No posts yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isOwnProfile ? "Start sharing your thoughts!" : "This user hasn't posted anything yet."}
                </Typography>
                {isOwnProfile && (
                  <Button
                    variant="contained"
                    sx={{ mt: 2, borderRadius: 20, textTransform: 'none' }}
                    onClick={() => navigate('/create')}
                  >
                    Create Post
                  </Button>
                )}
              </Paper>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Liked posts will appear here
            </Typography>
          </Paper>
        )}

        {activeTab === 2 && (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Media posts will appear here
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default Profile;
