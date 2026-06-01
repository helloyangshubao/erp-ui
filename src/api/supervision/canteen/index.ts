import request from '@/config/axios'

// 监管 - 食堂 VO
export interface CanteenVO {
  id: number
  deptId: number
  deptName?: string
  canteenNo: string
  canteenName: string
  businessStatus: number
  todayMealStatus: number
  foodSafetyManager: string
  contactPhone: string
  remark?: string
  createTime?: Date
}

// 监管 - 食堂 API
export const CanteenApi = {
  // 查询食堂分页
  getCanteenPage: async (params: any) => {
    return await request.get({ url: `/supervision/canteen/page`, params })
  },

  // 查询食堂详情
  getCanteen: async (id: number) => {
    return await request.get({ url: `/supervision/canteen/get?id=` + id })
  },

  // 新增食堂
  createCanteen: async (data: CanteenVO) => {
    return await request.post({ url: `/supervision/canteen/create`, data })
  },

  // 修改食堂
  updateCanteen: async (data: CanteenVO) => {
    return await request.put({ url: `/supervision/canteen/update`, data })
  },

  // 删除食堂
  deleteCanteen: async (id: number) => {
    return await request.delete({ url: `/supervision/canteen/delete?id=` + id })
  },

  // 查询食堂精简列表（通过分页接口组装）
  getCanteenSimpleList: async (deptId?: number): Promise<CanteenVO[]> => {
    const data = await request.get({
      url: `/supervision/canteen/page`,
      params: {
        pageNo: 1,
        pageSize: 200,
        deptId
      }
    })
    return data.list || []
  }
}
