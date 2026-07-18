import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BUILDER_API_KEY: process.env.BUILDER_API_KEY,
    BENTO_URL: process.env.BENTO_URL,
    PARLAY_TOURNMENT_URL: process.env.PARLAY_TOURNMENT_URL,
    ANAKIN_API_KEY: process.env.ANAKIN_API_KEY,
  }
};

export default nextConfig;
