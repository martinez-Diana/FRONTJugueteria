import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import UserProfile from "./pages/UserProfile"
import Home from "./pages/Home"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Administrador from "./pages/Administrador"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import CatalogoProductos from "./pages/CatalogoProductos"

function App() {
  return (
    <Router>
      <Routes>
        {/* 👇 Redirección a /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* 👇 Rutas principales */}
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Administrador />} />

        {/* 👇 Nueva ruta del perfil de usuario */}
        <Route path="/profile" element={<UserProfile />} />

        {/* 👇 Rutas de recuperación de contraseña */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 👇 Ruta del catálogo para clientes */}
        <Route path="/catalogo" element={<CatalogoProductos />} />
      </Routes>
    </Router>
  )
}

export default App
