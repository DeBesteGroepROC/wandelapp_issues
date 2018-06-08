var CACHE_NAME = 'my-site-cache-v2';
var urlsToCache = [
    '/',
    'css/cssreset.css',
    'css/wandelapp.css',
    'img/marker.svg',
    'img/allsizes.png',
    'img/sat_image.png',
    'img/kaart_image.png',
    'js/jquery/jquery.js',
    'js/ractive/ractive.js',
    'js/app_es5.js',
    'mapbox/mapbox-gl.css',
    'mapbox/mapbox-gl.js',
    'https://nodejs-mongo-persistent-wandelappbackend-v4.a3c1.starter-us-west-1.openshiftapps.com/routes?cuid=test'
];

self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});