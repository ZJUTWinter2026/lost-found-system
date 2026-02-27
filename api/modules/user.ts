import { request } from '@/api/request'

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResult {
  id: number
  need_update: boolean
  user_type: string
}

export interface UpdatePasswordPayload {
  old_password: string
  new_password: string
}

export function loginByPassword(payload: LoginPayload) {
  return request<LoginResult>({
    url: '/user/login',
    method: 'POST',
    data: payload,
  })
}

interface UploadImageData {
  urls: string[]
}

function appendFilesToFormData(files: File[]) {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })
  return formData
}

export function uploadImages(files: File[]) {
  if (!files.length)
    return Promise.resolve<string[]>([])

  return request<UploadImageData>({
    url: '/user/upload',
    method: 'POST',
    data: appendFilesToFormData(files),
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(result => result.urls || [])
}

export function updatePassword(payload: UpdatePasswordPayload) {
  return request<unknown>({
    url: '/user/update',
    method: 'POST',
    data: payload,
  })
}
