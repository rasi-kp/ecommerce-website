//configure home page to control it
const product = require('../helpers/producthelper')


module.exports = {
  main: async (req, res) => {
    const categorizedProducts = await module.exports.mainpage(req, res)
    res.render('users/index', { categorizedProducts });
  },
  mainpage: async (req, res) => {

    const data = await product.allproducts()

    const categorizedProducts = {};
    data.forEach(product => {
      const category = product.category;
      if (!categorizedProducts[category]) {
        categorizedProducts[category] = [];
      }
      if (categorizedProducts[category].length < 3) {
        categorizedProducts[category].push(product);
      }
    });
    return categorizedProducts
  },
  allproducts: async (req, res) => {
    const data = await product.allproducts()
    return data
  },
  allproductslimit: async (req, res) => {
    const data = await product.allproductspagination()
    return data
  },
  allproducts1: async (req, res) => {
    const data = await product.allproducts2()
    return data
  },
  allproducts2: async (req, res) => {
    const data = await product.allproducts3()
    return data
  },
  search: async (search) => {
    const data = await product.search(search)
    return data
  },
  category: async (data) => {
    const result = await product.category(data)
    return result
  }
}