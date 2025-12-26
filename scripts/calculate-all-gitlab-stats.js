/**
 * Script pour calculer les statistiques GitLab depuis tous les projets
 * 
 * Ce script doit être exécuté avec les outils MCP GitLab pour récupérer
 * les commits de 2025 depuis tous les projets listés.
 */

const PROJECTS = [
  'apvhn/resume',
  'apvhn/user-portal-monorepo',
  'apvhn/hexaflux-monorepo',
  'apvhn/yquem',
  'apvhn/customer-management-monorepo',
  'apvhn/overwatch-monorepo',
  'apvhn/hexa-script',
  'apvhn/htf-restruct',
  'apvhn/presentation',
  'apvhn/hexamdp',
  'apvhn/uniface-source-code',
  // Si les projets sont sous un autre namespace, ajoutez-les ici :
  // 'dedalus/user-portal-monorepo',
  // etc.
]

const USERNAME = 'apvhn'
const YEAR = 2025

/**
 * Calcule les statistiques depuis tous les projets GitLab
 * 
 * Pour chaque projet, utilisez l'API MCP GitLab :
 * mcp_gitlab-mcp_list_commits({
 *   project_id: projectId,
 *   author: USERNAME,
 *   since: `${YEAR}-01-01T00:00:00Z`,
 *   until: `${YEAR}-12-31T23:59:59Z`,
 *   with_stats: true,
 *   all: true
 * })
 */
function calculateStats(commitsByProject) {
  let totalLines = 0
  let totalCommits = 0

  for (const [projectId, commits] of Object.entries(commitsByProject)) {
    const projectLines = commits.reduce((sum, commit) => {
      return sum + (commit.stats?.additions || 0)
    }, 0)
    const projectCommits = commits.length

    console.log(`${projectId}:`)
    console.log(`  Commits: ${projectCommits}`)
    console.log(`  Lignes de code: ${projectLines}`)
    console.log('')

    totalLines += projectLines
    totalCommits += projectCommits
  }

  return {
    totalLines,
    totalCommits,
    projects: Object.keys(commitsByProject).length
  }
}

// Résultats connus pour le projet resume
const knownResults = {
  'apvhn/resume': {
    commits: 20,
    lines: 16905
  }
}

console.log('Statistiques GitLab 2025')
console.log('========================')
console.log('')
console.log('Projets à analyser:', PROJECTS.length)
console.log('')
console.log('Résultats connus:')
for (const [project, stats] of Object.entries(knownResults)) {
  console.log(`  ${project}: ${stats.commits} commits, ${stats.lines} lignes`)
}
console.log('')
console.log('Pour obtenir le total complet, exécutez les appels MCP GitLab')
console.log('pour chaque projet et calculez le total.')

