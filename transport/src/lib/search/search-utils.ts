import Fuse from 'fuse.js'
import type { UserRole } from '@/types'
import { SEARCH_ITEMS, type SearchItem } from './search-index'

const RANK: Record<UserRole, number> = {
  superadmin: 100,
  admin: 80,
  operations_manager: 60,
  accountant: 50,
  dispatcher: 40,
  data_entry: 20,
  viewer: 10,
}

export function getVisibleSearchItems(role: UserRole): SearchItem[] {
  return SEARCH_ITEMS.filter((item) => RANK[role] >= RANK[item.minRole])
}

export function searchDashboardItems(query: string, role: UserRole): SearchItem[] {
  const items = getVisibleSearchItems(role)

  if (!query.trim()) return items.slice(0, 8)

  const fuse = new Fuse(items, {
    threshold: 0.32,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: 'title', weight: 0.45 },
      { name: 'description', weight: 0.2 },
      { name: 'keywords', weight: 0.35 },
    ],
  })

  return fuse.search(query).map((result) => result.item)
}