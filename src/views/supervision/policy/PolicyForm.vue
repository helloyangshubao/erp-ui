<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="780px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="制度名称" prop="policyName">
            <el-input v-model="formData.policyName" placeholder="请输入制度名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="食堂" prop="canteenId">
            <el-select v-model="formData.canteenId" placeholder="请选择食堂" class="w-1/1" clearable>
              <el-option
                v-for="canteen in canteenList"
                :key="canteen.id"
                :label="formatCanteenLabel(canteen)"
                :value="canteen.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图片">
            <UploadImg v-model="formData.imageUrl" width="120px" height="120px" />
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
      </el-row>
    </el-form>
    <template #footer>
      <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { CanteenApi, CanteenVO } from '@/api/supervision/canteen'
import { PolicyApi, PolicyVO } from '@/api/supervision/policy'
import { UploadFile, UploadImg } from '@/components/UploadFile'

defineOptions({ name: 'SupervisionPolicyForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const canteenList = ref<CanteenVO[]>([])
  const formData = ref({
    id: undefined,
    policyName: undefined,
    canteenId: undefined,
    imageUrl: undefined,
    attachmentUrl: ''
  })
const formRules = reactive({
  policyName: [{ required: true, message: '制度名称不能为空', trigger: 'blur' }],
  canteenId: [{ required: true, message: '食堂不能为空', trigger: 'change' }]
})
const formRef = ref()

const loadCanteenList = async () => {
  canteenList.value = await CanteenApi.getCanteenSimpleList()
}

const formatCanteenLabel = (canteen: CanteenVO) => {
  return canteen.deptName ? `${canteen.deptName} / ${canteen.canteenName}` : canteen.canteenName
}

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  await loadCanteenList()
  if (id) {
    formLoading.value = true
    try {
      formData.value = await PolicyApi.getPolicy(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = formData.value as unknown as PolicyVO
    if (formType.value === 'create') {
      await PolicyApi.createPolicy(data)
      message.success(t('common.createSuccess'))
    } else {
      await PolicyApi.updatePolicy(data)
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
      policyName: undefined,
      canteenId: undefined,
      imageUrl: undefined,
      attachmentUrl: ''
    }
  formRef.value?.resetFields()
}
</script>
