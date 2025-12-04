'use client'

import { useEffect } from 'react'

export function useHapticFeedback() {
    const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
        // Check if Capacitor Haptics is available (for native apps)
        if (typeof window !== 'undefined' && (window as any).Capacitor) {
            const { Haptics, ImpactStyle } = (window as any).Capacitor.Plugins

            const styleMap = {
                light: ImpactStyle.Light,
                medium: ImpactStyle.Medium,
                heavy: ImpactStyle.Heavy,
                success: ImpactStyle.Medium,
                warning: ImpactStyle.Medium,
                error: ImpactStyle.Heavy
            }

            Haptics.impact({ style: styleMap[type] })
            return
        }

        // Fallback to Vibration API for web
        if ('vibrate' in navigator) {
            const patterns = {
                light: 10,
                medium: 20,
                heavy: 30,
                success: [10, 50, 10],
                warning: [20, 100, 20],
                error: [30, 100, 30, 100, 30]
            }

            navigator.vibrate(patterns[type])
        }
    }

    return { triggerHaptic }
}

// Hook to add haptic feedback to common actions
export function useHapticActions() {
    const { triggerHaptic } = useHapticFeedback()

    return {
        onTaskComplete: () => triggerHaptic('success'),
        onTaskCreate: () => triggerHaptic('medium'),
        onTaskDelete: () => triggerHaptic('warning'),
        onError: () => triggerHaptic('error'),
        onButtonClick: () => triggerHaptic('light'),
        onSwipe: () => triggerHaptic('light'),
    }
}
