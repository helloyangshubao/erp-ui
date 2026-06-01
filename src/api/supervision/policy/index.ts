import request from '@/config/axios'

// 监管 - 制度管理 VO
export interface PolicyVO {
  id: number
  policyName: string
  canteenId: number
  canteenName?: string
  imageUrl?: string
  attachmentUrl?: string
  creatorName?: string
  createTime?: Date
}

// 监管 - 制度管理 API
export const PolicyApi = {
  getPolicyPage: async (params: any) => {
    return await request.get({ url: `/supervision/policy/page`, params })
  },

  getPolicy: async (id: number) => {
    return await request.get({ url: `/supervision/policy/get?id=` + id })
  },

  createPolicy: async (data: PolicyVO) => {
    return await request.post({ url: `/supervision/policy/create`, data })
  },

  updatePolicy: async (data: PolicyVO) => {
    return await request.put({ url: `/supervision/policy/update`, data })
  },

  deletePolicy: async (id: number) => {
    return await request.delete({ url: `/supervision/policy/delete?id=` + id })
  },

  exportPolicy: async (params: any) => {
    return await request.download({ url: `/supervision/policy/export-excel`, params })
  }
}
