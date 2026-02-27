import { request } from '@/api/request'

interface SystemConfigData {
  item_types: string[]
  feedback_types?: string[]
  claim_validity_days?: number
  publish_limit?: number
}

export interface PublicConfig {
  itemTypes: string[]
}

export function getPublicConfig() {
  return request<SystemConfigData>({
    url: '/system/config',
    method: 'GET',
  }).then(result => ({
    itemTypes: result.item_types || [],
  }))
}
