#!/usr/bin/env node
// Refreshes src/domain/data/githubStats.json from the public GitHub API.
// Run manually (or in CI) with: npm run refresh:stats
// The JSON is committed so builds never depend on network access.

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const USERNAME = 'Wifsimster'
// resume.ts project id → GitHub repo name
const PROJECT_REPOS = {
  ondes: 'ondes',
  elan: 'elan',
  plexcord: 'PlexCord',
  thebox: 'the-box',
  solopilot: 'solopilot',
  toko: 'toko'
}

const headers = { 'User-Agent': `${USERNAME}-resume-stats` }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

const userRes = await fetch(`https://api.github.com/users/${USERNAME}`, { headers })
if (!userRes.ok) {
  console.error(`GitHub API error ${userRes.status} on /users/${USERNAME} — keeping the committed stats.`)
  process.exit(1)
}
const user = await userRes.json()

const stars = {}
for (const [id, repo] of Object.entries(PROJECT_REPOS)) {
  const res = await fetch(`https://api.github.com/repos/${USERNAME}/${repo}`, { headers })
  if (res.ok) {
    const data = await res.json()
    stars[id] = data.stargazers_count ?? 0
  } else {
    console.warn(`  ! ${repo}: HTTP ${res.status} — skipped`)
  }
}

const out = {
  fetchedAt: new Date().toISOString().slice(0, 10),
  totalRepos: user.public_repos,
  stars
}

const target = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'domain', 'data', 'githubStats.json')
await writeFile(target, JSON.stringify(out, null, 2) + '\n')
console.log(`githubStats.json updated: ${out.totalRepos} repos, stars for ${Object.keys(stars).length} projects`)
