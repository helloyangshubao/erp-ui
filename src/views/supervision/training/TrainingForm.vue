<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="860px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="所属机构" prop="deptId">
            <el-tree-select
              v-model="formData.deptId"
              :data="deptList"
              :props="defaultProps"
              check-strictly
              node-key="id"
              placeholder="请选择所属机构"
              @change="handleDeptChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="食堂" prop="canteenId">
            <el-select v-model="formData.canteenId" placeholder="请选择食堂" class="w-1/1" clearable>
              <el-option
                v-for="canteen in canteenList"
                :key="canteen.id"
                :label="canteen.canteenName"
                :value="canteen.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="培训讲师" prop="lecturer">
            <el-input v-model="formData.lecturer" placeholder="请输入培训讲师" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="讲师联系方式" prop="lecturerPhone">
            <el-input v-model="formData.lecturerPhone" placeholder="请输入讲师联系方式" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="培训地址" prop="trainingAddress">
            <el-input v-model="formData.trainingAddress" placeholder="请输入培训地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="培训级别" prop="trainingLevel">
            <el-select
              v-model="formData.trainingLevel"
              placeholder="请选择培训级别"
              class="w-1/1"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_TRAINING_LEVEL)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="培训主题" prop="trainingTheme">
            <el-input v-model="formData.trainingTheme" placeholder="请输入培训主题" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="培训日期" prop="trainingDate">
            <el-date-picker
              v-model="formData.trainingDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择培训日期"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="培训内容" prop="trainingContent">
            <el-input
              v-model="formData.trainingContent"
              type="textarea"
              :rows="3"
              placeholder="请输入培训内容"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="图片">
            <UploadImg v-model="formData.imageUrl" width="120px" height="120px" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import * as DeptApi from '@/api/system/dept'
import { CanteenApi, CanteenVO } from '@/api/supervision/canteen'
import { TrainingApi, TrainingVO } from '@/api/supervision/training'
import { UploadImg } from '@/components/UploadFile'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'

defineOptions({ name: 'SupervisionTrainingForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const loadingFormData = ref(false)
const deptList = ref<Tree[]>([])
const canteenList = ref<CanteenVO[]>([])
const formData = ref({
  id: undefined,
  deptId: undefined,
  canteenId: undefined,
  lecturer: undefined,
  lecturerPhone: undefined,
  trainingAddress: undefined,
  trainingTheme: undefined,
  trainingContent: undefined,
  imageUrl: undefined,
  trainingLevel: undefined,
  trainingDate: undefined
})
const formRules = reactive({
  deptId: [{ required: true, message: '所属机构不能为空', trigger: 'change' }],
  canteenId: [{ required: true, message: '食堂不能为空', trigger: 'change' }],
  lecturer: [{ required: true, message: '培训讲师不能为空', trigger: 'blur' }],
  lecturerPhone: [{ required: true, message: '讲师联系方式不能为空', trigger: 'blur' }],
  trainingAddress: [{ required: true, message: '培训地址不能为空', trigger: 'blur' }],
  trainingTheme: [{ required: true, message: '培训主题不能为空', trigger: 'blur' }],
  trainingContent: [{ required: true, message: '培训内容不能为空', trigger: 'blur' }],
  trainingLevel: [{ required: true, message: '培训级别不能为空', trigger: 'change' }],
  trainingDate: [{ required: true, message: '培训日期不能为空', trigger: 'change' }]
})
const formRef = ref()

const loadCanteenList = async (deptId?: number) => {
  canteenList.value = await CanteenApi.getCanteenSimpleList(deptId)
}

const handleDeptChange = async () => {
  if (loadingFormData.value) {
    return
  }
  formData.value.canteenId = undefined
  await loadCanteenList(formData.value.deptId)
}

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  if (id) {
    formLoading.value = true
    loadingFormData.value = true
    try {
      formData.value = await TrainingApi.getTraining(id)
      await loadCanteenList(formData.value.deptId)
    } finally {
      loadingFormData.value = false
      formLoading.value = false
    }
    return
  }
  await loadCanteenList()
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = formData.value as unknown as TrainingVO
    if (formType.value === 'create') {
      await TrainingApi.createTraining(data)
      message.success(t('common.createSuccess'))
    } else {
      await TrainingApi.updateTraining(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    deptId: undefined,
    canteenId: undefined,
    lecturer: undefined,
    lecturerPhone: undefined,
    trainingAddress: undefined,
    trainingTheme: undefined,
    trainingContent: undefined,
    imageUrl: undefined,
    trainingLevel: undefined,
    trainingDate: undefined
  }
  formRef.value?.resetFields()
}
</script>
