const db = require("../db/index")
const bcrypt = require("bcryptjs")
//获取用户基本信息的处理函数
exports.getUserInfo = (req,res)=> {
    const sql = `select id,username,nickname,email,user_pic from ev_users where id = ?`
    db.query(sql,req.user.id,(err,results)=> {//req身上的user属性是token解析成功后，express-jwt自动为我们挂载上去的
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc("获取用户信息失败")
        // console.log(req.user)//{id:4,username:"admin1",password:"",nickname:null,email:null,user_pic:"",iat:1683093000,exp:1683129000}
        res.send({
            status:0,
            message:"获取用户信息成功",
            data:results[0]//RowDataPacket{id:4,username:"admin1",nickname:null,email:null,user_pic:null}
        })
    })
}
//更新用户信息的处理函数
exports.updateUserInfo = (req,res)=> {
    const sql = `update ev_users set ? where id = ?`
    db.query(sql,[req.body,req.body.id],(err,results)=> {
        if(err) return res.cc(err)
        if(results.affectedRows !== 1) return res.cc("修改用户信息失败!")
        res.cc("修改用户信息成功!",0)
    })
}
//更新密码请求的处理函数
exports.updatePassword = (req,res)=> {
    const sql = `select * from ev_users where id = ?`
    db.query(sql, req.user.id, (err, results) => {//req身上的user属性是token解析成功后，express-jwt自动为我们挂载上去的
        // console.log(req.body)//{ oldPwd: '000000', newPwd: 'aaaaaa' }
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc("用户不存在!")
        //若查询到对应id，则接下来需判断用户请求中携带的旧密码是否正确
        const compareResult = bcrypt.compareSync(req.body.oldPwd,results[0].password)//比较提交的旧密码与查找到的数据库中的密码是否一致
        if(!compareResult) return res.cc("旧密码错误!")
        //更新数据库中的密码
        const sql = `update ev_users set password = ? where id = ?`
        const newPwd = bcrypt.hashSync(req.body.newPwd,10)//对用户提交的新密码加密
        db.query(sql,[newPwd,req.user.id],(err,results)=> {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) return res.cc("更新密码失败") 
            res.cc("更新密码成功",0)
        })
    })
}
//更新用户头像请求的处理函数
exports.updateAvatar = (req,res)=> {
    const sql = `update ev_users set user_pic = ? where id = ?`
    db.query(sql,[req.body.avatar,req.user.id],(err,results)=> {
        if(err) return res.cc(err)
        if(results.affectedRows !== 1) return res.cc("更新头像失败")
        res.cc("更新头像成功!",0)
    })
}