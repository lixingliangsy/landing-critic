import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'
import ChatWidget from '../components/ChatWidget'
import { SUPPORT } from '../lib/support.config'

export default function App({ Component, pageProps }: AppProps) {
  return       <><Head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="LandingCritic" />
        <meta property="og:description" content="Paste your landing page copy; get a 5-point critique covering value prop, CTA, target user, proof, and pricing. For indie founders shipping without a copywriter." />
        <meta property="og:url" content="https://landing-critic.lxsaihub.com/" />
        <meta property="og:image" content="https://landing-critic.lxsaihub.com/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="LandingCritic" />
        <meta name="twitter:description" content="Paste your landing page copy; get a 5-point critique covering value prop, CTA, target user, proof, and pricing. For indie founders shipping without a copywriter." />
        <meta name="twitter:image" content="https://landing-critic.lxsaihub.com/og.png" />
                                        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: '{"@context":"https://schema.org","@type":"SoftwareApplication","name":"LandingCritic","url":"https://landing-critic.lxsaihub.com/","description":"Paste your landing page copy; get a 5-point critique covering value prop, CTA, target user, proof, and pricing. For indie founders shipping without a copywriter.","applicationCategory":"BusinessApplication","operatingSystem":"Web","offers":{"@type":"Offer","priceCurrency":"USD","price":"0","availability":"https://schema.org/OnlineOnly"}}' }} />
      </Head>
      <Component {...pageProps} />
      <ChatWidget productName={SUPPORT.productName} brandColor={SUPPORT.brandColor} sessionKeyPrefix={SUPPORT.productSlug} /></>
}
