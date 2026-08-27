import type { ResumeData } from '../types/resume'

export const resumeData: ResumeData = {
  name: 'Damien Battistella',
  title: 'Tech Lead Manager',
  company: 'Dedalus',
  location: 'France',
  bio: 'Passionate JavaScript developer, Tech Geek, Raspberry Pi & ESP lover. I build code, I build things, I share knowledge.',

  passions: [
    { id: 'knowledge', icon: '📚', color: '#FFBF00' },
    { id: 'architecture', icon: '🏗️', color: '#BD93F9' },
    { id: 'modernization', icon: '🔄', color: '#61DAFB' },
    { id: 'performance', icon: '⚡', color: '#FFD93D' },
    { id: 'frontend', icon: '🎨', color: '#42B883' },
    { id: 'teamBuilding', icon: '👥', color: '#FF6B35' },
    { id: 'ai', icon: '🤖', color: '#10B981' },
    { id: 'devops', icon: '🐳', color: '#2496ED' },
    { id: 'testing', icon: '🧪', color: '#15803D' }
  ],

  behaviors: [
    { id: 'autonome', icon: '🎯', color: '#FF6B35', category: 'agir' },
    { id: 'calme', icon: '🧘', color: '#42B883', category: 'ressentir' },
    { id: 'conciliant', icon: '🤝', color: '#42B883', category: 'ressentir' },
    { id: 'consciencieux', icon: '📋', color: '#FFD93D', category: 'reflechir' },
    { id: 'creatif', icon: '🎨', color: '#FFD93D', category: 'reflechir' },
    { id: 'curieux', icon: '🤔', color: '#FFD93D', category: 'reflechir' },
    { id: 'direct', icon: '➡️', color: '#FF6B35', category: 'agir' },
    { id: 'enthousiaste', icon: '⭐', color: '#42B883', category: 'ressentir' },
    { id: 'observateur', icon: '👁️', color: '#FFD93D', category: 'reflechir' }
  ],

  strengths: [
    {
      id: 'relationships',
      category: 'relationships',
      icon: '💚',
      description: 'Il sait garder une distance affective dans ses relations, s\'en protéger. Il est sûr de ses décisions, et attaché à tenir sa ligne de conduite. Il va à l\'essentiel dans ses propos, ne cherche pas à en rajouter.'
    },
    {
      id: 'work',
      category: 'work',
      icon: '💼',
      description: 'Il est tenace, ne se décourage pas facilement. Il a une facilité pour faire face à plusieurs projets de front. Il est force de proposition, produit facilement de nouvelles idées.'
    },
    {
      id: 'emotions',
      category: 'emotions',
      icon: '❤️',
      description: 'Il est serein, ne se laisse pas perturber par les événements extérieurs. Il dégage de l\'enthousiasme, voit les choses positivement. Il maîtrise ses émotions, ne les répercute pas sur les autres.'
    }
  ],

  improvementAreas: [
    {
      id: 'empathie',
      description: 'Il pourrait quelquefois faire preuve de davantage d\'empathie vis-à-vis des personnes qui l\'entourent, être moins "dur" avec elles.'
    },
    {
      id: 'ecoute',
      description: 'Il gagnerait à poser des questions aux autres et à s\'enrichir de leurs retours, plutôt que de se centrer uniquement sur sa façon d\'envisager les situations.'
    },
    {
      id: 'delegation',
      description: 'Il gagnerait à laisser aux autres le soin de se charger de certaines tâches plutôt que de chercher à toutes les réaliser par lui-même.'
    }
  ],

  talentTags: [
    { id: 'conciliant', label: 'Conciliant' },
    { id: 'observateur', label: 'Observateur' },
    { id: 'direct', label: 'Direct' },
    { id: 'impartial', label: 'Impartial' },
    { id: 'confiant', label: 'Confiant' },
    { id: 'tolerant', label: 'Tolérant' },
    { id: 'hyperactif', label: 'Hyperactif' },
    { id: 'curieux', label: 'Curieux' },
    { id: 'creatif', label: 'Créatif' },
    { id: 'organise', label: 'Organisé' },
    { id: 'consciencieux', label: 'Consciencieux' },
    { id: 'perseverant', label: 'Persévérant' },
    { id: 'entreprenant', label: 'Entreprenant' },
    { id: 'calme', label: 'Calme' },
    { id: 'enthousiaste', label: 'Enthousiaste' },
    { id: 'maitreDeSoi', label: 'Maître De Soi' },
    { id: 'stable', label: 'Stable' }
  ],

  experiences: [
    {
      id: 'dedalus-lead',
      company: 'Dedalus',
      title: 'Tech Lead Manager',
      period: '2022 - Present',
      duration: '3 years',
      current: true,
      achievements: [
        'Led cross-functional team of 6 developers',
        'Healthcare interoperability platform (HL7, IHE PAM, HPRIM XML)',
        'Full-stack tech strategy (Vue.js 3, Node.js, PostgreSQL)',
        'Legacy system modernization (30 years old software)',
        'DevOps practices (GitLab CI/CD, Playwright, Vitest, Docker)',
        'AI research initiatives for team productivity'
      ]
    },
    {
      id: 'dedalus-dev',
      company: 'Dedalus',
      title: 'R&D Full Stack Developer',
      period: '2016 - 2022',
      duration: '6 years',
      current: false,
      achievements: [
        'SQL query builder library in TypeScript (Oracle & PostgreSQL)',
        'Legacy to web application migration',
        'Clean Architecture web servers in Node.js',
        'Unit tests and CI implementation',
        'Team mentoring and training (JS, Vue.js, Node.js)',
        'Vue.js 2 components library',
        'Hospital kiosk touch screen application',
        'Healthcare interoperability admin interface'
      ]
    }
  ],

  skills: [
    // Hard Skills — AI-era durable skills: design → build → quality → ops → domain
    // Languages & frameworks are intentionally absent: AI tooling commoditized them,
    // what remains valuable is judgment, architecture and domain expertise
    { id: 'systemdesign', name: 'System Design', category: 'hardskills', icon: '📐' },
    { id: 'softwarearchitecture', name: 'Software Architecture', category: 'hardskills', icon: '🏗️' },
    { id: 'apidesign', name: 'API Design', category: 'hardskills', icon: '🔌' },
    { id: 'datamodeling', name: 'Data Modeling', category: 'hardskills', icon: '🗄️' },
    { id: 'aiorchestration', name: 'AI Orchestration', category: 'hardskills', icon: '🤖' },
    { id: 'codereview', name: 'Code Review & Quality', category: 'hardskills', icon: '🔍' },
    { id: 'testingstrategy', name: 'Testing Strategy', category: 'hardskills', icon: '🧪' },
    { id: 'devops', name: 'DevOps & CI/CD', category: 'hardskills', icon: '🔄' },
    { id: 'legacymodernization', name: 'Legacy Modernization', category: 'hardskills', icon: '♻️' },
    { id: 'healthcareinterop', name: 'Healthcare Interoperability', category: 'hardskills', icon: '🏥', url: 'https://www.hl7.org/' },

    // IA
    { id: 'copilot', name: 'GitHub Copilot', category: 'ia', logo: '/logos/copilot.svg', url: 'https://github.com/features/copilot' },
    { id: 'cursor', name: 'Cursor', category: 'ia', logo: '/logos/cursor.svg', url: 'https://cursor.com/' },
    { id: 'claude', name: 'Claude', category: 'ia', logo: '/logos/claude.svg', url: 'https://claude.ai/' },
    { id: 'gemini', name: 'Gemini', category: 'ia', logo: '/logos/gemini.svg', url: 'https://gemini.google.com/' },
    { id: 'mcp', name: 'MCP', category: 'ia', logo: '/logos/mcp.svg', url: 'https://modelcontextprotocol.io/' },
    { id: 'skills', name: 'Skills', category: 'ia', logo: '/logos/skills.svg', url: 'https://skills.sh/' },

    // Soft Skills
    { id: 'leadership', name: 'Leadership', category: 'soft', icon: '👑' },
    { id: 'communication', name: 'Communication', category: 'soft', icon: '💬' },
    { id: 'decisionmaking', name: 'Decision Making', category: 'soft', icon: '🧭' },
    { id: 'problemsolving', name: 'Problem Solving', category: 'soft', icon: '🧩' },
    { id: 'adaptability', name: 'Adaptability', category: 'soft', icon: '🔄' },
    { id: 'agilemindset', name: 'Agile Mindset', category: 'soft', icon: '⚡' },
    { id: 'mentoring', name: 'Mentoring', category: 'soft', icon: '🎓' }
  ],

  projects: [
    {
      id: 'blog',
      name: 'Blog personnel',
      tech: 'Projets DIY',
      url: 'https://wifsimster.github.io/',
      icon: '📝',
      type: 'blog'
    }
  ],

  books: [
    {
      id: 'clean-architecture',
      title: 'Clean Architecture: A Craftsman\'s Guide to Software Structure',
      author: 'Robert C. Martin',
      status: 'read',
      url: 'https://www.amazon.fr/dp/0134494164'
    },
    {
      id: 'pragmatic-programmer',
      title: 'The Pragmatic Programmer: Your Journey to Mastery',
      author: 'David Thomas & Andrew Hunt',
      status: 'read',
      url: 'https://www.amazon.fr/dp/0135957052'
    },
    {
      id: 'philosophy-software',
      title: 'A Philosophy of Software Design',
      author: 'John Ousterhout',
      status: 'read',
      url: 'https://www.amazon.fr/dp/173210221X'
    },
    {
      id: '100m-leads',
      title: '$100M Leads',
      author: 'Alex Hormozi',
      status: 'toRead',
      url: 'https://www.amazon.fr/dp/1963349075'
    },
    {
      id: 'data-intensive',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      status: 'toRead',
      url: 'https://www.amazon.fr/dp/1449373321'
    },
    {
      id: 'company-of-one',
      title: 'Company of One',
      author: 'Paul Jarvis',
      status: 'toRead',
      url: 'https://www.amazon.fr/dp/0241470463'
    },
    {
      id: 'design-patterns',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Gang of Four',
      status: 'toBuy',
      url: 'https://www.amazon.fr/dp/0131177052/?coliid=INJTM1A1NCZIT&colid=JPHH2VURLKQ2&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it'
    },
    {
      id: 'learning-react',
      title: 'Learning React: Modern Patterns for Developing React Apps',
      author: 'Alex Banks & Eve Porcello',
      status: 'toBuy',
      url: 'https://www.amazon.fr/dp/149207800X/?coliid=I35U9S9P59O22J&colid=JPHH2VURLKQ2&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it'
    },
    {
      id: 'refactoring',
      title: 'Refactoring: Improving the Design of Existing Code',
      author: 'Martin Fowler',
      status: 'toBuy',
      url: 'https://www.amazon.fr/dp/0321834577/?coliid=I46J9P3USALAR&colid=JPHH2VURLKQ2&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it'
    },
    {
      id: 'effective-java',
      title: 'Effective Java',
      author: 'Joshua Bloch',
      status: 'toBuy',
      url: 'https://www.amazon.fr/dp/0134052501/?coliid=I3I89H0ERRF8MA&colid=JPHH2VURLKQ2&psc=1&ref_=list_c_wl_lv_ov_lig_dp_it'
    }
  ],

  socialLinks: [
    {
      id: 'github',
      name: 'GitHub',
      url: 'https://github.com/Wifsimster',
      icon: '🐙'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/damien-battistella-%F0%9F%92%BB-67964115/',
      icon: '💼'
    }
  ],

  github: {
    username: 'Wifsimster',
    url: 'https://github.com/Wifsimster',
    totalRepos: 60
  },

  statistics: {
    yearsOfExperience: 9, // Depuis 2016
    totalProjects: 11, // Nombre de projets GitLab où j'ai participé
    developersRecruited: 6, // Depuis les expériences
    presentations: 12, // Présentations mensuelles estimées
    linesOfCode2025: 16905, // Calculé depuis GitLab (apvhn/resume uniquement - autres projets sans commits en 2025)
    totalCommits2025: 20, // Calculé depuis GitLab (apvhn/resume uniquement - autres projets sans commits en 2025)
    issuesClosed2025: 21 // Issues fermées par apvhn en 2025 (tous projets GitLab)
  }
}

