import { Router } from 'express'
import * as controller from '../controllers/userController.js'
import userValidator from '../middlewares/userValidator.js'
import query from '../database/dbpromise.js'
import { sendRecoveryEmail } from '../functions/function.js'
import bcrypt from 'bcrypt'
import moment from 'moment'


const router = Router()

router.post('/signup', controller.signup)
router.post('/login', controller.login)

router.get('/get-user-by-token', userValidator, async (req, res) => {
    try {
        const data = await query(`SELECT * FROM user WHERE uid = ?`, [req.decode.uid])
        res.json({ data: data[0], success: true })

    } catch (err) {
        console.log(err)
        res.json({ err, msg: "server error" })
    }
})

router.post('/update-profile', userValidator, async (req, res) => {
    try {
        if (req.body.newpass) {
            const hash = await bcrypt.hash(req.body.newpass, 10)
            await query(`UPDATE user SET email = ?, password = ? WHERE uid = ?`, [req.body.email, hash, req.decode.uid])
            res.json({ success: true, msg: "Admin was updated refresh the page" })
        } else {
            await query(`UPDATE user SET email = ? WHERE uid = ?`, [req.body.email, req.decode.uid])
            res.json({ success: true, msg: "Profile was updated refresh the page" })
        }

    } catch (err) {
        console.log(err)
        res.json({ msg: "server error", err })
    }
})

router.post('/send-new-ping', userValidator, async (req, res) => {
    try {
        await query(`INSERT INTO ping (uid, user_msg) VALUES (?,?)`, [
            req.decode.uid, req.body.msg
        ])
        res.json({ msg: "New message was sent", success: true })

    } catch (err) {
        console.log(err)
        res.json({ msg: "server error", err })
    }
})

router.get('/get-my-ping', userValidator, async (req, res) => {
    try {
        const data = await query(`SELECT * FROM ping WHERE uid = ?`, [req.decode.uid])
        res.json({ data, success: true })

    } catch (err) {
        console.log(err)
        res.json({ msg: "server error", err })
    }
})

router.post('/modify_user', userValidator, async (req, res) => {
    try {
        if (!req.body.password) {
            return res.json({ success: false, msg: "No input provided" })
        }

        if (moment(req.decode.time).diff(moment(new Date()), 'hours') > 1) {
            return res.json({ success: false, msg: "Token expired" })
        }

        const hashpassword = await bcrypt.hash(req.body.password, 10)

        const result = await query(`UPDATE user SET password = ? WHERE email = ?`, [hashpassword, req.decode.old_email])

        res.json({ success: true, msg: "User has been updated", data: result })


    } catch (err) {
        console.log(err)
        res.json({ msg: "server error", err })
    }
})

router.post('/send_recovery', async (req, res) => {
    try {
        const checkEmailValid = await query(`SELECT * FROM user WHERE email = ?`, [req.body.recovery_email])
        console.log({ checkEmailValid })
        if (checkEmailValid.length < 1) {
            return res.json({ success: false, msg: "We have sent a recovery link if this email is associated with user account." })
        }

        await sendRecoveryEmail(checkEmailValid[0], "user", req)

        res.json({ success: true, msg: "We have sent a recovery link if this email is associated with user account." })

    } catch (err) {
        console.log(err)
        res.json({ msg: "server error", err })
    }
})

