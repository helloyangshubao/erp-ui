<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="110px"
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
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="食堂编号" prop="canteenNo">
            <el-input v-model="formData.canteenNo" placeholder="请输入食堂编号" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="食堂名称" prop="canteenName">
            <el-input v-model="formData.canteenName" placeholder="请输入食堂名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="营业状态" prop="businessStatus">
            <el-select v-model="formData.businessStatus" placeholder="请选择营业状态" class="w-1/1">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_CANTEEN_BUSINESS_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="今日供餐情况" prop="todayMealStatus">
            <el-select
              v-model="formData.todayMealStatus"
              placeholder="请选择今日供餐情况"
              class="w-1/1"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_CANTEEN_TODAY_MEAL_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="食品安全管理员" prop="foodSafetyManager">
            <el-input v-model="formData.foodSafetyManager" placeholder="请输入食品安全管理员" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系方式" prop="contactPhone">
            <el-input v-model="formData.contactPhone" placeholder="请输入联系方式" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remark">
            <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
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
import { defaultProps, handleTree } from '@/utils/tree'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

defineOptions({ name: 'SupervisionCanteenForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const deptList = ref<Tree[]>([])
const formData = ref({
  id: undefined,
  deptId: undefined,
  canteenNo: undefined,
  canteenName: undefined,
  businessStatus: undefined,
  todayMealStatus: undefined,
  foodSafetyManager: undefined,
  contactPhone: undefined,
  remark: undefined
})
const formRules = reactive({
  deptId: [{ required: true, message: '机构不能为空', trigger: 'change' }],
  canteenNo: [{ required: true, message: '食堂编号不能为空', trigger: 'blur' }],
  canteenName: [{ required: true, message: '食堂名称不能为空', trigger: 'blur' }],
  businessStatus: [{ required: true, message: '营业状态不能为空', trigger: 'change' }],
  todayMealStatus: [{ required: true, message: '今日供餐情况不能为空', trigger: 'change' }],
  foodSafetyManager: [{ required: true, message: '食品安全管理员不能为空', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '联系方式不能为空', trigger: 'blur' }]
})
const formRef = ref()

const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  if (id) {
    formLoading.value = true
    try {
      formData.value = await CanteenApi.getCanteen(id)
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
    const data = formData.value as unknown as CanteenVO
    if (formType.value === 'create') {
      await CanteenApi.createCanteen(data)
      message.success(t('common.createSuccess'))
    } else {
      await CanteenApi.updateCanteen(data)
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
    canteenNo: undefined,
    canteenName: undefined,
    businessStatus: 0,
    todayMealStatus: 0,
    foodSafetyManager: undefined,
    contactPhone: undefined,
    remark: undefined
  }
  formRef.value?.resetFields()
}
</script>
