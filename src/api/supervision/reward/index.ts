import request from '@/config/axios'

// 监管 - 奖惩记录 VO
export interface RewardVO {
  id: number
  deptId: number
  deptName?: string
  canteenId: number
  canteenName?: string
  rewardPerson: string
  contactPhone: string
  rewardType: number
  rewardReason: string
  rewardContent: string
  rewardDate: Date | string
  createTime?: Date
}

// 监管 - 奖惩记录 API
export const RewardApi = {
  getRewardPage: async (params: any) => {
    return await request.get({ url: `/supervision/reward/page`, params })
  },

  getReward: async (id: number) => {
    return await request.get({ url: `/supervision/reward/get?id=` + id })
  },

  createReward: async (data: RewardVO) => {
    return await request.post({ url: `/supervision/reward/create`, data })
  },

  updateReward: async (data: RewardVO) => {
    return await request.put({ url: `/supervision/reward/update`, data })
  },

  deleteReward: async (id: number) => {
    return await request.delete({ url: `/supervision/reward/delete?id=` + id })
  },

  exportReward: async (params: any) => {
    return await request.download({ url: `/supervision/reward/export-excel`, params })
  }
}
