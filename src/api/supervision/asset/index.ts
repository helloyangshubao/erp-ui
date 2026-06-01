import request from '@/config/axios'

// 监管 - 固定资产 VO
export interface AssetVO {
  id: number
  imageUrl?: string
  assetNo: string
  assetName: string
  assetCategory: string
  unit: string
  quantity: number
  originalValue: number
  currentValue: number
  assetSource: string
  purchaseTime: Date | string
  useDeptId: number
  useDeptName?: string
  responsiblePerson: string
  assetStatus: number
  depreciationRate?: number
  createTime?: Date
}

export interface AssetDepreciateReqVO {
  id: number
  amount: number
  remark?: string
}

export interface AssetOperateReqVO {
  id: number
  remark?: string
}

// 监管 - 固定资产 API
export const AssetApi = {
  // 查询固定资产分页
  getAssetPage: async (params: any) => {
    return await request.get({ url: `/supervision/asset/page`, params })
  },

  // 查询固定资产详情
  getAsset: async (id: number) => {
    return await request.get({ url: `/supervision/asset/get?id=` + id })
  },

  // 新增固定资产
  createAsset: async (data: AssetVO) => {
    return await request.post({ url: `/supervision/asset/create`, data })
  },

  // 修改固定资产
  updateAsset: async (data: AssetVO) => {
    return await request.put({ url: `/supervision/asset/update`, data })
  },

  // 删除固定资产
  deleteAsset: async (id: number) => {
    return await request.delete({ url: `/supervision/asset/delete?id=` + id })
  },

  // 导出固定资产
  exportAsset: async (params: any) => {
    return await request.download({ url: `/supervision/asset/export-excel`, params })
  },

  // 下载导入模板
  importAssetTemplate: async () => {
    return await request.download({ url: `/supervision/asset/get-import-template` })
  },

  // 折旧
  depreciateAsset: async (data: AssetDepreciateReqVO) => {
    return await request.put({ url: `/supervision/asset/depreciate`, data })
  },

  // 报损
  reportLossAsset: async (data: AssetOperateReqVO) => {
    return await request.put({ url: `/supervision/asset/report-loss`, data })
  },

  // 损毁
  destroyAsset: async (data: AssetOperateReqVO) => {
    return await request.put({ url: `/supervision/asset/destroy`, data })
  }
}
