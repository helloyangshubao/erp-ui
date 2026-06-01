<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="760px">
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
          <el-form-item label="食堂名称" prop="canteenId">
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
          <el-form-item label="姓名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别" prop="sex">
            <el-select v-model="formData.sex" placeholder="请选择性别" class="w-1/1">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄" prop="age">
            <el-input-number
              v-model="formData.age"
              :min="0"
              :precision="0"
              placeholder="请输入年龄"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职位" prop="position">
            <el-input v-model="formData.position" placeholder="请输入职位" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职工属性" prop="employeeAttribute">
            <el-select
              v-model="formData.employeeAttribute"
              placeholder="请选择职工属性"
              class="w-1/1"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_WORKER_ATTRIBUTE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入职时间" prop="entryTime">
            <el-date-picker
              v-model="formData.entryTime"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择入职时间"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态" class="w-1/1">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_WORKER_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
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
import { WorkerApi, WorkerVO } from '@/api/supervision/worker'
import { defaultProps, handleTree } from '@/utils/tree'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

defineOptions({ name: 'SupervisionWorkerForm' })

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
  name: undefined,
  sex: undefined,
  age: undefined,
  position: undefined,
  employeeAttribute: undefined,
  entryTime: undefined,
  status: undefined
})
const formRules = reactive({
  deptId: [{ required: true, message: '所属机构不能为空', trigger: 'change' }],
  canteenId: [{ required: true, message: '食堂不能为空', trigger: 'change' }],
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  sex: [{ required: true, message: '性别不能为空', trigger: 'change' }],
  age: [{ required: true, message: '年龄不能为空', trigger: 'blur' }],
  position: [{ required: true, message: '职位不能为空', trigger: 'blur' }],
  employeeAttribute: [{ required: true, message: '职工属性不能为空', trigger: 'change' }],
  entryTime: [{ required: true, message: '入职时间不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
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
      formData.value = await WorkerApi.getWorker(id)
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
    const data = formData.value as unknown as WorkerVO
    if (formType.value === 'create') {
      await WorkerApi.createWorker(data)
      message.success(t('common.createSuccess'))
    } else {
      await WorkerApi.updateWorker(data)
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
    name: undefined,
    sex: 1,
    age: undefined,
    position: undefined,
    employeeAttribute: 1,
    entryTime: undefined,
    status: 0
  }
  formRef.value?.resetFields()
}
</script>
