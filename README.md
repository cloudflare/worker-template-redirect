## Redirects

Examples of sending single and bulk redirects from a Worker script.

[`index.js`](https://github.com/cloudflare/worker-template-redirects/blob/master/redirect.js) is the content of the Workers script.

Live Demos are hosted on `workers-tooling.cf/demos/redirect`:

[Demo Generate](https://workers-tooling.cf/demos/redirect/send) | [Demo Bulk](https://workers-tooling.cf/demos/redirect/bulk1)

####Wrangler
To generate using [wrangler](https://github.com/cloudflare/wrangler)

```
wrangler generate myApp https://github.com/cloudflare/worker-template-redirect
```

####Serverless
To deploy using serverless add a [`serverless.yml`](https://serverless.com/framework/docs/providers/cloudflare/) file.
`