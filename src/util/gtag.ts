import { GOOGLE_ANALYTICS_KEY } from 'src/ApplicationConfiguration'

interface IWindow {
  gtag: any
}

declare let window: IWindow
// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (!GOOGLE_ANALYTICS_KEY) {
    return
  }

  window.gtag('config', GOOGLE_ANALYTICS_KEY, {
    page_location: url,
  })
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  if (!GOOGLE_ANALYTICS_KEY) {
    return
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  })
}
