<template>
  <div>
<!--    <div class="crumbs">-->
<!--      <el-breadcrumb separator="/">-->
<!--        <el-breadcrumb-item>-->
<!--          <i class="el-icon-lx-cascades" /> 文件列表-->
<!--        </el-breadcrumb-item>-->
<!--      </el-breadcrumb>-->
<!--    </div>-->
    <div class="container">
      <div class="handle-box">
        <div style="margin: 10px 0 -10px 0;">
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            class="handle-del mr10"
            @click="addAllSelection"
          >上传文件</el-button>
        </div>
      </div>
    </div>

    <!-- 编辑弹出框 -->
    <el-dialog :title="formTitle" :visible.sync="editVisible" width="1400px">
      <WebUpload
        :file-num-limit="fileNumLimit"
        :file-size="fileSize"
        :chunk-size="chunkSize"
        :upload-suffix-url="uploadSuffixUrl"
        :options="options"
        :file-list-data="fileList"
      />
<!--      <span slot="footer" class="dialog-footer">-->
<!--        <el-button @click="editVisible = false">取 消</el-button>-->
<!--        <el-button type="primary" @click="saveEdit">确 定</el-button>-->
<!--      </span>-->
    </el-dialog>

    <!--图片查看-->
<!--    <el-dialog title="图片查看" :visible.sync="showImgVisible" width="800px">-->
<!--      <el-image-->
<!--        v-if="imageUrl"-->
<!--        class="avatar"-->
<!--        npm-->
<!--        :src="imageUrl"-->
<!--        :preview-src-list="[imageUrl]"-->
<!--      />-->
<!--      <span slot="footer" class="dialog-footer">-->
<!--        &lt;!&ndash;<el-button @click="editVisible = false">取 消</el-button>&ndash;&gt;-->
<!--        <el-button type="primary" @click="showImgVisible=false;imageUrl=''">关 闭</el-button>-->
<!--      </span>-->
<!--    </el-dialog>-->

    <!--Excel导出-->

  </div>
</template>

<script>
import { getList, delData, delDatas } from '../../api/api'
import WebUpload from '../../components/Upload/WebUpload'

