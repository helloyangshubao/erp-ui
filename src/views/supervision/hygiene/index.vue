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
      <el-form-item label="检查人员" prop="inspector">
        <el-input
          v-model="queryParams.inspector"
          placeholder="请输入检查人员"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="检查时间" prop="checkDate">
        <el-date-picker
          v-model="queryParams.checkDate"
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
          v-hasPermi="['supervision:hygiene:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['supervision:hygiene:export']"
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
      <el-table-column label="检查人" align="center" prop="inspector" min-width="100" />
      <el-table-column label="联系电话" align="center" prop="contactPhone" min-width="120" />
      <el-table-column label="检查日期" align="center" prop="checkDate" min-width="110" />
      <el-table-column label="附件" align="center" min-width="100">
        <template #default="scope">
          <el-link v-if="scope.row.attachmentUrl" :href="scope.row.attachmentUrl" target="_blank" type="primary">
            查看附件
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="现场影像" align="center" min-width="100">
        <template #default="scope">
          <el-image
            v-if="scope.row.sceneImageUrl"
            :src="scope.row.sceneImageUrl"
            :preview-src-list="[scope.row.sceneImageUrl]"
            class="h-36px w-36px"
            preview-teleported
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
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
            v-hasPermi="['supervision:hygiene:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="handlePrint(scope.row)"
            v-hasPermi="['supervision:hygiene:query']"
          >
            打印
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['supervision:hygiene:delete']"
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

  <HygieneForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { CanteenApi, CanteenVO } from '@/api/supervision/canteen'
import { HygieneApi, HygieneVO } from '@/api/supervision/hygiene'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { printRecord } from '@/utils/print'
import HygieneForm from './HygieneForm.vue'

defineOptions({ name: 'SupervisionHygiene' })

const { t } = useI18n()
const message = useMessage()

const loading = ref(true)
const total = ref(0)
const list = ref<HygieneVO[]>([])
const canteenList = ref<CanteenVO[]>([])
const exportLoading = ref(false)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  canteenId: undefined,
  inspector: undefined,
  checkDate: []
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
    const data = await HygieneApi.getHygienePage(queryParams)
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
    await HygieneApi.deleteHygiene(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await HygieneApi.exportHygiene(queryParams)
    download.excel(data, '卫生检查.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const handlePrint = (row: HygieneVO) => {
  const printed = printRecord('卫生检查记录', [
    { label: '机构', value: row.deptName },
    { label: '食堂', value: row.canteenName },
    { label: '检查人', value: row.inspector },
    { label: '联系电话', value: row.contactPhone },
    { label: '检查日期', value: row.checkDate },
    { label: '附件', value: row.attachmentUrl },
    { label: '现场影像', value: row.sceneImageUrl }
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
