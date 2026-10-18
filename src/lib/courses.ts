/**
 * Cursos de graduação da UFU por campus, levantados no Catálogo de Cursos UFU
 * (4ª edição, Pró-Reitoria de Graduação/Prograd — prograd.ufu.br), restrito
 * aos 4 campi de Uberlândia. Cursos técnicos (ESTES) ficaram de fora: o
 * cadastro é de curso de faculdade, não de curso técnico.
 *
 * Chave = `campuses.name` exatamente como vem do banco (ver
 * docs/ARQUITETURA.md). Campi fora de Uberlândia (Pontal, Monte Carmelo,
 * Patos de Minas) não foram pesquisados e ficam de fora do mapa — ver
 * `coursesForCampus()`.
 *
 * ⚠️ A oferta de cursos muda com o tempo (vagas, novos cursos, etc.) — essa
 * lista pode ficar desatualizada; confirme no site da Prograd antes de
 * tratá-la como definitiva.
 */
export const COURSES_BY_CAMPUS: Record<string, string[]> = {
  "Educação Física": ["Educação Física - Bacharelado", "Educação Física - Licenciatura", "Fisioterapia"],

  Glória: [
    "Agronomia",
    "Engenharia Aeronáutica",
    "Engenharia Ambiental e Sanitária",
    "Engenharia Mecânica",
    "Engenharia Mecatrônica",
    "Medicina Veterinária",
    "Zootecnia",
  ],

  "Santa Mônica": [
    "Administração",
    "Arquitetura e Urbanismo",
    "Ciência da Computação",
    "Ciências Contábeis",
    "Ciências Econômicas",
    "Design",
    "Direito",
    "Engenharia Biomédica",
    "Engenharia Civil",
    "Engenharia Elétrica",
    "Engenharia Química",
    "Filosofia",
    "Física - Licenciatura",
    "Física de Materiais",
    "Física Médica",
    "Geografia",
    "Gestão da Informação",
    "História",
    "Inteligência Artificial",
    "Jornalismo",
    "Letras - Espanhol",
    "Letras - Francês",
    "Letras - Inglês",
    "Letras - Libras",
    "Letras - Português",
    "Matemática",
    "Música",
    "Pedagogia",
    "Química - Licenciatura",
    "Química Industrial",
    "Relações Internacionais",
    "Saúde Coletiva",
    "Sistemas de Informação",
    "Teatro",
    "Tradução",
  ],

  Umuarama: [
    "Biomedicina",
    "Biotecnologia",
    "Ciências Biológicas",
    "Enfermagem",
    "Medicina",
    "Nutrição",
    "Odontologia",
    "Psicologia",
  ],
};

/** Cursos disponíveis para um campus, pelo nome. `[]` se não tiver dado. */
export function coursesForCampus(campusName: string | null | undefined): string[] {
  if (!campusName) return [];
  return COURSES_BY_CAMPUS[campusName.trim()] ?? [];
}
