<template>
  <div class="app-container">
    <transition name="fade">
      <loading v-if="isLoading" />
    </transition>
    <el-input v-model="dhcpPool" placeholder="DHCP地址池" />
    <el-input v-model="dhcpMask" placeholder="DHCP地址池掩码" />
    <el-button type="text" size="small" round @click="deployDialogFormVisible = true,config()">修改</el-button>
  </div>
</template>

<script>
import axios from 'axios'
import Loading from '@/components/loading'

export default {
  components: { Loading },
  name: 'Config',
  data() {
    return {
      isLoading: true,
      dhcpPool: '',
      dhcpMask: ''
    }
  },
  created() {
    this.getConfig()
  },
  methods: {
    getConfig() {
      const url = '/nodesManagement/getDHCPInfo'
      this.isLoading = true
      axios.get(url).then(res => {
        // console.log(res)
        this.isLoading = false
        if (res.status === 200) {
          this.dhcpMask = res.data.dhcpMask
          this.dhcpPool = res.data.dhcpIPPond
          this.$message.success('获取配置成功')
        } else {
          this.$message.error(res.status)
        }
      })
    },
    config() {
      const url = '/nodesManagement/addDHCPInfo'
      this.isLoading = true
      axios({
        method: 'post',
        url: url,
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        params: {
          dhcpIPPond: this.dhcpPool,
          dhcpMask: this.dhcpMask
        }}).then(res => {
        // console.log(res)
        this.isLoading = false
        if (res.status === 200) {
          this.$message.success('配置生效')
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
