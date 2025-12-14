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
import Navbar from './components/Navbar';
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
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionHistoryPage />} />
          <Route path="/transactions/:id" element={<TransactionDetailsPage />} />
          <Route path="/create-vpa" element={<CreateVPAPage />} />
          <Route path="/send-money" element={<SendMoneyPage />} />
          <Route path="/request-money" element={<RequestMoneyPage />} />
          <Route path="/" element={<Navigate replace to="/login" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
