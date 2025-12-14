import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import TransactionDetailsPage from './pages/TransactionDetailsPage';
import CreateVPAPage from './pages/CreateVPAPage';
import SendMoneyPage from './pages/SendMoneyPage';
import RequestMoneyPage from './pages/RequestMoneyPage';
import ProfilePage from './pages/ProfilePage';
import ManageVPAPage from './pages/ManageVPAPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions/:id"
              element={
                <ProtectedRoute>
                  <TransactionDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-vpa"
              element={
                <ProtectedRoute>
                  <CreateVPAPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/send-money"
              element={
                <ProtectedRoute>
                  <SendMoneyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/request-money"
              element={
                <ProtectedRoute>
                  <RequestMoneyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-vpa"
              element={
                <ProtectedRoute>
                  <ManageVPAPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate replace to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
