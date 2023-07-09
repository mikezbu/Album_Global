import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export const {
  API_URL,
  APP_URL,
  ROOT_URL,
  CLIENT_CREDENTIALS,
  GOOGLE_ANALYTICS_KEY,
  STRIPE_PUBLIC_KEY,
  BUGSNAG_API_KEY,
  DEPLOYMENT_ENVIRONMENT,
} = publicRuntimeConfig
