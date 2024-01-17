const router = require("express").Router()
const queryModule = require("../modules/queryModule")
const isLogout = require("../middleware/isLogout")
const checkTrim = require("../middleware/checkTrim")
const logger = require("../config/loggerConfig")

//게시물 쓰기
router.post("/", isLogout, checkTrim("content"), checkTrim("title"), async (req, res, next) => {
    const { content, title } = req.body
    const userKey = req.session.userKey
    console.log(userKey)
    const result = {
        "message": "",
        "data": null
    }
    try {
        const sql = 'INSERT INTO posting (account_key,title,content) VALUES ($1,$2,$3)'
        await queryModule(sql, [userKey, title, content])

        result.data = {
            "id": req.session.userId,
            "content": content,
            "title": title,
        }
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//전체 게시물 읽기
router.get("/", async (req, res, next) => {
    const result = {
        "message": "",
        "data": null
    }
    try {
        const sql = `SELECT posting.*, account.id AS postingUser 
        FROM posting 
        JOIN account ON posting.account_key = account.account_key 
        ORDER BY posting.create_at DESC`
        const queryData = await queryModule(sql)
        result.data = queryData
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//각 게시물 읽기
router.get("/:idx", isLogout, async (req, res, next) => { // 여기도 내 거인지 아닌지 줘야 함
    const postingKey = req.params.idx
    const sessionKey = req.session.userKey
    const result = {
        "message": "",
        "data": null
    }
    try {
        const sql = `SELECT posting.*, account.id AS postingUser 
                    FROM posting 
                    JOIN account ON posting.account_key = account.account_key 
                    WHERE posting.posting_key =$1`
        const queryData = await queryModule(sql, [postingKey])
        queryData.forEach(elem => {
            if (elem.account_key != sessionKey) {
                elem.isMine = false
            } else {
                elem.isMine = true
            }
        })
        if (queryData.length == 0) {
            const error = new Error("게시물이 존재하지 않음")
            error.status = 204 // 404 말고 (통신은 되긴 했으니까) 굳이 필요 없음
            throw error
        }
        result.data = queryData[0]
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//게시물 수정
router.put("/:idx", isLogout, checkTrim("content"), checkTrim("title"), async (req, res, next) => {
    const { content, title } = req.body
    const postingKey = req.params.idx
    const sessionKey = req.session.userKey
    const result = {
        "message": "",
        "data": null
    }
    try {
        const sql = "UPDATE posting SET content=$1, title=$2 WHERE posting_key=$3 AND account_key =$4"
        await queryModule(sql, [content, title, postingKey, sessionKey])
        result.data = {
            "postingKey": postingKey,
            "content": content,
            "title": title
        }
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//게시물 삭제
router.delete("/:idx", isLogout, async (req, res, next) => {
    const postingKey = req.params.idx
    const sessionKey = req.session.userKey
    const result = {
        "message": ""
    }
    try {
        const sql = "DELETE FROM posting WHERE posting_key= $1 AND account_key =$2"
        await queryModule(sql, [postingKey, sessionKey])
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

module.exports = router