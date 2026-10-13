'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/src/lib/supabase/server'

export type ChatMessageActionResult =
	| {
			success: true
			message: {
				id: string
				content: string
				sender_id: string
				read_at: string | null
				created_at: string
			}
		}
	| {
			success: false
			error:
				| 'invalid_message'
				| 'unauthenticated'
				| 'conversation_unavailable'
				| 'database_error'
		}

export type MarkMessagesReadResult =
	| { success: true }
	| {
			success: false
			error: 'invalid_conversation' | 'unauthenticated' | 'database_error'
		}

type StartConversationResult =
	| { success: true; conversationId: string }
	| {
			success: false
			error:
				| 'invalid_listing'
				| 'unauthenticated'
				| 'profile_incomplete'
				| 'listing_unavailable'
				| 'own_listing'
				| 'database_error'
		}

export async function startConversation(
	listingId: string,
): Promise<StartConversationResult> {
	if (
		!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(listingId)
	) {
		return { success: false, error: 'invalid_listing' }
	}

	const supabase = await createClient()
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser()

	if (authError || !user) {
		return { success: false, error: 'unauthenticated' }
	}

	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('campus_id')
		.eq('id', user.id)
		.maybeSingle()

	if (profileError) {
		return { success: false, error: 'database_error' }
	}

	if (!profile?.campus_id) {
		return { success: false, error: 'profile_incomplete' }
	}

	const { data: listing, error: listingError } = await supabase
		.from('listings')
		.select('owner_id, status')
		.eq('id', listingId)
		.maybeSingle()

	if (listingError) {
		return { success: false, error: 'database_error' }
	}

	if (!listing || listing.status !== 'active') {
		return { success: false, error: 'listing_unavailable' }
	}

	if (listing.owner_id === user.id) {
		return { success: false, error: 'own_listing' }
	}

	const { data: existingConversation, error: conversationError } =
		await supabase
			.from('conversations')
			.select('id')
			.eq('listing_id', listingId)
			.eq('buyer_id', user.id)
			.maybeSingle()

	if (conversationError) {
		return { success: false, error: 'database_error' }
	}

	if (existingConversation) {
		return { success: true, conversationId: existingConversation.id }
	}

	const { data: newConversation, error: insertError } = await supabase
		.from('conversations')
		.insert({
			listing_id: listingId,
			buyer_id: user.id,
			seller_id: listing.owner_id,
		})
		.select('id')
		.single()

	if (!insertError && newConversation) {
		return { success: true, conversationId: newConversation.id }
	}

	if (insertError?.code === '23505') {
		const { data: concurrentConversation, error: retryError } = await supabase
			.from('conversations')
			.select('id')
			.eq('listing_id', listingId)
			.eq('buyer_id', user.id)
			.maybeSingle()

		if (!retryError && concurrentConversation) {
			return { success: true, conversationId: concurrentConversation.id }
		}
	}

	return { success: false, error: 'database_error' }
}

export async function sendChatMessage(
	conversationId: string,
	rawContent: string,
): Promise<ChatMessageActionResult> {
	const content = rawContent.trim()
	if (
		!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(conversationId) ||
		!content ||
		content.length > 2000
	) {
		return { success: false, error: 'invalid_message' }
	}

	const supabase = await createClient()
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser()

	if (authError || !user) {
		return { success: false, error: 'unauthenticated' }
	}

	const { data: conversation, error: conversationError } = await supabase
		.from('conversations')
		.select('id')
		.eq('id', conversationId)
		.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
		.maybeSingle()

	if (conversationError) {
		return { success: false, error: 'database_error' }
	}
	if (!conversation) {
		return { success: false, error: 'conversation_unavailable' }
	}

	const { data: message, error: insertError } = await supabase
		.from('messages')
		.insert({
			conversation_id: conversation.id,
			sender_id: user.id,
			content,
		})
		.select('id, content, sender_id, read_at, created_at')
		.single()

	if (insertError || !message) {
		return { success: false, error: 'database_error' }
	}

	revalidatePath('/mensagens')
	return {
		success: true,
		message: {
			id: message.id,
			content: message.content,
			sender_id: message.sender_id ?? user.id,
			read_at: message.read_at,
			created_at: message.created_at ?? new Date().toISOString(),
		},
	}
}

export async function markConversationMessagesRead(
	conversationId: string,
): Promise<MarkMessagesReadResult> {
	if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(conversationId)) {
		return { success: false, error: 'invalid_conversation' }
	}

	const supabase = await createClient()
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser()

	if (authError || !user) {
		return { success: false, error: 'unauthenticated' }
	}

	const { data: conversation, error: conversationError } = await supabase
		.from('conversations')
		.select('id')
		.eq('id', conversationId)
		.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
		.maybeSingle()

	if (conversationError) {
		return { success: false, error: 'database_error' }
	}
	if (!conversation) {
		return { success: false, error: 'invalid_conversation' }
	}

	const { error: updateError } = await supabase
		.from('messages')
		.update({ read_at: new Date().toISOString() })
		.eq('conversation_id', conversation.id)
		.neq('sender_id', user.id)
		.is('read_at', null)

	if (updateError) {
		return { success: false, error: 'database_error' }
	}

	revalidatePath('/mensagens')
	return { success: true }
}
