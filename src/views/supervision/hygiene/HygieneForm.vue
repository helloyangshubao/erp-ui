<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="820px">
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
          <el-form-item label="检查人" prop="inspector">
            <el-input v-model="formData.inspector" placeholder="请输入检查人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="检查日期" prop="checkDate">
            <el-date-picker
              v-model="formData.checkDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择检查日期"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="附件">
            <UploadFile
              v-model="formData.attachmentUrl"
              :limit="1"
              :is-show-tip="false"
              :file-type="['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="现场影像">
            <UploadImg v-model="formData.sceneImageUrl" width="120px" height="120px" />
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
import { HygieneApi, HygieneVO } from '@/api/supervision/hygiene'
import { UploadFile, UploadImg } from '@/components/UploadFile'
import { defaultProps, handleTree } from '@/utils/tree'

defineOptions({ name: 'SupervisionHygieneForm' })

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
    inspector: undefined,
    contactPhone: undefined,
    checkDate: undefined,
    attachmentUrl: '',
    sceneImageUrl: undefined
  })
const formRules = reactive({
  deptId: [{ required: true, message: '所属机构不能为空', trigger: 'change' }],
  canteenId: [{ required: true, message: '食堂不能为空', trigger: 'change' }],
  inspector: [{ required: true, message: '检查人不能为空', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }],
  checkDate: [{ required: true, message: '检查日期不能为空', trigger: 'change' }]
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
      formData.value = await HygieneApi.getHygiene(id)
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
    const data = formData.value as unknown as HygieneVO
    if (formType.value === 'create') {
      await HygieneApi.createHygiene(data)
      message.success(t('common.createSuccess'))
    } else {
      await HygieneApi.updateHygiene(data)
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
    inspector: undefined,
      contactPhone: undefined,
      checkDate: undefined,
      attachmentUrl: '',
      sceneImageUrl: undefined
    }
  formRef.value?.resetFields()
}
</script>
