'use client'

import type {
  ClaimRequest,
  FeedbackRecord,
  LostFoundItem,
  SubmitClaimPayload,
  SubmitFeedbackPayload,
} from '@/components/query/types'
import { create } from 'zustand'
import { INITIAL_FEEDBACK_RECORDS, MOCK_LOST_FOUND_ITEMS } from '@/components/query/constants'

interface LostFoundStore {
  items: LostFoundItem[]
  claimRequests: ClaimRequest[]
  feedbackRecords: FeedbackRecord[]
  submitClaim: (payload: SubmitClaimPayload) => boolean
  submitFeedback: (payload: SubmitFeedbackPayload) => boolean
}

function createRecordId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const useLostFoundStore = create<LostFoundStore>(set => ({
  items: MOCK_LOST_FOUND_ITEMS,
  claimRequests: [],
  feedbackRecords: INITIAL_FEEDBACK_RECORDS,
  submitClaim: (payload) => {
    let isSubmitted = false
    set((state) => {
      const target = state.items.find(item => item.id === payload.itemId)
      if (!target)
        return state

      const newClaim: ClaimRequest = {
        id: createRecordId('CLAIM'),
        itemId: target.id,
        itemName: target.name,
        action: payload.action,
        requestCategory: payload.action === '找回' ? '失物' : '招领',
        detail: payload.detail.trim(),
        photos: payload.photos.slice(0, 3),
        createdAt: new Date().toISOString(),
        status: '待审核',
      }
      isSubmitted = true

      return {
        claimRequests: [newClaim, ...state.claimRequests],
        items: state.items.map(item =>
          item.id === target.id
            ? { ...item, claimCount: item.claimCount + 1 }
            : item,
        ),
      }
    })
    return isSubmitted
  },
  submitFeedback: (payload) => {
    set(state => ({
      feedbackRecords: [
        {
          id: createRecordId('FDBK'),
          types: payload.types,
          description: payload.description.trim(),
          createdAt: new Date().toISOString(),
          status: '待审核',
          source: payload.source,
        },
        ...state.feedbackRecords,
      ],
    }))
    return true
  },
}))
