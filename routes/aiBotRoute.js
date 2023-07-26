import userValidator from '../middlewares/userValidator.js'
import { checkIfPlanExpire, checkGptWordsLimit } from '../middlewares/planValidator.js'
import { Router } from 'express'
import query from '../database/dbpromise.js'

const router = Router()

// add new bot 
router.post('/add-aibot', userValidator, checkIfPlanExpire, checkGptWordsLimit, async (req, res) => {
    try {
        const body = req.body

        // check if bot already there 
        const check = await query(`SELECT * FROM aibot WHERE client_id = ? and active = ?`, [body.client_id, 1])
        if (check.length > 0) {
            return res.json({ msg: "You have already a bot running with this whatsapp account" })
        }

        if (!body.name || !body.train_data || !body.client_id) {
            return res.json({ msg: "send all required fields" })
        }

        await query(`INSERT INTO aibot (name, uid, active, client_id, train_data, enable_typing, reaction) VALUES (
            ?,?,?,?,?,?,?
        )`, [
            body.name, req.decode.uid, 1, body.client_id, body.train_data, body.enable_typing, body.reaction
        ])

        res.json({ success: true, msg: "Your AI Bot was added" })

    } catch (err) {
        res.json({ msg: 'server error', err })
        console.log(err)
    }
})

// get al route 
router.get('/get-bots', userValidator, async (req, res) => {
    try {
        const data = await query(`SELECT * FROM aibot WHERE uid = ?`, [req.decode.uid])
        res.json({ data, success: true })

    } catch (err) {
        res.json({ msg: 'server error', err })
        console.log(err)
    }
})


// turn off on 
router.post('/change-status', userValidator, async (req, res) => {
    try {
        await query(`UPDATE aibot SET active = ? WHERE uid = ? `, [req.body.status, req.decode.uid])
        res.json({ msg: req.body.status === 1 ? "Bot was enabled" : "Bot was disabled", success: true })

    } catch (err) {
        res.json({ msg: 'server error', err })
        console.log(err)
    }
})

// del bot 
router.post('/del-bot', userValidator, async (req, res) => {
    try {
        await query(`DELETE FROM aibot WHERE uid = ? and id = ?`, [req.decode.uid, req.body.id])
        res.json({ success: true, msg: "Bot was deleted" })

    } catch (err) {
        res.json({ msg: 'server error', err })
        console.log(err)
    }
})

export default router