# trans-log-proxy
HTTP transparent logging proxy

If you want to **log** headers and body of request and response for some micro-service in your system then you can set DEFAULT_URL equal to micro-service address and **replace** its url in config files with address of this proxy - after this headers/body of request/response logs to console.

Usually I run it as a service with [pm2sd](https://github.com/artemdudkin/pm2sd) and get log files at /var/log, but you can look through console output.

## Config

| Name | Description |
| -------- | ------- |
|PORT|Listening port|
|DEFAULT_URL|All requests will be forwarded to this url|
|ADDITIONAL_URL_COUNT|You can add several exceptions (and this is its' quantity):|
|ADDITIONAL_\{N\}_PATH|Requests with url starting with given path will be redirected to url specified below|
|ADDITIONAL_\{N\}_URL|('N' means number; starting from 1)|

## Run

```
node index.js config.file
```
(you can omit config.file and it will use `./index.cfg`)

## Sample output

```
Using config from C:\Users\A\src\_github\cfg
  all --> http://192.168.1.1/
Server listening at http://localhost:8081

>> POST htpp://192.168.1.1:80/realms/myrealm/protocol/openid-connect/token
>> HEADERS
   content-type = application/x-www-form-urlencoded
   content-length = 51
   connection = close
>> BODY[51]  grant_type=password&client_id=myclient&scope=openid
<< 401
<< HEADERS
   server = nginx/1.24.0 (Ubuntu)
   date = Sun, 19 Oct 2025 23:40:37 GMT
   content-type = application/json; charset=utf-8
   content-length = 77
   connection = close
   cache-control = no-store
   pragma = no-cache
   referrer-policy = no-referrer
   strict-transport-security = max-age=31536000; includeSubDomains
   x-content-type-options = nosniff
   x-frame-options = SAMEORIGIN
<< BODY[77] {"error":"invalid_request","error_description":"Missing parameter: username"}
```
