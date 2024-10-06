#!/usr/bin/env node
import 'dotenv/config'

import { KindleClient } from '../src'

async function main() {
  const kindle = new KindleClient()

  await kindle.init()
  console.log(JSON.stringify(kindle.books, null, 2))

  const bookDetails = await kindle.getBookDetails(kindle.books[0]!.asin)
  console.log(JSON.stringify(bookDetails, null, 2))
}

try {
  await main()
} catch (err) {
  console.error('error', err)
  process.exit(1)
}
