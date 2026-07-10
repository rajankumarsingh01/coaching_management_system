// import axios from 'axios';

// const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
//   withCredentials: true,
// });

// axiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem('accessToken');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// let isRefreshing = false;
// let refreshSubscribers = [];

// const onRefreshed = (newToken) => {
//   refreshSubscribers.forEach((callback) => callback(newToken));
//   refreshSubscribers = [];
// };

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const refreshToken = localStorage.getItem('refreshToken');
//       if (!refreshToken) {
//         localStorage.clear();
//         window.location.href = '/login';
//         return Promise.reject(error);
//       }

//       if (!isRefreshing) {
//         isRefreshing = true;
//         try {
//           const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {
//             refreshToken,
//           });
//           const newAccessToken = data.data.accessToken;
//           localStorage.setItem('accessToken', newAccessToken);
//           isRefreshing = false;
//           onRefreshed(newAccessToken);
//         } catch (refreshError) {
//           isRefreshing = false;
//           localStorage.clear();
//           window.location.href = '/login';
//           return Promise.reject(refreshError);
//         }
//       }

//       return new Promise((resolve) => {
//         refreshSubscribers.push((newToken) => {
//           originalRequest.headers.Authorization = `Bearer ${newToken}`;
//           resolve(axiosInstance(originalRequest));
//         });
//       });
//     }

//     return Promise.reject(error);
//   }
// );

// export default axiosInstance;







import axios from 'axios';

// Create a reusable Axios instance so every API request shares the same
// configuration (base URL, credentials, interceptors, etc.).
const axiosInstance = axios.create({
  // Base URL comes from the Vite environment file (.env)
  // Example:
  // VITE_API_BASE_URL=http://localhost:5000/api/v1
  baseURL: import.meta.env.VITE_API_BASE_URL,

  // Sends cookies along with requests (required if backend uses HttpOnly cookies).
  // Even if the current project stores tokens in localStorage, keeping this enabled
  // makes it easy to migrate to cookie-based authentication later.
  withCredentials: true,
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
| Runs BEFORE every outgoing request.
|
| Responsibility:
| 1. Read access token from localStorage.
| 2. Attach it to the Authorization header.
|
| Result:
| Every protected API automatically receives:
|
| Authorization: Bearer <accessToken>
|
| Components never need to attach the token manually.
*/
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
|--------------------------------------------------------------------------
| Refresh Token Management
|--------------------------------------------------------------------------
|
| isRefreshing
| ------------
| Prevents multiple refresh-token API calls.
|
| Example:
| Five API requests receive 401 simultaneously.
|
| Without this flag:
|    Refresh API × 5
|
| With this flag:
|    Refresh API × 1
|
|
| refreshSubscribers
| ------------------
| Stores requests waiting for a new access token.
| Once refresh succeeds, all queued requests are retried automatically.
*/
let isRefreshing = false;
let refreshSubscribers = [];

/*
|--------------------------------------------------------------------------
| Notify Waiting Requests
|--------------------------------------------------------------------------
|
| Called after a new access token is received.
|
| Every waiting request receives the new token and continues execution.
*/
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
|
| Runs AFTER every server response.
|
| Success Response
| ----------------
| Returns response directly.
|
| Error Response
| --------------
| If access token expires (401):
|
| 1. Get refresh token.
| 2. Request a new access token.
| 3. Save the new access token.
| 4. Retry the original request automatically.
|
| The user stays logged in without noticing anything.
*/
axiosInstance.interceptors.response.use(

  // Successful responses pass through unchanged.
  (response) => response,

  async (error) => {

    // Save the failed request so it can be retried later.
    const originalRequest = error.config;

    /*
    ----------------------------------------------------------------------
    Retry only once.

    _retry prevents an infinite refresh loop.

    Without _retry:

        Request
           ↓
          401
           ↓
        Refresh
           ↓
          401
           ↓
        Refresh
           ↓
        Infinite Loop ❌
    ----------------------------------------------------------------------
    */
    if (error.response?.status === 401 && !originalRequest._retry) {

      originalRequest._retry = true;

      // Read refresh token from localStorage.
      const refreshToken = localStorage.getItem('refreshToken');

      /*
      --------------------------------------------------------------------
      No refresh token means the user session has ended.
      Clear local storage and force login again.
      --------------------------------------------------------------------
      */
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      /*
      --------------------------------------------------------------------
      Only one refresh request should run at a time.
      Other failed requests will wait in refreshSubscribers.
      --------------------------------------------------------------------
      */
      if (!isRefreshing) {

        isRefreshing = true;

        try {

          /*
          --------------------------------------------------------------
          IMPORTANT:
          Use plain axios instead of axiosInstance.

          If axiosInstance is used here,
          the response interceptor would trigger again,
          causing an infinite refresh loop.
          --------------------------------------------------------------
          */
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
            {
              refreshToken,
            }
          );

          // Backend returns a fresh access token.
          const newAccessToken = data.data.accessToken;

          // Replace expired access token.
          localStorage.setItem('accessToken', newAccessToken);

          isRefreshing = false;

          // Retry every queued request.
          onRefreshed(newAccessToken);

        } catch (refreshError) {

          // Refresh token is also invalid or expired.
          isRefreshing = false;

          localStorage.clear();

          window.location.href = '/login';

          return Promise.reject(refreshError);
        }
      }

      /*
      --------------------------------------------------------------------
      Queue the failed request.

      Once refresh finishes, this callback receives the new token,
      updates the Authorization header,
      and retries the original request.
      --------------------------------------------------------------------
      */
      return new Promise((resolve) => {

        refreshSubscribers.push((newToken) => {

          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          resolve(axiosInstance(originalRequest));

        });

      });
    }

    // Forward all other errors to the calling component.
    return Promise.reject(error);
  }
);

export default axiosInstance;