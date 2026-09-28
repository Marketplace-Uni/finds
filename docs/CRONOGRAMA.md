# Cronograma

**27/09 → 21/10/2026**: 24 dias corridos, ~35–40h de trabalho por pessoa.
Os sprints terminam no **domingo**, com uma call de review de 30 min.

| Sprint | Datas | Objetivo | Review |
|---|---|---|---|
| **0 · Fundação** | dom 27/09 – seg 28/09 | Repositório, contas, projeto criado, schema completo, tokens de design, inventário do Figma | — |
| **1 · Núcleo** | ter 29/09 – dom 04/10 | Cadastro/login, onboarding, anúncio de **Produto e Serviço** de ponta a ponta, feed + filtros, detalhe, chat funcionando | dom 04/10 |
| **2 · Completo** | seg 05/10 – dom 11/10 | Roommate + República, **match**, meus anúncios + rascunhos, favoritos, denúncias, perfil público, transações | dom 11/10 |
| **3 · Polimento** | seg 12/10 (feriado) – dom 18/10 | Avaliações, landing, estados vazios/erro, responsivo básico, QA de design, **seed final no ambiente demo** | dom 18/10 · 🧊 **congelamento de features** |
| **Reta final** | seg 19/10 – ter 20/10 | Só correção de bugs, deploy final, ensaio da demo, gravação do vídeo backup | — |
| 🎤 **Mostra** | **qua 21/10** | Apresentação | |

## Marcos (o que tem que estar funcionando)

- **28/09:** `npm run dev` roda na máquina de todo mundo; a home mostra o layout com a identidade do Finds; o banco `finds-dev` está criado com todas as tabelas e com o seed v1.
- **04/10:** consigo me cadastrar com @ufu.br, completar o perfil, criar um produto com fotos, vê-lo no feed, filtrar, abrir o detalhe e mandar uma mensagem que chega em tempo real.
- **11/10:** os 4 tipos de anúncio, o match de roommates, favoritos, denúncias e uma transação completa entre duas contas.
- **18/10:** o roteiro da demo ([ESCOPO.md](ESCOPO.md)) roda inteiro, sem erro, no ambiente **demo**. **Depois disso, nada de feature nova.**
- **20/10:** ensaio geral e vídeo backup gravado.

## Rituais

| Quando | O quê |
|---|---|
| Todo dia (async, no grupo) | Check-in de 1 linha: `✅ fiz X · 🔜 vou fazer Y · 🚧 travado em Z` |
| Fim de cada sessão | Marcar os checkboxes no seu arquivo em `docs/equipe/` |
| Quarta de cada sprint | Caike entrega os componentes visuais da sprint (ver [DESIGN.md](DESIGN.md#divisão-visual--lógica)) |
| ~01/10, ~08/10, ~15/10 | Caike valida as telas com a designer (ver [DESIGN.md](DESIGN.md#trabalhando-com-a-designer)) |
| Domingo (30 min, call) | Review: cada um mostra o que fez rodando + ajustamos a próxima sprint |
| 19/10 (1h, call) | **Bug bash:** todo mundo executa o roteiro da demo tentando quebrar |
| 20/10 | Ensaio da apresentação + gravação do vídeo backup |