router.get('/get_dash', userValidator, async (req, res) => {
    try {
        // get plan name 
        const getUser = await query(`SELECT * FROM user WHERE uid = ?`, [req.decode.uid])
        const plan = getUser[0].plan ? JSON.parse(getUser[0].plan).plan_name : false

        // getting instances 
        const instance = await query(`SELECT * FROM instance WHERE uid = ?`, [req.decode.uid])


        // getting bots 
        const bots = await query(`SELECT * FROM aibot WHERE uid = ? and active = ?`, [req.decode.uid, 1])

        const pendingPings = await query(`SELECT * FROM ping WHERE uid = ? and admin_reply = ?`, [req.decode.uid, null])


        // getting 24 hours data orders 
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const formattedDateTime = twentyFourHoursAgo.toISOString().slice(0, 19).replace('T', ' ');
        const dailyGenImg = await query(`SELECT * FROM generated_images WHERE createdAt >= ? and uid = ?`, [formattedDateTime, req.decode.uid])

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const formattedDateTimeMonthly = oneMonthAgo.toISOString().slice(0, 19).replace('T', ' ');
        const monthlyGenImg = await query(`SELECT * FROM generated_images WHERE createdAt >= ? and uid = ?`, [formattedDateTimeMonthly, req.decode.uid])

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const formattedDateTimeYear = oneYearAgo.toISOString().slice(0, 19).replace('T', ' ');
        const yearlyGenImg = await query(`SELECT * FROM generated_images WHERE createdAt >= ? and uid = ?`, [formattedDateTimeYear, req.decode.uid])

        // total orders 
        const allGenImg = await query(`SELECT * FROM generated_images WHERE uid = ?`, [req.decode.uid])


        // getting 24 hours data orders 
        const twentyFourHoursAgoWP = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const formattedDateTimeWP = twentyFourHoursAgoWP.toISOString().slice(0, 19).replace('T', ' ');
        const dailyAutoBlog = await query(`SELECT * FROM generated_wp WHERE createdAt >= ? and uid = ?`, [formattedDateTimeWP, req.decode.uid])

        const oneMonthAgoAP = new Date();
        oneMonthAgoAP.setMonth(oneMonthAgoAP.getMonth() - 1);
        const formattedDateTimeMonthlyAP = oneMonthAgoAP.toISOString().slice(0, 19).replace('T', ' ');
        const monthlyAutoBlog = await query(`SELECT * FROM generated_wp WHERE createdAt >= ? and uid = ?`, [formattedDateTimeMonthlyAP, req.decode.uid])

        const oneYearAgoAP = new Date();
        oneYearAgoAP.setFullYear(oneYearAgoAP.getFullYear() - 1);
        const formattedDateTimeYearAP = oneYearAgoAP.toISOString().slice(0, 19).replace('T', ' ');
        const yearlyAutoBlog = await query(`SELECT * FROM generated_wp WHERE createdAt >= ? and uid = ?`, [formattedDateTimeYearAP, req.decode.uid])

        // total orders 
        const allAutoBlog = await query(`SELECT * FROM generated_wp WHERE uid = ?`, [req.decode.uid])



        // getting 24 hours data orders 
        const twentyFourHoursAgostt = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const formattedDateTimestt = twentyFourHoursAgostt.toISOString().slice(0, 19).replace('T', ' ');
        const dailyStt = await query(`SELECT * FROM stt WHERE createdAt >= ? and uid = ?`, [formattedDateTimestt, req.decode.uid])

        const oneMonthAgostt = new Date();
        oneMonthAgostt.setMonth(oneMonthAgostt.getMonth() - 1);
        const formattedDateTimeMonthlystt = oneMonthAgostt.toISOString().slice(0, 19).replace('T', ' ');
        const monthlyStt = await query(`SELECT * FROM stt WHERE createdAt >= ? and uid = ?`, [formattedDateTimeMonthlystt, req.decode.uid])

        const oneYearAgostt = new Date();
        oneYearAgostt.setFullYear(oneYearAgostt.getFullYear() - 1);
        const formattedDateTimeYeastt = oneYearAgostt.toISOString().slice(0, 19).replace('T', ' ');
        const yearlyStt = await query(`SELECT * FROM stt WHERE createdAt >= ? and uid = ?`, [formattedDateTimeYeastt, req.decode.uid])

        // total orders 
        const allStt = await query(`SELECT * FROM stt WHERE uid = ?`, [req.decode.uid])


        // getting 24 hours data orders 
        const twentyFourHoursAgotts = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const formattedDateTimetts = twentyFourHoursAgotts.toISOString().slice(0, 19).replace('T', ' ');
        const dailyTTs = await query(`SELECT * FROM tts WHERE createdAt >= ? and uid = ?`, [formattedDateTimetts, req.decode.uid])

        const oneMonthAgotts = new Date();
        oneMonthAgotts.setMonth(oneMonthAgotts.getMonth() - 1);
        const formattedDateTimeMonthlytts = oneMonthAgotts.toISOString().slice(0, 19).replace('T', ' ');
        const monthlyTTs = await query(`SELECT * FROM tts WHERE createdAt >= ? and uid = ?`, [formattedDateTimeMonthlytts, req.decode.uid])

        const oneYearAgotts = new Date();
        oneYearAgotts.setFullYear(oneYearAgotts.getFullYear() - 1);
        const formattedDateTimeYeatts = oneYearAgotts.toISOString().slice(0, 19).replace('T', ' ');
        const yearlyTTs = await query(`SELECT * FROM tts WHERE createdAt >= ? and uid = ?`, [formattedDateTimeYeatts, req.decode.uid])

        // total orders 
        const allTTs = await query(`SELECT * FROM tts WHERE uid = ?`, [req.decode.uid])

        res.json({
            success: true,
            plan,
            instance: instance.length,
            bots: bots.length,
            pendingPings: pendingPings.length,
            dailyGenImg: dailyGenImg.length,
            monthlyGenImg: monthlyGenImg.length,
            yearlyGenImg: yearlyGenImg.length,
            allGenImg: allGenImg.length,
            dailyAutoBlog: dailyAutoBlog.length,
            monthlyAutoBlog: monthlyAutoBlog.length,
            yearlyAutoBlog: yearlyAutoBlog.length,
            allAutoBlog: allAutoBlog.length,
            dailyStt: dailyStt.length,
            monthlyStt: monthlyStt.length,
            yearlyStt: yearlyStt.length,
            allStt: allStt.length,
            dailyTTs: dailyTTs.length,
            monthlyTTs: monthlyTTs.length,
            yearlyTTs: yearlyTTs.length,
            allTTs: allTTs.length
        })


    } catch (err) {
        console.log(err)
        res.json({ msg: "server error", err })
    }
})


export default router
