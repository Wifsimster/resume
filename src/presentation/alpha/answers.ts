import type { CardKind } from './cards'

// Scripted knowledge base of the conversational alpha. Every answer names the
// "tool" it pretends to call, a short reasoning line, the streamed text and
// the generative card to render — in both locales. Copy lives here (not in
// the global locale files) so the whole alpha stays one self-contained module.

export type IntentId = 'welcome' | 'experience' | 'skills' | 'projects' | 'maker' | 'stats' | 'contact' | 'books' | 'fallback'

export interface Answer {
  reasoning: string
  tool: { name: string, args: string }
  text: string
  card?: CardKind
  suggestions: string[]
}

interface IntentDef {
  keywords: string[]
  fr: Answer
  en: Answer
}

export const INTENTS: Record<Exclude<IntentId, 'welcome' | 'fallback'>, IntentDef> = {
  experience: {
    keywords: ['experience', 'expérience', 'career', 'carrière', 'parcours', 'job', 'travail', 'dedalus', 'work', 'poste', 'tech lead'],
    fr: {
      reasoning: 'Le visiteur veut le parcours professionnel. Je récupère les expériences et je mets en avant la progression développeur → tech lead manager.',
      tool: { name: 'resume.getExperience', args: '{ order: "desc" }' },
      text: 'Damien a près de 10 ans chez Dedalus, leader européen du logiciel de santé. Développeur R&D full-stack pendant 6 ans, il est devenu Tech Lead Manager en 2022 : il pilote une équipe de 6 développeurs sur une plateforme d\'interopérabilité santé (HL7, IHE PAM) et la modernisation d\'un logiciel de 30 ans.',
      card: 'experience',
      suggestions: ['Quelles sont ses compétences ?', 'Montre-moi ses projets open source', 'Comment le contacter ?']
    },
    en: {
      reasoning: 'The visitor wants the career path. Fetching experiences, highlighting the developer → tech lead manager progression.',
      tool: { name: 'resume.getExperience', args: '{ order: "desc" }' },
      text: 'Damien has spent nearly 10 years at Dedalus, Europe\'s leading healthcare software company. After 6 years as a full-stack R&D developer, he became Tech Lead Manager in 2022: he leads a team of 6 developers on a healthcare interoperability platform (HL7, IHE PAM) and the modernization of 30-year-old software.',
      card: 'experience',
      suggestions: ['What are his skills?', 'Show me his open-source projects', 'How can I contact him?']
    }
  },
  skills: {
    keywords: ['skill', 'compétence', 'competence', 'stack', 'techno', 'hard', 'soft', 'savoir'],
    fr: {
      reasoning: 'Question sur les compétences. Sa liste est volontairement centrée sur les savoir-faire durables à l\'ère de l\'IA, pas sur les frameworks.',
      tool: { name: 'resume.getSkills', args: '{ category: "all" }' },
      text: 'Ses hard skills sont volontairement centrées sur ce que l\'IA ne remplace pas : architecture, system design, qualité de code, orchestration d\'IA et expertise métier en interopérabilité santé. Les langages et frameworks sont considérés comme des outils, pas des compétences.',
      card: 'skills',
      suggestions: ['Son expérience chez Dedalus ?', 'Ses stats GitHub ?', 'Parle-moi de son homelab']
    },
    en: {
      reasoning: 'Skills question. His list is deliberately built around durable, AI-era competencies rather than frameworks.',
      tool: { name: 'resume.getSkills', args: '{ category: "all" }' },
      text: 'His hard skills deliberately focus on what AI doesn\'t replace: architecture, system design, code quality, AI orchestration and healthcare interoperability domain expertise. Languages and frameworks are considered tools, not skills.',
      card: 'skills',
      suggestions: ['His experience at Dedalus?', 'His GitHub stats?', 'Tell me about his homelab']
    }
  },
  projects: {
    keywords: ['project', 'projet', 'open source', 'opensource', 'github', 'repo', 'ondes', 'elan', 'plexcord', 'code'],
    fr: {
      reasoning: 'Demande sur les projets. Je liste les projets open source actifs de 2026 avec leurs stacks variées (Kotlin, Go, TypeScript).',
      tool: { name: 'resume.getProjects', args: '{ status: "active" }' },
      text: 'Damien maintient 87 dépôts publics. Ses projets actifs du moment : un lecteur de podcasts Android, un tracker vélo/renfo hors-ligne, un pont Plexamp→Discord en Go, un jeu quotidien de captures de jeux vidéo, un bot d\'actus IA propulsé par Claude, et une app pour accompagner les enfants TDAH.',
      card: 'projects',
      suggestions: ['Parle-moi de son homelab', 'Quelles sont ses lectures ?', 'Son parcours ?']
    },
    en: {
      reasoning: 'Projects question. Listing the active 2026 open-source projects and their varied stacks (Kotlin, Go, TypeScript).',
      tool: { name: 'resume.getProjects', args: '{ status: "active" }' },
      text: 'Damien maintains 87 public repositories. His currently active projects: an Android podcast player, an offline cycling/strength tracker, a Plexamp→Discord bridge in Go, a daily video-game screenshot quiz, an AI news bot powered by Claude, and an app helping parents of children with ADHD.',
      card: 'projects',
      suggestions: ['Tell me about his homelab', 'What is he reading?', 'His career path?']
    }
  },
  maker: {
    keywords: ['maker', 'homelab', 'home lab', 'rack', 'serveur', 'server', 'diy', 'domotique', 'raspberry', 'esp', 'unifi', 'nas'],
    fr: {
      reasoning: 'Question maker/homelab. Je décris le rack serveur et les projets DIY — la partie la plus personnelle du CV.',
      tool: { name: 'resume.getHomelab', args: '{ include: "rack" }' },
      text: 'C\'est un maker convaincu : rack serveur complet à la maison (réseau UniFi, NAS sous Unraid, Proxmox, onduleur), domotique Home Assistant, électronique ESP8266, et des chantiers réels — cabane sur pilotis, poêle à bois, salle d\'eau. Le site classique modélise son rack en 3D, unité par unité.',
      card: 'maker',
      suggestions: ['Voir la version classique en 3D', 'Ses projets open source ?', 'Ses stats ?']
    },
    en: {
      reasoning: 'Maker/homelab question. Describing the server rack and DIY projects — the most personal part of the resume.',
      tool: { name: 'resume.getHomelab', args: '{ include: "rack" }' },
      text: 'He\'s a committed maker: a full home server rack (UniFi network, Unraid NAS, Proxmox, UPS), Home Assistant automation, ESP8266 electronics, and real-world builds — a stilt cabin, a wood stove, a bathroom renovation. The classic site models his rack in 3D, unit by unit.',
      card: 'maker',
      suggestions: ['See the classic 3D version', 'His open-source projects?', 'His stats?']
    }
  },
  stats: {
    keywords: ['stat', 'chiffre', 'number', 'combien', 'how many', 'année', 'years', 'metric'],
    fr: {
      reasoning: 'Demande de chiffres. J\'agrège les statistiques du CV et le compteur GitHub rafraîchi automatiquement.',
      tool: { name: 'resume.getStats', args: '{}' },
      text: 'Les chiffres clés : presque 10 ans d\'expérience, 87 dépôts GitHub publics, 6 développeurs recrutés et encadrés, et 30 achievements à débloquer sur ce CV.',
      card: 'stats',
      suggestions: ['Son parcours ?', 'Ses projets ?', 'Comment le contacter ?']
    },
    en: {
      reasoning: 'Numbers question. Aggregating the resume statistics and the auto-refreshed GitHub counter.',
      tool: { name: 'resume.getStats', args: '{}' },
      text: 'The key numbers: nearly 10 years of experience, 87 public GitHub repositories, 6 developers recruited and mentored, and 30 achievements to unlock on this resume.',
      card: 'stats',
      suggestions: ['His career path?', 'His projects?', 'How can I contact him?']
    }
  },
  contact: {
    keywords: ['contact', 'email', 'mail', 'linkedin', 'joindre', 'reach', 'hire', 'recruter', 'embaucher'],
    fr: {
      reasoning: 'Le visiteur veut entrer en contact. Je fournis les liens officiels — LinkedIn est le canal préféré.',
      tool: { name: 'resume.getContact', args: '{}' },
      text: 'Le meilleur canal est LinkedIn. Son GitHub et son blog DIY donnent aussi une bonne idée de sa façon de travailler.',
      card: 'contact',
      suggestions: ['Ses compétences ?', 'Son expérience ?', 'Voir la version classique en 3D']
    },
    en: {
      reasoning: 'The visitor wants to get in touch. Providing the official links — LinkedIn is the preferred channel.',
      tool: { name: 'resume.getContact', args: '{}' },
      text: 'LinkedIn is the best channel. His GitHub and DIY blog also give a good sense of how he works.',
      card: 'contact',
      suggestions: ['His skills?', 'His experience?', 'See the classic 3D version']
    }
  },
  books: {
    keywords: ['book', 'livre', 'lecture', 'read', 'lit', 'bibliothèque', 'library'],
    fr: {
      reasoning: 'Question lectures. Je remonte les livres marqués comme lus dans sa bibliothèque.',
      tool: { name: 'resume.getBooks', args: '{ status: "read" }' },
      text: 'Ses fondamentaux : Clean Architecture, The Pragmatic Programmer et A Philosophy of Software Design — la colonne vertébrale de sa façon de concevoir du logiciel.',
      card: 'books',
      suggestions: ['Ses compétences ?', 'Ses projets ?', 'Ses chiffres clés ?']
    },
    en: {
      reasoning: 'Reading question. Fetching the books marked as read in his library.',
      tool: { name: 'resume.getBooks', args: '{ status: "read" }' },
      text: 'His fundamentals: Clean Architecture, The Pragmatic Programmer and A Philosophy of Software Design — the backbone of how he designs software.',
      card: 'books',
      suggestions: ['His skills?', 'His projects?', 'His key numbers?']
    }
  }
}

