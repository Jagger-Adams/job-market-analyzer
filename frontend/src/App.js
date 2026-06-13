import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Overview from './pages/Overview';
import Trends from './pages/Trends';
import Explore from './pages/Explore';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/explore" element={<Explore />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;