export default {
  name: 'Uploadfile',
  components: {
    WebUpload
  },
  data() {
    return {
      query: {
        orgName: '',
        fileType: '',
        pageIndex: 1,
        pageSize: 10
      },
      formTitle: '添加',
      tableData: [],
      multipleSelection: [],
      delList: [],
      editVisible: false,
      pageTotal: 0,
      form: {},
      idx: -1,
      uId: 0,
      id: -1,

      loading: true,
      uploadLoading: false,
      showRemoveFile: false,

      imageUrl: '',
      showImgVisible: false,
      uploader: {},
      uploadBtnDisabled: false,
      uploadStaus: 'el-icon-upload',
      fileList: [], // 显示集合
      fileNumLimit: 200, // 文件总数
      fileSize: 100 * 1024 * 1024 * 1024, // 默认上传文件大小
      chunkSize: 100 * 1024 * 1024, // 默认文件片段
      // uploadSuffixUrl: 'http://localhost:8080/',
      uploadSuffixUrl: 'http://210.0.0.233:8080/',
      options: {
        // 允许上传的文件
        // fileType: 'doc,docx,pdf,xls,xlsx,ppt,pptx,gif,jpg,jpeg,bmp,png,rar,zip,mp4,avi',
        fileType: 'iso,cfg,tar,zip',
        // fileUploadUrl: '/upload/fileRecord/zone/upload', // 上传地址
        fileUploadUrl: '/fileManagement/upload',
        fileCheckUrl: '/fileManagement/isFileExist', // 检测文件是否存在url
        checkChunkUrl: '/upload/fileRecord/zone/upload/md5Check', // 检测分片url
        // mergeChunksUrl: '/upload/fileRecord/zone/upload/merge/', // 合并文件请求地址
        mergeChunksUrl: '/fileManagement/merge',
        headers: {}
      }

    }
  },
  created() {
    // this.getData()
  },
  methods: {
    getData() {
      var that = this
      this.loading = true
      var query = this.query
      var pageSize = query.pageSize
      var pageIndex = query.pageIndex
      var reqData = {}

      if (query.orgName.length > 0) {
        reqData.orgName = query.orgName
      }
      if (query.fileType != null && query.fileType !== '') {
        reqData.fileType = query.fileType
      }

      getList(reqData, pageIndex, pageSize).then(res => {
        if (res.success) {
          var resdata = res.data
          var rows = resdata.rows
          for (var i = 0; i < rows.length; i++) {
            var fileSize = rows[i].fileSize
            rows[i].fileSizeStr = this.formatFileSize(fileSize)
            rows[i].networkPathURL = this.uploadSuffixUrl + rows[i].networkPath
          }
          that.tableData = rows
          that.pageTotal = resdata.total || 50
        }
        that.loading = false
      })
    },
    // 触发搜索按钮
    handleSearch() {
      this.$set(this.query, 'pageIndex', 1)
      this.getData()
    },
    // 删除操作
    handleDelete(index, row) {
      // 二次确认删除
      this.$confirm('确定要删除吗？', '提示', {
        type: 'warning'
      })
        .then(() => {
          delData(row.id).then(res => {
            if (res.success) {
              this.$message.success(res.message)
              // this.tableData.splice(index, 1);
              this.getData()
            } else {
              this.$message.error(res.message)
            }
          })
        })
        .catch(() => {
          this.$message.success('取消成功')
        })
    },
    // 多选操作
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    addAllSelection() { // 添加数据
      this.form = {
        isFilter: '1',
        contentType: '',
        fileSuffix: '',
        fileType: '',
        fileTag: '',
        fileDescribe: ''
      }
      this.formTitle = '上传文件'
      this.editVisible = true
    },
    delAllSelection() {
      const length = this.multipleSelection.length
      let str = ''
      let ids = ''
      if (length === 0) {
        this.$message.error(`请选择数据`)
        return
      }
      this.delList = this.delList.concat(this.multipleSelection)
      for (let i = 0; i < length; i++) {
        str += this.multipleSelection[i].orgName + '、'
        ids += this.multipleSelection[i].id + ','
      }
      str = str.substring(0, str.length - 1)
      ids = ids.substring(0, ids.length - 1)
      delDatas(ids).then(res => {
        if (res.success) {
          this.$message.success(`删除了【${str}】`)
          this.multipleSelection = []
          this.getData()
        } else {
          this.$message.error(res.message)
        }
      })
    },
    // 编辑操作
    seeFile(index, row) {
      console.log('row:', row)
      var orgName = row.orgName
      var fSuffix = orgName.substring(orgName.lastIndexOf('.') + 1)
      if (fSuffix === 'png' || fSuffix === 'gif' ||
        fSuffix === 'jpg' || fSuffix === 'jpeg' ||
        fSuffix === 'bmp') {
        this.showImgVisible = true
        this.imageUrl = this.uploadSuffixUrl + row.networkPath
      } else if (fSuffix === 'mp4' || fSuffix === 'mp3' || fSuffix === 'pdf') {
        this.$confirm('需要新开窗口页面，确定需要吗？', '提示', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
          .then(() => {
            window.open(this.uploadSuffixUrl + row.networkPath)
          })
          .catch(() => {
            this.$message.success('取消成功')
          })
      } else {
        this.$confirm('不支持在线查看，请[下载]后查看', '提示', {
          type: 'warning',
          confirmButtonText: '下载',
          cancelButtonText: '取消'
        })
          .then(() => {
            window.open(this.uploadSuffixUrl + row.networkPath)
          })
          .catch(() => {
            this.$message.success('取消成功')
          })
      }
    },
    // 保存编辑
    saveEdit(formName) {
      console.log('form:', formName)
      this.editVisible = false
      this.getData()
      this.fileList = []
    },
    // 分页导航
    handlePageChange(val) {
      this.$set(this.query, 'pageIndex', val)
      this.getData()
    },
    handleSizeChange(val) {
      this.$set(this.query, 'pageSize', val)
      this.getData()
    },
    handleGetFile(e) {
      const file = e.target.files[0]
      console.log('file:', file)
      const type = file.type
      const fileType = type.substring(0, type.lastIndexOf('/'))
      const fileName = file.name
      const fileSuffix = fileName.substring(fileName.lastIndexOf('.') + 1)
      this.form.contentType = type
      this.form.fileType = fileType
      this.form.fileSuffix = fileSuffix
      console.log('this.form:', this.form)
    },
    formatFileSize(size) {
      let fileSize = 0
      if (size / 1024 > 1024) {
        const len = size / 1024 / 1024
        fileSize = len.toFixed(2) + 'MB'
      } else if (size / 1024 / 1024 > 1024) {
        const len = size / 1024 / 1024
        fileSize = len.toFixed(2) + 'GB'
      } else {
        const len = size / 1024
        fileSize = len.toFixed(2) + 'KB'
      }
      return fileSize
    }
  }
}
</script>

<style scoped>
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 120px;
}

.handle-input {
  width: 200px;
  display: inline-block;
}
.table {
  width: 100%;
  font-size: 14px;
}
.red {
  color: #ff0000;
}
.mr10 {
  margin-right: 10px;
}
.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}

.table-td-thumb-from-item {
  display: block;
  max-width: 200px;
  max-height: 200px;
}

.avatar {
  min-width: 100px;
  min-height: 100px;
  max-width: 80%;
  max-height: 80%;
  width: auto;
  height: auto;
  display: block;
  cursor: pointer;
  border: 1px solid #eee;
}

.el-image__inner{
  width: auto;
  height: auto;
}

.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}

</style>
