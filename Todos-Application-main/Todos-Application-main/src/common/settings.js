module.exports = {
    secret: process.env.SECRET || "SUPER COOL SECRET KEY!@",
    audience: '*',
    issuer: 'todo.api',
    subject: '*',
}