import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

type SeedUser = {
	id: string;
	full_name: string;
	username: string;
	bio: string;
	campus_id: string;
};

type SeedListing = {
	title: string;
	description: string;
	type: "product" | "service" | "roommate" | "republic";
	status: "draft" | "active" | "paused" | "closed";
	price: number | null;
	owner_id: string;
	campus_id: string;
	details: Record<string, unknown>;
};

type SeedTrait = { key: string; label: string; trait_group: string };
type SeedImage = { path: string; contentType: string; bytes: Buffer };

const universityId = "00000000-0000-4000-8000-000000000001";

function seedEmail(user: Pick<SeedUser, "username">): string {
	return `${user.username}@ufu.br`;
}

const campuses = [
	{
		id: "11111111-1111-4000-8000-000000000001",
		university_id: universityId,
		name: "Santa Mônica",
		city: "Uberlândia",
	},
	{
		id: "11111111-1111-4000-8000-000000000002",
		university_id: universityId,
		name: "Umuarama",
		city: "Uberlândia",
	},
	{
		id: "11111111-1111-4000-8000-000000000003",
		university_id: universityId,
		name: "Glória",
		city: "Uberlândia",
	},
];

const traits: SeedTrait[] = [
	{ key: "dorme-cedo", label: "Dorme cedo", trait_group: "rotina" },
	{ key: "noturno", label: "Tem rotina noturna", trait_group: "rotina" },
	{ key: "acorda-cedo", label: "Acorda cedo", trait_group: "rotina" },
	{ key: "rotina-flexivel", label: "Tem rotina flexível", trait_group: "rotina" },
	{ key: "organizado", label: "É organizado", trait_group: "organização" },
	{ key: "divide-tarefas", label: "Divide as tarefas", trait_group: "organização" },
	{ key: "espaco-organizado", label: "Mantém os espaços organizados", trait_group: "organização" },
	{ key: "pontual", label: "É pontual", trait_group: "organização" },
	{ key: "gosta-silencio", label: "Gosta de silêncio", trait_group: "convivência" },
	{ key: "sociavel", label: "É sociável", trait_group: "convivência" },
	{ key: "recebe-visitas", label: "Gosta de receber visitas", trait_group: "convivência" },
	{ key: "poucas-visitas", label: "Prefere poucas visitas", trait_group: "convivência" },
	{ key: "tem-pet", label: "Tem pet", trait_group: "estilo de vida" },
	{ key: "gosta-de-pets", label: "Gosta de pets", trait_group: "estilo de vida" },
	{ key: "nao-fuma", label: "Não fuma", trait_group: "hábitos" },
	{ key: "aceita-pets", label: "Aceita pets", trait_group: "estilo de vida" },
	{ key: "cozinha-em-casa", label: "Cozinha em casa", trait_group: "hábitos" },
	{ key: "estuda-em-casa", label: "Estuda em casa", trait_group: "rotina" },
	{ key: "pratica-esportes", label: "Pratica esportes", trait_group: "estilo de vida" },
	{ key: "sustentavel", label: "Tem hábitos sustentáveis", trait_group: "hábitos" },
	{ key: "ouve-musica-alta", label: "Ouve música alta", trait_group: "convivência" },
	{ key: "fone-de-ouvido", label: "Usa fone pra não incomodar", trait_group: "convivência" },
	{ key: "limpa-na-hora", label: "Limpa a louça/bagunça na hora", trait_group: "organização" },
	{ key: "tolera-bagunca", label: "Tolera bagunça eventual", trait_group: "organização" },
	{ key: "gosta-de-festa", label: "Gosta de receber amigos pra festa em casa", trait_group: "estilo de vida" },
	{ key: "prefere-tranquilo", label: "Prefere fim de semana tranquilo em casa", trait_group: "estilo de vida" },
	{ key: "compartilha-comida", label: "Compartilha comida com facilidade", trait_group: "hábitos" },
	{ key: "trabalha-estuda-fora", label: "Passa a maior parte do dia fora (trabalho/estágio)", trait_group: "rotina" },
];

