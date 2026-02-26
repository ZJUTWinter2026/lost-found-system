import { request } from '@/api/request'

export interface AnnouncementListParams {
  page?: number
  page_size?: number
}

export interface AnnouncementItem {
  id: number
  title: string
  content: string
  type: string
  created_at: string
}

export interface AnnouncementListData {
  list: AnnouncementItem[]
  page: number
  page_size: number
  total: number
}

export function getAnnouncementList(params: AnnouncementListParams = {}) {
  return request<AnnouncementListData>({
    url: '/announcement/list',
    method: 'GET',
    params,
  })
}
