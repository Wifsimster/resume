import type { ResumeData } from '../types/resume'

export const resumeData: ResumeData = {
  name: 'Damien Battistella',
  title: 'Team Leader R&D ERP-PAS',
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
    { id: 'making', icon: '🔧', color: '#B87333' }
  ],

  experiences: [
    {
      id: 'dedalus',
      company: 'Dedalus',
      title: 'Team Leader R&D ERP-PAS',
      period: '2020 - Present',
      current: true,
      achievements: [
        'Clean Architecture migration',
        'Monorepo implementation',
        'Team recruitment',
        'AWS cloud migration',
        'AI implementation (Agents, MCP, LLM)',
        'Rust rewrite of desktop application',
        'Microservices architecture'
      ]
    }
  ],

  skills: [
    // Frontend
    { id: 'vue', name: 'Vue.js Ecosystem', category: 'frontend', icon: '💚' },
    { id: 'javascript', name: 'JavaScript', category: 'frontend', icon: '⚡' },
    { id: 'tailwind', name: 'TailwindCSS', category: 'frontend', icon: '🎨' },

    // Backend
    { id: 'nodejs', name: 'Node.js', category: 'backend', icon: '💚' },
    { id: 'sql', name: 'SQL', category: 'backend', icon: '🗃️' },

    // DevOps
    { id: 'docker', name: 'Docker', category: 'devops', icon: '🐳' },
    { id: 'gitlab', name: 'GitLab CI', category: 'devops', icon: '🦊' },
    { id: 'git', name: 'Git', category: 'devops', icon: '📦' },

    // Soft Skills
    { id: 'leadership', name: 'Leadership', category: 'soft', icon: '👑' },
    { id: 'craftsmanship', name: 'Craftsmanship', category: 'soft', icon: '🛠️' },
    { id: 'mentoring', name: 'Mentoring', category: 'soft', icon: '🎓' }
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
      status: 'read',
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
  ]
}

