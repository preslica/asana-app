import { useEffect } from 'react'

/**
 * Custom hook for keyboard shortcuts
 * Usage: useKeyboardShortcuts()
 */
export function useKeyboardShortcuts() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Command/Ctrl + K - Open search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
                searchInput?.focus()
            }

            // N - New task (when not in input)
            if (e.key === 'n' && !isInputFocused()) {
                e.preventDefault()
                const newTaskButton = document.querySelector('[data-new-task-button]') as HTMLButtonElement
                newTaskButton?.click()
            }

            // Escape - Close dialogs/drawers
            if (e.key === 'Escape') {
                // Let components handle their own escape logic
            }

            // Command/Ctrl + / - Show keyboard shortcuts help
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault()
                // TODO: Show keyboard shortcuts dialog
                console.log('Keyboard shortcuts help')
            }
        }

        const isInputFocused = () => {
            const activeElement = document.activeElement
            return (
                activeElement?.tagName === 'INPUT' ||
                activeElement?.tagName === 'TEXTAREA' ||
                activeElement?.getAttribute('contenteditable') === 'true'
            )
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])
}
