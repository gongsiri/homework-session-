
const isLogout = (req, res, next) => {
    if (!req.session.isLogin) {
        const error = new Error("로그인 되어 있지 않음")
        error.status = 401
        return next(error)
    }
    next()
}

module.exports = isLogout