export const WELCOME: Record<'fr' | 'en', Answer> = {
  fr: {
    reasoning: 'Nouveau visiteur sur l\'alpha conversationnelle. Je me présente et je propose les sujets principaux du CV.',
    tool: { name: 'resume.load', args: '{ profile: "wifsimster" }' },
    text: 'Bonjour ! Je suis l\'interface conversationnelle (alpha) du CV de Damien Battistella. Posez-moi une question sur son parcours, ses compétences ou ses projets — ou choisissez une suggestion ci-dessous.',
    card: 'profile',
    suggestions: ['Son expérience ?', 'Quelles sont ses compétences ?', 'Ses projets open source ?', 'Parle-moi de son homelab']
  },
  en: {
    reasoning: 'New visitor on the conversational alpha. Introducing myself and offering the resume\'s main topics.',
    tool: { name: 'resume.load', args: '{ profile: "wifsimster" }' },
    text: 'Hi! I\'m the conversational interface (alpha) of Damien Battistella\'s resume. Ask me anything about his career, skills or projects — or pick a suggestion below.',
    card: 'profile',
    suggestions: ['His experience?', 'What are his skills?', 'His open-source projects?', 'Tell me about his homelab']
  }
}

export const FALLBACK: Record<'fr' | 'en', Answer> = {
  fr: {
    reasoning: 'Je ne reconnais pas ce sujet dans le CV. Je le dis honnêtement et je ramène vers ce que je sais.',
    tool: { name: 'resume.search', args: '{ query: "…" }' },
    text: 'Je suis une alpha scriptée, sans vrai LLM derrière — je ne sais répondre que sur le contenu du CV. Essayez l\'un des sujets ci-dessous !',
    suggestions: ['Son expérience ?', 'Ses compétences ?', 'Ses projets ?', 'Comment le contacter ?']
  },
  en: {
    reasoning: 'I don\'t recognize this topic in the resume. Saying so honestly and steering back to what I know.',
    tool: { name: 'resume.search', args: '{ query: "…" }' },
    text: 'I\'m a scripted alpha with no real LLM behind me — I can only answer about the resume itself. Try one of the topics below!',
    suggestions: ['His experience?', 'His skills?', 'His projects?', 'How can I contact him?']
  }
}

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export function matchIntent(input: string): IntentId {
  const text = normalize(input)
  let best: { id: IntentId, score: number } = { id: 'fallback', score: 0 }
  for (const [id, def] of Object.entries(INTENTS)) {
    const score = def.keywords.reduce((n, kw) => (text.includes(normalize(kw)) ? n + 1 : n), 0)
    if (score > best.score) best = { id: id as IntentId, score }
  }
  return best.id
}

export function answerFor(intent: IntentId, lang: 'fr' | 'en'): Answer {
  if (intent === 'welcome') return WELCOME[lang]
  if (intent === 'fallback') return FALLBACK[lang]
  return INTENTS[intent][lang]
}
