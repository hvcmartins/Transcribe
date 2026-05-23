

const nextConfig = {
  // Allow large file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default nextConfig;
