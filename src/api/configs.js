const productsArray = []
export const productTypes = ['CAS_CVM', 'CAS_CVK']
export const kindTypes = ['ISO', 'KS']
productTypes.forEach((product) => {
  productsArray.push({
    productValue: product,
    label: product
  })
})

export const products = productsArray
export const kinds = [{
  kindValue: 'ISO',
  label: 'ISO文件'
}, {
  kindValue: 'KS',
  label: 'KS配置文件'
}]
