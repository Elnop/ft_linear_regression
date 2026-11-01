import fs from 'node:fs'
import path from 'node:path'

const CATEGORY_FOLDERS = new Set(['components', 'orchestrators', 'presenters', 'hooks', 'styles', 'types', 'configs', 'stores', 'lib'])
const root = path.resolve(import.meta.dirname, '..', 'src')

const folders = (dir) => fs.readdirSync(dir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((entry) => {
    const folder = path.join(dir, entry.name)
    return [folder, ...folders(folder)]
  })

const violations = folders(root).flatMap((folder) => {
  const count = fs.readdirSync(folder).length
  const name = path.relative(path.dirname(root), folder)
  if (count === 0) return [`${name} est vide`]
  if (count === 1 && CATEGORY_FOLDERS.has(path.basename(folder))) return [`${name} n'a qu'un enfant : le remonter d'un niveau`]
  return []
})

for (const violation of violations) console.error(violation)
process.exit(violations.length === 0 ? 0 : 1)
