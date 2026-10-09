import { createContext, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {

  // 1. Authentication states
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);


  // 2. Register function
  const register = async (name, username, password) => {
    setLoading(true);

    // Try and catch block to handle network errors
    try {
      const response = await fetch("http://localhost:8000/api/v1/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData,
        }
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      }

    } catch (error) {
      return {
        success: false,
        error: {
          message: "Network error. Please try again.",
        },
      };

    } finally {
      setLoading(false);
    }

  };


  // 3. Login function
  const login = async (username, password) => {
    setLoading(true);

    // Try and catch block to handle network errors
    try {
      const response = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData,
        }
      }

      const data = await response.json();
      if (!data.token) {
        return {
          success: false,
          error: {
            message: "Login response did not contain a token.",
          },
        };
      }
      sessionStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      return {
        success: true,
        data: data,
      };

    } catch (error) {
      return {
        success: false,
        error: {
          message: "Network error. Please try again.",
        },
      };

    } finally {
      setLoading(false);
    }

  };


  // 4. Logout function
  const logout = () => {
    sessionStorage.removeItem("token");
    setIsAuthenticated(false);
  };


  // 5. Provide everything to children
  return (
    <AuthContext.Provider
      value={{
        // states
        user,
        isAuthenticated,
        loading,

        // functions
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export default AuthContext;