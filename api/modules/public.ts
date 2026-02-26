import { request } from '@/api/request'

interface PublicConfigData {
  item_types: string[]
}

export interface PublicConfig {
  itemTypes: string[]
}

export function getPublicConfig() {
  return request<PublicConfigData>({
    url: '/public/config',
    method: 'GET',
  }).then(result => ({
    itemTypes: result.item_types || [],
  }))
}
