import type { AnnouncementListParams } from '@/api/modules/announcement'
import { useQuery } from '@tanstack/react-query'
import { getAnnouncementList } from '@/api/modules/announcement'
import { queryKeys } from '@/api/queryKeys'

export function useAnnouncementListQuery(params: AnnouncementListParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.announcement.list(params),
    queryFn: () => getAnnouncementList(params),
    enabled,
  })
}
