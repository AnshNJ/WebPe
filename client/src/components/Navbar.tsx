import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(144, 202, 249, 0.1) 0%, rgba(244, 143, 177, 0.1) 100%)',
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
}));

const LogoText = styled(Typography)({
  fontSize: '1.8rem',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #90caf9 0%, #f48fb1 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  letterSpacing: '0.1em',
  fontFamily: 'system-ui, -apple-system, sans-serif',
});

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
`;

const glow = keyframes`
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-8px);
    opacity: 1;
  }
`;

const AestheticContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
});

const NavButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.primary,
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: 'rgba(144, 202, 249, 0.1)',
  },
}));

const NavContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
});

const DecorativeCircle = styled(Box)({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #90caf9 0%, #f48fb1 100%)',
  animation: `${pulse} 2s ease-in-out infinite`,
});

const DecorativeLine = styled(Box)({
  width: '2px',
  height: '24px',
  background: 'linear-gradient(180deg, transparent 0%, #90caf9 50%, transparent 100%)',
  animation: `${glow} 2s ease-in-out infinite`,
});

const DecorativeDots = styled(Box)({
  display: 'flex',
  gap: '6px',
  '& > div': {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#90caf9',
    animation: `${bounce} 1.5s ease-in-out infinite`,
    '&:nth-of-type(1)': {
      animationDelay: '0s',
    },
    '&:nth-of-type(2)': {
      animationDelay: '0.2s',
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s',
    },
  },
});

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <StyledAppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between', py: 1.5 }}>
        <LogoText
          variant="h5"
          onClick={() => isAuthenticated && handleNavigation('/dashboard')}
          sx={{
            cursor: isAuthenticated ? 'pointer' : 'default',
          }}
        >
          webPe
        </LogoText>
        {isAuthenticated ? (
          <NavContainer>
            <NavButton onClick={() => handleNavigation('/dashboard')}>
              Dashboard
            </NavButton>
            <NavButton onClick={() => handleNavigation('/transactions')}>
              Transaction History
            </NavButton>
            <NavButton onClick={() => handleNavigation('/create-vpa')}>
              Create VPA
            </NavButton>
            <NavButton onClick={() => handleNavigation('/profile')}>
              Profile
            </NavButton>
            <NavButton onClick={handleLogout} sx={{ ml: 1 }}>
              Logout
            </NavButton>
            <AestheticContainer sx={{ ml: 2 }}>
              <DecorativeCircle />
              <DecorativeLine />
              <DecorativeDots>
                <Box />
                <Box />
                <Box />
              </DecorativeDots>
            </AestheticContainer>
          </NavContainer>
        ) : (
          <AestheticContainer>
            <DecorativeCircle />
            <DecorativeLine />
            <DecorativeDots>
              <Box />
              <Box />
              <Box />
            </DecorativeDots>
          </AestheticContainer>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};

export default Navbar;

