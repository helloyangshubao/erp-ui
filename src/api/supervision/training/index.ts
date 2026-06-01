import request from '@/config/axios'

// 监管 - 培训记录 VO
export interface TrainingVO {
  id: number
  deptId: number
  deptName?: string
  canteenId: number
  canteenName?: string
  lecturer: string
  lecturerPhone: string
  trainingAddress: string
  trainingTheme: string
  trainingContent: string
  imageUrl?: string
  trainingLevel: number
  trainingDate: Date | string
  createTime?: Date
}

// 监管 - 培训记录 API
export const TrainingApi = {
  getTrainingPage: async (params: any) => {
    return await request.get({ url: `/supervision/training/page`, params })
  },

  getTraining: async (id: number) => {
    return await request.get({ url: `/supervision/training/get?id=` + id })
  },

  createTraining: async (data: TrainingVO) => {
    return await request.post({ url: `/supervision/training/create`, data })
  },

  updateTraining: async (data: TrainingVO) => {
    return await request.put({ url: `/supervision/training/update`, data })
  },

  deleteTraining: async (id: number) => {
    return await request.delete({ url: `/supervision/training/delete?id=` + id })
  },

  exportTraining: async (params: any) => {
    return await request.download({ url: `/supervision/training/export-excel`, params })
  }
}
