-- O Finds é um marketplace fechado pra comunidade da UFU: a promessa central
-- do produto é que "a pessoa do outro lado da negociação é um colega de
-- universidade verificado pelo e-mail institucional" (docs/ESCOPO.md). Hoje
-- essa verificação existe SÓ na camada do app — `emailUfuSchema`
-- (src/lib/validations/auth.ts), validado dentro da Server Action
-- `cadastrar()` (src/app/(auth)/cadastro/actions.ts).
--
-- O problema: essa Server Action chama `supabase.auth.signUp()` usando a
-- chave ANON — a mesma chave pública que já vem exposta no HTML/JS de
-- qualquer página do site. Qualquer pessoa, sem precisar de nada além do
-- DevTools do navegador, consegue chamar `supabase.auth.signUp()` direto
-- (ou bater na API REST do GoTrue), pulando o app inteiro e a validação de
-- domínio junto. Confirmado com um teste usando só a chave anon: o pedido
-- passa pela validação (que simplesmente não existe nesse nível) e só para
-- num limite de envio de e-mail do Supabase — sem relação nenhuma com
-- `@ufu.br`.
--
-- Esta migration move a validação pro único lugar que nenhum cliente
-- consegue pular: um trigger `BEFORE INSERT` em `auth.users`. Não importa
-- por onde o cadastro chegue (app, DevTools, script, token roubado da chave
-- anon) — o Postgres recusa a linha se o e-mail não terminar em `@ufu.br`.
--
-- `SECURITY DEFINER` é necessário pra função conseguir rodar como dona do
-- schema `auth` (o usuário da aplicação normalmente não tem permissão de
-- trigger lá) — mas a função não faz nada além de validar e devolver `NEW`,
-- não expõe nenhum acesso extra.
CREATE OR REPLACE FUNCTION public.enforce_dominio_ufu()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email !~* '@ufu\.br$' THEN
    RAISE EXCEPTION 'Apenas e-mails @ufu.br podem se cadastrar no Finds'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS enforce_dominio_ufu_trigger ON auth.users;

CREATE TRIGGER enforce_dominio_ufu_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_dominio_ufu();
