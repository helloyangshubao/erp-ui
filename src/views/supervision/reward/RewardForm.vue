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
          <el-form-item label="奖惩人员" prop="rewardPerson">
            <el-input v-model="formData.rewardPerson" placeholder="请输入奖惩人员" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="奖惩类型" prop="rewardType">
            <el-select v-model="formData.rewardType" placeholder="请选择奖惩类型" class="w-1/1">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_REWARD_TYPE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="奖惩日期" prop="rewardDate">
            <el-date-picker
              v-model="formData.rewardDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="请选择奖惩日期"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="奖惩原因" prop="rewardReason">
            <el-input v-model="formData.rewardReason" placeholder="请输入奖惩原因" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="奖惩内容" prop="rewardContent">
            <el-input
              v-model="formData.rewardContent"
              type="textarea"
              :rows="3"
              placeholder="请输入奖惩内容"
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
import { CanteenApi, CanteenVO } from '@/api/supervision/canteen'
import { RewardApi, RewardVO } from '@/api/supervision/reward'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { defaultProps, handleTree } from '@/utils/tree'

defineOptions({ name: 'SupervisionRewardForm' })

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
  rewardPerson: undefined,
  contactPhone: undefined,
  rewardType: undefined,
  rewardReason: undefined,
  rewardContent: undefined,
  rewardDate: undefined
})
const formRules = reactive({
  deptId: [{ required: true, message: '所属机构不能为空', trigger: 'change' }],
  canteenId: [{ required: true, message: '食堂不能为空', trigger: 'change' }],
  rewardPerson: [{ required: true, message: '奖惩人员不能为空', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '联系电话不能为空', trigger: 'blur' }],
  rewardType: [{ required: true, message: '奖惩类型不能为空', trigger: 'change' }],
  rewardReason: [{ required: true, message: '奖惩原因不能为空', trigger: 'blur' }],
  rewardContent: [{ required: true, message: '奖惩内容不能为空', trigger: 'blur' }],
  rewardDate: [{ required: true, message: '奖惩日期不能为空', trigger: 'change' }]
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
      formData.value = await RewardApi.getReward(id)
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
    const data = formData.value as unknown as RewardVO
    if (formType.value === 'create') {
      await RewardApi.createReward(data)
      message.success(t('common.createSuccess'))
    } else {
      await RewardApi.updateReward(data)
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
    rewardPerson: undefined,
    contactPhone: undefined,
    rewardType: undefined,
    rewardReason: undefined,
    rewardContent: undefined,
    rewardDate: undefined
  }
  formRef.value?.resetFields()
}
</script>
