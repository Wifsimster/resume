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
    // Frontend
    { id: 'javascript', name: 'JavaScript', category: 'frontend', icon: '⚡', url: 'https://developer.mozilla.org/docs/Web/JavaScript' },
    { id: 'vue', name: 'Vue.js', category: 'frontend', icon: '💚', url: 'https://vuejs.org/' },
    { id: 'pinia', name: 'Pinia', category: 'frontend', icon: '🍍', url: 'https://pinia.vuejs.org/' },
    { id: 'tailwind', name: 'TailwindCSS', category: 'frontend', icon: '🎨', url: 'https://tailwindcss.com/' },
    { id: 'primevue', name: 'PrimeVue', category: 'frontend', icon: '🎯', url: 'https://primevue.org/' },

    // Backend
    { id: 'nodejs', name: 'Node.js', category: 'backend', icon: '💚', url: 'https://nodejs.org/' },
    { id: 'postgresql', name: 'PostgreSQL', category: 'backend', icon: '🐘', url: 'https://www.postgresql.org/' },
    { id: 'oracle', name: 'Oracle', category: 'backend', icon: '🔶', url: 'https://www.oracle.com/database/' },
    { id: 'restapi', name: 'REST API', category: 'backend', icon: '🔌', url: 'https://restfulapi.net/' },
    { id: 'hl7', name: 'HL7', category: 'backend', icon: '🏥', url: 'https://www.hl7.org/' },

    // DevOps & CI/CD
    { id: 'git', name: 'Git', category: 'devops', icon: '📦', url: 'https://git-scm.com/' },
    { id: 'gitlab', name: 'GitLab CI', category: 'devops', icon: '🦊', url: 'https://docs.gitlab.com/ee/ci/' },
    { id: 'docker', name: 'Docker', category: 'devops', icon: '🐳', url: 'https://www.docker.com/' },

    // Testing
    { id: 'vitest', name: 'Vitest', category: 'devops', icon: '🧪', url: 'https://vitest.dev/' },
    { id: 'playwright', name: 'Playwright', category: 'devops', icon: '🎭', url: 'https://playwright.dev/' },

    // IDE & AI Tools
    { id: 'vscode', name: 'VS Code', category: 'devops', icon: '💻', url: 'https://code.visualstudio.com/' },
    { id: 'cursor', name: 'Cursor', category: 'devops', icon: '✨', url: 'https://cursor.com/' },
    { id: 'copilot', name: 'GitHub Copilot', category: 'devops', icon: '🤖', url: 'https://github.com/features/copilot' },

    // Soft Skills
    { id: 'leadership', name: 'Leadership', category: 'soft', icon: '👑' },
    { id: 'mentoring', name: 'Mentoring', category: 'soft', icon: '🎓' },
    { id: 'craftsmanship', name: 'Craftsmanship', category: 'soft', icon: '🛠️' },
    { id: 'cleanarchitecture', name: 'Clean Architecture', category: 'soft', icon: '🏗️' }
  ],

  projects: [
    {
      id: 'adalight',
      name: 'adalight_ws2812',
      stars: 168,
      tech: 'Arduino',
      url: 'https://github.com/Wifsimster/adalight_ws2812',
      icon: '💡'
    },
    {
      id: 'rtsp',
      name: 'node-rtsp-stream-es6',
      stars: 101,
      tech: 'Node.js',
      url: 'https://github.com/Wifsimster/node-rtsp-stream-es6',
      icon: '📹'
    },
    {
      id: 'pavie',
      name: 'pavie',
      stars: 26,
      tech: 'Node.js',
      url: 'https://github.com/Wifsimster/pavie',
      icon: '📟'
    },
    {
      id: 'overwatch',
      name: 'overwatch',
      stars: 10,
      tech: 'Vue.js',
      url: 'https://github.com/Wifsimster/overwatch',
      icon: '🏠'
    },
    {
      id: 'bordeaux',
      name: 'bordeaux',
      stars: 10,
      tech: 'JavaScript',
      url: 'https://github.com/Wifsimster/bordeaux',
      icon: '📺'
    },
    {
      id: 'pir',
      name: 'pir-mqtt',
      stars: 4,
      tech: 'Lua/ESP',
      url: 'https://github.com/Wifsimster/pir-mqtt',
      icon: '👁️'
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

