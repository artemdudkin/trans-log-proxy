const proxy = require('express-http-proxy');
const path = require('path');
const fs = require('fs');
const express = require('express');

const configFile = process.argv.length > 2 ? process.argv[2] : './index.cfg'
console.log('Using config from', configFile);
const config = require('dotenv').parse(fs.readFileSync(configFile))

const PORT = config.PORT || 8092
const URL = config.DEFAULT_URL

const ADDITIONAL_URL_COUNT = +(config.ADDITIONAL_URL_COUNT || '0')

const app = express();
app.disable('x-powered-by');

let mapping = [{path:'/', url:URL}];
for (let i=ADDITIONAL_URL_COUNT; i>0; i--) {
  mapping.unshift({path:config[`ADDITIONAL_${i}_PATH`], url:config[`ADDITIONAL_${i}_URL`]})
}

mapping.forEach(m => console.log(' ', (m.path==='/'?'all':m.path), '-->', m.url))


const opt = {
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    console.log();
    console.log('>> ' + proxyReqOpts.method + ' htpp://' + proxyReqOpts.host + ':' + proxyReqOpts.port + proxyReqOpts.path)
    console.log('>> HEADERS')
    let headerNames = Object.keys(proxyReqOpts.headers)
    for (let i=0; i<headerNames.length; i++) console.log('   ' + headerNames[i] + ' = ' + proxyReqOpts.headers[headerNames[i]])
    return proxyReqOpts;
  },

  proxyReqBodyDecorator: function(bodyContent, srcReq) {
    console.log(`>> BODY[${bodyContent.toString().length}] `, bodyContent.toString())
    return bodyContent;
  },

  userResHeaderDecorator: function(headers, userReq, userRes, proxyReq, proxyRes) {
    console.log('<< ' + userRes.statusCode);
    console.log('<< HEADERS')
    let headerNames = Object.keys(headers)
    for (let i=0; i<headerNames.length; i++) console.log('   ' + headerNames[i] + ' = ' + headers[headerNames[i]])

    return headers;
  },

  userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
    let data = proxyResData.toString('utf8');
    console.log(`<< BODY[${data.length}]`, data);
    return data;
  }
}

for (let i=0; i<mapping.length; i++) {
  let {path, url} = mapping[i]
  app.use(path, proxy(url, opt));
}




// default 404 response 
app.use(function (req, res, next) {
  console.log(">>", "404")
  res.status(404).send("route not exists");
});

// default error handler 
app.use((err, req, res, next)=>{
  if (res.headersSent) {
    return next(err);
  }
  console.log(">>", "500")
  console.log(err);
  res.status(500).send({ errorMsg: err.toString() });
});

// uncaught exceptions handler 
process.on('uncaughtException', function (err) {
  console.log('**************************');
  console.log('* [process.on(uncaughtException)]: err:', err);
  console.log('**************************');
});

app.listen(+PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})

