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
      <el-form-item label="制度名称" prop="policyName">
        <el-input
          v-model="queryParams.policyName"
          placeholder="请输入制度名称"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
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
          v-hasPermi="['supervision:policy:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['supervision:policy:export']"
        >
          <Icon icon="ep:download" class="mr-5px" />导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="制度名称" align="center" prop="policyName" min-width="180" />
      <el-table-column label="食堂" align="center" prop="canteenName" min-width="120" />
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
      <el-table-column label="附件" align="center" min-width="100">
        <template #default="scope">
          <el-link v-if="scope.row.attachmentUrl" :href="scope.row.attachmentUrl" target="_blank" type="primary">
            查看附件
          </el-link>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建人" align="center" prop="creatorName" min-width="100" />
      <el-table-column
        label="创建日期"
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
            v-hasPermi="['supervision:policy:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="handlePrint(scope.row)"
            v-hasPermi="['supervision:policy:query']"
          >
            打印
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['supervision:policy:delete']"
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

  <PolicyForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { CanteenApi, CanteenVO } from '@/api/supervision/canteen'
import { PolicyApi, PolicyVO } from '@/api/supervision/policy'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { printRecord } from '@/utils/print'
import PolicyForm from './PolicyForm.vue'

defineOptions({ name: 'SupervisionPolicy' })

const { t } = useI18n()
const message = useMessage()

const loading = ref(true)
const total = ref(0)
const list = ref<PolicyVO[]>([])
const canteenList = ref<CanteenVO[]>([])
const exportLoading = ref(false)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  canteenId: undefined,
  policyName: undefined,
  createTime: []
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
    const data = await PolicyApi.getPolicyPage(queryParams)
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
    await PolicyApi.deletePolicy(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await PolicyApi.exportPolicy(queryParams)
    download.excel(data, '制度管理.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const handlePrint = (row: PolicyVO) => {
  const printed = printRecord('制度管理', [
    { label: '制度名称', value: row.policyName },
    { label: '食堂', value: row.canteenName },
    { label: '图片', value: row.imageUrl },
    { label: '附件', value: row.attachmentUrl },
    { label: '创建人', value: row.creatorName },
    { label: '创建日期', value: row.createTime }
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
