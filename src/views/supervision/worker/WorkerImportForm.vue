<template>
  <Dialog v-model="dialogVisible" title="工勤人员导入" width="400">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="importUrl + '?updateSupport=' + updateSupport"
      :auto-upload="false"
      :disabled="formLoading"
      :headers="uploadHeaders"
      :limit="1"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      accept=".xlsx, .xls"
      drag
    >
      <Icon icon="ep:upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <div class="el-upload__tip">
            <el-checkbox v-model="updateSupport" />
            是否更新已经存在的工勤人员数据
          </div>
          <span>仅允许导入 xls、xlsx 格式文件（模板内机构与食堂为编号列）。</span>
          <el-link
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            type="primary"
            @click="importTemplate"
          >
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { WorkerApi } from '@/api/supervision/worker'
import { getAccessToken, getTenantId } from '@/utils/auth'
import download from '@/utils/download'

defineOptions({ name: 'SupervisionWorkerImportForm' })

const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const uploadRef = ref()
const importUrl =
  import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/supervision/worker/import'
const uploadHeaders = ref()
const fileList = ref([])
const updateSupport = ref(false)

const open = () => {
  dialogVisible.value = true
  updateSupport.value = false
  fileList.value = []
  resetForm()
}
defineExpose({ open })

const submitForm = async () => {
  if (fileList.value.length == 0) {
    message.error('请上传文件')
    return
  }
  uploadHeaders.value = {
    Authorization: 'Bearer ' + getAccessToken(),
    'tenant-id': getTenantId()
  }
  formLoading.value = true
  uploadRef.value!.submit()
}

const emits = defineEmits(['success'])
const submitFormSuccess = (response: any) => {
  if (response.code !== 0) {
    message.error(response.msg)
    resetForm()
    return
  }
  const data = response.data
  let text = '创建成功数量：' + data.createNames.length + ';'
  for (const name of data.createNames) {
    text += '< ' + name + ' >'
  }
  text += '更新成功数量：' + data.updateNames.length + ';'
  for (const name of data.updateNames) {
    text += '< ' + name + ' >'
  }
  text += '导入失败数量：' + Object.keys(data.failureNames).length + ';'
  for (const name in data.failureNames) {
    text += '< ' + name + ': ' + data.failureNames[name] + ' >'
  }
  message.alert(text)
  formLoading.value = false
  dialogVisible.value = false
  emits('success')
}

const submitFormError = () => {
  message.error('上传失败，请您重新上传！')
  formLoading.value = false
}

const resetForm = async () => {
  formLoading.value = false
  await nextTick()
  uploadRef.value?.clearFiles()
}

const handleExceed = () => {
  message.error('最多只能上传一个文件！')
}

const importTemplate = async () => {
  const res = await WorkerApi.importWorkerTemplate()
  download.excel(res, '工勤人员导入模板.xls')
}
</script>