const traitAssignments: Record<string, { self: string[]; wanted: string[] }> = {
	"22222222-2222-4000-8000-000000000001": {
		self: ["organizado", "nao-fuma", "estuda-em-casa"],
		wanted: ["gosta-silencio", "divide-tarefas", "nao-fuma"],
	},
	"22222222-2222-4000-8000-000000000002": {
		self: ["noturno", "sociavel", "cozinha-em-casa"],
		wanted: ["recebe-visitas", "rotina-flexivel", "divide-tarefas"],
	},
	"22222222-2222-4000-8000-000000000003": {
		self: ["dorme-cedo", "gosta-silencio", "organizado"],
		wanted: ["dorme-cedo", "poucas-visitas", "nao-fuma"],
	},
	"22222222-2222-4000-8000-000000000004": {
		self: ["estuda-em-casa", "acorda-cedo", "pontual"],
		wanted: ["organizado", "gosta-silencio", "acorda-cedo"],
	},
	"22222222-2222-4000-8000-000000000005": {
		self: ["tem-pet", "gosta-de-pets", "rotina-flexivel"],
		wanted: ["aceita-pets", "sociavel", "divide-tarefas"],
	},
	"22222222-2222-4000-8000-000000000006": {
		self: ["pratica-esportes", "dorme-cedo", "nao-fuma"],
		wanted: ["pratica-esportes", "organizado", "poucas-visitas"],
	},
	"22222222-2222-4000-8000-000000000007": {
		self: ["noturno", "estuda-em-casa", "sustentavel"],
		wanted: ["rotina-flexivel", "divide-tarefas", "gosta-silencio"],
	},
	"22222222-2222-4000-8000-000000000008": {
		self: ["tem-pet", "sociavel", "recebe-visitas"],
		wanted: ["gosta-de-pets", "aceita-pets", "sociavel"],
	},
	"22222222-2222-4000-8000-000000000009": {
		self: ["cozinha-em-casa", "divide-tarefas", "pontual"],
		wanted: ["organizado", "nao-fuma", "cozinha-em-casa"],
	},
	"22222222-2222-4000-8000-000000000010": {
		self: ["acorda-cedo", "organizado", "gosta-silencio"],
		wanted: ["acorda-cedo", "estuda-em-casa", "poucas-visitas"],
	},
	"22222222-2222-4000-8000-000000000011": {
		self: ["rotina-flexivel", "sociavel", "pratica-esportes"],
		wanted: ["recebe-visitas", "divide-tarefas", "gosta-de-pets"],
	},
	"22222222-2222-4000-8000-000000000012": {
		self: ["dorme-cedo", "sustentavel", "espaco-organizado"],
		wanted: ["dorme-cedo", "sustentavel", "organizado"],
	},
};

const conversationFixtures = [
	{
		listingTitle: "Calculadora HP 50g",
		buyerId: "22222222-2222-4000-8000-000000000002",
		messages: [
			["buyer", "Oi! A calculadora ainda está disponível?"],
			["seller", "Oi, está sim. Posso combinar a entrega no Santa Mônica."],
			["buyer", "Perfeito, podemos conversar depois da aula."],
		],
	},
	{
		listingTitle: "Livro: Estrutura de Dados e Seus Algoritmos (Ziviani)",
		buyerId: "22222222-2222-4000-8000-000000000001",
		messages: [
			["buyer", "Você ainda tem o livro?"],
			["seller", "Tenho sim, está bem conservado."],
		],
	},
	{
		listingTitle: "Jaleco Branco UFU - Tamanho M",
		buyerId: "22222222-2222-4000-8000-000000000005",
		messages: [
			["buyer", "Oi! O tamanho é M mesmo?"],
			["seller", "Isso, tamanho M e bordado da UFU."],
		],
	},
	{
		listingTitle: "Aulas Particulares de Cálculo 1",
		buyerId: "22222222-2222-4000-8000-000000000004",
		messages: [
			["buyer", "Você tem horário disponível esta semana?"],
			["seller", "Tenho na quarta à tarde e na sexta de manhã."],
		],
	},
	{
		listingTitle: "Dividir apartamento no Santa Mônica",
		buyerId: "22222222-2222-4000-8000-000000000010",
		messages: [
			["buyer", "A vaga ainda está disponível?"],
			["seller", "Está sim. Posso mostrar o apartamento no fim de semana."],
		],
	},
	{
		listingTitle: "Vaga República Pasárgada",
		buyerId: "22222222-2222-4000-8000-000000000007",
		messages: [
			["buyer", "Quais contas estão incluídas no valor?"],
			["seller", "Água e internet. Energia é dividida entre moradores."],
		],
	},
];

