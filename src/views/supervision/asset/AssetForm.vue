<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="资产编号" prop="assetNo">
            <el-input v-model="formData.assetNo" placeholder="请输入资产编号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产名称" prop="assetName">
            <el-input v-model="formData.assetName" placeholder="请输入资产名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产分类" prop="assetCategory">
            <el-input v-model="formData.assetCategory" placeholder="请输入资产分类" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="图片地址" prop="imageUrl">
            <el-input v-model="formData.imageUrl" placeholder="请输入图片 URL" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="计量单位" prop="unit">
            <el-input v-model="formData.unit" placeholder="请输入计量单位" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="数量" prop="quantity">
            <el-input-number
              v-model="formData.quantity"
              :min="0"
              :precision="0"
              placeholder="请输入数量"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产原值" prop="originalValue">
            <el-input-number
              v-model="formData.originalValue"
              :min="0"
              :precision="2"
              placeholder="请输入资产原值"
              class="!w-1/1"
              @change="updateDepreciationRate"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产现值" prop="currentValue">
            <el-input-number
              v-model="formData.currentValue"
              :min="0"
              :precision="2"
              placeholder="请输入资产现值"
              class="!w-1/1"
              @change="updateDepreciationRate"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产来源" prop="assetSource">
            <el-input v-model="formData.assetSource" placeholder="请输入资产来源" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="购置时间" prop="purchaseTime">
            <el-date-picker
              v-model="formData.purchaseTime"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择购置时间"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="使用部门" prop="useDeptId">
            <el-tree-select
              v-model="formData.useDeptId"
              :data="deptList"
              :props="defaultProps"
              check-strictly
              node-key="id"
              placeholder="请选择使用部门"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人" prop="responsiblePerson">
            <el-input v-model="formData.responsiblePerson" placeholder="请输入负责人" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="资产状态" prop="assetStatus">
            <el-select v-model="formData.assetStatus" placeholder="请选择资产状态" class="w-1/1">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_ASSET_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="折旧程度(%)">
            <el-input-number
              v-model="formData.depreciationRate"
              :precision="2"
              :disabled="true"
              class="!w-1/1"
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
import * as DeptApi from '@/api/system/dept'
import { AssetApi, AssetVO } from '@/api/supervision/asset'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'

defineOptions({ name: 'SupervisionAssetForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const deptList = ref<Tree[]>([])
const formData = ref({
  id: undefined,
  imageUrl: undefined,
  assetNo: undefined,
  assetName: undefined,
  assetCategory: undefined,
  unit: undefined,
  quantity: undefined,
  originalValue: undefined,
  currentValue: undefined,
  assetSource: undefined,
  purchaseTime: undefined,
  useDeptId: undefined,
  responsiblePerson: undefined,
  assetStatus: undefined,
  depreciationRate: undefined
})
const formRules = reactive({
  assetNo: [{ required: true, message: '资产编号不能为空', trigger: 'blur' }],
  assetName: [{ required: true, message: '资产名称不能为空', trigger: 'blur' }],
  assetCategory: [{ required: true, message: '资产分类不能为空', trigger: 'blur' }],
  unit: [{ required: true, message: '计量单位不能为空', trigger: 'blur' }],
  quantity: [{ required: true, message: '数量不能为空', trigger: 'blur' }],
  originalValue: [{ required: true, message: '资产原值不能为空', trigger: 'blur' }],
  currentValue: [{ required: true, message: '资产现值不能为空', trigger: 'blur' }],
  assetSource: [{ required: true, message: '资产来源不能为空', trigger: 'blur' }],
  purchaseTime: [{ required: true, message: '购置时间不能为空', trigger: 'change' }],
  useDeptId: [{ required: true, message: '使用部门不能为空', trigger: 'change' }],
  responsiblePerson: [{ required: true, message: '负责人不能为空', trigger: 'blur' }],
  assetStatus: [{ required: true, message: '资产状态不能为空', trigger: 'change' }]
})
const formRef = ref()

const updateDepreciationRate = () => {
  const originalValue = Number(formData.value.originalValue || 0)
  const currentValue = Number(formData.value.currentValue || 0)
  if (!originalValue || originalValue <= 0) {
    formData.value.depreciationRate = 0
    return
  }
  let rate = ((originalValue - currentValue) / originalValue) * 100
  if (rate < 0) rate = 0
  formData.value.depreciationRate = Number(rate.toFixed(2))
}

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  if (id) {
    formLoading.value = true
    try {
      formData.value = await AssetApi.getAsset(id)
      updateDepreciationRate()
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
    updateDepreciationRate()
    const data = formData.value as unknown as AssetVO
    if (formType.value === 'create') {
      await AssetApi.createAsset(data)
      message.success(t('common.createSuccess'))
    } else {
      await AssetApi.updateAsset(data)
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
    imageUrl: undefined,
    assetNo: undefined,
    assetName: undefined,
    assetCategory: undefined,
    unit: undefined,
    quantity: undefined,
    originalValue: undefined,
    currentValue: undefined,
    assetSource: undefined,
    purchaseTime: undefined,
    useDeptId: undefined,
    responsiblePerson: undefined,
    assetStatus: 0,
    depreciationRate: 0
  }
  formRef.value?.resetFields()
}
</script>
