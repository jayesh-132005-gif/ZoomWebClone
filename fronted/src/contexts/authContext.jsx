import { createContext } from "react";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {

  // 1. Authentication states
  // user
  // loading
  // isAuthenticated


  // 2. Register function
  const register = async () => {
    // registration logic later
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