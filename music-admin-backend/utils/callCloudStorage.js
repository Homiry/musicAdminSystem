//调用云存储
const getAccessToken = require('./getAccessToken.js')
const rp = require('request-promise')
const fs = require('fs')

const cloudStorage = {
    async download(ctx, fileList){
        const ACCESS_TOKEN = await getAccessToken()
        const options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`,
            body: {
                
                env: ctx.state.env,
                file_list: fileList,
            },
            json: true // Automatically stringifies the body to JSON
        }
    
        return await rp(options)
            .then((res) => {
                return res
            })
            .catch(function (err) {
                console.log(err);
            })        
    },


    //封装把图片上传到云存储的方法，给swiper.js调用
    async upload(ctx){
        //1、请求地址（uploadFile）
        const file = ctx.request.files.file
        const path = `swiper/${Date.now()}-${Math.random()}-${file.name}`
        const ACCESS_TOKEN = await getAccessToken()
        const options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/uploadfile?access_token=${ACCESS_TOKEN}`,
            body: {
                
                env: ctx.state.env,
                path
            },
            json: true // Automatically stringifies the body to JSON
        }
        //请求参数
        const info = await rp(options)
            .then((res) => {
                return res
            })
            .catch(function (err) {
                console.log(err);
            })  
        console.log(info)

        //2、上传图片
        const params = {
            method: 'POST',
            headers: {
                'content-type': 'multipart/form-data'
            },
            uri: info.url,
            formData: {
                key: path,
                Signature: info.authorization ,
                'x-cos-security-token': info.token,
                'x-cos-meta-fileid': info.cos_file_id,
                file: fs.createReadStream(file.path)

            },
            json: true
        }

        //返回成功上传图片的file_id
        await rp(params)
        return info.file_id
    },

    async delete(ctx, fileid_list){
        const ACCESS_TOKEN = await getAccessToken()
        const options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${ACCESS_TOKEN}`,
            body: {
                env: ctx.state.env,
                fileid_list: fileid_list,
            },
            json: true // Automatically stringifies the body to JSON
        }
    
        return await rp(options)
            .then((res) => {
                return res
            })
            .catch(function (err) {
                console.log(err);
            })        
    },


}


module.exports = cloudStorage