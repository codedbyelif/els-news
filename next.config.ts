import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Kullanıcılar haber/profil görsellerini link olarak yapıştırır; herhangi
    // bir https host'tan görsele izin veriyoruz. (next/image yine de optimize
    // ve yeniden boyutlandırma yapar.)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
