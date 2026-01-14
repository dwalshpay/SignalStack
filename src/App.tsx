import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Calculator } from '@/pages/Calculator';
import { Implementation } from '@/pages/Implementation';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/calculator" replace />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/implementation" element={<Implementation />} />
        <Route path="/implementation/:tool" element={<Implementation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
