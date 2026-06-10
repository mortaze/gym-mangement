// backend\next.config.js

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push("@mongodb-js/zstd-win32-x64-msvc");
    }
    return config;
  },
};
