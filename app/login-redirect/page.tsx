"use client";

import axios from "axios";
import { useEffect } from "react";
import { Tokens } from "../value_objects/Tokens";
import { redirect } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_GATEWAY_URL;

export default function Redirect() {
  const getJWTFromCognitoCode = async () => {
    try {
      const response = await axios.get(`${apiUrl}auth/token?`, {
        params: {
          code: window.location.search.split("=")[1],
        },
      });
      const tokens: Tokens = {
        idToken: response.data.id_token,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
      };
      localStorage.setItem("tokens", JSON.stringify(tokens));
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      redirect("/"); // Redirect to the home page
    }
  };

  useEffect(() => {
    getJWTFromCognitoCode();
  }, []);

  return <div>redirecting...</div>;
}
