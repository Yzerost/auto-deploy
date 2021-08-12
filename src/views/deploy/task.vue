<template>
  <div class="app-container">
    <transition name="fade">
      <loading v-if="isLoading" />
    </transition>
    <el-row>
      <el-col :span="3" class="grid">
        <el-input v-model="input" placeholder="请输入内容" size="mini" />
      </el-col>
      <el-col :span="16" class="grid">
        <el-button type="success" icon="el-icon-search" size="mini" @click="search(input)">搜索</el-button>
        <el-button style="margin-left: 20px" type="success" icon="el-icon-refresh" size="mini" @click="getNodes(currentPage,pageSize)">刷新</el-button>
      </el-col>
    </el-row>
    <br>
    <el-col :span="1" class="grid">
      <el-button type="primary" icon="el-icon-plus" size="mini" round @click="addDialogFormVisible = true">创建工程</el-button>
      <el-dialog title="创建工程" :visible.sync="addDialogFormVisible" :close-on-click-modal="false" style="width: 1800px">
        <el-form :model="project" :label-position="labelPosition" label-width="120px" :inline="true">
          <el-form-item label="工程名称:">
            <el-input v-model="project.name" />
          </el-form-item>
          <el-form-item label="工程简介:">
            <el-input v-model="project.brief" />
          </el-form-item>
          <el-form-item label="部署服务:">
            <el-checkbox-group v-model="project.products">
              <el-checkbox v-for="product in products" :key="product" :label="product" />
            </el-checkbox-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addDialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addDialogFormVisible = false,handleAdd(project)">确 定</el-button>
        </div>
      </el-dialog>
    </el-col>
    <!--表格数据及操作-->
    <el-table
      ref="multipleTable"
      :data="tableData"
      border
      style="width: 100%"
      stripe
      tooltip-effect="dark"
      @selection-change="selsChange"
    >
      <!--勾选框-->
      <el-table-column type="selection" width="55" />
      <!--索引-->
      <el-table-column type="index" :index="indexMethod" label="序号" width="80" align="center" />
      <el-table-column prop="projectName" label="工程名称" width="180" align="center" />
      <el-table-column prop="projectDescribe" label="工程简介" align="center" />
      nodeStatus
      <el-table-column
        v-slot="scope"
        label="操作"
        width="200"
        align="center"
      >
        <template>
          <el-button type="text" size="small" round @click="deployDialogFormVisible = true,beforeDeploy(scope.row)">部署</el-button>
          <el-dialog title="部署工程" :visible.sync="deployDialogFormVisible" :close-on-click-modal="false" style="width: 1800px">
            <el-form :model="scope.row" :label-position="labelPosition" label-width="120px" :inline="true">
              <el-form-item label="CAS配置参数">
                <el-form-item label="主机池名称">
                  <el-input v-model="scope.row.hostPoolName" />
                </el-form-item>
                <el-form-item label="集群名称">
                  <el-input v-model="scope.row.clusterName" />
                </el-form-item>
                <el-form-item label="部署节点">
                  <el-select v-model="scope.row.nodes" multiple placeholder="请选择" value-key="nodeId">
                    <el-option
                      v-for="item in nodes"
                      :key="item.value.nodeId"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="部署版本">
                  <el-select v-model="scope.row.productVersion" title="产品版本" filterable placeholder="选择部署版本">
                    <el-option
                      v-for="type in productVersions"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    />
                  </el-select>
                </el-form-item>
              </el-form-item></el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="deployDialogFormVisible = false">取 消</el-button>
              <el-button type="primary" @click="deployDialogFormVisible = false,deploy(scope.row)">确 定</el-button>
            </div>
          </el-dialog>
          <el-button type="text" size="small" round @click="beforeEdit(scope.row)">编辑</el-button>
          <el-dialog title="编辑工程" :visible.sync="editDialogFormVisible" :close-on-click-modal="false" style="width: 1800px">
            <el-form :model="editProject" :label-position="labelPosition" label-width="120px" :inline="true">
              <el-form-item label="工程名称:">
                <el-input v-model="editProject.name" />
              </el-form-item>
              <el-form-item label="工程简介:">
                <el-input v-model="editProject.brief" />
              </el-form-item>
              <el-form-item label="部署服务:">
                <el-checkbox-group v-model="editProject.products">
                  <el-checkbox label="CAS" />
                  <el-checkbox label="ONEStor" />
                  <el-checkbox label="CloudOS" />
                </el-checkbox-group>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="editDialogFormVisible = false">取 消</el-button>
              <el-button type="primary" @click="editDialogFormVisible = false,edit(editProject)">确 定</el-button>
            </div>
          </el-dialog>
          <el-popconfirm
            confirm-button-text="好的"
            cancel-button-text="不用了"
            icon="el-icon-info"
            icon-color="red"
            :title="`是否删除工程：【${scope.row.name}】？`"
            @onConfirm="handleDelete(scope.row.id)"
          >
            <el-button slot="reference" type="text" size="small" @click="handleDelete(scope.row.nodeName)">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <br>
  </div>
