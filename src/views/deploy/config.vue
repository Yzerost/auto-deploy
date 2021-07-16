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
  name: 'Config',
  data() {
    return {
      isLoading: true,
      dhcpPool: '',
      dhcpMask: ''
    }
  },
  methods: {
    config() {
      const url = '/config'
      this.isLoading = true
      axios.post(url, {
        dhcpPool: this.dhcpPool,
        dhcpMask: this.dhcpMask
      }).then(res => {
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
