# ApiMock

Do you depend on 3rd-party APIs? Does HTTP 503 "Service unavailable" sound way too familiar? There is absolutely
no reason for why outages should slow you down.

In essence, ApiMock is a HTTP proxy. It intercepts requests and replays captured responses. The tool is proven 
in real-life projects. As such, it is easy to set up, has a minimal configuration with sensible defaults and comprises a set of thoughtful features. 

## Key Features

* supports the most frequently used HTTP methods (GET, POST, PUT, DELETE)
* caters for a variety of architectures - REST, SOAP, query parameters .. 
* puts no restrictions on data formats - typically, but not only, JSON and XML
* provides an authentic replay - status code and headers captured along with the data
* enables to simulate live data - think stock quotes auto-updates
* allows to organise and structure captured responses

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Examples](#examples)
  - [REST Style](#rest-style)
  - [Query String](#query-string)
TBC

## Installation

```git clone git@github.com:aalbuquerque73/apimock.git && cd apimock sudo npm install```

Now start the server: ```npm start```

As you can see it runs on the port 8081 by default:

```
> node server

verbose: environment: development
verbose: setting up route: 
verbose: route supported? true
verbose: connector found: wiki_conn
verbose: connecting paths to server api-proxy
verbose: binding /:path to get
verbose: api-proxy listening at http://0.0.0.0:8081
```

## Quick Start

The example below shows how to connect to a typical endpoint, intercept the returned responses and replay them.

[http://date.jsontest.com](http://date.jsontest.com)

returns current date and time:

<pre>
{
   "time": "06:51:17 PM",
   "milliseconds_since_epoch": 1428864677638,
   "date": "04-12-2015"
}
</pre>

Same call, proxied through api mock:

[http://localhost:8081/date](http://localhost:8081/date)

How to get there? Let's start by editing the configuration. 

__conf/default.json__

<pre>
{
    "routes": [
        {
            "proxies": [
                {
                    "binding": "date",
                    "url": "http://date.jsontest.com",
                    "folder": "date"
                }
            ],
            "paths": [ "/:binding" ],
            "method": "get",
            "folder": "jsontest"
        }
    ]
}
</pre>

Save the changes and start the server by running ```npm start```

Go to the browser and enter the following query:

__http://localhost:8081/date__

Here is what you should get:

<pre>
{
   "time": "06:58:14 PM",
   "milliseconds_since_epoch": 1428865094842,
   "date": "04-12-2015"
}
</pre>

Let's take a look at the saved data:

<pre>
data/jsontest
└── date
    ├── file_0.req
    ├── file_0.res
    └── file_0.stats
</pre>  
  
__file_0.req__ keeps information about the original request:

<pre>
{
  "binding": "date"
}  
</pre>

__file_0.res__ stores the captured response:

<pre>
{
   "time": "06:58:14 PM",
   "milliseconds_since_epoch": 1428865094842,
   "date": "04-12-2015"
}
</pre>

__file_0.stats__ retains the response status and all of the response headers:

<pre>
{
  "status": 200,
  "headers": {
    "access-control-allow-origin": "*",
    "content-type": "application/json; charset=ISO-8859-1",
    "date": "Sun, 12 Apr 2015 18:58:14 GMT",
    "server": "Google Frontend",
    "cache-control": "private",
    "alternate-protocol": "80:quic,p=0.5,80:quic,p=0.5",
    "accept-ranges": "none",
    "vary": "Accept-Encoding",
    "transfer-encoding": "chunked"
  }
}
</pre>

## Examples

Here are a few quick examples to help you get started. To give you an idea of how to best
utilise the tool in your own setup, we cover a range of situations.

* [JsonTest](http://www.jsontest.com) - REST + JSON, includes HTTP POST

### REST Style

__Endpoint:__  [http://echo.jsontest.com/hello/world](http://echo.jsontest.com/hello/world) 

__Invocation:__ [http://localhost:8081/echo/message/hello](http://localhost:8081/echo/message/hello)

__Response:__

<pre>
{
    "hello": "world"
}
</pre>

__Configuration:__

<pre>
{
    "routes": [
        {
            "proxies": [
                {
                    "binding": "echo",
                    "url": "http://echo.jsontest.com",
                    "folder": "echo"
                }
            ],
            "paths": [ "/:binding/:key/:val" ],
            "method": "get",
            "folder": "jsontest"
        }
    ]
}
</pre>

__Saved as:__

<pre>
data/jsontest
└── echo
    ├── file_0.req
    ├── file_0.res
    └── file_0.stats
</pre>

__file_0.req__

<pre>
{
  "binding": "echo",
  "key": "message",
  "val": "hello"
}  
</pre>

__file_0.res__

<pre>
{"message": "hello"}
</pre>

__file_0.stats__

<pre>
{
  "status": 200,
  "headers": {
    "access-control-allow-origin": "*",
    "content-type": "application/json; charset=ISO-8859-1",
    "date": "Sun, 12 Apr 2015 18:16:03 GMT",
    "server": "Google Frontend",
    "cache-control": "private",
    "alternate-protocol": "80:quic,p=0.5,80:quic,p=0.5",
    "accept-ranges": "none",
    "vary": "Accept-Encoding",
    "transfer-encoding": "chunked"
  }
}
</pre>

### Query String

__Endpoint:__  [http://validate.jsontest.com/?json={"key":"value"}](http://validate.jsontest.com/?json={"key":"value"}) 

__Invocation:__ [http://localhost:8081/validate?json={"key":"value"}](http://localhost:8081/validate?json={"key":"value"}})

__Response:__

<pre>
{
   "object_or_array": "object",
   "empty": false,
   "parse_time_nanoseconds": 5059984,
   "validate": true,
   "size": 1
}
</pre>

__Configuration:__

<pre>
{
    "routes": [
        {
            "proxies": [
                {
                    "binding": "validate",
                    "url": "http://validate.jsontest.com",
                    "folder": "validate"
                }
            ],
            "paths": [ "/:binding" ],
            "method": "get",
            "folder": "jsontest"
        }
    ]
}
</pre>

__Saved as:__

<pre>
data/jsontest
└── validate
    ├── file_0.req
    ├── file_0.res
    └── file_0.stats
</pre>

__file_0.req__

<pre>
{
  "path": "validate",
  "json": "{\"key\":\"value\"}"
}  
</pre>

__file_0.res__

<pre>
{
   "object_or_array": "object",
   "empty": false,
   "parse_time_nanoseconds": 27028,
   "validate": true,
   "size": 1
}
</pre>

__file_0.stats__

<pre>
{
  "status": 200,
  "headers": {
    "access-control-allow-origin": "*",
    "content-type": "application/json; charset=ISO-8859-1",
    "date": "Sun, 12 Apr 2015 19:18:53 GMT",
    "server": "Google Frontend",
    "cache-control": "private",
    "alternate-protocol": "80:quic,p=0.5,80:quic,p=0.5",
    "accept-ranges": "none",
    "vary": "Accept-Encoding",
    "transfer-encoding": "chunked"
  }
}
</pre>

