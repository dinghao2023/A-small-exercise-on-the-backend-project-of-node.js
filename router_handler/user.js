const db = require("../db/index")//导入创建的数据库连接对象
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const config = require("../config")

//注册新用户请求的处理函数
exports.regUser = (req,res)=> {
    const userinfo = req.body//获取提交的用户信息
    //检测用户名在数据库中是否已存在
    const sqlStr = `select * from ev_users where username=?`
    db.query(sqlStr, userinfo.username, (err, results) => {
        if (err) {
            return res.cc(err)
        }
        if (results.length > 0) {
            return res.cc(`用户名被占用，请更换其他用户名!`)
        }
        //对用户的密码进行加密
        // console.log(userinfo.password)//000000
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)//$2a$10$zXp9hL73UUEdMeG2AgRXwerHErqSiVdd2h94aU3iRLRr3wL1NDsNu
        //将用户信息存入数据库
        const sql = `insert into ev_users set ?`
        db.query(sql, { username: userinfo.username, password: userinfo.password }, (err, results) => {
            if (err) return res.cc(err)
            if (results.affectedRows !== 1) return res.cc(`注册用户失败，请稍后再试`)
            res.cc(`注册成功`, 0)
        })
    })
}
//登录请求的处理函数
exports.login = (req,res)=> {
    const userinfo = req.body
    const sql = `select * from ev_users where username = ?`
    db.query(sql,userinfo.username,(err,results)=> {
        if(err) return res.cc(err)//执行sql语句失败
        if(results.length !== 1) return res.cc(`登录失败`)//在数据库中没有查找到对应信息
        //比较用户提交的密码与数据库中加密的密码
        const compareResult = bcrypt.compareSync(userinfo.password,results[0].password)
        if(!compareResult) return res.cc("密码错误")
        //在服务端生成token字符串
        const user = {...results[0],password:"",user_pic:""}//获取用户信息，并将密码和用户头像设为空值
        const tokenStr = jwt.sign(user,config.jwtSecretKey,{expiresIn:config.expiresIn})
        res.send({
            status:0,
            message:"登录成功",
            token:`Bearer ${tokenStr}`
        })
    })
}