<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      class="-mb-15px"
      :model="queryParams"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="食堂" prop="canteenId">
        <el-select v-model="queryParams.canteenId" placeholder="请选择食堂" clearable class="!w-240px">
          <el-option
            v-for="canteen in canteenList"
            :key="canteen.id"
            :label="formatCanteenLabel(canteen)"
            :value="canteen.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="奖惩时间" prop="rewardDate">
        <el-date-picker
          v-model="queryParams.rewardDate"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />查询</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['supervision:reward:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['supervision:reward:export']"
        >
          <Icon icon="ep:download" class="mr-5px" />导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="机构" align="center" prop="deptName" min-width="140" />
      <el-table-column label="食堂" align="center" prop="canteenName" min-width="120" />
      <el-table-column label="奖惩人员" align="center" prop="rewardPerson" min-width="100" />
      <el-table-column label="联系电话" align="center" prop="contactPhone" min-width="120" />
      <el-table-column label="奖惩类型" align="center" prop="rewardType" min-width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SUPERVISION_REWARD_TYPE" :value="scope.row.rewardType" />
        </template>
      </el-table-column>
      <el-table-column label="奖惩原因" align="center" prop="rewardReason" min-width="160" />
      <el-table-column label="奖惩内容" align="center" prop="rewardContent" min-width="180" />
      <el-table-column label="奖惩日期" align="center" prop="rewardDate" min-width="110" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="220" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['supervision:reward:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="handlePrint(scope.row)"
            v-hasPermi="['supervision:reward:query']"
          >
            打印
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['supervision:reward:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <RewardForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { CanteenApi, CanteenVO } from '@/api/supervision/canteen'
import { RewardApi, RewardVO } from '@/api/supervision/reward'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { printRecord } from '@/utils/print'
import RewardForm from './RewardForm.vue'

defineOptions({ name: 'SupervisionReward' })

const { t } = useI18n()
const message = useMessage()

const loading = ref(true)
const total = ref(0)
const list = ref<RewardVO[]>([])
const canteenList = ref<CanteenVO[]>([])
const exportLoading = ref(false)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  canteenId: undefined,
  rewardDate: []
})
const queryFormRef = ref()

const loadCanteenList = async () => {
  canteenList.value = await CanteenApi.getCanteenSimpleList()
}

const formatCanteenLabel = (canteen: CanteenVO) => {
  return canteen.deptName ? `${canteen.deptName} / ${canteen.canteenName}` : canteen.canteenName
}

const getList = async () => {
  loading.value = true
  try {
    const data = await RewardApi.getRewardPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = async () => {
  queryFormRef.value.resetFields()
  await loadCanteenList()
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await RewardApi.deleteReward(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await RewardApi.exportReward(queryParams)
    download.excel(data, '奖惩记录.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const handlePrint = (row: RewardVO) => {
  const printed = printRecord('奖惩记录', [
    { label: '机构', value: row.deptName },
    { label: '食堂', value: row.canteenName },
    { label: '奖惩人员', value: row.rewardPerson },
    { label: '联系电话', value: row.contactPhone },
    { label: '奖惩类型', value: getDictLabel(DICT_TYPE.SUPERVISION_REWARD_TYPE, row.rewardType) },
    { label: '奖惩原因', value: row.rewardReason },
    { label: '奖惩内容', value: row.rewardContent },
    { label: '奖惩日期', value: row.rewardDate }
  ])
  if (!printed) {
    message.error('打印窗口打开失败，请检查浏览器弹窗限制')
  }
}

onMounted(async () => {
  await loadCanteenList()
  await getList()
})
</script>
