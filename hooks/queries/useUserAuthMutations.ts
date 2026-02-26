import { useMutation } from '@tanstack/react-query'
import { loginByPassword, updatePassword, uploadImages } from '@/api/modules/user'

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginByPassword,
  })
}

export function useUploadImagesMutation() {
  return useMutation({
    mutationFn: uploadImages,
  })
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: updatePassword,
  })
}
