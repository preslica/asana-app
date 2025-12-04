import { useEffect, useState } from 'react'
import { getPendingActionsCount } from '@/lib/offline-storage'

export function useOfflineSync() {
    const [isOnline, setIsOnline] = useState(true)
    const [pendingCount, setPendingCount] = useState(0)

    useEffect(() => {
        // Initial check
        setIsOnline(navigator.onLine)
        updatePendingCount()

        const handleOnline = () => {
            setIsOnline(true)
            console.log('App is online, triggering sync...')

            // Trigger service worker sync if supported
            if ('serviceWorker' in navigator && 'SyncManager' in window) {
                navigator.serviceWorker.ready.then(registration => {
                    // @ts-ignore - sync is not yet in standard types
                    registration.sync.register('sync-tasks')
                })
            } else {
                // Fallback: try to trigger sync via message or just reload?
                // For now, we rely on the service worker's own online detection or next page load
                // But we can also send a message to SW
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_SYNC' })
                }
            }
        }

        const handleOffline = () => {
            setIsOnline(false)
        }

        const handleSyncComplete = (event: MessageEvent) => {
            if (event.data && event.data.type === 'SYNC_COMPLETE') {
                console.log('Sync completed')
                updatePendingCount()
            }
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        navigator.serviceWorker?.addEventListener('message', handleSyncComplete)

        // Poll for pending count occasionally
        const interval = setInterval(updatePendingCount, 5000)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            navigator.serviceWorker?.removeEventListener('message', handleSyncComplete)
            clearInterval(interval)
        }
    }, [])

    async function updatePendingCount() {
        try {
            const count = await getPendingActionsCount()
            setPendingCount(count)
        } catch (e) {
            console.error('Failed to get pending count', e)
        }
    }

    return { isOnline, pendingCount }
}
