### db文件夹
与数据库相关的配置。通过引入`mysql`库，借助`mysql`库的`createPool()`方法创建数据库连接对象，与已有的数据库建立连接。
### router文件夹

用于存放路由模块。

##### 1.user.js

该路由模块用于监听用户注册和登录的请求，都带有`/api`的访问前缀。
- 引入`@escook/express-joi`中间件（关于验证表单数据的中间件@escook/express-joi和通过joi库定义验证规则的使用请参考[链接](https://www.npmjs.com/package/@escook/express-joi)）。
- 引入schema文件夹中自己创建的验证规则对象。
- 直接在`router.post()`的第二个参数通过上述中间件和验证规则对象对用户信息进行校验。

##### 2.userinfo.js

该路由模块用于监听获取用户信息、更新用户信息、更新密码、更换头像的请求，都带有`/my`的访问前缀，访问时需要进行token身份认证，即请求头中需通过`Authorization`字段携带token信息。

```js
router.get("/userinfo",userinfo_handler.getUserInfo)//监听获取用户信息的请求
router.post("/userinfo", expressJoi(update_userinfo_schema), userinfo_handler.updateUserInfo)//监听更新用户信息的请求
router.post("/updatepwd", expressJoi(update_password_schema), userinfo_handler.updatePassword)//监听更新密码的请求
router.post("/update/avatar", expressJoi(update_avatar_schema), userinfo_handler.updateAvatar)//监听更换头像的请求
```

- 监听更新用户信息时，需要对用户提交的更新信息通过`@escook/express-joi`中间件和schema文件夹中的校验规则进行校验。

  引入`@escook/express-joi`中间件和schema文件夹中的验证规则对象。

  校验对象主要校验三部分：id、nickname、email。

  在`router.post()`第二个参数通过上述中间件和验证规则对象对用户提交的信息进行校验。

- 监听更新密码时，同样需要对提交的新旧密码进行格式的校验。

  校验对象主要校验：请求体中的`oldPwd`和`newPwd`

- 监听更换头像时，同样需要对提交的头像avatar信息进行格式校验。

  校验请求体中的`avatar`数据。

##### 3.artcate.js

该路由模块用于监听获取文章分类列表、新增文章分类、删除文章分类、根据id获取文章分类的请求，都带有`/my/article`的访问前缀，访问时需要进行token身份认证，即请求头中需通过`Authorization`字段携带token信息。

```js
router.get("/cates", artcate_handler.getArticleCates)//监听获取文章分类列表请求
router.post("/addcates", expressJoi(add_cate_schema), artcate_handler.addArticleCates)//监听新增文章分类的请求
router.get("/deletecate/:id", expressJoi(delete_cate_schema), artcate_handler.deleteCateById)//监听删除文章分类请求的路由
router.get("/cates/:id", expressJoi(get_cate_schema), artcate_handler.getArtCateById)//监听根据id获取文章分类请求的路由
router.post("/updatecate", expressJoi(update_cate_schema), artcate_handler.updateCateById)//监听根据id更新文章分类的请求
```

- 新增文章分类请求需对请求体中的`name`和`alias`数据进行格式校验。
- 删除文章分类请求需要对url中的id参数格式校验。
- 根据id获取文章分类的请求也需要对url中的id参数进行格式校验。
- 根据id更新文章分类的请求需要对请求体中的Id、name、alias数据进行格式校验。

### router_handler文件夹
用于存放路由处理函数模块，用于对用户的请求做出相应的处理。

##### 1.user.js

包括用户注册请求和用户登录请求这两个事件回调。

①用户注册请求的处理函数：

- 通过`req.body`获取提交的用户信息（主要包括用户名和密码两项数据）。
- 检测用户名是否与数据库中已有数据重复（需要引入创建的数据库连接对象`db`）。通过`db.query()`方法执行sql语句，在回调函数中通过`err`和`results`参数进行分别的处理。
- 对用户密码进行加密（需要引入`bcryptjs`库，调用该库的`hashSync()`方法进行加密）。
- 最后将用户信息存入数据库（通过`db.query()`方法执行sql语句，传入用户信息作为参数，在回调函数中通过`err`和`results`两个参数进行相应处理）。

②用户登录请求的处理函数：

- 通过`req.body`获取用户提交的信息。
- 通过`db.query()`查询数据库中是否有对应username的用户信息，并在回调函数中通过`err`和`results`参数作出相应处理。
- 若数据库中查找到对应username的用户信息，通过`bcrypt`库的`compareSync()`方法比较用户提交的密码与数据库中加密的密码是否一致。
- 若密码一致，则根据在数据库获取的用户信息在服务端生成token字符串。  
  获取的对应用户信息要剔除密码、用户头像等敏感信息。  
  引入`jsonwebtoken`库，借助`jsonwebtoken`库的`sign()`方法生成token字符串。  
- 将token字符串等信息响应给客户端。

##### 2.userinfo.js

①获取用户信息请求的处理函数，用户通过`Authorization`字段携带token信息发起get请求，对该请求的处理函数：

- 引入数据库连接对象`db`，通过`db.query()`方法执行sql语句。

  其中`db.query()`方法的第二个参数为：对token字符串进行解密之后挂载到`req.user`属性上的某些用户信息。

  第三个参数为回调函数，根据在数据库中是否查找到对应的用户信息通过回调函数中的`err`和`results`参数做进一步处理。

  若在数据库中查找到对应的用户信息，则将用户信息(不包含密码)等数据响应给客户端。

  ```js
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
  ```

②更新用户信息请求的处理函数，用户通过`Authorization`字段携带token信息发起post请求，对该请求的处理函数：

- 通过`expressJoi(update_userinfo_schema)`对请求体中的信息进行校验通过之后，便进入了此处理函数。

- 该处理函数主要通过`db.query()`方法执行sql语句更新数据库中的用户信息。

  ```js
  const sql = `update ev_users set ? where id = ?`
  db.query(sql,[req.body,req.body.id],(err,results)=> {
      if(err) return res.cc(err)
      if(results.affectedRows !== 1) return res.cc("修改用户信息失败!")
      res.cc("修改用户信息成功!",0)
  })
  ```

③更新密码的处理函数，用户通过`Authorization`字段携带token信息发起post请求，对该请求的处理函数：

- 通过`expressJoi(update_password_schema)`对请求体中新旧密码的格式校验通过之后就进入了此处理函数。
- 首先根据`req.user.id`查找数据库中对应的用户信息。
- 若查找到对应id的用户信息，则需判断用户请求携带的旧密码是否正确。
- 若旧密码正确，则对用户提交的新密码加密之后，通过`db.query()`方法执行sql语句更改数据库中的密码。

④更新用户头像请求的处理函数：

- 通过`expressJoi(update_avatar_schema)`对请求体中所携带的`avatar`数据进行校验，校验通过之后就进入了此处理函数。
- 通过`db.query()`方法执行sql语句，根据用户id更新用户头像信息。

##### 3.artcate.js

①获取文章分类列表的处理函数，用户通过`Authorization`字段携带token信息发起get请求，对该请求的处理函数：

- 主要通过`db.query()`方法执行sql语句获取文章分类列表。

②新增文章分类的处理函数：

- 对请求体中的数据格式校验通过之后就进入了此处理函数。

- 首先通过`db.query()`方法执行sql语句查询请求体中提交的数据是否与数据库已有数据重复。
- 若不重复通过执行sql语句在数据库中新增文章分类。

③删除文章分类的处理函数：

- 对url中的id参数格式校验通过之后就进入了此处理函数。
- 通过`db.query()`方法执行sql语句根据id参数对数据库中的数据进行删除。

④根据id获取文章分类的处理函数：

- 对url中的id参数格式校验通过之后就进入了此处理函数。
- 通过`db.query()`方法执行sql语句根据id参数获取数据库中的数据，并返回给客户端。

⑤根据id更新文章分类的处理函数：

- 对请求体中的Id、name、alias数据格式校验通过之后就进入了此处理函数。
- 首先执行sql语句查询数据库中Id字段不等于用户提交的Id那些数据中，是否有name或alias被占用的数据。
- 若没有name和alias被占用的情况，则执行sql语句更新对应Id的数据。

### schema文件夹

该文件夹用于对请求体中包含的用户信息格式进行验证规则的设置，因此需要引入joi库，以定义验证规则。

##### 1.user.js

①对用户注册请求提交的请求体中的username和password的格式进行校验：

```js
const Joi = require("joi")
exports.reg_login_schema = {
    //校验req.body中的数据
    body:{
        username:Joi.string().alphanum().min(1).max(10).required(),
        password:Joi.string().pattern(/^[\S]{6,12}$/).required()
    }
}
```
②对更新用户信息请求所提交的id、nickname、email格式进行校验：

```js
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
```

③对更新密码请求所提交的新旧密码格式进行校验：

```js
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
```

④对更新头像请求所提交的avatar数据格式进行校验：

```js
exports.update_avatar_schema = {
    //验证请求体body中的avatar数据的格式
    body:{
        //dataUri()指的是如下格式的字符串数据：
        //img/png;base64
        avatar:Joi.string().dataUri().required()
    }
}
```

##### 2.artcate.js

①对新增文章分类请求提交的name、alias数据进行格式校验：

```js
const name = joi.string().required()
const alias = joi.string().alphanum().required()
exports.add_cate_schema = {
    //对req.body里面的数据进行校验
    body:{
        name,
        alias
    }
}
```

②对删除文章分类、根据id获取文章分类的请求所提交的url中的参数id进行格式校验：

```js
const id = joi.number().integer().min(1).required()
exports.delete_cate_schema = {
    //校验req.params中的参数id
    params:{
        id,
    }
}
exports.get_cate_schema = {
    params:{
        id,
    }
}
```

③对根据id更新文章分类的请求所提交的Id、name、alias数据进行格式校验：

```js
exports.update_cate_schema = {
    body:{
        Id:id,
        name,
        alias
    }
}
```

### app.js

- 引入`express`，并创建服务器实例app。

- 引入并注册`cors`跨域资源共享。  

- 配置express的内置中间件，用于解析post类型url-encoded格式的请求体数据。
  
  ```js
  app.use(express.urlencoded({ extended: false }))
  ```
  
- 封装一个`res.cc()`函数，通过`app.use()`注册为全局中间件，用于对`res.send()`相关代码的简化。

  ```js
  app.use(function(req,res,next) {
      res.cc = function(err,status = 1) {//status默认值为1，表示失败的情况
          res.send({
              status,
              message:err instanceof Error ? err.message : err//err可能是一个错误对象，也可能是一个错误的描述字符串。
          })
      }
      next()
  })
  ```

- 引入用于解析token的中间件`express-jwt`并全局注册，用于对token字符串的解密。
  
  ```js
  const expressJWT = require("express-jwt")
  const config = require("./config")
  //.unless({path:[/^\/api/]})表示以/api开头的接口不需要进行token身份认证。
  app.use(expressJWT({secret:config.jwtSecretKey}).unless({path:[/^\/api/]}))
  ```
  
- 引入并使用已创建的路由模块。

  ```js
  //引入并注册用户路由模块
  const userRouter = require("./router/user")
  app.use("/api",userRouter)
  //引入并注册用户信息的模块
  const userinfoRouter = require("./router/userinfo")
  app.use("/my",userinfoRouter)
  //引入并注册文章分类的路由模块
  const artCateRouter = require("./router/artcate")
  app.use("/my/article",artCateRouter)
  ```

- 注册错误中间件。  
  在路由模块中对用户提交的数据进行校验之后若抛出全局错误，通过以下代码在错误中间件中做出相应处理，需要引入`joi`库。  

  ```js
  if(err instanceof Joi.ValidationError) return res.cc(err)
  ```
  若token身份认证失败产生错误，通过以下代码在全局错误中间件中作出相应处理。
  ```js
  if(err.name === "UnauthorizedError") return res.cc("身份认证失败!")
  ```

- 最后启动服务器实例。
### config.js
全局的配置文件，向外暴露用于加密和解密token的密钥、token字符串的有效期。