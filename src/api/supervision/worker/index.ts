import request from '@/config/axios'

// 监管 - 工勤人员 VO
export interface WorkerVO {
  id: number
  deptId: number
  deptName?: string
  canteenId: number
  canteenName?: string
  name: string
  sex: number
  age: number
  position: string
  employeeAttribute: number
  entryTime: Date | string
  status: number
  createTime?: Date
}

// 监管 - 工勤人员 API
export const WorkerApi = {
  // 查询工勤人员分页
  getWorkerPage: async (params: any) => {
    return await request.get({ url: `/supervision/worker/page`, params })
  },

  // 查询工勤人员详情
  getWorker: async (id: number) => {
    return await request.get({ url: `/supervision/worker/get?id=` + id })
  },

  // 新增工勤人员
  createWorker: async (data: WorkerVO) => {
    return await request.post({ url: `/supervision/worker/create`, data })
  },

  // 修改工勤人员
  updateWorker: async (data: WorkerVO) => {
    return await request.put({ url: `/supervision/worker/update`, data })
  },

  // 删除工勤人员
  deleteWorker: async (id: number) => {
    return await request.delete({ url: `/supervision/worker/delete?id=` + id })
  },

  // 导出工勤人员
  exportWorker: async (params: any) => {
    return await request.download({ url: `/supervision/worker/export-excel`, params })
  },

  // 下载导入模板
  importWorkerTemplate: async () => {
    return await request.download({ url: `/supervision/worker/get-import-template` })
  }
}
