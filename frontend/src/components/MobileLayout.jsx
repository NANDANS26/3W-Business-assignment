import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import {
  Home,
  Search,
  AddCircle,
  Person,
  Notifications,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const MobileLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Hide layout on login/register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return children;
  }

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 0;
    if (path === '/search') return 1;
    if (path === '/create') return 2;
    if (path.startsWith('/profile')) return 3;
    return 0;
  };

  const handleNavigation = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/search');
        break;
      case 2:
        navigate('/create');
        break;
      case 3:
        navigate(user ? `/profile/${user.id}` : '/login');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F0F2F5',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 480,
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      }}
    >
      {/* Top Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#fff',
          color: '#333',
          borderBottom: '1px solid #E4E6EB',
        }}
      >
        <Toolbar sx={{ minHeight: 56, px: 2 }}>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              fontSize: '1.25rem',
              color: '#1877F2',
            }}
          >
            Social
          </Typography>

          {/* Points Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#FFF3E0',
              borderRadius: 20,
              px: 1.5,
              py: 0.5,
              mr: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: '#F57C00',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <span>50</span>
              <EmojiEvents sx={{ fontSize: 16, color: '#FFB300' }} />
            </Typography>
          </Box>

          {/* Earnings Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#E8F5E9',
              borderRadius: 20,
              px: 1.5,
              py: 0.5,
              mr: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: '#2E7D32',
              }}
            >
              $0.0000
            </Typography>
          </Box>

          {/* Notifications */}
          <IconButton size="small" sx={{ mr: 1 }}>
            <Badge badgeContent={1} color="error">
              <Notifications sx={{ color: '#666' }} />
            </Badge>
          </IconButton>

          {/* Profile Avatar */}
          <Avatar
            src={user?.avatar}
            sx={{
              width: 36,
              height: 36,
              border: '2px solid #4CAF50',
              cursor: 'pointer',
            }}
            onClick={() => navigate(user ? `/profile/${user.id}` : '/login')}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          pb: 8,
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          zIndex: 1000,
          borderRadius: 0,
        }}
      >
        <BottomNavigation
          value={getActiveTab()}
          onChange={handleNavigation}
          showLabels
          sx={{
            bgcolor: '#1877F2',
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              color: 'rgba(255,255,255,0.7)',
              minWidth: 'auto',
              padding: '6px 0',
              '&.Mui-selected': {
                color: '#fff',
              },
            },
          }}
        >
          <BottomNavigationAction
            icon={<Home sx={{ fontSize: 28 }} />}
            label="Home"
          />
          <BottomNavigationAction
            icon={<Search sx={{ fontSize: 28 }} />}
            label="Search"
          />
          <BottomNavigationAction
            icon={
              <Box
                sx={{
                  bgcolor: '#FFD700',
                  borderRadius: '50%',
                  p: 0.5,
                  transform: 'translateY(-8px)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                }}
              >
                <AddCircle sx={{ fontSize: 32, color: '#1877F2' }} />
              </Box>
            }
          />
          <BottomNavigationAction
            icon={<Notifications sx={{ fontSize: 28 }} />}
            label="Activity"
          />
          <BottomNavigationAction
            icon={<Person sx={{ fontSize: 28 }} />}
            label="Profile"
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MobileLayout;
