# ApiMock

Do you depend on 3rd-party APIs? Does HTTP 503 "Service unavailable" sound way too familiar? There is absolutely
no reason for why outages should slow you down.

In essence, ApiMock is a HTTP proxy. It intercepts requests and replays captured responses. The tool is proven 
in real-life projects. As such, it is easy to set up, has a minimal configuration with sensible defaults and comprises a set of thoughtful features. 

# Key Features

* supports the most frequently used HTTP methods (GET, POST, PUT, DELETE)
* caters for a variety of architectures - REST, SOAP, query parameters .. 
* puts no restrictions on data formats - typically, but not only, JSON and XML
* provides an authentic replay - status code and headers captured along with the data
* enables to simulate live data - think stock quotes auto-updates
* allows to organise and structure captured responses

The list goes on.

# Installation Instructions

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

# Quick Start

Here are a few quick examples to help you get started. To give you an idea of how to best
utilise the tool in your own setup, we cover a range of different APIs. In particular:

* [WikiMedia](http://www.mediawiki.org/wiki/API:Main_page) - query parameters, variety of data formats
* [JsonTest](http://www.jsontest.com) - REST + JSON, includes HTTP POST
* [Google Maps API](https://developers.google.com/maps) - just because it's cool

## Example 1 - A simple GET via WikiMedia API

The example shows how to connect to a typical endpoint, intercept the returned responses and replay them.

Let's start by editing the configuration - __conf/default.json__:

<pre>
{
    "routes": [
        { "connectors": [ "wiki_conn" ], "paths": [ "/:path" ], "method": "get", "folder": "wiki" }
    ],
    "connectors": {
        "wiki_conn": { "binding": "wiki", "url": "http://en.wikipedia.org/w/api.php", "folder": "" }
    }
}
</pre>

Save the changes and start the server by running ```npm start```

Go to the browser and enter the following query (taken from the [wiki example](http://en.wikipedia.org/w/api.php?action=query&titles=San_Francisco&prop=images&imlimit=20&format=json)):

__http://localhost:8081/wiki?action=query&titles=San_Francisco&prop=images&imlimit=20&format=json__

Here is what you should get:

<img border="0" alt="Wiki: San Francisco" src="https://github.com/zezutom/zezutom.github.io/blob/master/img/apimock/example-1/wiki_san_francisco_json.png">

Let's take a look at the saved data:

<pre>
data/
└── wiki
    ├── file_0.req
    ├── file_0.res
    └── file_0.stats
</pre>  
  
__file_0.req__ keeps information about the original request:

<pre>
{
  "path": "wiki",
  "action": "query",
  "titles": "San_Francisco",
  "prop": "images",
  "imlimit": "20",
  "format": "json"
}  
</pre>

__file_0.res__ stores the captured response:

<pre>
{"query-continue":{"images":{"imcontinue":"49728|Flag_of_California.svg"}},"warnings":{"query":{"*":"Formatting of continuation data will be changing soon. To continue using the current formatting, use the 'rawcontinue' parameter. To begin using the new format, pass an empty string for 'continue' in the initial query."}},"query":{"normalized":[{"from":"San_Francisco","to":"San Francisco"}],"pages":{"49728":{"pageid":49728,"ns":0,"title":"San Francisco","images":[{"ns":6,"title":"File:1stBearFlag.svg"},{"ns":6,"title":"File:3 Cable Car on Hyde St with Alcatraz, SF, CA, jjron 25.03.2012.jpg"},{"ns":6,"title":"File:AT&T Park.jpg"},{"ns":6,"title":"File:Alamo Square with Painted Ladies, SF, CA, jjron 26.03.2012.jpg"},{"ns":6,"title":"File:Alcatraz Island 1, SF, CA, jjron 25.03.2012.jpg"},{"ns":6,"title":"File:Bandera del Primer Imperio Mexicano.svg"},{"ns":6,"title":"File:BayareaUSGS.jpg"},{"ns":6,"title":"File:Boxed East arrow.svg"},{"ns":6,"title":"File:CHP Police Interceptor Utility Vehicle.jpg"},{"ns":6,"title":"File:California county map (San Francisco County enlarged).svg"},{"ns":6,"title":"File:Caltrain logo.svg"},{"ns":6,"title":"File:Candlestick Park aerial.jpg"},{"ns":6,"title":"File:Castro Rainbow Flag.jpg"},{"ns":6,"title":"File:Cliff House from Ocean Beach.jpg"},{"ns":6,"title":"File:Commons-logo.svg"},{"ns":6,"title":"File:Compass rose pale.svg"},{"ns":6,"title":"File:Cscr-featured.svg"},{"ns":6,"title":"File:East.svg"},{"ns":6,"title":"File:FerryBuildingEmbarcaderoBayBridge.JPG"},{"ns":6,"title":"File:Fillmore-sidewalk-1.jpg"}]}}}}
</pre>

__file_0.stats__ retains the response status and all of the response headers:

<pre>
{
  "status": 200,
  "headers": {
    "server": "Apache",
    "x-powered-by": "HHVM/3.3.1",
    "cache-control": "private, must-revalidate, max-age=0",
    "x-content-type-options": "nosniff",
    "x-frame-options": "SAMEORIGIN",
    "vary": "Accept-Encoding,X-Forwarded-Proto,Cookie",
    "content-type": "application/json; charset=utf-8",
    "x-varnish": "3632628483, 2251397220, 2209643709",
    "via": "1.1 varnish, 1.1 varnish, 1.1 varnish",
    "transfer-encoding": "chunked",
    "date": "Sun, 29 Mar 2015 16:04:41 GMT",
    "age": "0",
    "connection": "keep-alive",
    "x-cache": "cp1053 miss (0), amssq51 miss (0), amssq35 frontend miss (0)",
    "set-cookie": [
      "GeoIP=SE:H__r:55.9333:13.5333:v4; Path=/; Domain=.wikipedia.org"
    ]
  }
}
</pre>

## Example 2 - Going REST with JsonTest

TODO

# Configuration Explained

TODO
