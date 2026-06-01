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
        />
      </el-form-item>
      <el-form-item label="食堂编号" prop="canteenNo">
        <el-input
          v-model="queryParams.canteenNo"
          placeholder="请输入食堂编号"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="食堂名称" prop="canteenName">
        <el-input
          v-model="queryParams.canteenName"
          placeholder="请输入食堂名称"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="营业状态" prop="businessStatus">
        <el-select
          v-model="queryParams.businessStatus"
          placeholder="请选择营业状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_CANTEEN_BUSINESS_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="今日供餐" prop="todayMealStatus">
        <el-select
          v-model="queryParams.todayMealStatus"
          placeholder="请选择今日供餐"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SUPERVISION_CANTEEN_TODAY_MEAL_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['supervision:canteen:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="机构名称" align="center" prop="deptName" min-width="120" />
      <el-table-column label="食堂编号" align="center" prop="canteenNo" min-width="120" />
      <el-table-column label="食堂名称" align="center" prop="canteenName" min-width="140" />
      <el-table-column label="营业状态" align="center" prop="businessStatus" min-width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SUPERVISION_CANTEEN_BUSINESS_STATUS" :value="scope.row.businessStatus" />
        </template>
      </el-table-column>
      <el-table-column label="今日供餐情况" align="center" prop="todayMealStatus" min-width="120">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SUPERVISION_CANTEEN_TODAY_MEAL_STATUS" :value="scope.row.todayMealStatus" />
        </template>
      </el-table-column>
      <el-table-column label="食品安全管理员" align="center" prop="foodSafetyManager" min-width="120" />
      <el-table-column label="联系方式" align="center" prop="contactPhone" min-width="120" />
      <el-table-column label="备注" align="center" prop="remark" min-width="120" />
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
            v-hasPermi="['supervision:canteen:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['supervision:canteen:delete']"
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

  <CanteenForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import * as DeptApi from '@/api/system/dept'
import { CanteenApi, CanteenVO } from '@/api/supervision/canteen'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { defaultProps, handleTree } from '@/utils/tree'
import CanteenForm from './CanteenForm.vue'

defineOptions({ name: 'SupervisionCanteen' })

const { t } = useI18n()
const message = useMessage()

const loading = ref(true)
const total = ref(0)
const list = ref<CanteenVO[]>([])
const deptList = ref<Tree[]>([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  deptId: undefined,
  canteenNo: undefined,
  canteenName: undefined,
  businessStatus: undefined,
  todayMealStatus: undefined,
  createTime: []
})
const queryFormRef = ref()

const getList = async () => {
  loading.value = true
  try {
    const data = await CanteenApi.getCanteenPage(queryParams)
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

const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await CanteenApi.deleteCanteen(id)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

onMounted(async () => {
  deptList.value = handleTree(await DeptApi.getSimpleDeptList())
  await getList()
})
</script>