function readJson<T>(fileName: string): T {
	return JSON.parse(readFileSync(resolve(process.cwd(), fileName), "utf8")) as T;
}

function readSeedImages(count: number, target: string): SeedImage[] {
	const directory = resolve(process.cwd(), "supabase/seed/imagens_seed");
	const extensions = ["jpg", "webp", "png"] as const;

	return Array.from({ length: count }, (_, index) => {
		const matchingFiles = extensions
			.map((extension) => `anuncio-${index + 1}.${extension}`)
			.filter((candidate) => existsSync(resolve(directory, candidate)));
		if (matchingFiles.length !== 1) {
			throw new Error(
				`Esperada exatamente uma imagem para o anúncio ${index + 1} em imagens_seed; encontradas ${matchingFiles.length}.`,
			);
		}
		const [fileName] = matchingFiles;

		const extension = fileName.split(".").at(-1);
		const contentType =
			extension === "webp"
				? "image/webp"
				: extension === "png"
					? "image/png"
					: "image/jpeg";

		return {
			path: `seed-${target}/${fileName}`,
			contentType,
			bytes: readFileSync(resolve(directory, fileName)),
		};
	});
}

function validateSeed(users: SeedUser[], listings: SeedListing[]) {
	const userIds = new Set(users.map((user) => user.id));
	const campusIds = new Set(campuses.map((campus) => campus.id));
	const emails = new Set(users.map((user) => seedEmail(user).toLowerCase()));
	const titles = new Set(listings.map((listing) => listing.title));

	if (users.length === 0 || listings.length === 0) {
		throw new Error("Os arquivos de seed não podem estar vazios.");
	}
	if (emails.size !== users.length || titles.size !== listings.length) {
		throw new Error("A seed contém nomes de usuário ou títulos duplicados.");
	}
	if (users.some((user) => !campusIds.has(user.campus_id))) {
		throw new Error("Há usuário associado a um campus sem cadastro na seed.");
	}
	if (
		listings.some(
			(listing) =>
				!userIds.has(listing.owner_id) ||
				!campusIds.has(listing.campus_id),
		)
	) {
		throw new Error("Há anúncio com proprietário ou campus inválido.");
	}
	if (users.some((user) => !traitAssignments[user.id])) {
		throw new Error("Há usuário sem seleção de traits na seed.");
	}
	if (
		conversationFixtures.some((item) => {
			const listing = listings.find((entry) => entry.title === item.listingTitle);
			return (
				!listing ||
				!titles.has(item.listingTitle) ||
				listing.owner_id === item.buyerId ||
				!userIds.has(item.buyerId)
			);
		})
	) {
		throw new Error("Há conversa apontando para anúncio inexistente.");
	}
}

