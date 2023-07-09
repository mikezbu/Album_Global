import createEmotionServer from '@emotion/server/create-instance'
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'
import React from 'react'

import { GOOGLE_ANALYTICS_KEY } from 'src/ApplicationConfiguration'
import theme from 'src/common/styles/ThemeContext'
import createEmotionCache from 'src/util/EmotionCache'

class MyDocument extends Document {
  public static getInitialProps = async (ctx: DocumentContext) => {
    const originalRenderPage = ctx.renderPage

    const cache = createEmotionCache()
    const { extractCriticalToChunks } = createEmotionServer(cache)

    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: (App: any) =>
          function EnhanceApp(props) {
            return <App emotionCache={cache} {...props} />
          },
      })

    const initialProps = await Document.getInitialProps(ctx)

    const emotionStyles = extractCriticalToChunks(initialProps.html)
    const emotionStyleTags = emotionStyles.styles.map(style => (
      <style
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
        key={style.key}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: style.css }}
      />
    ))

    return {
      ...initialProps,
      // Styles fragment is rendered after the app and page rendering finish.
      styles: [...React.Children.toArray(initialProps.styles), ...emotionStyleTags],
    }
  }

  public render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="google" content="notranslate" />
          <meta name="theme-color" content={theme.palette.background.default} />
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,200;0,300;0,400;0,500;0,700;1,100&family=Pacifico&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="h-full w-full overflow-hidden">
          <Main />
          <NextScript />
        </body>
        <style>
          {`::-webkit-scrollbar {
                width: 0px;
                background: transparent;
            }`}
        </style>

        {this.gtag()}
      </Html>
    )
  }

  private gtag() {
    if (!GOOGLE_ANALYTICS_KEY) {
      return <></>
    }

    return (
      <>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_KEY}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GOOGLE_ANALYTICS_KEY}', {
                  page_path: window.location.pathname,
                });
              `,
          }}
        />
      </>
    )
  }
}

export default MyDocument
