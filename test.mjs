#!/usr/bin/env node

//import assert from 'tap'
import {httpsGetPromise} from './httpsGetPromise.mjs'

//const p = await httpsGetPromise("https://diary.sshida.com/")
try {
  const timeout = 2000
  const p = await httpsGetPromise("http://localhost:3333/", {timeout})
  console.log(`Done:`, p)
} catch(error) {
  console.error(error)
}


//assert.equal(t(), true);
//assert.equal(t.isArray([]), true);
