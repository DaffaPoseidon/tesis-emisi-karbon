import "./App.css";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/login/Login";
import SignupValidator from "./pages/signup/SignupValidator";
import SignupSeller from "./pages/signup/SignupSeller";
import SignupBuyer from "./pages/signup/SignupBuyer";
import Dashboard from "./pages/dashboard/Dashboard";
import LandingPage from "./pages/landingPage/LandingPage";
import DataRekap from "./pages/dataRekap/DataRekap";
import ProtectedRouteValidator from "./components/ProtectedRouteValidator";
import ProtectedRouteSuperadmin from "./components/ProtectedRouteSuperadmin";

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
          element={<ProtectedRouteValidator element={<Dashboard />} />}
        />
        <Route
          path="/register-validator"
          element={<ProtectedRouteSuperadmin element={<SignupValidator />} />}
        />
        <Route
          path="/register-seller"
          element={<ProtectedRouteSeller element={<SignupSeller />} />}
        />
        <Route
          path="/register-buyer"
          element={<ProtectedRouteBuyer element={<SignupBuyer />} />}
        />
        <Route path="/data-rekap" element={<DataRekap />} />
      </Routes>
    </>
  );
}

export default App;
