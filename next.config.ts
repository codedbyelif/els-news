import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Görseller Supabase Storage'dan (ve eski kayıtlarda harici linklerden)
    // gelir; her https host'a izin veriyoruz. next/image yine optimize eder.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    serverActions: {
      // Görsel yüklemeleri Server Action gövdesiyle gider. Varsayılan 1 MB
      // sınırı fotoğraflar için çok düşük; upload action'ı 10 MB'a izin
      // verdiği için gövde sınırını biraz daha yüksek tutuyoruz.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
