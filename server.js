module.exports=function(althea){
    althea.addPagemodule('/sitemap.xml',pagemodule)
}
function pagemodule(env){
    if(!env.althea.allowOrigin(env.envVars,env.request.headers.origin))
        return 403
    if(env.request.method==='GET')
        return get(env)
    env.headers.allow='GET'
    return{
        status:405,
        headers:env.headers,
    }
}
async function get(env){
    env.headers['content-type']='text/xml'
    let res=await calcContent(env)
    return{
        status:200,
        headers:env.headers,
        content:res,
    }
}
async function calcContent(env){
    let rows=await env.database.query0(`
        select id
        from page
        where !isremoved && ispublic
    `)
    env.headers['content-type']='text/xml'
    env.response.writeHead(200,env.headers)
    let res=''
    res+=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
<loc>/</loc>
</url>
        `
    rows.map(row=>
        res+=`
<url>
<loc>/${row.id}</loc>
</url>
        `
    )
    res+=`
</urlset>
    `
    return res
}
