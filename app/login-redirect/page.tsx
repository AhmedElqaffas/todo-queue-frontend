"use client";

import axios from "axios";
import { useEffect } from "react";

const apiUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;

export default function Redirect() {
  const getJWTFromCognitoCode = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}auth/token?`,
        new URLSearchParams({
          code: window.location.search.split("=")[1],
        })
      );
      localStorage.setItem("accessToken", response.data.accessToken);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  useEffect(() => {
    getJWTFromCognitoCode();
  }, []);

  return <div>redirecting...</div>;
}
