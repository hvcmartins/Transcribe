

const nextConfig = {
  // Produces a minimal standalone build for Docker
  output: "standalone",

  // Allow large file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default nextConfig;
