import validateAdmin from '../middlewares/adminValidator.js'
import { checkIfPlanExpire, } from '../middlewares/planValidator.js'
import { Router } from 'express'
import query from '../database/dbpromise.js'
import validateUser from '../middlewares/userValidator.js'
import { getReplyFromBard, createFilePath, pushObjectToArrayAndDeleteOld, readJsonArray } from './chatting/function.js'

const router = Router()

router.post('/get_reply', validateUser, checkIfPlanExpire, async (req, res) => {
    try {
        if (parseInt(req.plan?.bard_access) !== 1) {
            return res.json({ msg: "Your plan does not allow you to chat with Bard Ai" })
        }

        // getting api
        const apiKey = await query(`SELECT * FROM apikeys`, [])
        const api = apiKey[0].bard_ai_api
        if (!api) {
            return res.json({ msg: "API not found" })
        }

        const que = req.body.que || 0

        if (!que) {
            return res.json({ msg: "Please type something" })
        }

        const dirPath = process.cwd()
        const createNewChatFile = `${dirPath}/routes/chatting/${req.decode.uid}/bard/convo.json`

        // creating path if not exist 
        await createFilePath(createNewChatFile)

        // adding question to path 
        await pushObjectToArrayAndDeleteOld(createNewChatFile, { role: 'user', content: que })


        const response = await getReplyFromBard(que, api)

        if (response.success) {
            res.json({ data: response.reply, success: true })
            // adding question to path 
            await pushObjectToArrayAndDeleteOld(createNewChatFile, { role: 'assistant', content: response.reply })
        } else {
            res.json({ msg: "Either your API incorrect or expired." })
        }

    } catch (err) {
        res.json({ err, msg: 'server error' })
        console.log(err)
    }
})

// get chats 
router.get("/get_chat", validateUser, async (req, res) => {
    try {
        const dirPath = process.cwd()
        const createNewChatFile = `${dirPath}/routes/chatting/${req.decode.uid}/bard/convo.json`

        // getting latest convo data 
        const getJson = await readJsonArray(createNewChatFile)
        res.json({ success: true, data: getJson })


    } catch (err) {
        res.json({ err, msg: 'server error' })
        console.log(err)
    }
})

export default router