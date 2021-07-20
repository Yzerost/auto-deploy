<template>
  <div class="app-container">
    <transition name="fade">
      <loading v-if="isLoading" />
    </transition>
    <!--搜索框-->
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
      <el-table-column prop="nodeName" label="节点名称" width="180" align="center" />
      <el-table-column prop="nodeHDMIP" label="HDM IP" align="center" />
      <el-table-column prop="nodeType" label="类型" align="center" />
      <el-table-column prop="nodeStatus" label="状态" align="center" />
      nodeStatus
      <el-table-column
        v-slot="scope"
        label="操作"
        width="200"
        align="center"
      >
        <template>
          <el-button type="text" size="small" round @click="deployDialogFormVisible = true,deploy(scope.row)">部署</el-button>
          <el-button type="text" size="small" round @click="beforeEdit(scope.row)">编辑</el-button>
          <el-dialog title="编辑节点" :visible.sync="editDialogFormVisible" :close-on-click-modal="false" style="width: 1800px">
            <el-form :model="editNode" :label-position="labelPosition" label-width="120px" :inline="true">
              <el-form-item label="节点名称:">
                <el-input v-model="editNode.nodeName" />
              </el-form-item>
              <el-form-item label="节点HDM IP:">
                <el-input v-model="editNode.nodeHDMIP" />
              </el-form-item>
              <el-form-item label="节点HDM 密码:">
                <el-input v-model="editNode.nodeHDMPaasword" />
              </el-form-item>
              <el-form-item label="节点类型:">
                <el-select v-model="editNode.nodeType" filterable placeholder="选择节点类型" style="width: 100%">
                  <el-option
                    v-for="type in nodeTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="节点配置:" style="width: 100%" />
              <el-form-item label="管理网IP:">
                <el-input v-model="editNode.managementIP" style="width: 150px" />
              </el-form-item>
              <el-form-item label="管理网掩码:">
                <el-input v-model="editNode.managementMask" style="width: 150px" />
              </el-form-item>
              <el-form-item label="管理网网关:">
                <el-input v-model="editNode.managementGateway" style="width: 150px" />
              </el-form-item>
              <el-form-item label="业务网IP:">
                <el-input v-model="editNode.businessIP" style="width: 150px" />
              </el-form-item>
              <el-form-item label="业务网掩码:">
                <el-input v-model="editNode.businessMask" style="width: 150px" />
              </el-form-item>
              <el-form-item label="业务网网关:">
                <el-input v-model="editNode.businessGateway" style="width: 150px" />
              </el-form-item>
              <el-form-item label="存储网IP:">
                <el-input v-model="editNode.storageIP" style="width: 150px" />
              </el-form-item>
              <el-form-item label="存储网掩码:">
                <el-input v-model="editNode.storageMask" style="width: 150px" />
              </el-form-item>
              <el-form-item label="存储网网关:">
                <el-input v-model="editNode.storageGateway" style="width: 150px" />
              </el-form-item>
              <!--          <el-form-item label="文件类型(后续改成下拉框）:">-->
              <!--            <el-input v-model="node.productType" style="width: 120px" />-->
              <!--          </el-form-item>-->
              <!--          <el-form-item label="文件版本(后续改成下拉框）:">-->
              <!--            <el-input v-model="node.productVersion" style="width: 120px" />-->
              <!--          </el-form-item>-->
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="editDialogFormVisible = false">取 消</el-button>
              <el-button type="primary" @click="editDialogFormVisible = false,edit(editNode)">确 定</el-button>
            </div>
          </el-dialog>
          <el-popconfirm
            confirm-button-text="好的"
            cancel-button-text="不用了"
            icon="el-icon-info"
            icon-color="red"
            :title="`是否删除节点：【${scope.row.name}】？`"
            @onConfirm="handleDelete(scope.row.id)"
          >
            <el-button slot="reference" type="text" size="small" @click="handleDelete(scope.row.nodeName)">删除</el-button>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <br>
    <!--新增按钮-->
    <el-col :span="1" class="grid">
      <el-button type="primary" icon="el-icon-plus" size="mini" round @click="addDialogFormVisible = true">添加节点</el-button>
      <el-dialog title="添加节点" :visible.sync="addDialogFormVisible" :close-on-click-modal="false" style="width: 1800px">
        <el-form :model="node" :label-position="labelPosition" label-width="120px" :inline="true">
          <el-form-item label="节点名称:">
            <el-input v-model="node.nodeName" />
          </el-form-item>
          <el-form-item label="节点HDM IP:">
            <el-input v-model="node.nodeHDMIP" />
          </el-form-item>
          <el-form-item label="节点HDM 密码:">
            <el-input v-model="node.nodeHDMPaasword" />
          </el-form-item>
          <el-form-item label="节点类型:">
            <el-select v-model="node.nodeType" filterable placeholder="选择节点类型" style="width: 100%">
              <el-option
                v-for="type in nodeTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="节点配置:" style="width: 100%" />
          <el-form-item label="管理网IP:">
            <el-input v-model="node.managementIP" style="width: 150px" />
          </el-form-item>
          <el-form-item label="管理网掩码:">
            <el-input v-model="node.managementMask" style="width: 150px" />
          </el-form-item>
          <el-form-item label="管理网网关:">
            <el-input v-model="node.managementGateway" style="width: 150px" />
          </el-form-item>
          <el-form-item label="业务网IP:">
            <el-input v-model="node.businessIP" style="width: 150px" />
          </el-form-item>
          <el-form-item label="业务网掩码:">
            <el-input v-model="node.businessMask" style="width: 150px" />
          </el-form-item>
          <el-form-item label="业务网网关:">
            <el-input v-model="node.businessGateway" style="width: 150px" />
          </el-form-item>
          <el-form-item label="存储网IP:">
            <el-input v-model="node.storageIP" style="width: 150px" />
          </el-form-item>
          <el-form-item label="存储网掩码:">
            <el-input v-model="node.storageMask" style="width: 150px" />
          </el-form-item>
          <el-form-item label="存储网网关:">
            <el-input v-model="node.storageGateway" style="width: 150px" />
          </el-form-item>
          <!--          <el-form-item label="文件类型(后续改成下拉框）:">-->
          <!--            <el-input v-model="node.productType" style="width: 120px" />-->
          <!--          </el-form-item>-->
          <!--          <el-form-item label="文件版本(后续改成下拉框）:">-->
          <!--            <el-input v-model="node.productVersion" style="width: 120px" />-->
          <!--          </el-form-item>-->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addDialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="addDialogFormVisible = false,handleAdd(node)">确 定</el-button>
        </div>
      </el-dialog>
    </el-col>
    <!--批量删除按钮-->
    <el-col :span="1" class="grid" style="margin-left: 50px">
      <el-button
        type="danger"
        icon="el-icon-delete"
        size="mini"
        round
        :disabled="sels.length === 0"
        @click="handleBatchDeploy()"
      >批量部署</el-button>
    </el-col>
    <br>
    <!--分页条-->
    <!--el-pagination background layout="prev, pager, next" :total="tableData.length" /-->
    <el-pagination
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="totalData.length"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>
<script>
import axios from 'axios'
import Loading from '@/components/loading'

