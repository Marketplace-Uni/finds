'use server'

import { createClient } from '@/src/lib/supabase/server'

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
