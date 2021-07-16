import axios from 'axios'
import { Message } from 'element-ui'

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
const service = axios.create({
  timeout: 5000
})

// 请求发前拦截，header中添加token
service.interceptors.request.use(req => {
  return req
})
service.interceptors.response.use(
  response => {
    // console.log("response:",response);
    var res = response.data
    if (res.success) {
      Message.success({
        showClose: true,
        message: res.message
      })
    } else {
      Message.error({
        showClose: true,
        message: res.message
      })
    }
    return res
  },
  error => {
    Message.error({
      showClose: true,
      message: '对不起，出错了'
    })
    Promise.reject(error)
  }
)
export default service