export default {
  components: { Loading },
  data() {
    return {
      labelPosition: 'left',
      isLoading: true,
      currentPage: 1,
      pageSize: 10,
      sels: [],
      input: '',
      node: {},
      editNode: {},
      versionList: [
        {
          value: 'E0701',
          label: 'E0701'
        },
        {
          value: 'E0702',
          label: 'E0702'
        }
      ],
      nodeTypes: [{
        value: 'CAS_CVM',
        label: 'CAS_CVM'
      },
      {
        value: 'CAS_CVK',
        label: 'CAS_CVK'
      }],
      tableData: [],
      totalData: [],
      addDialogFormVisible: false,
      editDialogFormVisible: false,
      deployDialogFormVisible: false
    }
  },
  created() {
    this.getNodes(this.currentPage, this.pageSize)
  },
  methods: {
    search(key) {
      this.$message.success('功能暂未实现，关键词：' + key)
    },
    selsChange(sels) {
      this.sels = sels
    },
    getNodes(currentPage, pageSize) {
      const url = '/nodesManagement/nodeList'
      this.isLoading = true
      axios.get(url).then(res => {
        this.totalData = res.data
        console.log(totalSize)
        const totalSize = res.data.length
        this.tableData = res.data.slice(pageSize * (currentPage - 1), (pageSize * currentPage >= totalSize) ? totalSize : (pageSize * currentPage))
        this.isLoading = false
      })
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
      const url = '/nodesManagement/nodeAdd'
      this.isLoading = true
      axios({
        method: 'post',
        url: url,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        params: {
          nodeName: item.nodeName,
          nodeHDMIP: item.nodeHDMIP,
          nodeHDMPaasword: item.nodeHDMPaasword,
          nodeType: item.nodeType,
          managementIP: item.managementIP,
          managementMask: item.managementMask,
          managementGateway: item.managementGateway,
          businessIP: item.businessIP,
          businessMask: item.businessMask,
          businessGateway: item.businessGateway,
          storageIP: item.storageIP,
          storageMask: item.storageMask,
          storageGateway: item.storageGateway
        }
      }).then(res => {
        // console.log(res)
        this.isLoading = false
        if (res.status === 200) {
          this.$message.success('添加节点' + item.name + '成功')
          this.getNodes(this.currentPage, this.pageSize)
          // this.$set(this.node, 'solution_type', '')
          // this.$set(this.node, 'description', '')
        } else {
          this.$message.error(res.status)
        }
      })
    },
    deploy(item) {
      const url = '/nodesManagement/nodeDeploy'
      console.log(item)
      this.isLoading = true
      axios.post(url, {
        nodeName: item.nodeName,
        nodeHDMIP: item.nodeHDMIP,
        nodeHDMPaasword: item.nodeHDMPaasword,
        nodeType: item.nodeType,
        managementIP: item.managementIP,
        managementMask: item.managementMask,
        managementGateway: item.managementGateway,
        businessIP: item.businessIP,
        businessMask: item.businessMask,
        businessGateway: item.businessGateway,
        storageIP: item.storageIP,
        storageMask: item.storageMask,
        storageGateway: item.storageGateway,
        productType: item.productType,
        productVersion: item.productVersion
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
    },
    beforeEdit(item) {
      if (item.nodeStatus === 'available') {
        this.$message.success('非空闲节点不可编辑')
      } else {
        this.editDialogFormVisible = true
        this.$set(this.editNode, 'nodeName', item.nodeName)
        this.$set(this.editNode, 'nodeHDMIP', item.nodeHDMIP)
        this.$set(this.editNode, 'nodeHDMPaasword', item.nodeHDMPaasword)
        this.$set(this.editNode, 'nodeType', item.nodeType)
        this.$set(this.editNode, 'managementIP', item.managementIP)
        this.$set(this.editNode, 'managementMask', item.managementMask)
        this.$set(this.editNode, 'managementGateway', item.managementGateway)
        this.$set(this.editNode, 'businessIP', item.businessIP)
        this.$set(this.editNode, 'businessMask', item.businessMask)
        this.$set(this.editNode, 'businessGateway', item.businessGateway)
        this.$set(this.editNode, 'storageIP', item.storageIP)
        this.$set(this.editNode, 'storageMask', item.storageMask)
        this.$set(this.editNode, 'storageGateway', item.storageGateway)
        this.$set(this.editNode, 'nodeStatus', item.nodeStatus)
      }
    },
    edit(item) {
      const url = '/nodesManagement/nodeEdit'
      this.isLoading = true
      axios({
        method: 'put',
        url: url,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        params: {
          nodeName: item.nodeName,
          nodeHDMIP: item.nodeHDMIP,
          nodeHDMPaasword: item.nodeHDMPaasword,
          nodeType: item.nodeType,
          managementIP: item.managementIP,
          managementMask: item.managementMask,
          managementGateway: item.managementGateway,
          businessIP: item.businessIP,
          businessMask: item.businessMask,
          businessGateway: item.businessGateway,
          storageIP: item.storageIP,
          storageMask: item.storageMask,
          storageGateway: item.storageGateway
        }
      }).then(res => {
        this.isLoading = false
        if (res.status === 200) {
          this.$message.success('编辑节点' + item.nodeName + '】成功')
          this.editNode = {}
          this.getNodes(this.currentPage, this.pageSize)
        }
      })
    },
    handleDelete(nodeName) {
      const url = '/nodesManagement/nodeDelete'
      this.isLoading = true
      axios({
        method: 'post',
        url: url,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        params: {
          nodeName: nodeName
        }
      }).then(res => {
        // console.log(res.headers)
        this.isLoading = false
        this.$message.warning('成功删除节点' + nodeName + '!')
        this.getNodes(this.currentPage, this.pageSize)
      })
    },
    handleBatchDeploy() {
      // const ids = this.sels.map(item => item.id).join()
      // this.isLoading = true
      // this.$confirm('删除选择的所有类型, 是否继续?', '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(() => {
      //   const url = '/solutionType/batchDeleteSolutionType'
      //   this.isLoading = false
      //   axios.post(url, {
      //     ids: ids
      //   }).then(res => {
      //     console.log(res)
      //     if (res.status === 200) {
      //       this.getNodes(this.currentPage, this.pageSize)
      //     }
      //   })
      // })
      this.$message.success('功能暂未实现')
    }
  }
}
</script>
<style>
.el-pagination {
  padding-top: 20px;
  text-align: center;
}
.el-table__body-wrapper::-webkit-scrollbar {
  /*width: 0;宽度为0隐藏*/
  width: 0px;
}
</style>
