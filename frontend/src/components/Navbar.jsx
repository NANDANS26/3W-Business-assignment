import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
} from '@mui/material';
import { Home, AddCircle, ExitToApp, Login, PersonAdd } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: '#fff', color: '#333', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: '#1976d2',
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          SocialFeed
        </Typography>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              startIcon={<Home />}
              sx={{ textTransform: 'none' }}
            >
              Feed
            </Button>
            <Button
              component={RouterLink}
              to="/create"
              color="primary"
              variant="contained"
              startIcon={<AddCircle />}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Create
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: '#1976d2', width: 32, height: 32, fontSize: 14 }}>
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user.username}
              </Typography>
            </Box>
            <Button
              color="error"
              startIcon={<ExitToApp />}
              onClick={handleLogout}
              sx={{ textTransform: 'none' }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/login"
              color="inherit"
              startIcon={<Login />}
              sx={{ textTransform: 'none' }}
            >
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              color="primary"
              variant="contained"
              startIcon={<PersonAdd />}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
