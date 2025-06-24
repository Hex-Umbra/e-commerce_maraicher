import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_FETCH_URL;
  const [user, setUser] = useState(null);

  //We check if the user is already logged in
  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log(data);
      setUser(data.user);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
  }, []);

  //Register logic
  const register = async (username, email, password) => {
    const response = await fetch(`${API_URL}/register`, {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    await checkAuth();
  };

  //Login logic
  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    await checkAuth();
  };

  //Logout Logic
  const logout = async () => {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};