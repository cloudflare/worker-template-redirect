// Example Input
const hostname = 'workers-tooling.cf'
const externalHostname = 'victoriacf.tk'
const REDIRECT_MAP = new Map([
    ['/bulk1', 'https://' + externalHostname + '/redirect2'],
    ['/bulk2', 'https://' + externalHostname + '/redirect3'],
    ['/bulk3', 'https://' + externalHostname + '/redirect4'],
    ['/bulk4', 'https://google.com'],
])
const someURLToRedirectTo = 'https://www.google.com'

/**
 * redirectResponse returns a redirect Response
 * @param {Request} url where to redirect the response
 * @param {number?=301|302} type permanent or temporary redirect
 */
async function redirectResponse(url, type = 301) {
    return Response.redirect(url, type) //await fetch(request)
}

/**
 * sets up routes and redirects them to a location based on a map
 * @param {Request} request
 * @param {Map<string, string>} redirectMap
 */
async function bulkRedirects(request, redirectMap) {
    let requestURL = new URL(request.url)
    let path = requestURL.pathname.split('/redirect')[1]
    let location = redirectMap.get(path)

    if (location) {
        return Response.redirect(location, 301)
    }
    // If in map, return the original request
    return fetch(request)
}

/**
 * Example of how redirect methods above can be used in an application
 *  */
addEventListener('fetch', async event => {
    const { request } = event
    const { url, method } = request
    // demo is hosted on workers-tooling.cf/demos/redirect so get the last
    // part of the path
    const path = new URL(url).pathname.split('/redirect')[1]

    if (path.match('/bulk[0-3]'))
        event.respondWith(bulkRedirects(request, REDIRECT_MAP))
    if (path.includes('/send'))
        event.respondWith(redirectResponse(somepathToRedirectTo))
    if (path.includes('/device'))
        event.respondWith(
            redirectOnDeviceType(
                event.request,
                'mobile',
                MOBILE_REDIRECT_HOSTNAMES
            )
        )

    // if doesn't match above return a dummy response for demonstration purposes
    event.respondWith(new Response('some random response for ' + url))
})

/*************************** WIP ***************************/
/**
 * redirectOnDeviceType checks the device header set by Cloudflare
 * and returns a temporary redirect to the corresponding hostnames
 * @param {Request} request
 */
async function redirectOnDeviceType(request, deviceType, deviceHostnames) {
    let requestURL = new URL(request.url)
    let hostname = requestURL.hostname
    let device = request.headers.get('CF-Device-Type')

    /**
     *  Requires Enterprise "CF-Device-Type Header" zone setting or
     *  Page Rule with "Cache By Device Type" setting applied.
     */
    if (device === deviceType) {
        const deviceHostname = deviceHostnames[hostname]
        if (deviceHostname) {
            requestURL.hostname = deviceHostname
            return Response.redirect(requestURL, 302)
        }
    }
    return new Response('device was ', device) //await fetch(request)
}
const MOBILE_REDIRECT_HOSTNAMES = {
    'a.example.com': 'a.m.' + hostname,
    'www.example.com': 'm.' + hostname,
    'example.com': 'm.' + hostname,
}
