'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/home')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    // Prefer NEXT_PUBLIC_SITE_URL, then origin, then fallback to production URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin || 'https://asana-app-six.vercel.app'

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            emailRedirectTo: `${siteUrl}/auth/callback`,
            data: {
                full_name: formData.get('full_name') as string,
            },
        },
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/home')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const updates = {
        full_name: formData.get('full_name') as string,
        bio: formData.get('bio') as string,
        title: formData.get('title') as string,
        location: formData.get('location') as string,
        website: formData.get('website') as string,
    }

    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/settings')
    return { success: true }
}

export async function updateEmail(newEmail: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
        email: newEmail,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: 'Verification email sent to new address' }
}

export async function updatePassword(newPassword: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
