import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Needed for hosting on azure static web app service.
  The service expects the site to consist of static html/css/javascript,
  so we use 'output: export' which outputs these static components.*/
  output: "export",
};

export default nextConfig;
