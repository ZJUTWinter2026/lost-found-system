import type { CreateAgentSessionPayload } from '@/api/modules/agent'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAgentSession,
  getAgentHistory,
  getAgentSessions,
} from '@/api/modules/agent'
import { queryKeys } from '@/api/queryKeys'
import { useAuthStore } from '@/stores/authStore'

function normalizeSessionId(sessionId?: string) {
  return String(sessionId || '').trim()
}

export function useAgentSessionsQuery(enabled = true) {
  const authUserId = useAuthStore(state => state.authUser?.id)

  return useQuery({
    queryKey: queryKeys.agent.sessions(authUserId),
    queryFn: getAgentSessions,
    enabled,
  })
}

export function useAgentHistoryQuery(sessionId?: string, enabled = true) {
  const authUserId = useAuthStore(state => state.authUser?.id)
  const normalizedSessionId = normalizeSessionId(sessionId)

  return useQuery({
    queryKey: queryKeys.agent.history({ session_id: normalizedSessionId }, authUserId),
    queryFn: () => {
      if (!normalizedSessionId)
        throw new Error('sessionId 不能为空')

      return getAgentHistory(normalizedSessionId)
    },
    enabled: enabled && !!normalizedSessionId,
  })
}

export function useCreateAgentSessionMutation() {
  const queryClient = useQueryClient()
  const authUserId = useAuthStore(state => state.authUser?.id)

  return useMutation({
    mutationFn: (payload?: CreateAgentSessionPayload) => createAgentSession(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.agent.sessions(authUserId) })
    },
  })
}
