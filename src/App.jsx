import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Administrador from "./pages/Administrador";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CatalogoProductos from "./pages/Catalogo_Productos";
import UserProfile from "./pages/UserProfile"; // 👈 NUEVO IMPORT

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Administrador />} />
        <Route path="/profile" element={<UserProfile />} /> {/* 👈 NUEVA RUTA */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/catalogo" element={<CatalogoProductos />} />
      </Routes>
    </Router>
  );
}

export default App;