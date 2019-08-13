

var options = {
  host: 'http://192.168.1.127',
  port: '8021',
  path: '/auth/oauth/token',
  method: 'POST',
  redis: {
    host: "192.168.1.250",
    port: "6379",
    pass: "zxwlpt",
    db: 0,
    ttl: 30000, //单位秒
    logErrors: true
  }
}

module.exports = options;