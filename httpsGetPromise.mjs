#!/usr/bin/env node

// HTTP/HTTPS GET with Promise
const debug = 0

import http from 'node:http'
import https from 'node:https'

Array.prototype.toCons = function(num) {
  return Array.from(
    { length: Math.ceil(this.length / num) },
    (_, i) => this.slice(i * num, (i * num) + num))
}
const showHeaders = response =>
  debug > 0 ? console.error(`Response:`, response.rawHeaders.toCons(2).map(h => h.join(": ")).join(`\n`), `\n`) : 0

// return Promise for HTTP or HTTPS method
const httpsGetPromise = (url, options = {}) => 
  new Promise((resolve, reject) => {
    const protocol = url.startsWith(`https:`) ? https : http
    let receiving = 0
    const request = protocol.request(url, options, response => {
      receiving = 1
      showHeaders(response)
      if (response.statusCode > 299) // handle http errors
        reject(new Error('Failed to get content, status code: ' + response.statusCode));

      const body = [];          // temporary data holder
      response.setEncoding('utf8')
      response.on('data', chunk => body.push(chunk))
      response.on('end', () => { receiving = 2; return resolve(body.join('')) })
      response.on('error', err => reject(err))
    })

    if(debug > 1) {
    request.on('socket', stream => console.error(`socket:`, stream)) // network socket is created
    request.on('connect', (r,s,h) => console.error(`connect:`, r,s,h)) // Server responds to CONNECT method
    request.on('response', message => console.error(`response:`, message)) // http response is received
    request.on('upgrade', (r, s, h) => console.error(`r, s, h:`, r, s, h)) // 101 upgrade
    request.on('continue', () => console.error(`continue ...`)) // 100 continue
    request.on('information', (v,j,n,c,m,h,r) => console.error(`information:`, v,j,n,c,m,h,r)) // 101 upgrade
    }
    request.on('close', () => {
      if(debug > 0) console.error(`close:`, receiving)
      if(receiving !== 2)
        reject(new Error(["HTTP_DISCONNECTED_BEFORE_RRECEIVING",url]))
    }) // tcp connection is closed

    request.on('timeout', err => { // http.request(url, {timeout, ...}) triggers "timeout" event
      if(debug > 0) console.error(`timeout:`, err)
      const error = new Error(["HTTP_REQUEST_TIMEOUT",options.timeout,url])
      request.destroy(error)
      reject(error)
    })

    // "error" Event
    // 1. connect ENETUNREACH: The IP address is not unreachable or Network is not connected
    // 2. getaddrinfo ENOTFOUND: IP address is not found
    // 3. connect ECONNREFUSED: Specified port refused to connect
    request.on('error', err => { // TCP disconnect triggers "error" event
      if(debug) console.error(`error:`, err)
      const error = new Error(["HTTP_REQUEST_ERROR",err,url])
      request.destroy(error)
      reject(error)
    })

    request.on('close', err => reject(err))
    //request.write() // for POST method

    request.end()
  })

export { httpsGetPromise }

// Reference: Node.js v17.4.0 documentation, Examples, HTTPS loader
// https://nodejs.org/api/esm.html#https-loader

