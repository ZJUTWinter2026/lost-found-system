import { useQuery } from '@tanstack/react-query'
import { getPublicConfig } from '@/api/modules/public'
import { queryKeys } from '@/api/queryKeys'

export function usePublicConfigQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.public.config(),
    queryFn: getPublicConfig,
    enabled,
  })
}
