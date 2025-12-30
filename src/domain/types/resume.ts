export interface Passion {
  id: string
  icon: string
  color: string
}

export interface Behavior {
  id: string
  icon: string
  color: string
  category: 'influencer' | 'cooperer' | 'reflechir' | 'agir' | 'ressentir'
}

export interface Experience {
  id: string
  company: string
  title: string
  period: string
  duration: string
  current: boolean
  achievements: string[]
}

export interface Skill {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'devops' | 'maker' | 'soft'
  icon?: string
  url?: string
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
  status: 'read' | 'reading' | 'toRead' | 'toBuy'
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

export interface Statistics {
  yearsOfExperience: number
  totalProjects: number
  developersRecruited: number
  presentations: number
  linesOfCode2025: number
  totalCommits2025: number
  issuesClosed2025: number
}

export interface Strength {
  id: string
  category: 'relationships' | 'work' | 'emotions'
  icon: string
  description: string
}

export interface ImprovementArea {
  id: string
  description: string
}

export interface TalentTag {
  id: string
  label: string
}

export interface ResumeData {
  name: string
  title: string
  company: string
  location: string
  bio: string
  passions: Passion[]
  behaviors?: Behavior[]
  experiences: Experience[]
  skills: Skill[]
  projects: Project[]
  books: Book[]
  socialLinks: SocialLink[]
  github: GitHubProfile
  statistics?: Statistics
  strengths?: Strength[]
  improvementAreas?: ImprovementArea[]
  talentTags?: TalentTag[]
}

