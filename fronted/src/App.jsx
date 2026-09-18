import "./App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import  LandingPage  from "./pages/landing.jsx";
import  Authentication from "./pages/authentication.jsx";
import  Register from "./pages/register.jsx";
import  Home from "./pages/home.jsx";

 function App() {

  return (
    <>
      
      <BrowserRouter>

        <Routes>

          <Route path="/" element={<LandingPage />}  />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />

        </Routes>

      </BrowserRouter>



    

    </>
      
 
  );
}

export default App;

