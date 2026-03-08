import type { LostFoundListParams, MyClaimListParams } from '@/api/modules/lostFound'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelClaimRequest,
  getClaimList,
  getLostFoundItemDetail,
  getLostFoundList,
  getMyClaimList,
  reviewClaim,
  submitClaimRequest,
} from '@/api/modules/lostFound'
import { queryKeys } from '@/api/queryKeys'

export function useLostFoundListQuery(params: LostFoundListParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.lostFound.list(params),
    queryFn: () => getLostFoundList(params),
    enabled,
  })
}

export function useLostFoundDetailQuery(itemId?: string) {
  return useQuery({
    queryKey: queryKeys.lostFound.detail(itemId || ''),
    queryFn: () => {
      if (!itemId)
        throw new Error('itemId 不能为空')

      return getLostFoundItemDetail(itemId)
    },
    enabled: !!itemId,
  })
}

export function useSubmitClaimMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitClaimRequest,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.claim.myLists() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.lostFound.lists() })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.lostFound.detail(String(variables.postId)),
      })
    },
  })
}

function hasValidPostId(postId?: string | number) {
  if (postId === undefined || postId === null)
    return false

  return String(postId).trim().length > 0
}

export function useClaimListQuery(postId?: string | number, enabled = true) {
  const queryPostId = hasValidPostId(postId) ? String(postId).trim() : ''

  return useQuery({
    queryKey: queryKeys.claim.list(queryPostId),
    queryFn: () => {
      if (!queryPostId)
        throw new Error('postId 不能为空')

      return getClaimList(queryPostId)
    },
    enabled: enabled && !!queryPostId,
  })
}

export function useMyClaimListQuery(params: MyClaimListParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.claim.myList(params),
    queryFn: () => getMyClaimList(params),
    enabled,
  })
}

export function useCancelClaimMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelClaimRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.claim.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.lostFound.lists() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.lostFound.details() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.post.myLists() })
    },
  })
}

export function useReviewClaimMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reviewClaim,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.claim.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.lostFound.lists() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.post.myLists() })
    },
  })
}
