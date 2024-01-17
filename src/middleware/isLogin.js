
const isLogin = (req, res, next) => {
    if (req.session.isLogin) {
        const error = new Error("이미 로그인 되어 있음")
        error.status = 401
        return next(error)
    }
    next()
}

module.exports = isLogin