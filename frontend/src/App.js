import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import Header from './components/Header';
import Overview from './pages/Overview';
import Trends from './pages/Trends';
import Explore from './pages/Explore';

function App() {
  return (
    <BrowserRouter>
      <div className="appRoot">
        <Header />
        <div className="pageContentArea">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/explore" element={<Explore />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;