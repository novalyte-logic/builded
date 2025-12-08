/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Exclude server-only packages from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@google-cloud/bigquery': false,
        '@google-cloud/common': false,
        'google-gax': false,
        'google-auth-library': false,
        fs: false,
        net: false,
        tls: false,
        'server-only': false,
      }
    }
    
    // Ignore BigQuery during client-side bundling
    config.externals = config.externals || []
    if (!isServer) {
      config.externals.push({
        '@google-cloud/bigquery': 'commonjs @google-cloud/bigquery',
      })
    }
    
    return config
  },
}

module.exports = nextConfig

