const Joi = require("joi")//用于定义验证规则的包
//定义用户名和密码的验证规则
const username = Joi.string().alphanum().min(1).max(10).required()
const password = Joi.string().pattern(/^[\S]{6,12}$/).required()
//向外共享验证规则对象：
exports.reg_login_schema = {
    //校验req.body中的数据
    body:{
        username,//即相当于username:Joi.string().alphanum().min(1).max(10).required()
        password
    }
}
//定义id、nickname、email的验证规则
const id = Joi.number().integer().min(1).required()
const nickname = Joi.string().required()
const email = Joi.string().email().required()
//向外共享验证规则对象：
exports.update_userinfo_schema = {
    //对req.body里面的数据进行验证
    body:{
        id,
        nickname,
        email
    }
}
//向外共享验证规则对象：
exports.update_password_schema = {
    //对post请求体req.body里面的数据进行验证
    body:{
        oldPwd:password,//旧密码需符合之前定义的密码验证规则
        //新密码的验证规则：
        //Joi.ref("oldPwd")表示新旧密码的值保持一致
        //Joi.not()表示不一致
        //.concat()用于合并验证规则，即既要满足新旧密码不能一致，也要满足之前定义的密码验证规则
        newPwd:Joi.not(Joi.ref("oldPwd")).concat(password)
    }
}
//向外共享验证规则对象(定义验证avatar头像的验证规则)：
exports.update_avatar_schema = {
    //验证请求体中的avatar数据的格式
    body:{
        //dataUri()指的是类似这样格式的字符串数据：data:image/png;base64,VE9PTUFOWVNFQ1JFVFM=
        avatar:Joi.string().dataUri().required()
    }
}