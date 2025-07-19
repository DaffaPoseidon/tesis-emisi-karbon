import "./App.css";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/login/Login";
import SignupValidator from "./pages/signup/SignupValidator";
import SignupUser from "./pages/signup/SignupUser";
import DashboardValidator from "./pages/dashboard/DashboardValidator";
import DashboardSeller from "./pages/dashboard/DashboardSeller";
import LandingPage from "./pages/landingPage/LandingPage";
import DataKandidat from "./pages/dataKandidat/DataKandidat";
import ProtectedRouteValidator from "./components/ProtectedRouteValidator";
import ProtectedRouteSuperadmin from "./components/ProtectedRouteSuperadmin";
import ProtectedRouteSeller from "./components/ProtectedRouteSeller";
import ProtectedRouteBuyer from "./components/ProtectedRouteBuyer";
import BuyProduct from "./pages/marketplace/BuyProduct";
import Marketplace from "./pages/marketplace/Marketplace";
import ProductDetail from "./pages/marketplace/ProductDetail";
import Account from "./pages/account/Account";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<Signup />} /> */}
        <Route
          path="/dashboard-seller"
          element={<ProtectedRouteSeller element={<DashboardSeller />} />}
        />
        <Route
          path="/dashboard-validator"
          element={<ProtectedRouteSeller element={<DashboardValidator />} />}
        />
        <Route
          path="/product/:id/buy"
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
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </>
  );
}

export default App;
