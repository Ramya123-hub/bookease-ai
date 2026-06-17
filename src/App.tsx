import { HashRouter, Routes, Route } from 'react-router-dom';
import SignupLogin from './components/SignupLogin';
import CustomerDashboard from './components/CustomerDashboard';
import ProviderDashboard from './components/ProviderDashboard';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SignupLogin />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      </Routes>
    </HashRouter>
  );
}
