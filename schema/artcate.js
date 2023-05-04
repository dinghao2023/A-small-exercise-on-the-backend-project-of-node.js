const joi = require("joi")
const name = joi.string().required()
const alias = joi.string().alphanum().required()

const id = joi.number().integer().min(1).required()
//向外共享校验规则对象
exports.add_cate_schema = {
    //对req.body里面的数据进行校验
    body:{
        name,
        alias
    }
}
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
exports.update_cate_schema = {
    body:{
        Id:id,
        name,
        alias
    }
}