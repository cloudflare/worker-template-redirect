/**
 * Example Input
 *  */
const hostname = 'workers-tooling.cf'
const externalHostname = 'victoriacf.tk'
const REDIRECT_MAP = new Map([
    [
        '/redirect1',
        'https://' + externalHostname + '/redirect2',
    ] /**  /redirect1 will 301 to /redirect2 etc. */,
    ,
    ['/redirect2', 'https://' + externalHostname + '/redirect3'],
    ['/redirect3', 'https://' + externalHostname + '/redirect4'],
    ['/redirect4', 'https://google.com'],
])
const someURLToRedirectTo = 'https://www.google.com'
const someURLThatSendsRedirects = 'http://victoriacf.tk/redirect1'
const maxRedirects = 10

/**
 * redirectResponse returns a redirect Response
 * @param {Request} url where to redirect the response
 * @param {number?=301|302} type permanent or temporary redirect
 */
async function redirectResponse(url, type = 301) {
    return Response.redirect(url, type) //await fetch(request)
}

/**
 * followRedirects returns a redirect Response based on url
 * so that a clients browser doesn't have to
 * @param {Request} url
 */
async function followRedirects(url, type = 301) {
    let i = 0
    let location = url
    do {
        response = await fetch(location)
        i++
        let headers = new Headers(response.headers)
        location = headers.get('Location')
    } while (i < maxRedirects && response.redirected && location)

    return response
}

/**
 * sets up routes and redirects them to a location based on a map
 * @param {Request} request
 * @param {Map<string, string>} redirectMap
 */
async function bulkRedirects(request, redirectMap) {
    let requestURL = new URL(request.url)
    let path = requestURL.pathname
    let location = redirectMap.get(path)

    // If location exists on map, return a redirect to it
    if (location) {
        return Response.redirect(location, 301)
    }
    // If not, return the original request
    return fetch(request)
}

/**
 * Example of how redirect methods above can be used in an application
 *  */
addEventListener('fetch', async event => {
    const { request } = event
    const { url, method } = request

    if (url.match('/redirect[0-3]')) {
        return event.respondWith(bulkRedirects(request, REDIRECT_MAP))
    }
    if (url.endsWith('/follow'))
        return event.respondWith(followRedirects(someURLThatSendsRedirects))
    if (url.includes('/send'))
        return event.respondWith(redirectResponse(someURLToRedirectTo))
    if (url.includes('/device'))
        return event.respondWith(
            redirectOnDeviceType(
                event.request,
                'mobile',
                MOBILE_REDIRECT_HOSTNAMES
            )
        )
    // if doesn't match above return a dummy response for demonstration purposes
    return event.respondWith(new Response('some random response for ' + url))
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
