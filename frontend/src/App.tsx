import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ScribePage from './pages/ScribePage';
import SynapsePage from './pages/SynapsePage';
import LensPage from './pages/LensPage';
import OratorPage from './pages/OratorPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scribe" element={<ScribePage />} />
          <Route path="/synapse" element={<SynapsePage />} />
          <Route path="/lens" element={<LensPage />} />
          <Route path="/orator" element={<OratorPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