</template>
<script>
import axios from 'axios'
import Loading from '@/components/loading'
export default {
  name: 'Task',
  components: { Loading },
  data() {
    return {
      labelPosition: 'left',
      isLoading: true,
      currentPage: 1,
      pageSize: 10,
      sels: [],
      input: '',
      project: {},
      products: ['CAS', 'ONEStor', 'CloudOS'],
      editProject: {},
      projectParams: {},
      nodes: [],
      productVersions: [],
      tableData: [{ 'id': 1, 'name': 'cas', 'brief': 'jlskdlf', 'products': ['cas', 'onestor'] }],
      totalData: [],
      addDialogFormVisible: false,
      editDialogFormVisible: false,
      deployDialogFormVisible: false
    }
  },
  created() {
    this.getTasks(this.currentPage, this.pageSize)
    this.$set(this.project, 'products', [])
  },
  methods: {
    search(key) {
      this.$message.success('功能暂未实现，关键词：' + key)
    },
    selsChange(sels) {
      this.sels = sels
    },
    getTasks(currentPage, pageSize) {
      this.isLoading = false
      // const url = '/projectManagement/projectList'
      // this.isLoading = true
      // axios.get(url).then(res => {
      //   this.totalData = res.data
      //   const totalSize = res.data.length
      //   this.tableData = res.data.slice(pageSize * (currentPage - 1), (pageSize * currentPage >= totalSize) ? totalSize : (pageSize * currentPage))
      //   this.isLoading = false
      // }).catch(error => {
      //   this.isLoading = false
      //   if (error.response) {
      //     console.log('error.response')
      //     console.log(error.response)
      //   } else if (error.request) {
      //     console.log(error.request)
      //     this.$message({
      //       duration: 6000,
      //       message: '请求异常',
      //       type: 'error'
      //     })
      //     if (error.request.readyState === 4 && error.request.status === 0) {
      //       console.log('补充重试逻辑')
      //     }
      //   } else {
      //     console.log('Error', error.message)
      //   }
      //   console.log(error.config)
      // })
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.getNodes(this.currentPage, this.pageSize)
      // console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getNodes(this.currentPage, this.pageSize)
      // console.log(`当前页: ${val}`)
    },
    indexMethod(index) {
      return index + 1 + this.pageSize * (this.currentPage - 1)
    },
    handleAdd(item) {
      console.log(item)
      const url = '/projectManagement/projectAdd'
      this.isLoading = true
      axios({
        method: 'post',
        url: url,
        data: {
          name: item.name,
          brief: item.brief,
          products: JSON.stringify(item.products)
        }
      }).then(res => {
        // console.log(res)
        this.isLoading = false
        if (res.status === 200) {
          this.$message.success('添加节点' + item.name + '成功')
          this.getTasks(this.currentPage, this.pageSize)
          // this.$set(this.node, 'solution_type', '')
          // this.$set(this.node, 'description', '')
        } else {
          this.$message.error(res.status)
        }
      })
    },
    beforeDeploy(item) {
      this.projectParams = {}
      this.nodes = []
      this.productVersions = []
      const getNodesUrl = '/nodesManagement/nodeList'
      const getVersionUrl = '/fileManagement/getVersionByType'
      axios.get(getNodesUrl).then(res => {
        // console.log(res)
        if (res.status === 200) {
          res.data.forEach((item) => {
            const node = { value: item, label: item.nodeName + '-' + item.nodeType }
            this.nodes.push(node)
          })
        } else {
          this.$message.error(res.status)
        }
      })
      axios.get(getVersionUrl).then(res => {
        // console.log(res)
        if (res.status === 200) {
          res.data.forEach((item) => {
            const productVersion = { value: item, label: item }
            this.productVersions.push(productVersion)
          })
        } else {
          this.$message.error(res.status)
        }
      })
    },
    deploy(item) {
      const url = '/projectManagement/projectDeploy'
      // this.isLoading = true
      axios({
        method: 'post',
        url: url,
        data: {
          // productType: item.productType,
          // productVersion: item.productVersion,
          hostPoolName: item.hostPoolName,
          clusterName: item.clusterName,
          productVersion: item.productVersion,
          nodes: JSON.stringify(item.nodes)
        }
      }).then(res => {
        // console.log(res)
        this.isLoading = false
        if (res.status === 200) {
          this.$message.success('开始部署节点' + item.name)
          this.getNodes(this.currentPage, this.pageSize)
          // this.$set(this.node, 'solution_type', '')
          // this.$set(this.node, 'description', '')
        } else {
          this.$message.error(res.status)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
