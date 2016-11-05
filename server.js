module.exports=althea=>{
    althea.addPagemodule('/sitemap.xml',pagemodule)
}
function pagemodule(env){
    if(
        env.request.headers.origin&&
        env.request.headers.origin!=env.envVars.allowedOrigin
    )
        return 403
    if(env.request.method==='GET')
        return get(env)
    env.headers.allow='GET'
    return{
        status:405,
        headers:env.headers,
    }
}
function get(env){
    env.headers['content-type']='text/xml'
    return calcContent(env).then(res=>({
        status:200,
        headers:env.headers,
        content:res,
    }))
}
function calcContent(env){
    return getPages(env.database.pool).then(rows=>{
        env.headers['content-type']='text/xml'
        env.response.writeHead(200,env.headers)
        let res=''
        res+=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>${env.environmentvariables.clientUrlRoot}</loc>
</url>
        `
        rows.forEach(row=>{
            res+=`
<url>
<loc>${env.environmentvariables.clientUrlRoot+row.id}</loc>
</url>
            `
        })
        res+=`
</urlset>
        `
        return res
    })
}
function getPages(pool){
    return new Promise((rs,rj)=>{
        pool.query(`
            select id
            from pages
            where !isremoved && ispublic
        `,(err,rows)=>err?rj(err):rs(rows))
    })
}
