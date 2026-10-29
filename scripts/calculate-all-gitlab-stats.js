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
]

const USERNAME = 'apvhn'
const YEAR = 2025

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


