import request from '../utils/request'
import qs from 'qs'
// 请求前缀参数
// const reqURL = 'http://localhost:8080/upload/fileRecord'
const reqURL = 'http://210.0.0.233:8080/upload/fileRecord'
// 获取数据
export const getList = (param, page, size) => {
  page = page || 1
  size = size || 10
  param = param || {}
  param.page = page
  param.size = size
  console.log('param:', param)
  return request({
    url: `${reqURL}/getList`,
    method: 'post',
    isToken: true,
    data: qs.stringify(param)
  })
}
// 删除一行
export const delData = (id) => {
  if (id == null) {
    return
  }
  return request({
    url: `${reqURL}/delById/${id}`,
    method: 'delete'
  })
}
// 批量删除数据
export const delDatas = (ids) => {
  if (ids == null) {
    return
  }
  return request({
    url: `${reqURL}/delByIds/${ids}`,
    method: 'delete'
  })
}
