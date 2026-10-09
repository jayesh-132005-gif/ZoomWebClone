import "./App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import  LandingPage  from "./pages/landing.jsx";
import  Authentication from "./pages/authentication.jsx";
import  Register from "./pages/Register.jsx";
import  Home from "./pages/home.jsx";
import ProtectedRoute from "./components/protectedRoute.jsx";


 function App() {

  return (
    <>
      
      <BrowserRouter>

        <Routes>
          
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />}  />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
          </Route>

        </Routes>

      </BrowserRouter>

    </>
      
 
  );
}

export default App;

