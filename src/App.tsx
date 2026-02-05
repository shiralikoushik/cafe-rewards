import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Games } from './pages/Games';
import { QuantumReflex } from './games/QuantumReflex';
import { MemoMatrix } from './games/MemoMatrix';
import { PrecisionTower } from './games/PrecisionTower';
import { VoidRunner } from './games/VoidRunner';
import { StaffVerify } from './pages/StaffVerify';

// Placeholder for Leaderboard
function Leaderboard() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">Leaderboard</h1>
      <p className="text-gray-400">Rankings coming soon...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="games" element={<Games />} />
          <Route path="games/quantum-reflex" element={<QuantumReflex />} />
          <Route path="games/memo-matrix" element={<MemoMatrix />} />
          <Route path="games/precision-tower" element={<PrecisionTower />} />
          <Route path="games/void-runner" element={<VoidRunner />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="staff" element={<StaffVerify />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
