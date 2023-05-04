const express = require("express")
const router = express.Router()
const artcate_handler = require("../router_handler/artcate")
const expressJoi = require("@escook/express-joi")//导入验证数据的中间件
const { add_cate_schema,delete_cate_schema, get_cate_schema,update_cate_schema } = require("../schema/artcate")//导入验证规则对象
//该路由监听获取文章分类列表的请求
router.get("/cates", artcate_handler.getArticleCates)
//该路由监听新增文章分类的请求
router.post("/addcates", expressJoi(add_cate_schema), artcate_handler.addArticleCates)
//该路由监听删除文章分类请求
router.get("/deletecate/:id", expressJoi(delete_cate_schema), artcate_handler.deleteCateById)//:id为动态参数，可以通过req.params获取该参数
//该路由监听根据id获取文章分类的请求
router.get("/cates/:id", expressJoi(get_cate_schema), artcate_handler.getArtCateById)
//该路由监听根据id更新文章分类的请求
router.post("/updatecate", expressJoi(update_cate_schema), artcate_handler.updateCateById)
module.exports = router