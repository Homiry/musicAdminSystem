const Router = require('koa-router')
const router = new Router()
const callCloundDB = require('../utils/callCloudDB.js')
const cloudStorage = require('../utils/callCloudStorage.js')

router.get('/list', async(ctx, next)=>{
    const params = ctx.request.query
    const query =  `
        db.collection('blog').skip(${params.start}).limit(${params.count}).orderBy('createTime', 'desc').get()
    `
    const res = await callCloundDB(ctx, 'databasequery', query)
    ctx.body = {
        code: 20000,
        data: res.data
    }
})

router.post('/del', async(ctx, next)=>{
    //取到前端发送的参数
    const params = ctx.request.body
    //删除blog
    const queryBlog = `db.collection('blog').doc('${params._id}').remove()`
    const delBlogRes = await callCloundDB(ctx, 'databasedelete', queryBlog)
    //删除blog-comment   (doc删除的是一条数据where传入查询条件可以删除多条)
    const queryComment = `db.collection('blog-comment').where({
        blogId: '${params._id}'
    }).remove()`
    const delCommentRes = await callCloundDB(ctx, 'databasedelete', queryComment)
    //删除对应的图片
    const delStorageRes = await cloudStorage.delete(ctx, params.img)
    ctx.body = {
        code: 20000,
        data: {
            delBlogRes,
            delCommentRes,
            delStorageRes
        } 
    }
})

module.exports = router