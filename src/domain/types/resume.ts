export interface Passion {
  id: string
  icon: string
  color: string
}

export interface Experience {
  id: string
  company: string
  title: string
  period: string
  current: boolean
  achievements: string[]
}

export interface Skill {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'devops' | 'maker' | 'soft'
  icon?: string
}

export interface Project {
  id: string
  name: string
  stars: number
  tech: string
  url: string
  icon?: string
}

export interface Book {
  id: string
  title: string
  author: string
  status: 'read' | 'reading' | 'toRead'
  url: string
  cover?: string
}

export interface SocialLink {
  id: string
  name: string
  url: string
  icon: string
}

export interface GitHubProfile {
  username: string
  url: string
  totalRepos: number
}

export interface ResumeData {
  name: string
  title: string
  company: string
  location: string
  bio: string
  passions: Passion[]
  experiences: Experience[]
  skills: Skill[]
  projects: Project[]
  books: Book[]
  socialLinks: SocialLink[]
  github: GitHubProfile
}

