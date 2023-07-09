/* eslint-disable no-undef */

const fs = require('fs')
const path = require('path')
const packageJson = require('./package.json')

// Copy Robots.txt
if (process.env.ROBOTS_TXT_FILE) {
  fs.copyFile(`robots/${process.env.ROBOTS_TXT_FILE}`, 'public/robots.txt', err => {
    if (err) throw err
  })
} else {
  fs.copyFile(`robots/robots.allow.all.txt`, 'public/robots.txt', err => {
    if (err) throw err
  })
}

module.exports = {
  reactStrictMode: false,
  poweredByHeader: false,
  swcMinify: false,
  webpack: config => {
    config.resolve.alias['src'] = path.resolve(__dirname, 'src')
    return config
  },
  generateBuildId: async () => {
    return packageJson.version
  },
  eslint: {
    dirs: ['src'],
  },
  images: {
    domains: ['cdn.bemi.dev', 'cdn.bevios.com'],
  },
  publicRuntimeConfig: {
    API_URL: process.env.API_URL,
    APP_URL: process.env.APP_URL,
    ROOT_URL: process.env.ROOT_URL,
    GOOGLE_ANALYTICS_KEY: process.env.GOOGLE_ANALYTICS_KEY,
    STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
    CLIENT_CREDENTIALS: process.env.CLIENT_CREDENTIALS,
    BUGSNAG_API_KEY: process.env.BUGSNAG_API_KEY,
    DEPLOYMENT_ENVIRONMENT: process.env.DEPLOYMENT_ENVIRONMENT,
  },
}
