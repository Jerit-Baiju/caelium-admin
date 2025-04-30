import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";

const baseURL = process.env.NEXT_PUBLIC_API_HOST || "";

const useAxios = () => {
  const { authTokens, logoutUser, refreshToken } = useContext(AuthContext);
  const api = axios.create({ baseURL });

  api.interceptors.request.use(async (request) => {
    if (authTokens?.access) {
      try {
        const decoded: any = jwtDecode(authTokens.access);
        const expiry = decoded.exp * 1000;
        if (expiry - Date.now() < 60000) {
          const newTokens = await refreshToken();
          if (newTokens?.access) {
            request.headers.Authorization = `Bearer ${newTokens.access}`;
          } else {
            logoutUser();
            return Promise.reject("Session expired");
          }
        } else {
          request.headers.Authorization = `Bearer ${authTokens.access}`;
        }
      } catch {
        logoutUser();
        return Promise.reject("Invalid token");
      }
    }
    return request;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logoutUser();
      }
      return Promise.reject(error);
    }
  );

  return { api };
};

export default useAxios;
