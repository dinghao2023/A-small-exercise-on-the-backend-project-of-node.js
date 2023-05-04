const express = require("express")
const app = express()
const cors = require("cors")
app.use(cors())
app.use(express.urlencoded({ extended: false }))
// 封装res.cc()函数
app.use(function(req,res,next) {
    res.cc = function(err,status = 1) {//status默认值为1，表示失败的情况
        res.send({
            status,
            message:err instanceof Error ? err.message : err//err可能是一个错误对象，也可能是一个错误的描述字符串。
        })
    }
    next()
})
const expressJWT = require("express-jwt")
const config = require("./config")
app.use(expressJWT({secret:config.jwtSecretKey}).unless({path:[/^\/api/]}))//以/api开头的接口不需要进行token身份认证
//用户路由模块
const userRouter = require("./router/user")
app.use("/api",userRouter)
//用户信息的模块
const userinfoRouter = require("./router/userinfo")
app.use("/my",userinfoRouter)
//文章分类的路由模块
const artCateRouter = require("./router/artcate")
app.use("/my/article",artCateRouter)
//文章路由模块
const articleRouter = require("./router/article")
app.use("/my/article", articleRouter)
//注册错误中间件
const Joi = require("joi")
app.use(function(err,req,res,next) {
    if(err instanceof Joi.ValidationError) return res.cc(err)//校验失败的错误
    if(err.name === "UnauthorizedError") return res.cc("身份认证失败!")
    res.cc(err)//其他错误
})
app.listen(3007,()=> {
    console.log("api server running at http://127.0.0.1:3007")
})