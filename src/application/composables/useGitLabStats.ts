import { ref, computed } from 'vue'
import { resumeData } from '@domain/data/resume'

interface GitLabStats {
  totalLinesAdded: number
  totalCommits: number
  loading: boolean
  error: string | null
}

const stats = ref<GitLabStats>({
  totalLinesAdded: 0,
  totalCommits: 0,
  loading: false,
  error: null
})

/**
 * Met à jour les statistiques depuis les données du résumé
 * Les stats peuvent être mises à jour manuellement dans resume.ts
 * ou via un script qui utilise l'API GitLab MCP
 */
export function updateStatsFromResume() {
  if (resumeData.statistics) {
    stats.value.totalLinesAdded = resumeData.statistics.linesOfCode2025 || 0
    stats.value.totalCommits = resumeData.statistics.totalCommits2025 || 0
  }
}

export function useGitLabStats() {
  // Initialiser les stats depuis resume.ts
  updateStatsFromResume()

  return {
    stats: computed(() => stats.value),
    refresh: updateStatsFromResume
  }
}

