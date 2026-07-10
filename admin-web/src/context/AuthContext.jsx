import { createContext, useContext, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));

  const login = async (email, password) => {
    const { data } = await axiosInstance.post('/auth/login', { email, password });
    const { accessToken: token, refreshToken, user: loggedInUser } = data.data;

    setUser(loggedInUser);
    setAccessToken(token);

    localStorage.setItem('user', JSON.stringify(loggedInUser));
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);

    return loggedInUser;
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (err) {
      // ignore errors on logout
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);










// import { createContext, useContext, useState } from 'react';
// import axiosInstance from '../api/axiosInstance';

// /*
// |--------------------------------------------------------------------------
// | Auth Context
// |--------------------------------------------------------------------------
// | Global authentication container.
// |
// | Stores:
// | - Logged-in user
// | - Access token
// | - Login function
// | - Logout function
// |
// | Any component can access these values using useAuth().
// */
// const AuthContext = createContext(null);

// /*
// |--------------------------------------------------------------------------
// | Auth Provider
// |--------------------------------------------------------------------------
// | Wraps the entire application and provides authentication state
// | to every child component.
// |
// | Example:
// |
// | <AuthProvider>
// |     <App />
// | </AuthProvider>
// */
// export const AuthProvider = ({ children }) => {

//   /*
//   --------------------------------------------------------------------------
//   | User State
//   --------------------------------------------------------------------------
//   | Load user from localStorage only on the first render.
//   |
//   | Why?
//   | ----
//   | React state is cleared after page refresh.
//   | localStorage keeps the user persistent.
//   */
//   const [user, setUser] = useState(() => {
//     const stored = localStorage.getItem('user');
//     return stored ? JSON.parse(stored) : null;
//   });

//   /*
//   --------------------------------------------------------------------------
//   | Access Token State
//   --------------------------------------------------------------------------
//   | Restore access token from localStorage when the application starts.
//   */
//   const [accessToken, setAccessToken] = useState(() =>
//     localStorage.getItem('accessToken')
//   );

//   /*
//   --------------------------------------------------------------------------
//   | Login
//   --------------------------------------------------------------------------
//   | Steps:
//   |
//   | 1. Call backend login API.
//   | 2. Receive user + access token + refresh token.
//   | 3. Update React state.
//   | 4. Save everything in localStorage.
//   | 5. Return logged-in user.
//   */
//   const login = async (email, password) => {

//     // Send login request.
//     const { data } = await axiosInstance.post('/auth/login', {
//       email,
//       password,
//     });

//     // Extract backend response.
//     const {
//       accessToken: token,
//       refreshToken,
//       user: loggedInUser,
//     } = data.data;

//     // Update React state (causes re-render).
//     setUser(loggedInUser);
//     setAccessToken(token);

//     // Persist login after page refresh.
//     localStorage.setItem('user', JSON.stringify(loggedInUser));
//     localStorage.setItem('accessToken', token);
//     localStorage.setItem('refreshToken', refreshToken);

//     return loggedInUser;
//   };

//   /*
//   --------------------------------------------------------------------------
//   | Logout
//   --------------------------------------------------------------------------
//   | Steps:
//   |
//   | 1. Inform backend to invalidate refresh token.
//   | 2. Ignore backend errors (frontend logout should still happen).
//   | 3. Clear React state.
//   | 4. Clear localStorage.
//   */
//   const logout = async () => {
//     try {
//       await axiosInstance.post('/auth/logout');
//     } catch (err) {
//       // Backend logout failure should not stop frontend logout.
//     }

//     // Clear React state.
//     setUser(null);
//     setAccessToken(null);

//     // Remove persisted authentication data.
//     localStorage.removeItem('user');
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//   };

//   /*
//   --------------------------------------------------------------------------
//   | Context Provider
//   --------------------------------------------------------------------------
//   | Makes authentication data available to the entire application.
//   |
//   | Components using useAuth() can access:
//   | - user
//   | - accessToken
//   | - login()
//   | - logout()
//   */
//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         accessToken,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// /*
// |--------------------------------------------------------------------------
// | Custom Hook
// |--------------------------------------------------------------------------
// | Shortcut for:
// |
// | const auth = useContext(AuthContext);
// |
// | Usage:
// |
// | const { user, login, logout } = useAuth();
// */
// export const useAuth = () => useContext(AuthContext);










// Application Start
//         │
//         ▼
// AuthProvider
//         │
//         ▼
// Load User + Token From LocalStorage
//         │
//         ▼
// User Click Login
//         │
//         ▼
// AuthContext.login()
//         │
//         ▼
// axiosInstance.post("/auth/login")
//         │
//         ▼
// Backend
//         │
//         ▼
// Access Token + Refresh Token + User
//         │
//         ▼
// AuthContext
//         │
//         ├── setUser()
//         ├── setAccessToken()
//         └── Save LocalStorage
//         │
//         ▼
// React Re-render
//         │
//         ▼
// Whole App Gets User
//         │
//         ▼
// Protected API
//         │
//         ▼
// axiosInstance
//         │
//         ▼
// Request Interceptor
//         │
//         ▼
// Attach Bearer Token
//         │
//         ▼
// Backend
//         │
//         ▼
// Token Valid?
//       /     \
//     Yes      No (401)
//     │          │
//     ▼          ▼
//  Response   Response Interceptor
//                  │
//                  ▼
//       Refresh Token API
//                  │
//         Valid? ──┬── Yes
//           │      │
//           │      ▼
//           │  New Access Token
//           │      │
//           │      ▼
//           │ Retry Original Request
//           │
//           └── No
//                  │
//                  ▼
//         Clear LocalStorage
//                  │
//                  ▼
//           Redirect /login