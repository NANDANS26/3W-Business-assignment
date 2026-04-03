import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  IconButton,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  ArrowBack,
  Person,
  Article,
  Tag,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import PostCard from '../components/PostCard';

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Popular hashtags
  const popularTags = [
    'TaskPlanet', 'Leaderboard', 'Winning', 'Fitness', 'Travel',
    'Foodie', 'Photography', 'Motivation', 'Coding', 'Art'
  ];

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setUsers([]);
        setPosts([]);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      // Search users
      const userResponse = await api.get(`/auth/search?query=${encodeURIComponent(query)}`);
      setUsers(userResponse.data.users || []);

      // Search posts
      const postResponse = await api.get(`/posts/search/posts?query=${encodeURIComponent(query)}`);
      setPosts(postResponse.data.posts || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F0F2F5' }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton onClick={() => navigate('/')}>
            <ArrowBack />
          </IconButton>
          <TextField
            fullWidth
            placeholder="Search users, posts, hashtags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <Search sx={{ color: '#8C939D', mr: 1 }} />
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 30,
                bgcolor: '#F0F2F5',
              },
            }}
          />
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTabs-indicator': {
              bgcolor: '#1877F2',
            },
          }}
        >
          <Tab
            icon={<Person sx={{ fontSize: 20 }} />}
            label="Users"
            sx={{ textTransform: 'none' }}
          />
          <Tab
            icon={<Article sx={{ fontSize: 20 }} />}
            label="Posts"
            sx={{ textTransform: 'none' }}
          />
          <Tab
            icon={<Tag sx={{ fontSize: 20 }} />}
            label="Tags"
            sx={{ textTransform: 'none' }}
          />
        </Tabs>
      </Paper>

      {/* Content */}
      <Box sx={{ p: 2 }}>
        {activeTab === 0 && (
          <Box>
            {query.trim() === '' ? (
              // Suggested users or recent searches
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#65676B' }}>
                  Popular Users
                </Typography>
                {users.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    Search for users to see results
                  </Typography>
                )}
              </Box>
            ) : users.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No users found
              </Typography>
            ) : (
              <List>
                {users.map((user, index) => (
                  <React.Fragment key={user._id}>
                    <ListItem
                      button
                      onClick={() => navigate(`/profile/${user._id}`)}
                      sx={{ borderRadius: 2 }}
                    >
                      <ListItemAvatar>
                        <Avatar src={user.avatar} sx={{ bgcolor: '#1877F2' }}>
                          {user.username?.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {user.username}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            @{user.username?.toLowerCase().replace(/\s+/g, '')}
                          </Typography>
                        }
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 20,
                          textTransform: 'none',
                          borderColor: '#1877F2',
                          color: '#1877F2',
                        }}
                      >
                        Follow
                      </Button>
                    </ListItem>
                    {index < users.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            {query.trim() === '' ? (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2, color: '#65676B' }}>
                  Trending Posts
                </Typography>
                {posts.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    Search for posts to see results
                  </Typography>
                )}
              </Box>
            ) : posts.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No posts found
              </Typography>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, color: '#65676B' }}>
              Popular Hashtags
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {popularTags.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  onClick={() => {
                    setQuery(tag);
                    setActiveTab(1);
                  }}
                  sx={{
                    bgcolor: '#E7F3FF',
                    color: '#1877F2',
                    fontWeight: 500,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#D0E5FF',
                    },
                  }}
                />
              ))}
            </Box>

            {query.startsWith('#') && posts.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Posts with #{query.replace('#', '')}
                </Typography>
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchPage;
