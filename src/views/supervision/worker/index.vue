<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      class="-mb-15px"
      :model="queryParams"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="所属机构" prop="deptId">
        <el-tree-select
          v-model="queryParams.deptId"
          :data="deptList"
          :props="defaultProps"
          check-strictly
          node-key="id"
          placeholder="请选择所属机构"
          clearable
          class="!w-240px"
          @change="handleDeptChange"
        />
      </el-form-item>
      <el-form-item label="食堂名称" prop="canteenId">
        <el-select
          v-model="queryParams.canteenId"
          placeholder="请选择食堂"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="canteen in canteenList"
            :key="canteen.id"
            :label="canteen.canteenName"
            :value="canteen.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入姓名"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="queryParams.sex" placeholder="请选择性别" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="!w-240px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_WORKER_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="入职时间" prop="entryTime">
        <el-date-picker
          v-model="queryParams.entryTime"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['supervision:worker:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />新增
        </el-button>
        <el-button
          type="warning"
          plain
          @click="handleImport"
          v-hasPermi="['supervision:worker:import']"
        >
          <Icon icon="ep:upload" class="mr-5px" />导入
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['supervision:worker:export']"
        >
          <Icon icon="ep:download" class="mr-5px" />导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="所属机构" align="center" prop="deptName" min-width="120" />
      <el-table-column label="食堂名称" align="center" prop="canteenName" min-width="120" />
      <el-table-column label="姓名" align="center" prop="name" min-width="100" />
      <el-table-column label="性别" align="center" prop="sex" min-width="80">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_USER_SEX" :value="scope.row.sex" />
        </template>
      </el-table-column>
      <el-table-column label="年龄" align="center" prop="age" min-width="80" />
      <el-table-column label="职位" align="center" prop="position" min-width="120" />
      <el-table-column label="职工属性" align="center" prop="employeeAttribute" min-width="100">
        <template #default="scope">
          <dict-tag
            :type="DICT_TYPE.SUPERVISION_WORKER_ATTRIBUTE"
            :value="scope.row.employeeAttribute"
          />
        </template>
      </el-table-column>
      <el-table-column label="入职时间" align="center" prop="entryTime" min-width="110" />
      <el-table-column label="状态" align="center" prop="status" min-width="90">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SUPERVISION_WORKER_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="140">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['supervision:worker:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['supervision:worker:delete']"
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

  <WorkerForm ref="formRef" @success="getList" />
  <WorkerImportForm ref="importFormRef" @success="getList" />
</template>

<script setup lang="ts">
import * as DeptApi from '@/api/system/dept'
import { CanteenApi, CanteenVO } from '@/api/supervision/canteen'
import { WorkerApi, WorkerVO } from '@/api/supervision/worker'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { defaultProps, handleTree } from '@/utils/tree'
import download from '@/utils/download'
import WorkerForm from './WorkerForm.vue'
import WorkerImportForm from './WorkerImportForm.vue'

defineOptions({ name: 'SupervisionWorker' })

const { t } = useI18n()
const message = useMessage()

const loading = ref(true)
const total = ref(0)
const list = ref<WorkerVO[]>([])
const deptList = ref<Tree[]>([])
const canteenList = ref<CanteenVO[]>([])
const exportLoading = ref(false)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  deptId: undefined,
  canteenId: undefined,
  name: undefined,
  sex: undefined,
  status: undefined,
  entryTime: []
})
const queryFormRef = ref()

const loadCanteenList = async (deptId?: number) => {
  canteenList.value = await CanteenApi.getCanteenSimpleList(deptId)
}

const getList = async () => {
  loading.value = true
  try {
    const data = await WorkerApi.getWorkerPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleDeptChange = async () => {
  queryParams.canteenId = undefined
  await loadCanteenList(queryParams.deptId)
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

const importFormRef = ref()
const handleImport = () => {
  importFormRef.value.open()
}

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await WorkerApi.deleteWorker(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await WorkerApi.exportWorker(queryParams)
    download.excel(data, '工勤人员.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(async () => {
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  await loadCanteenList()
  await getList()
})
</script>
