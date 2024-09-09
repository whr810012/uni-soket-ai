
module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'https://spark-api-open.xf-yun.com',
                changeOrigin: true,
                pathRewrite: { '^/api': '' },
                secure: false
            }
        }
    }
}