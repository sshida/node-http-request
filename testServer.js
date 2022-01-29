#!/usr/bin/env node

require('http').createServer(async (request,response) => {
  console.debug(`Request: ${request.method} ${request.url} ... sleep 8000 ms`)
  await sleep(8000)
  response.end("Sleeped 8000 ms, TEST")
}).listen(3333)

const sleep = ms => new Promise((resolve) => setTimeout(resolve, ms))

