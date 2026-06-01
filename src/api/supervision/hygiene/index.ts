import request from '@/config/axios'

// 监管 - 卫生检查 VO
export interface HygieneVO {
  id: number
  deptId: number
  deptName?: string
  canteenId: number
  canteenName?: string
  inspector: string
  contactPhone: string
  checkDate: Date | string
  attachmentUrl?: string
  sceneImageUrl?: string
  createTime?: Date
}

// 监管 - 卫生检查 API
export const HygieneApi = {
  getHygienePage: async (params: any) => {
    return await request.get({ url: `/supervision/hygiene/page`, params })
  },

  getHygiene: async (id: number) => {
    return await request.get({ url: `/supervision/hygiene/get?id=` + id })
  },

  createHygiene: async (data: HygieneVO) => {
    return await request.post({ url: `/supervision/hygiene/create`, data })
  },

  updateHygiene: async (data: HygieneVO) => {
    return await request.put({ url: `/supervision/hygiene/update`, data })
  },

  deleteHygiene: async (id: number) => {
    return await request.delete({ url: `/supervision/hygiene/delete?id=` + id })
  },

  exportHygiene: async (params: any) => {
    return await request.download({ url: `/supervision/hygiene/export-excel`, params })
  }
}
