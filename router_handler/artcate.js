const db = require("../db/index")
//获取文章分类列表的处理函数
exports.getArticleCates = (req,res)=> {
    const sql = `select * from ev_article_cate where is_delete=0 order by id asc`
    db.query(sql,(err,results)=> {
        if(err) return res.cc(err)
        res.send({status:0,message:"获取文章分类列表成功",data:results})
    })
}
//新增文章分类的处理函数
exports.addArticleCates = (req,res)=> {
    const sql = `select * from ev_article_cate where name=? or alias=?`
    db.query(sql,[req.body.name,req.body.alias],(err,results)=> {
        if(err) return res.cc(err)
        if(results.length === 2) return res.cc("分类名称与别名已被占用，请更换!")
        if(results.length === 1 && results[0].name === req.body.name && results[0].alias === req.body.alias) return res.cc("分类名称与别名已被占用，请更换!")
        if(results.length ===1 && results[0].name === req.body.name) return res.cc("分类名称已被占用，请更换!")
        if(results.length === 1 && results[0].alias === req.body.alias) return res.cc("分类别名已被占用，请更换!")
        //若都未被占用，则在数据库中添加数据
        const sql = `insert into ev_article_cate set ?`
        db.query(sql,req.body,(err,results)=> {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) return res.cc("新增文章分类失败！")
            res.cc("新增文章分类成功！",0)
        })
    })
}
//删除文章分类的处理函数
exports.deleteCateById = (req,res)=> {
    const sql = `update ev_article_cate set is_delete=1 where id=?`
    db.query(sql,req.params.id,(err,results)=> {
        if(err) return res.cc(err)
        if(results.affectedRows !== 1) return res.cc("删除文章分类失败！")
        res.cc("删除文章分类成功！",0)
    })
}
//根据id获取文章分类的处理函数
exports.getArtCateById = (req,res)=> {
    const sql = `select * from ev_article_cate where id = ?`
    db.query(sql,req.params.id,(err,results)=> {
        if(err) return res.cc(err)
        if(results.length !== 1) return res.cc("获取文章分类数据失败！")
        res.send({status:0,message:"获取文章分类数据成功！",data:results[0]})
    })
}
//根据id更新文章分类的处理函数
exports.updateCateById = (req,res)=> {
    const sql = `select * from ev_article_cate where Id<>? and (name=? or alias=?)`//查询数据库中Id字段不等于用户提交的Id那些数据中，是否有name或alias被占用的数据
    db.query(sql,[req.body.Id,req.body.name,req.body.alias],(err,results)=> {
        if(err) return res.cc(err)
        if(results.length === 2) return res.cc("分类名称与别名被占用，请更换！")
        if (results.length === 1 && results[0].name === req.body.name && results[0].alias === req.body.alias) return res.cc("分类名称与别名被占用，请更换！")
        if(results.length === 1 && results[0].name === req.body.name) return res.cc("分类名称被占用，请更换！")
        if(results.length === 1 && results[0].alias === req.body.alias) return res.cc("分类别名被占用，请更换！")
        //在数据库中与用户提交的Id不同的那些数据中，没有name和alias被占用的情况
        const sql = `update ev_article_cate set ? where Id = ?`
        db.query(sql,[req.body,req.body.Id],(err,results)=> {
            if(err) return res.cc(err)
            if(results.affectedRows !== 1) return res.cc("更新文章分类失败！")
            res.cc("更新文章分类成功！",0)
        })
    })
}