import './App.css';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login/Login';
import Signup from './pages/signup/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import LandingPage from './pages/landingPage/LandingPage';
import DataRekap from './pages/dataRekap/DataRekap';
import ProtectedRouteAdmin from './components/ProtectedRouteAdmin';
import ProtectedRouteSuperadmin from './components/ProtectedRouteSuperadmin';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Signup />} /> */}

        {/* Menggunakan ProtectedRoute untuk melindungi Dashboard */}
        <Route
          path="/dashboard"
          element={<ProtectedRouteAdmin element={<Dashboard />} />}       
        />
         <Route 
          path="/register" 
          element={<ProtectedRouteSuperadmin element={<Signup />} />}     
         />
        <Route path="/data-rekap" element={<DataRekap />} />
      </Routes>
    </>
  );
}

export default App;