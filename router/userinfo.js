const express = require("express")
const router = express.Router()
const userinfo_handler = require("../router_handler/userinfo")
const expressJoi = require("@escook/express-joi")//导入验证表单数据的中间件
const { update_userinfo_schema, update_password_schema,update_avatar_schema } = require("../schema/user")//导入验证规则对象
router.get("/userinfo", userinfo_handler.getUserInfo)//监听获取用户信息的请求
router.post("/userinfo", expressJoi(update_userinfo_schema), userinfo_handler.updateUserInfo)//监听更新用户信息的请求
router.post("/updatepwd", expressJoi(update_password_schema), userinfo_handler.updatePassword)//监听更新密码的请求
router.post("/update/avatar", expressJoi(update_avatar_schema), userinfo_handler.updateAvatar)//监听更换头像的请求
module.exports = router