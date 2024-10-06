# kindle-api-ky <!-- omit from toc -->

> TypeScript client for Kindle's unofficial API.

<p>
  <a href="https://github.com/transitive-bullshit/kindle-api/actions/workflows/main.yml"><img alt="Build Status" src="https://github.com/transitive-bullshit/kindle-api/actions/workflows/main.yml/badge.svg" /></a>
  <a href="https://www.npmjs.com/package/kindle-api-ky"><img alt="NPM" src="https://img.shields.io/npm/v/kindle-api-ky.svg" /></a>
  <a href="https://github.com/transitive-bullshit/kindle-api/blob/main/license"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue" /></a>
  <a href="https://prettier.io"><img alt="Prettier Code Formatting" src="https://img.shields.io/badge/code_style-prettier-brightgreen.svg" /></a>
</p>

- [Intro](#intro)
- [Install](#install)
- [Setup](#setup)
  - [Cookies](#cookies)
  - [Device Token](#device-token)
- [Usage](#usage)
  - [Environment Variables](#environment-variables)
  - [Book Details](#book-details)
  - [Book Content Manifest](#book-content-manifest)
- [Disclaimer](#disclaimer)
- [License](#license)

## Intro

This package is rewrite and extension of https://github.com/Xetera/kindle-api-ky.

It provides a simple TypeScript client for accessing Kindle's unofficial API.

> [!IMPORTANT]
> This library is not officially supported by Amazon / Kindle. Using this library might violate Kindle's Terms of Service. Use it at your own risk.

## Install

```sh
npm install kindle-api-ky
```

## Setup

This library does depends on an external [tls-client-api](https://github.com/bogdanfinn/tls-client-api) to proxy requests due to amazon's recent changes to their TLS fingerprinting. You'll need to run the server locally to be able to use this library. It's quite easy to set up and have one running in a few minutes and will save you tons of headache if you wanna do other kinds of scraping in the future.

<details>

<summary>
This is the `config.dist.yml` file I'm using locally for testing:
</summary>

The only thing I changed form the defaults is the `api_auth_keys` which you'll need to set as an environment variable `TLS_SERVER_API_KEY`.

```yml
env: dev

app_project: tls-client
app_family: tls-client
app_name: api

log:
  handlers:
    main:
      formatter: console
      level: info
      timestamp_format: '15:04:05:000'
      type: iowriter
      writer: stdout

sentry:
  dsn: ''
  release: ''
  tags:
    project: tls-client
    component: tls-client-api

api:
  port: 8080
  mode: release
  health:
    port: 8081
  timeout:
    read: 120s
    write: 120s
    idle: 120s

api_auth_keys: ['agentic-auth-key']

api_cors_allowed_origin_pattern: ''
api_cors_allowed_headers: ['X-API-KEY', 'X-API-VIEW', 'Content-Type']
api_cors_allowed_methods: ['POST', 'GET', 'PUT', 'DELETE']
```

</details>

### Cookies

Amazon's login system is quite strict and the SMS 2FA makes automating logins difficult. Instead of trying to automate that with puppeteer and slow things down, we use 4 cookies that stay valid for an entire year.

**TODO: One or more of these cookies is expiring every few minutes...**

- `ubid-main`
- `at-main`
- `x-main`
- `session-id`

You can grab these values directly by going on inspect element after loading [read.amazon.com](https://read.amazon.com) and copying the entire thing or just the select ones.

![cookies in the network panel](./assets/cookie-demonstration.png)

### Device Token

We also need a deviceToken for your kindle. You can grab this from the same network window as before on the `getDeviceToken` request that looks like:

https://read.amazon.com/service/web/register/getDeviceToken?serialNumber=(your-device-token)&deviceType=(your-device-token)

![device token network request](./assets/kindle-device-token.png)

Both of those identifiers should be the same.

## Usage

```ts
import { KindleClient } from 'kindle-api-ky'

const kindle = new KindleClient({
  cookies: 'ubid-main=xxx.xxxx ...',
  deviceToken: '(your-device-token)'
  tlsServerUrl: 'http://127.0.0.1:8080',
  tlsServerApiKey: '(your-tls-server-api-key)'
})

// Initialize session and fetch initial list of books
await kindle.init()

console.log(kindle.books)

/*
[
  {
    "title": "Revelation Space (The Inhibitor Trilogy Book 1)",
    "asin": "B0819W19WD",
    "webReaderUrl": "https://read.amazon.com/?asin=B0819W19WD",
    "productUrl": "https://m.media-amazon.com/images/I/41sMaof0iQL._SY400_.jpg",
    "authors": [
      "Alastair Reynolds"
    ],
    "resourceType": "EBOOK",
    "originType": "PURCHASE",
    "mangaOrComicAsin": false
  },
  {
    "title": "Dragon's Egg: A Novel (Del Rey Impact)",
    "asin": "B004G8PJDA",
    "webReaderUrl": "https://read.amazon.com/?asin=B004G8PJDA",
    "productUrl": "https://m.media-amazon.com/images/I/51SEoLeSZuL._SY400_.jpg",
    "authors": [
      "Robert L. Forward"
    ],
    "resourceType": "EBOOK",
    "originType": "PURCHASE",
    "mangaOrComicAsin": false
  },
// ...
]
*/
```

### Environment Variables

Instead of passing values directly to `KindleClient`, you can alternatively use env vars:

```sh
KINDLE_COOKIES='TODO'
KINDLE_DEVICE_TOKEN='TODO'

TLS_SERVER_URL='TODO'
TLS_SERVER_API_KEY='TODO'
```

You can checkout this repo, `pnpm install`, set up `.env`, and run `tsx bin/test.ts` to test things locally.

### Book Details

```ts
const bookDetails = await kindle.getBookDetails(kindle.books[0]!.asin)

console.log(bookDetails)

/*
{
  "title": "Revelation Space (The Inhibitor Trilogy Book 1)",
  "asin": "B0819W19WD",
  "authors": [
    "Alastair Reynolds"
  ],
  "bookType": "owned",
  "formatVersion": "CR!WPPV87W8317H7FWJRF6JFMVE7SJY",
  "mangaOrComicAsin": false,
  "originType": "PURCHASE",
  "productUrl": "https://m.media-amazon.com/images/I/41sMaof0iQL._SY400_.jpg",
  "coverUrl": "https://m.media-amazon.com/images/I/41sMaof0iQL._SY400_.jpg",
  "largeCoverUrl": "https://m.media-amazon.com/images/I/41sMaof0iQL.jpg",
  "metadataUrl": "https://k4wyjmetadata.s3.amazonaws.com/books2/B0819W19WD/da38557c/CR%21WPPV87W8317H7FWJRF6JFMVE7SJY/book/YJmetadata.jsonp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20241004T063350Z&X-Amz-SignedHeaders=host&X-Amz-Expires=600&X-Amz-Credential=AKIAUHDZ6VO6DPMXT2XV%2F20241004%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=e6cd53784e98d2ea5b8cea256c9403341be4ae103f31fabddd26cc173a0cd1f1",
  "progress": {
    "reportedOnDevice": "Travis's 2nd iPad",
    "position": 163586,
    "syncDate": "2024-10-04T06:28:56.000Z"
  },
  "webReaderUrl": "https://read.amazon.com/?asin=B0819W19WD",
  "srl": 2393,
  "percentageRead": 13.100000000000001,
  "releaseDate": "21/04/2020",
  "startPosition": 5,
  "endPosition": 1250310,
  "publisher": "Orbit"
}
*/
```

### Book Content Manifest

Kindle uses heavy DRM and obfuscation for the actual book contents. We can, however get some rendering manifest data that is very useful. This method Returns a TAR file as a binary-encoded string. Unzipping the TAR file will result in about a dozen JSON files which specify different aspects of the book's pre-rendered content, layout, TOC, and metadata.

```ts
const manifestTar = await kindle.getBookContentManifest(kindle.books[0]!.asin)
```

## Disclaimer

This library is not endorsed or supported by Amazon / Kindle. It is an unofficial library intended for educational purposes and personal use only. By using this library, you agree to not hold the author or contributors responsible for any consequences resulting from its usage.

## License

MIT © [Travis Fischer](https://x.com/transitive_bs)

This package is rewrite and extension of https://github.com/Xetera/kindle-api-ky.
