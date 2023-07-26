import userValidator from '../middlewares/userValidator.js'
import { checkIfPlanExpire, checkDallLimit } from '../middlewares/planValidator.js'
import { Router } from 'express'
import { openAiImage, leonardoAiImage, downloadImages } from '../functions/function.js'
import query from '../database/dbpromise.js'

const router = Router()

router.post('/genrate', userValidator, checkIfPlanExpire, checkDallLimit, async (req, res) => {
    try {
        // cehck if the requested images are more that limit 
        if (req.body.numOfImage > req.user?.dalle_limit) {
            return res.json({ msg: `You are requesting ${req.body.numOfImage} images however you have ${req.body.numOfImage} limits left` })
        }

        const body = req.body

        let prompt = body.prompt;
        const promptDB = prompt

        if (body.aS) {
            if (body.moods) {
                prompt += `\nMood: ${body.moods}`;
            }

            if (body.lightingStyles) {
                prompt += `\nLighting Style: ${body.lightingStyles}`;
            }

            if (body.artStyles) {
                prompt += `\nArt Style: ${body.artStyles}`;
            }
        }


        const resp = await leonardoAiImage(prompt, req.plan, body.numOfImage)


        function insertData(data) {
            return new Promise(async (resolve) => {
                const newDta = data.map((ii) => {
                    return [req.decode.uid, ii.dataUrl, ii.imageName, req.plan?.dalle_size, promptDB]
                })

                await query(`INSERT INTO generated_images (uid, url, image, size, prompt) VALUES ?`, [
                    newDta
                ])
                resolve()
            })
        }

        if (resp.success && resp.data.length > 0) {
            const downlaodImage = await downloadImages(resp.data)
            await insertData(downlaodImage)

            // updating limits in database 
            const finalLimit = parseInt(req.user.dalle_limit) - downlaodImage.length
            await query(`UPDATE user SET dalle_limit = ? WHERE uid = ?`, [finalLimit, req.decode.uid])

            res.json({ success: true, msg: "Images was generated" })
        } else {
            res.json({ success: false, msg: "API issue images can not be generated" })
        }


    } catch (err) {
        console.log(err)
        res.json({ msg: 'server error', err })
    }
})

// get all users image 
router.get('/get_aiimage', userValidator, async (req, res) => {
    try {
        const data = await query(`SELECT * FROM generated_images WHERE uid = ?`, [req.decode.uid])
        res.json({ data, success: true })

    } catch (err) {
        console.log(err)
        res.json({ msg: 'server error', err })
    }
})


// del img by user 
router.post('/del_ai_img', userValidator, async (req, res) => {
    try {
        await query(`DELETE FROM generated_images WHERE id = ?`, [req.body.id])
        res.json({ msg: "The image was deleted", success: true })
    } catch (err) {
        console.log(err)
        res.json({ msg: 'server error', err })
    }
})

export default router