async function main() {
	if (existsSync(resolve(process.cwd(), ".env.local"))) {
		process.loadEnvFile(".env.local");
	}

	const seedTarget = process.env.SUPABASE_SEED_TARGET;
	if (seedTarget !== "finds-dev" && seedTarget !== "finds-demo") {
		throw new Error(
			"Defina SUPABASE_SEED_TARGET=finds-dev ou SUPABASE_SEED_TARGET=finds-demo para confirmar o destino.",
		);
	}
	const seedMarker = seedTarget;

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!supabaseUrl || !serviceRoleKey) {
		throw new Error(
			"Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente ou em .env.local.",
		);
	}

	const users = readJson<SeedUser[]>("supabase/seed/users.json");
	const listings = readJson<SeedListing[]>("supabase/seed/ad.json");
	validateSeed(users, listings);
	const seedImages = readSeedImages(listings.length, seedTarget);

	const supabase = createClient(supabaseUrl, serviceRoleKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
	const admin = supabase.auth.admin;
	const fixtureEmails = new Set(users.map((user) => seedEmail(user).toLowerCase()));
	const existingUsers = [];

	for (let page = 1; ; page += 1) {
		const { data, error } = await admin.listUsers({ page, perPage: 1000 });
		if (error) throw error;
		existingUsers.push(...data.users);
		if (data.users.length < 1000) break;
	}

	const conflictingUsers = existingUsers.filter(
		(user) =>
			user.email &&
			fixtureEmails.has(user.email.toLowerCase()) &&
			user.user_metadata?.finds_seed !== seedMarker,
	);
	if (conflictingUsers.length > 0) {
		throw new Error(
			`E-mails da seed já pertencem a contas sem o marcador ${seedMarker}: ${conflictingUsers
				.map((user) => user.email)
				.join(", ")}. Nenhuma conta foi removida.`,
		);
	}

	for (let index = 0; index < seedImages.length; index += 5) {
		const batch = seedImages.slice(index, index + 5);
		const results = await Promise.all(
			batch.map((image) =>
				supabase.storage.from("listing-images").upload(image.path, image.bytes, {
					cacheControl: "3600",
					contentType: image.contentType,
					upsert: true,
				}),
			),
		);
		const failedUpload = results.find((result) => result.error)?.error;
		if (failedUpload) throw failedUpload;
	}

	const oldSeedUsers = existingUsers.filter(
		(user) => user.user_metadata?.finds_seed === seedMarker,
	);
	const oldSeedUserIds = oldSeedUsers.map((user) => user.id);

	if (oldSeedUserIds.length > 0) {
		for (const column of ["reviewer_id", "reviewed_id"] as const) {
			const { error } = await supabase
				.from("reviews")
				.delete()
				.in(column, oldSeedUserIds);
			if (error) throw error;
		}
		for (const column of ["seller_id", "buyer_id", "created_by", "cancelled_by"] as const) {
			const { error } = await supabase
				.from("transactions")
				.delete()
				.in(column, oldSeedUserIds);
			if (error) throw error;
		}
		const { error: reportsError } = await supabase
			.from("reports")
			.delete()
			.in("reporter_id", oldSeedUserIds);
		if (reportsError) throw reportsError;

		for (const user of oldSeedUsers) {
			const { error } = await admin.deleteUser(user.id);
			if (error) throw error;
		}
	}

	const { error: universityError } = await supabase.from("universities").upsert(
		{ id: universityId, name: "Universidade Federal de Uberlândia", email_domain: "ufu.br" },
		{ onConflict: "id" },
	);
	if (universityError) throw universityError;

	const { error: campusesError } = await supabase
		.from("campuses")
		.upsert(campuses, { onConflict: "id" });
	if (campusesError) throw campusesError;

	const { data: savedTraits, error: traitsError } = await supabase
		.from("traits")
		.upsert(traits, { onConflict: "key" })
		.select("id, key");
	if (traitsError) throw traitsError;
	const traitIds = new Map(savedTraits.map((trait) => [trait.key, trait.id]));

	const userIds = new Map<string, string>();
	for (const user of users) {
		const { data, error } = await admin.createUser({
			email: seedEmail(user),
			password: randomBytes(32).toString("hex"),
			email_confirm: true,
			user_metadata: {
				finds_seed: seedMarker,
				username: user.username,
				full_name: user.full_name,
			},
		});
		if (error) throw error;

		userIds.set(user.id, data.user.id);
		const { error: profileError } = await supabase
			.from("profiles")
			.update({
				campus_id: user.campus_id,
				university_id: universityId,
				bio: user.bio,
			})
			.eq("id", data.user.id);
		if (profileError) throw profileError;
	}

	const userTraits = users.flatMap((user) => {
		const profileId = userIds.get(user.id);
		const assignment = traitAssignments[user.id];
		return [
			...assignment.self.map((key) => ({
				user_id: profileId,
				trait_id: traitIds.get(key),
				kind: "self" as const,
			})),
			...assignment.wanted.map((key) => ({
				user_id: profileId,
				trait_id: traitIds.get(key),
				kind: "wanted" as const,
			})),
		];
	});
	const { error: userTraitsError } = await supabase.from("user_traits").insert(userTraits);
	if (userTraitsError) throw userTraitsError;

	const listingRows = listings.map((listing) => ({
		title: listing.title,
		description: listing.description,
		type: listing.type,
		status: listing.status,
		price: listing.price,
		owner_id: userIds.get(listing.owner_id),
		campus_id: listing.campus_id,
		details: listing.details,
	}));
	const { data: savedListings, error: listingsError } = await supabase
		.from("listings")
		.insert(listingRows)
		.select("id, title");
	if (listingsError) throw listingsError;
	const listingIds = new Map(savedListings.map((listing) => [listing.title, listing.id]));

	const imageRows = listings.map((listing, index) => ({
		listing_id: listingIds.get(listing.title),
		path: seedImages[index].path,
		position: 0,
	}));
	const { error: imagesError } = await supabase.from("listing_images").insert(imageRows);
	if (imagesError) throw imagesError;

	const seededAt = Date.now();
	const conversationRows = conversationFixtures.map((fixture, index) => {
		const listing = listings.find((item) => item.title === fixture.listingTitle)!;
		const listingId = listingIds.get(fixture.listingTitle)!;
		const sellerId = userIds.get(listing.owner_id)!;
		const buyerId = userIds.get(fixture.buyerId)!;
		const latestMessageAt = new Date(seededAt - index * 60_000).toISOString();
		return {
			listing_id: listingId,
			buyer_id: buyerId,
			seller_id: sellerId,
			last_message_at: latestMessageAt,
		};
	});
	const { data: savedConversations, error: conversationsError } = await supabase
		.from("conversations")
		.insert(conversationRows)
		.select("id, listing_id, buyer_id");
	if (conversationsError) throw conversationsError;

	const conversationIds = new Map(
		savedConversations.map((conversation) => [
			`${conversation.listing_id}:${conversation.buyer_id}`,
			conversation.id,
		]),
	);
	const messageRows = conversationFixtures.flatMap((fixture, index) => {
		const listing = listings.find((item) => item.title === fixture.listingTitle)!;
		const listingId = listingIds.get(fixture.listingTitle)!;
		const buyerId = userIds.get(fixture.buyerId)!;
		const sellerId = userIds.get(listing.owner_id)!;
		const conversationId = conversationIds.get(`${listingId}:${buyerId}`)!;
		const latestMessageAt = seededAt - index * 60_000;

		return fixture.messages.map(([sender, content], messageIndex) => ({
			conversation_id: conversationId,
			sender_id: sender === "buyer" ? buyerId : sellerId,
			content,
			created_at: new Date(
				latestMessageAt - (fixture.messages.length - messageIndex - 1) * 60_000,
			).toISOString(),
		}));
	});
	const { error: messagesError } = await supabase.from("messages").insert(messageRows);
	if (messagesError) throw messagesError;

	console.info(
		`Seed concluída em ${seedTarget}: ${users.length} usuários, ${listings.length} anúncios, ${imageRows.length} imagens enviadas ao Storage e ${conversationRows.length} conversas.`,
	);
}

main().catch((error: unknown) => {
	console.error("Falha ao executar a seed:", error);
	process.exitCode = 1;
});
