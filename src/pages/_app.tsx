import '../styles/globals.css';

import {Provider} from 'react-redux';
import type {AppProps} from 'next/app';

import store from '../store';
import Head from 'next/head';

export default function MyApp({Component, pageProps}: AppProps) {
  return (
    <Provider store={store}>
      <MyHead />
      <Component {...pageProps} />
    </Provider>
  );
}

export const MyHead = () => {
  return (
    <Head>
      <meta name="application-name" content="Break Only Three" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Break Only Three" />
      <meta name="description" content="Break only three" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-config" content="/icons/browserconfig.xml" />
      <meta name="msapplication-TileColor" content="#2B5797" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#000000" />

      <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
      <link
        rel="apple-touch-icon"
        sizes="64x64"
        href="/icons/favicon-64x64.png"
      />

      <link
        rel="icon"
        type="image/ico"
        sizes="64x64"
        href="/icons/favicon-64x64.png"
      />
      <link rel="manifest" href="/manifest.json" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"
      />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="Break Only Three" />
      <meta property="og:description" content="Break only three" />
      <meta property="og:site_name" content="Break Only Three" />
      <meta property="og:url" content="https://break-only-three.vercel.app" />
      <meta
        property="og:image"
        content="https://break-only-three.vercel.app/icons/favicon-64x64.png"
      />
    </Head>
  );
};
