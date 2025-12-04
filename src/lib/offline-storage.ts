import { openDB, DBSchema, IDBPDatabase } from 'idb'

interface TaskAppDB extends DBSchema {
    tasks: {
        key: string
        value: {
            id: string
            name: string
            description?: string
            priority: 'low' | 'medium' | 'high'
            dueDate?: string
            assignee?: { name: string; avatarUrl?: string }
            project?: string
            tags?: string[]
            completed?: boolean
            createdAt: number
            updatedAt: number
            synced: number // 0 = false, 1 = true
        }
        indexes: { 'by-project': string; 'by-synced': number }
    }
    pendingActions: {
        key: number
        value: {
            id: number
            action: 'create' | 'update' | 'delete'
            entity: 'task' | 'project'
            data: any
            timestamp: number
        }
        indexes: { 'by-timestamp': number }
    }
}

let dbInstance: IDBPDatabase<TaskAppDB> | null = null

export async function getDB() {
    if (dbInstance) return dbInstance

    dbInstance = await openDB<TaskAppDB>('taskapp-db', 1, {
        upgrade(db) {
            // Tasks store
            if (!db.objectStoreNames.contains('tasks')) {
                const taskStore = db.createObjectStore('tasks', { keyPath: 'id' })
                taskStore.createIndex('by-project', 'project')
                taskStore.createIndex('by-synced', 'synced')
            }

            // Pending actions store for offline sync
            if (!db.objectStoreNames.contains('pendingActions')) {
                const actionStore = db.createObjectStore('pendingActions', {
                    keyPath: 'id',
                    autoIncrement: true
                })
                actionStore.createIndex('by-timestamp', 'timestamp')
            }
        }
    })

    return dbInstance
}

// Task operations
export async function saveTaskOffline(task: any) {
    const db = await getDB()
    await db.put('tasks', {
        ...task,
        updatedAt: Date.now(),
        synced: 0
    })
}

export async function getTasksOffline() {
    const db = await getDB()
    return await db.getAll('tasks')
}

export async function deleteTaskOffline(id: string) {
    const db = await getDB()
    await db.delete('tasks', id)
}

// Pending actions for sync
export async function addPendingAction(
    action: 'create' | 'update' | 'delete',
    entity: 'task' | 'project',
    data: any
) {
    const db = await getDB()
    await db.add('pendingActions', {
        action,
        entity,
        data,
        timestamp: Date.now()
    } as any)
}

export async function getPendingActions() {
    const db = await getDB()
    return await db.getAll('pendingActions')
}

export async function clearPendingActions() {
    const db = await getDB()
    await db.clear('pendingActions')
}

export async function getPendingActionsCount() {
    const db = await getDB()
    return await db.count('pendingActions')
}

// Sync status
export async function markTasksSynced(ids: string[]) {
    const db = await getDB()
    const tx = db.transaction('tasks', 'readwrite')

    await Promise.all(
        ids.map(async (id) => {
            const task = await tx.store.get(id)
            if (task) {
                task.synced = 1
                await tx.store.put(task)
            }
        })
    )

    await tx.done
}

// Check if online
export function isOnline() {
    return navigator.onLine
}

// Listen for online/offline events
export function setupOnlineListener(callback: (online: boolean) => void) {
    window.addEventListener('online', () => callback(true))
    window.addEventListener('offline', () => callback(false))
}
