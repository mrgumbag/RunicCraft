import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CalculatorPage from './pages/CalculatorPage';
import GuidesPage from './pages/GuidesPage';
import './App.css';
import './components/Header.css';
import './components/Footer.css';

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/guides" element={<GuidesPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
