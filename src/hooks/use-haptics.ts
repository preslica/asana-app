import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { Capacitor } from '@capacitor/core'

export function useHaptics() {
    const isAvailable = Capacitor.isNativePlatform()

    const impact = async (style: ImpactStyle = ImpactStyle.Medium) => {
        if (!isAvailable) return
        try {
            await Haptics.impact({ style })
        } catch (e) {
            console.warn('Haptics impact failed', e)
        }
    }

    const notification = async (type: NotificationType = NotificationType.Success) => {
        if (!isAvailable) return
        try {
            await Haptics.notification({ type })
        } catch (e) {
            console.warn('Haptics notification failed', e)
        }
    }

    const vibrate = async () => {
        if (!isAvailable) return
        try {
            await Haptics.vibrate()
        } catch (e) {
            console.warn('Haptics vibrate failed', e)
        }
    }

    const selectionStart = async () => {
        if (!isAvailable) return
        try {
            await Haptics.selectionStart()
        } catch (e) {
            console.warn('Haptics selectionStart failed', e)
        }
    }

    const selectionChanged = async () => {
        if (!isAvailable) return
        try {
            await Haptics.selectionChanged()
        } catch (e) {
            console.warn('Haptics selectionChanged failed', e)
        }
    }

    const selectionEnd = async () => {
        if (!isAvailable) return
        try {
            await Haptics.selectionEnd()
        } catch (e) {
            console.warn('Haptics selectionEnd failed', e)
        }
    }

    return {
        impact,
        notification,
        vibrate,
        selectionStart,
        selectionChanged,
        selectionEnd,
        ImpactStyle,
        NotificationType
    }
}
