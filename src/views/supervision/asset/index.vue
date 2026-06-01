<template>
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      class="-mb-15px"
      :model="queryParams"
      :inline="true"
      label-width="90px"
    >
      <el-form-item label="资产编号" prop="assetNo">
        <el-input
          v-model="queryParams.assetNo"
          placeholder="请输入资产编号"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="资产名称" prop="assetName">
        <el-input
          v-model="queryParams.assetName"
          placeholder="请输入资产名称"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="资产分类" prop="assetCategory">
        <el-input
          v-model="queryParams.assetCategory"
          placeholder="请输入资产分类"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="使用部门" prop="useDeptId">
        <el-tree-select
          v-model="queryParams.useDeptId"
          :data="deptList"
          :props="defaultProps"
          check-strictly
          node-key="id"
          placeholder="请选择使用部门"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="资产状态" prop="assetStatus">
        <el-select
          v-model="queryParams.assetStatus"
          placeholder="请选择资产状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_ASSET_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="购置时间" prop="purchaseTime">
        <el-date-picker
          v-model="queryParams.purchaseTime"
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
          v-hasPermi="['supervision:asset:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />新增
        </el-button>
        <el-button
          type="warning"
          plain
          @click="handleImport"
          v-hasPermi="['supervision:asset:import']"
        >
          <Icon icon="ep:upload" class="mr-5px" />导入
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['supervision:asset:export']"
        >
          <Icon icon="ep:download" class="mr-5px" />导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
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
      <el-table-column label="资产编号" align="center" prop="assetNo" min-width="120" />
      <el-table-column label="资产名称" align="center" prop="assetName" min-width="120" />
      <el-table-column label="资产分类" align="center" prop="assetCategory" min-width="100" />
      <el-table-column label="计量单位" align="center" prop="unit" min-width="80" />
      <el-table-column label="数量" align="center" prop="quantity" min-width="70" />
      <el-table-column label="资产原值" align="center" prop="originalValue" min-width="100" />
      <el-table-column label="资产现值" align="center" prop="currentValue" min-width="100" />
      <el-table-column label="资产来源" align="center" prop="assetSource" min-width="100" />
      <el-table-column label="购置时间" align="center" prop="purchaseTime" min-width="110" />
      <el-table-column label="使用部门" align="center" prop="useDeptName" min-width="120" />
      <el-table-column label="负责人" align="center" prop="responsiblePerson" min-width="100" />
      <el-table-column label="资产状态" align="center" prop="assetStatus" min-width="90">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SUPERVISION_ASSET_STATUS" :value="scope.row.assetStatus" />
        </template>
      </el-table-column>
      <el-table-column label="折旧程度(%)" align="center" prop="depreciationRate" min-width="100" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180"
      />
      <el-table-column label="操作" align="center" width="280" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['supervision:asset:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="warning"
            @click="handleDepreciate(scope.row)"
            v-hasPermi="['supervision:asset:update']"
          >
            折旧
          </el-button>
          <el-button
            link
            type="warning"
            @click="handleReportLoss(scope.row.id)"
            v-hasPermi="['supervision:asset:update']"
          >
            报损
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDestroy(scope.row.id)"
            v-hasPermi="['supervision:asset:update']"
          >
            损毁
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['supervision:asset:delete']"
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

  <AssetForm ref="formRef" @success="getList" />
  <AssetImportForm ref="importFormRef" @success="getList" />
</template>

<script setup lang="ts">
import * as DeptApi from '@/api/system/dept'
import { AssetApi, AssetVO } from '@/api/supervision/asset'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { defaultProps, handleTree } from '@/utils/tree'
import AssetForm from './AssetForm.vue'
import AssetImportForm from './AssetImportForm.vue'

defineOptions({ name: 'SupervisionAsset' })

const { t } = useI18n()
const message = useMessage()

const loading = ref(true)
const total = ref(0)
const list = ref<AssetVO[]>([])
const deptList = ref<Tree[]>([])
const exportLoading = ref(false)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  assetNo: undefined,
  assetName: undefined,
  assetCategory: undefined,
  useDeptId: undefined,
  assetStatus: undefined,
  purchaseTime: []
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await AssetApi.getAssetPage(queryParams)
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

const resetQuery = () => {
  queryFormRef.value.resetFields()
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
    await AssetApi.deleteAsset(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const handleDepreciate = async (row: AssetVO) => {
  try {
    const { value } = await message.prompt('请输入折旧金额', '资产折旧')
    const amount = Number(value)
    if (!amount || amount <= 0) {
      message.error('折旧金额必须大于 0')
      return
    }
    await AssetApi.depreciateAsset({
      id: row.id,
      amount
    })
    message.success('操作成功')
    await getList()
  } catch {}
}

const handleReportLoss = async (id: number) => {
  try {
    await message.confirm('确认执行报损操作？该操作会将数量减 1')
    await AssetApi.reportLossAsset({ id })
    message.success('操作成功')
    await getList()
  } catch {}
}

const handleDestroy = async (id: number) => {
  try {
    await message.confirm('确认执行损毁操作？该操作会将数量减 1')
    await AssetApi.destroyAsset({ id })
    message.success('操作成功')
    await getList()
  } catch {}
}

const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await AssetApi.exportAsset(queryParams)
    download.excel(data, '固定资产.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

onMounted(async () => {
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  await getList()
})
</script>
