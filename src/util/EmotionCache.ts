import createCache from '@emotion/cache'

export default function createEmotionCache() {
  return createCache({ key: 'bevios-css', prepend: true })
}
