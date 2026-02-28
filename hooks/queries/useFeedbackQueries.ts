import type { FeedbackListParams } from '@/api/modules/feedback'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getFeedbackRecords, submitFeedbackRequest } from '@/api/modules/feedback'
import { queryKeys } from '@/api/queryKeys'

export function useFeedbackRecordsQuery(params: FeedbackListParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.feedback.list(params),
    queryFn: () => getFeedbackRecords(params),
    enabled,
  })
}

export function useSubmitFeedbackMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitFeedbackRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all })
    },
  })
}
