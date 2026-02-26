import type { MyPostListParams } from '@/api/modules/lostFound'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelMyPost,
  deleteMyPost,
  getMyPostList,
  publishPost,
  updateMyPost,
} from '@/api/modules/lostFound'
import { queryKeys } from '@/api/queryKeys'

export function useMyPostListQuery(params: MyPostListParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.post.myList(params),
    queryFn: () => getMyPostList(params),
    enabled,
  })
}

export function usePublishPostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: publishPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.post.myLists() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.lostFound.lists() })
    },
  })
}

export function useUpdateMyPostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMyPost,
    onSuccess: (_, payload) => {
      const id = String(payload.post_id)
      void queryClient.invalidateQueries({ queryKey: queryKeys.post.myLists() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.lostFound.lists() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.lostFound.detail(id) })
    },
  })
}

export function useCancelMyPostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelMyPost,
    onSuccess: (_, payload) => {
      const id = String(payload.post_id)
      void queryClient.invalidateQueries({ queryKey: queryKeys.post.myLists() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.lostFound.lists() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.lostFound.detail(id) })
    },
  })
}

export function useDeleteMyPostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMyPost,
    onSuccess: (_, payload) => {
      const id = String(payload.post_id)
      void queryClient.invalidateQueries({ queryKey: queryKeys.post.myLists() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.lostFound.lists() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.lostFound.detail(id) })
    },
  })
}
