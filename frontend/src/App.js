import "./App.css";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/login/Login";
import SignupValidator from "./pages/signup/SignupValidator";
import SignupUser from "./pages/signup/SignupUser";
import Dashboard from "./pages/dashboard/Dashboard";
import LandingPage from "./pages/landingPage/LandingPage";
import DataKandidat from "./pages/dataKandidat/DataKandidat";
import ProtectedRouteValidator from "./components/ProtectedRouteValidator";
import ProtectedRouteSuperadmin from "./components/ProtectedRouteSuperadmin";
import ProtectedRouteSeller from "./components/ProtectedRouteSeller";
import ProtectedRouteBuyer from "./components/ProtectedRouteBuyer";
import BuyProduct from "./pages/marketplace/BuyProduct";
import Marketplace from "./pages/marketplace/Marketplace";
import ProductDetail from './pages/marketplace/ProductDetail';

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
          element={<ProtectedRouteSeller element={<Dashboard />} />}
        />
        <Route
          path="/buy/:productId"
          element={<ProtectedRouteBuyer element={<BuyProduct />} />}
        />
        <Route
          path="/register-validator"
          element={<ProtectedRouteSuperadmin element={<SignupValidator />} />}
        />
        <Route path="/register-user" element={<SignupUser />} />
        <Route
          path="/data-kandidat"
          element={<ProtectedRouteValidator element={<DataKandidat />} />}
        />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
      </Routes>
    </>
  );
}

export default App;
