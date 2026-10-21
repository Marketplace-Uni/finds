import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

import { CONTAS_TESTE, CONTA_TESTE_MARKER } from "../src/lib/contas-teste.ts";

/**
 * Cria/atualiza as 5 contas de demonstração da Mostra (ver docs/contas-teste.md
 * e `/como-testar`). Diferente de `scripts/seed.ts`, este script:
 * - nunca deleta usuários (só cria ou atualiza as 5 contas fixas);
 * - não mexe em `profiles` além do que o trigger `handle_new_user()` já
 *   preenche sozinho — a conta nasce vazia, pro visitante completar.
 *
 * Reaproveita o mesmo padrão de segurança do seed.ts: exige confirmação
 * explícita do ambiente via SUPABASE_SEED_TARGET.
 */
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

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!supabaseUrl || !serviceRoleKey) {
		throw new Error(
			"Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente ou em .env.local.",
		);
	}

	const supabase = createClient(supabaseUrl, serviceRoleKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
	const admin = supabase.auth.admin;

	const existingUsers = [];
	for (let page = 1; ; page += 1) {
		const { data, error } = await admin.listUsers({ page, perPage: 1000 });
		if (error) throw error;
		existingUsers.push(...data.users);
		if (data.users.length < 1000) break;
	}
	const existingByEmail = new Map(
		existingUsers
			.filter((user) => user.email)
			.map((user) => [user.email!.toLowerCase(), user]),
	);

	for (const conta of CONTAS_TESTE) {
		const existing = existingByEmail.get(conta.email.toLowerCase());

		if (existing && existing.user_metadata?.finds_seed !== CONTA_TESTE_MARKER) {
			throw new Error(
				`${conta.email} já existe sem o marcador ${CONTA_TESTE_MARKER} — nenhuma conta foi alterada.`,
			);
		}

		if (!existing) {
			const { error } = await admin.createUser({
				email: conta.email,
				password: conta.senha,
				email_confirm: true,
				user_metadata: {
					finds_seed: CONTA_TESTE_MARKER,
					username: conta.username,
					full_name: conta.full_name,
				},
			});
			if (error) throw error;
			console.info(`Criada: ${conta.email}`);
			continue;
		}

		const { error } = await admin.updateUserById(existing.id, {
			password: conta.senha,
			email_confirm: true,
			user_metadata: {
				finds_seed: CONTA_TESTE_MARKER,
				username: conta.username,
				full_name: conta.full_name,
			},
		});
		if (error) throw error;
		console.info(`Atualizada: ${conta.email}`);
	}

	console.info(`Contas de teste prontas em ${seedTarget}.`);
}

main().catch((error: unknown) => {
	console.error("Falha ao criar contas de teste:", error);
	process.exitCode = 1;
});
