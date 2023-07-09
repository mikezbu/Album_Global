import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import LogRocket from 'logrocket'
import { Provider } from 'mobx-react'
import { NextComponentType, NextPageContext } from 'next'
import App, { AppProps } from 'next/app'
import Router from 'next/router'
import NProgress from 'nprogress'
import React from 'react'
import Head from 'next/head'
import { StyledEngineProvider } from '@mui/material/styles'
import { CacheProvider, EmotionCache } from '@emotion/react'
import dynamic from 'next/dynamic'

import MyLayout from 'src/common/components/layout'
import Confirm from 'src/common/components/layout/Confirm'
import Notifier from 'src/common/components/layout/Notifier'
import { initializeStore, Store } from 'src/common/store'
import { APP_URL } from 'src/ApplicationConfiguration'
import * as gtag from 'src/util/gtag'
import Bugsnag, { startBugsnag } from 'src/util/Bugsnag'
import createEmotionCache from 'src/util/EmotionCache'
import 'react-image-crop/dist/ReactCrop.css'
import '../../public/styles/global.css'
import '../../public/styles/nprogress.css'
import theme from 'src/common/styles/ThemeContext'
import packageJson from '../../package.json'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const MediaPlayer = dynamic(() => import('src/modules/track/components/MediaPlayer'), {
  ssr: false,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
})

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

startBugsnag()

const isServer = typeof window === 'undefined'

if (!isServer && APP_URL === 'https://app.bevios.com') {
  LogRocket.init('3omppn/bevios-ui')
  Bugsnag.addOnError(report => {
    report.addMetadata('LogRocket', {
      sessionURL: LogRocket.sessionURL,
    })
  })
}

const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)

NProgress.configure({ showSpinner: false })

Router.events.on('routeChangeStart', () => {
  NProgress.start()
})

Router.events.on('routeChangeComplete', (url: string) => {
  NProgress.done()
  if (!isServer) {
    document.querySelector('#main-container').scrollTo({ top: 0, left: 0, behavior: 'smooth' })
    gtag.pageview(url)
  }
})

Router.events.on('routeChangeError', () => {
  NProgress.done()
  if (!isServer) {
    document.querySelector('#main-container').scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }
})

export interface IContext extends AppProps {
  emotionCache?: EmotionCache
  Component: LayoutComponent
  store: Store
  req: Request
  pathname: string
  asPath: string
  query: {
    slug?: string
    userId?: number
    collectionId?: number
    trackId?: number
    sampleId?: number
    tab?: number
    token?: string
    tagName?: string
    genreName?: string
    instrumentName?: string
  }
}

type LayoutComponent = NextComponentType<NextPageContext, any, any> & {
  Layout?: any
}

class MyApp extends App<IContext> {
  public static async getInitialProps({ Component, ctx }) {
    const store = initializeStore()
    ctx.store = store

    let pageProps: any
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps, store }
  }

  public render() {
    const { Component, emotionCache = clientSideEmotionCache, pageProps } = this.props
    const Layout = Component.Layout || MyLayout
    const store = initializeStore(this.props.store)
    if (!isServer) {
      console.log('Build Version:', packageJson.version)
    }

    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          <StyledEngineProvider injectFirst>
            <CacheProvider value={emotionCache}>
              <Head>
                <meta
                  name="viewport"
                  content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
                />
              </Head>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Provider {...store}>
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                  <div
                    style={{
                      width: '100%',
                      position: 'fixed',
                      bottom: 0,
                      zIndex: 50,
                    }}
                  >
                    <MediaPlayer />
                  </div>
                  <Notifier />
                  <Confirm />
                </Provider>
              </ThemeProvider>
            </CacheProvider>
          </StyledEngineProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    )
  }
}

export default MyApp
