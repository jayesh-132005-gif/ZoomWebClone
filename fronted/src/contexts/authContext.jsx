import { createContext, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {

  // 1. Authentication states
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);


  // 2. Register function
  const register = async (name, email, password) => {
    setLoading(true);

    const response = await fetch("YOUR_BACKEND_URL/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });






  };









};


// 3. Login function
const login = async () => {
  // login logic later
};


// 4. Logout function
const logout = () => {
  // logout logic later
};


// 5. Provide everything to children
return (
  <AuthContext.Provider
    value={{
      // states
      // functions
    }}
  >
    {children}
  </AuthContext.Provider>
);
};

export { AuthProvider };
export default AuthContext;