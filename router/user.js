const express = require("express")
const router = express.Router()
const userHandler = require("../router_handler/user")
const expressJoi = require("@escook/express-joi")//导入验证表单数据的中间件
const { reg_login_schema } = require("../schema/user")//导入自己创建的验证规则对象
//监听客户端的注册新用户请求
router.post("/reguser", expressJoi(reg_login_schema), userHandler.regUser)
//监听客户端的登录请求
router.post("/login", expressJoi(reg_login_schema), userHandler.login)
module.exports = router