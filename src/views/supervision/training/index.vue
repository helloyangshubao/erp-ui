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
      <el-form-item label="培训时间" prop="trainingDate">
        <el-date-picker
          v-model="queryParams.trainingDate"
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
          v-hasPermi="['supervision:training:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['supervision:training:export']"
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
      <el-table-column label="培训讲师" align="center" prop="lecturer" min-width="110" />
      <el-table-column label="讲师联系方式" align="center" prop="lecturerPhone" min-width="120" />
      <el-table-column label="培训地址" align="center" prop="trainingAddress" min-width="140" />
      <el-table-column label="培训主题" align="center" prop="trainingTheme" min-width="160" />
      <el-table-column label="培训内容" align="center" prop="trainingContent" min-width="180" />
      <el-table-column label="图片" align="center" min-width="90">
        <template #default="scope">
          <el-image
            v-if="scope.row.imageUrl"
            :src="scope.row.imageUrl"
            :preview-src-list="[scope.row.imageUrl]"
            class="h-36px w-36px"
            preview-teleported
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="培训级别" align="center" prop="trainingLevel" min-width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SUPERVISION_TRAINING_LEVEL" :value="scope.row.trainingLevel" />
        </template>
      </el-table-column>
      <el-table-column label="培训日期" align="center" prop="trainingDate" min-width="110" />
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
            v-hasPermi="['supervision:training:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="handlePrint(scope.row)"
            v-hasPermi="['supervision:training:query']"
          >
            打印
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['supervision:training:delete']"
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

  <TrainingForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { CanteenApi, CanteenVO } from '@/api/supervision/canteen'
import { TrainingApi, TrainingVO } from '@/api/supervision/training'
import { DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { printRecord } from '@/utils/print'
import TrainingForm from './TrainingForm.vue'

defineOptions({ name: 'SupervisionTraining' })

const { t } = useI18n()
const message = useMessage()

const loading = ref(true)
const total = ref(0)
const list = ref<TrainingVO[]>([])
const canteenList = ref<CanteenVO[]>([])
const exportLoading = ref(false)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  canteenId: undefined,
  trainingDate: []
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
    const data = await TrainingApi.getTrainingPage(queryParams)
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
    await TrainingApi.deleteTraining(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await TrainingApi.exportTraining(queryParams)
    download.excel(data, '培训记录.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const handlePrint = (row: TrainingVO) => {
  const printed = printRecord('培训记录', [
    { label: '机构', value: row.deptName },
    { label: '食堂', value: row.canteenName },
    { label: '培训讲师', value: row.lecturer },
    { label: '讲师联系方式', value: row.lecturerPhone },
    { label: '培训地址', value: row.trainingAddress },
    { label: '培训主题', value: row.trainingTheme },
    { label: '培训内容', value: row.trainingContent },
    { label: '图片', value: row.imageUrl },
    { label: '培训级别', value: row.trainingLevel },
    { label: '培训日期', value: row.trainingDate }
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
