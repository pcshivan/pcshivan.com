import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event));
  } catch (e) {
    event.respondWith(new Response('Internal Error', { status: 500 }));
  }
});

async function handleEvent(event) {
  try {
    // Attempt to serve the static asset from KV
    return await getAssetFromKV(event);
  } catch (e) {
    // If the asset is not found (e.g., a direct URL to a React route),
    // serve the index.html to let React Router handle the routing.
    try {
      const notFoundResponse = await getAssetFromKV(event, {
        mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/index.html`, req),
      });
      return new Response(notFoundResponse.body, notFoundResponse);
    } catch (e) {
      // If index.html also fails, return a generic 404
      return new Response('Not Found', { status: 404 });
    }
  }
}
