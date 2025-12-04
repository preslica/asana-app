const CACHE_NAME = 'taskapp-v1.0.0'
const STATIC_CACHE = 'taskapp-static-v1'
const DYNAMIC_CACHE = 'taskapp-dynamic-v1'

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/home',
    '/my-tasks',
    '/offline',
    '/manifest.json'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...')
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets')
                return cache.addAll(STATIC_ASSETS)
            })
            .then(() => self.skipWaiting())
    )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...')
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                        .map((name) => caches.delete(name))
                )
            })
            .then(() => self.clients.claim())
    )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return
    }

    // Network first for API calls
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache successful responses
                    if (response.ok) {
                        const responseClone = response.clone()
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone)
                        })
                    }
                    return response
                })
                .catch(() => {
                    // Return cached version if network fails
                    return caches.match(request)
                })
        )
        return
    }

    // Cache first for static assets
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse
                }

                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200) {
                            return response
                        }

                        const responseClone = response.clone()
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(request, responseClone)
                        })

                        return response
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/offline')
                        }
                    })
            })
    )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag)

    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks())
    }
})

async function syncTasks() {
    console.log('[Service Worker] Syncing tasks...')

    try {
        const db = await openDB()
        const tx = db.transaction('pendingActions', 'readwrite')
        const store = tx.objectStore('pendingActions')
        const actions = await store.getAll()

        if (actions.length === 0) {
            console.log('[Service Worker] No pending actions to sync')
            return
        }

        console.log(`[Service Worker] Found ${actions.length} pending actions`)

        for (const action of actions) {
            try {
                console.log('[Service Worker] Processing action:', action)

                let url = '/api'
                let method = 'POST'
                let body = null

                // Construct API request based on action type
                if (action.entity === 'task') {
                    url += '/tasks'
                    if (action.action === 'create') {
                        method = 'POST'
                        body = action.data
                    } else if (action.action === 'update') {
                        url += `/${action.data.id}`
                        method = 'PATCH'
                        body = action.data
                    } else if (action.action === 'delete') {
                        url += `/${action.data.id}`
                        method = 'DELETE'
                    }
                } else if (action.entity === 'project') {
                    // TODO: Implement project sync
                }

                if (body) {
                    // Remove temporary ID if present for creation
                    if (action.action === 'create' && body.id && body.id.startsWith('temp-')) {
                        const { id, ...rest } = body
                        body = rest
                    }
                }

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: body ? JSON.stringify(body) : undefined
                })

                if (response.ok) {
                    console.log('[Service Worker] Action synced successfully:', action.id)
                    // Delete from pending actions
                    await store.delete(action.id)
                } else {
                    console.error('[Service Worker] Failed to sync action:', action.id, response.status)
                    // Keep in store to retry later? Or move to failed actions?
                    // For now, we leave it. If it's a 4xx error, maybe we should delete it to avoid infinite loops.
                    if (response.status >= 400 && response.status < 500) {
                        await store.delete(action.id)
                    }
                }
            } catch (err) {
                console.error('[Service Worker] Error processing action:', action.id, err)
            }
        }

        await tx.done
        console.log('[Service Worker] Sync complete')

        // Notify clients to refresh data
        self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }))
        })

    } catch (error) {
        console.error('[Service Worker] Sync failed:', error)
    }
}

// Simple IDB wrapper for Service Worker (since we can't easily import 'idb' library here without bundling)
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('taskapp-db', 1)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => resolve(request.result)

        request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains('pendingActions')) {
                db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true })
            }
        }
    })
}

// Push notification handling
self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {}
    const title = data.title || 'TaskApp Notification'
    const options = {
        body: data.body || 'You have a new notification',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        data: data.data || {}
    }

    event.waitUntil(
        self.registration.showNotification(title, options)
    )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    )
})

// Listen for messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'TRIGGER_SYNC') {
        console.log('[Service Worker] Manual sync triggered')
        event.waitUntil(syncTasks())
    }
})
