import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFPs from './pages/RFPs';
import CreateRFP from './pages/CreateRFP';
import RFPDetails from './pages/RFPDetails';
import SendRFP from './pages/SendRFP';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="rfps" element={<RFPs />} />
          <Route path="rfps/create" element={<CreateRFP />} />
          <Route path="rfps/:id" element={<RFPDetails />} />
          <Route path="rfps/:id/send" element={<SendRFP />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
