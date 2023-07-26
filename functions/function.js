import query from '../database/dbpromise.js'
import fetch from 'node-fetch'
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import fs from 'fs'
import { OpenAIApi, Configuration } from 'openai'
import path from 'path'
import nodemailer from 'nodemailer'
import moment from 'moment'


function createJsonFile(filename, data) {
  const dirName = process.cwd()
  const filePath = `${dirName}/contacts/${filename}.json`;
  const jsonData = JSON.stringify(data, null, 2);

  fs.writeFileSync(filePath, jsonData);
  console.log(`${filename}.json file created or replaced successfully.`);
}

function createJsonFileEmbed(filePathWithFileName, jsonData) {
  const directoryPath = path.dirname(filePathWithFileName);

  fs.access(filePathWithFileName, fs.constants.F_OK, (err) => {
    if (!err) {
      console.log('JSON file already exists. Ignoring file creation.');
      return;
    }

    fs.mkdir(directoryPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Error creating directory:', err);
        return;
      }

      fs.writeFile(filePathWithFileName, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          console.error('Error creating JSON file:', err);
          return;
        }
        console.log('JSON file created successfully!');
      });
    });
  });
}


function deleteFileIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`${filePath} deleted successfully.`);
  } else {
    console.log(`${filePath} does not exist. Skipping deletion.`);
  }
}


async function sendRecoveryEmail(user, type, req) {
  return new Promise(async (resolve, reject) => {
    try {

      const web = await query(`SELECT * FROM web`, [])

      let transporter = nodemailer.createTransport({
        host: `${web[0].smtp_host}`,
        port: `${web[0].smtp_port}`,
        secure: web[0].smtp_port === "465" ? true : false, // true for 465, false for other ports
        auth: {
          user: `${web[0].smtp_email}`, // generated ethereal user
          pass: `${web[0].smtp_pass}`, // generated ethereal password
        },
      });

      const jsontoken = sign({ old_email: req.body.recovery_email, email: req.body.recovery_email, time: moment(new Date()), password: user.password, role: type }, process.env.JWTKEY, {
      })

      let info = await transporter.sendMail({
        from: `${web[0].app_name} <${web[0].smtp_email}>`, // sender address
        to: req.body.recovery_email, // list of receivers
        subject: "Password Recover", // Subject line
        html: `<html>
                                          <head>
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                                            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                                            <title>Simple Transactional Email</title>
                                            <style>
                                              /* -------------------------------------
                                                  GLOBAL RESETS
                                              ------------------------------------- */
                              
                                              /*All the styling goes here*/
                              
                                              img {
                                                border: none;
                                                -ms-interpolation-mode: bicubic;
                                                max-width: 100%; 
                                              }
                              
                                              body {
                                                background-color: #f6f6f6;
                                                font-family: sans-serif;
                                                -webkit-font-smoothing: antialiased;
                                                font-size: 14px;
                                                line-height: 1.4;
                                                margin: 0;
                                                padding: 0;
                                                -ms-text-size-adjust: 100%;
                                                -webkit-text-size-adjust: 100%; 
                                              }
                              
                                              table {
                                                border-collapse: separate;
                                                mso-table-lspace: 0pt;
                                                mso-table-rspace: 0pt;
                                                width: 100%; }
                                                table td {
                                                  font-family: sans-serif;
                                                  font-size: 14px;
                                                  vertical-align: top; 
                                              }
                              
                                              /* -------------------------------------
                                                  BODY & CONTAINER
                                              ------------------------------------- */
                              
                                              .body {
                                                background-color: #f6f6f6;
                                                width: 100%; 
                                              }
                              
                                              /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
                                              .container {
                                                display: block;
                                                margin: 0 auto !important;
                                                /* makes it centered */
                                                max-width: 580px;
                                                padding: 10px;
                                                width: 580px; 
                                              }
                              
                                              /* This should also be a block element, so that it will fill 100% of the .container */
                                              .content {
                                                box-sizing: border-box;
                                                display: block;
                                                margin: 0 auto;
                                                max-width: 580px;
                                                padding: 10px; 
                                              }
                              
                                              /* -------------------------------------
                                                  HEADER, FOOTER, MAIN
                                              ------------------------------------- */
                                              .main {
                                                background: #ffffff;
                                                border-radius: 3px;
                                                width: 100%; 
                                              }
                              
                                              .wrapper {
                                                box-sizing: border-box;
                                                padding: 20px; 
                                              }
                              
                                              .content-block {
                                                padding-bottom: 10px;
                                                padding-top: 10px;
                                              }
                              
                                              .footer {
                                                clear: both;
                                                margin-top: 10px;
                                                text-align: center;
                                                width: 100%; 
                                              }
                                                .footer td,
                                                .footer p,
                                                .footer span,
                                                .footer a {
                                                  color: #999999;
                                                  font-size: 12px;
                                                  text-align: center; 
                                              }
                              
                                              /* -------------------------------------
                                                  TYPOGRAPHY
                                              ------------------------------------- */
                                              h1,
                                              h2,
                                              h3,
                                              h4 {
                                                color: #000000;
                                                font-family: sans-serif;
                                                font-weight: 400;
                                                line-height: 1.4;
                                                margin: 0;
                                                margin-bottom: 30px; 
                                              }
                              
                                              h1 {
                                                font-size: 35px;
                                                font-weight: 300;
                                                text-align: center;
                                                text-transform: capitalize; 
                                              }
                              
                                              p,
                                              ul,
                                              ol {
                                                font-family: sans-serif;
                                                font-size: 14px;
                                                font-weight: normal;
                                                margin: 0;
                                                margin-bottom: 15px; 
                                              }
                                                p li,
                                                ul li,
                                                ol li {
                                                  list-style-position: inside;
                                                  margin-left: 5px; 
                                              }
                              
                                              a {
                                                color: #3498db;
                                                text-decoration: underline; 
                                              }
                              
                                              /* -------------------------------------
                                                  BUTTONS
                                              ------------------------------------- */
                                              .btn {
                                                box-sizing: border-box;
                                                width: 100%; }
                                                .btn > tbody > tr > td {
                                                  padding-bottom: 15px; }
                                                .btn table {
                                                  width: auto; 
                                              }
                                                .btn table td {
                                                  background-color: #ffffff;
                                                  border-radius: 5px;
                                                  text-align: center; 
                                              }
                                                .btn a {
                                                  background-color: #ffffff;
                                                  border: solid 1px #3498db;
                                                  border-radius: 5px;
                                                  box-sizing: border-box;
                                                  color: #3498db;
                                                  cursor: pointer;
                                                  display: inline-block;
                                                  font-size: 14px;
                                                  font-weight: bold;
                                                  margin: 0;
                                                  padding: 12px 25px;
                                                  text-decoration: none;
                                                  text-transform: capitalize; 
                                              }
                              
                                              .btn-primary table td {
                                                background-color: #3498db; 
                                              }
                              
                                              .btn-primary a {
                                                background-color: #3498db;
                                                border-color: #3498db;
                                                color: #ffffff; 
                                              }
                              
                                              /* -------------------------------------
                                                  OTHER STYLES THAT MIGHT BE USEFUL
                                              ------------------------------------- */
                                              .last {
                                                margin-bottom: 0; 
                                              }
                              
                                              .first {
                                                margin-top: 0; 
                                              }
                              
                                              .align-center {
                                                text-align: center; 
                                              }
                              
                                              .align-right {
                                                text-align: right; 
                                              }
                              
                                              .align-left {
                                                text-align: left; 
                                              }
                              
                                              .clear {
                                                clear: both; 
                                              }
                              
                                              .mt0 {
                                                margin-top: 0; 
                                              }
                              
                                              .mb0 {
                                                margin-bottom: 0; 
                                              }
                              
                                              .preheader {
                                                color: transparent;
                                                display: none;
                                                height: 0;
                                                max-height: 0;
                                                max-width: 0;
                                                opacity: 0;
                                                overflow: hidden;
                                                mso-hide: all;
                                                visibility: hidden;
                                                width: 0; 
                                              }
                              
                                              .powered-by a {
                                                text-decoration: none; 
                                              }
                              
                                              hr {
                                                border: 0;
                                                border-bottom: 1px solid #f6f6f6;
                                                margin: 20px 0; 
                                              }
                              
                                              /* -------------------------------------
                                                  RESPONSIVE AND MOBILE FRIENDLY STYLES
                                              ------------------------------------- */
                                              @media only screen and (max-width: 620px) {
                                                table.body h1 {
                                                  font-size: 28px !important;
                                                  margin-bottom: 10px !important; 
                                                }
                                                table.body p,
                                                table.body ul,
                                                table.body ol,
                                                table.body td,
                                                table.body span,
                                                table.body a {
                                                  font-size: 16px !important; 
                                                }
                                                table.body .wrapper,
                                                table.body .article {
                                                  padding: 10px !important; 
                                                }
                                                table.body .content {
                                                  padding: 0 !important; 
                                                }
                                                table.body .container {
                                                  padding: 0 !important;
                                                  width: 100% !important; 
                                                }
                                                table.body .main {
                                                  border-left-width: 0 !important;
                                                  border-radius: 0 !important;
                                                  border-right-width: 0 !important; 
                                                }
                                                table.body .btn table {
                                                  width: 100% !important; 
                                                }
                                                table.body .btn a {
                                                  width: 100% !important; 
                                                }
                                                table.body .img-responsive {
                                                  height: auto !important;
                                                  max-width: 100% !important;
                                                  width: auto !important; 
                                                }
                                              }
                              
                                              /* -------------------------------------
                                                  PRESERVE THESE STYLES IN THE HEAD
                                              ------------------------------------- */
                                              @media all {
                                                .ExternalClass {
                                                  width: 100%; 
                                                }
                                                .ExternalClass,
                                                .ExternalClass p,
                                                .ExternalClass span,
                                                .ExternalClass font,
                                                .ExternalClass td,
                                                .ExternalClass div {
                                                  line-height: 100%; 
                                                }
                                                .apple-link a {
                                                  color: inherit !important;
                                                  font-family: inherit !important;
                                                  font-size: inherit !important;
                                                  font-weight: inherit !important;
                                                  line-height: inherit !important;
                                                  text-decoration: none !important; 
                                                }
                                                #MessageViewBody a {
                                                  color: inherit;
                                                  text-decoration: none;
                                                  font-size: inherit;
                                                  font-family: inherit;
                                                  font-weight: inherit;
                                                  line-height: inherit;
                                                }
                                                .btn-primary table td:hover {
                                                  background-color: #34495e !important; 
                                                }
                                                .btn-primary a:hover {
                                                  background-color: #34495e !important;
                                                  border-color: #34495e !important; 
                                                } 
                                              }
                              
                                            </style>
                                          </head>
                                          <body>
                                            <span class="preheader">This is password recovery email from ${web[0].app_name}.</span>
                                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
                                              <tr>
                                                <td>&nbsp;</td>
                                                <td class="container">
                                                  <div class="content">
                              
                                                    <!-- START CENTERED WHITE CONTAINER -->
                                                    <table role="presentation" class="main">
                              
                                                      <!-- START MAIN CONTENT AREA -->
                                                      <tr>
                                                        <td class="wrapper">
                                                          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                              <td>
                                                                <p>Hi there,</p>
                                                                <p>Please click below button to recover your password.</p>
                                                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                                                                  <tbody>
                                                                    <tr>
                                                                      <td align="left">
                                                                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                                          <tbody>
                                                                            <tr>
                                                                              <td> <a style="cursor: pointer;" href=${req.headers.host + `/recovery-${type}/` + jsontoken} target="_blank">Click Here</a> </td>
                                                                            </tr>
                                                                          </tbody>
                                                                        </table>
                                                                      </td>
                                                                    </tr>
                                                                  </tbody>
                                                                </table>
                                                                <p>If the above button is not working please copy and paste this url link to your browser tab!</p>
                                                                <p>${req.headers.host + `/recovery-${type}/` + jsontoken}</p>
                                                                <p style="font-weight:bold" >Good luck!</p>
                                                              </td>
                                                            </tr>
                                                          </table>
                                                        </td>
                                                      </tr>
                              
                                                    <!-- END MAIN CONTENT AREA -->
                                                    </table>
                                                    <!-- END CENTERED WHITE CONTAINER -->
                              
                                                    <!-- START FOOTER -->
                                                    <div class="footer">
                                                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                          <td class="content-block powered-by">
                                                            Powered by <a href=${req.headers.host}>${web[0].app_name}</a>.
                                                          </td>
                                                        </tr>
                                                      </table>
                                                    </div>
                                                    <!-- END FOOTER -->
                              
                                                  </div>
                                                </td>
                                                <td>&nbsp;</td>
                                              </tr>
                                            </table>
                                          </body>
                                        </html>`, // html body
      });
      resolve()

    } catch (err) {
      reject(err)
    }
  })
}



function decreaseGptLimit(valuetoBeminus, uid) {
  return new Promise((resolve) => {
    try {


    } catch (error) {
      console.log("decreast was not done decreaseGptLimit", error)
      resolve()
    }
  })
}


const rzCapturePayment = (paymentId, amount, razorpayKey, razorpaySecret) => {
  const auth = 'Basic ' + Buffer.from(razorpayKey + ':' + razorpaySecret).toString('base64');

  return new Promise((resolve, reject) => {
    fetch(`https://api.razorpay.com/v1/payments/${paymentId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: amount }), // Replace with the actual amount to capture
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error('Error capturing payment:', data.error);
          reject(data.error);
        } else {
          console.log('Payment captured successfully:', data);
          resolve(data);
        }
      })
      .catch((error) => {
        console.error('Error capturing payment:', error);
        reject(error);
      });
  });
};


function createOrder(uid, payment_mode, amount, data) {
  return new Promise(async (resolve, reject) => {
    try {
      await query(`INSERT INTO orders (uid,payment_mode, amount, data) VALUES (?,?,?,?)`, [
        uid, payment_mode, amount, data
      ])

      resolve()

    } catch (err) {
      reject(err)
    }
  })
}

function generateImageName() {
  const timestamp = Date.now();
  const randomDigits = Math.floor(Math.random() * 90000) + 10000;
  return `${timestamp}_${randomDigits}`;
}

function createBlogPost(text) {
  const titleStartIndex = text.indexOf('Title:');
  const contentStartIndex = text.indexOf('Content:');

  let title, content;

  if (titleStartIndex !== -1 && contentStartIndex !== -1) {
    const titleEndIndex = contentStartIndex;
    const contentEndIndex = text.length;
    title = text.substring(titleStartIndex + 7, titleEndIndex).trim();
    content = text.substring(contentStartIndex + 9, contentEndIndex).trim();
  } else {
    title = text.slice(0, 15);
    content = text.slice(title.length).trim();
  }

  return { title, content };
}

function postToWordpress(user, post, categoryArr, postStatus) {
  return new Promise(async (resolve) => {
    try {
      const login = user.wp_email;
      const password = user.wp_token;
      const apiUrl = `${user.wp_domain}/wp-json/wp/v2/posts`;

      const auth = Buffer.from(`${login}:${password}`).toString('base64');

      const postData = {
        title: post.title?.replace(`""`, ""),
        status: postStatus,
        content: post.content,
        categories: categoryArr, // Replace with the category IDs
      };

      const sendPost = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      const respp = await sendPost.json()
      const postRes = { link: respp?.link || "", id: respp?.id || "", title: respp?.title?.rendered || "" }

      resolve({ success: true, postRes })

    } catch (err) {
      console.log(JSON.stringify(err), "postToWordpress")
      resolve({ success: false, postRes: {} })
    }
  })
}


function getAllCategory(domain) {
  return new Promise(async (resolve) => {
    try {

      if (!domain || !domain.startsWith('https://')) {
        console.error('Invalid domain');
        resolve({ category: [] })
        return
      }
      const response = await fetch(`${domain}/wp-json/wp/v2/categories`);
      const data = await response.json();


      // Process the categories data
      const categories = data.map(category => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      }));

      resolve(categories)

    } catch (error) {
      console.error('Error occurred while fetching categories:', error);
      resolve([])
    }
  })
}

function returnPost(topic, language, words) {
  console.log(topic, language, words);
  return new Promise(async (resolve) => {
    try {
      const api = await query(`SELECT * FROM apikeys`, []);
      const openAiApi = api[0].openai_keys;

      console.log({ openAiApi });

      const configuration = new Configuration({
        apiKey: openAiApi,
      });

      const prompt = `write a SEO friendly unique blog in ${words} words, topic is "${topic}" and language is "${language}". nothing write more than that write only title and content`;

      const openai = new OpenAIApi(configuration);



      const completion = await openai.createChatCompletion({
        model: process.env.OPENAIMODEL,
        messages: [{ role: 'user', content: prompt }]
      });

      const completion_text = completion?.data?.choices[0]?.message.content;


      resolve({ blog: completion_text, success: true });
    } catch (err) {
      console.log(JSON.stringify(err))
      resolve({ blog: "", success: false });
    }
  });
}

function checkWpAuth(user) {
  return new Promise(async (resolve) => {
    try {
      const login = user.wp_email
      const password = user.wp_token
      const apiUrl = `${user.wp_domain}/wp-json/wp/v2/posts`

      const auth = Buffer.from(`${login}:${password}`).toString('base64');

      // Usage example:
      const postData = {
        title: 'Test Post',
        status: 'publish',
        content: 'wordpress auth check post',
        // featured_media: 11, 
        // categories: [4, 3], 
      };


      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        console.log('Failed to add the post.');
        resolve({ success: false, msg: "Wordpress API credentials are inavlid" })
        return
      }

      const post = await response.json();
      const postId = post.id;

      const deleteResponse = await fetch(`${apiUrl}/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });

      if (!deleteResponse.ok) {
        console.log('Failed to delete the post.');
        resolve({ success: false, msg: "Wordpress API credentials are inavlid" })
        return
      }

      console.log('Post added and deleted successfully.');
      resolve({ success: true, msg: "taks done ji" })

    } catch (err) {
      console.log(err)
      resolve({ success: false, msg: "Something went wrong, checkWpAuth" })
    }
  })

}

function getUserPlan(uid) {
  return new Promise(async (resolve) => {
    const getUser = await query(`SELECT * FROM user WHERE uid = ?`, [uid])
    const plan = getUser[0]?.plan ? JSON.parse(getUser[0].plan) : {}
    resolve(plan)
  })
}

async function downloadImages(images) {
  return new Promise(async (resolve) => {
    const downloadedImages = [];

    for (const image of images) {
      const url = image.url;
      const extension = ".png"
      const imageName = generateImageName() + extension;
      const dirName = process.cwd();
      const imagePath = path.join(`${dirName}/client/public/aiimages/${imageName}`);

      try {
        const response = await fetch(url);
        const buffer = await response.buffer();

        fs.writeFileSync(imagePath, buffer);

        downloadedImages.push({ dataUrl: url, imageName });
      } catch (error) {
        console.error(`Error downloading image: ${url}`, error);
      }
    }

    resolve(downloadedImages);
  });
}

function parseDimensions(dimensionsString) {
  const [width, height] = dimensionsString.split('x').map(Number);
  return { width, height };
}


const generateImage = (token, prompt, width, height, numofImg) => {
  const url = 'https://cloud.leonardo.ai/api/rest/v1/generations';
  const accessToken = token;

  const data = {
    prompt: prompt,
    // modelId: '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3',
    width: width,
    height: height,
    num_images: numofImg || 1
  };

  const headers = {
    'accept': 'application/json',
    'content-type': 'application/json',
    'authorization': `Bearer ${accessToken}`
  };

  return new Promise((resolve, reject) => {
    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(result => resolve(result))
      .catch(error => reject(error));
  });
};

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

function leonardoAiImage(prompt, plan, numofImg) {

  return new Promise(async (resolve) => {
    try {

      const dataGen = await generateImage(process.env.LEONARDO, prompt, parseDimensions(plan?.dalle_size || "256x256").width,
        parseDimensions(plan?.dalle_size || "256x256").height, numofImg)

      if (!dataGen.sdGenerationJob.generationId) {
        resolve({ success: false, msg: "Please check your settings" })
        return
      }

      const genID = dataGen.sdGenerationJob.generationId

      await delay(5000);

      const url = `https://cloud.leonardo.ai/api/rest/v1/generations/${genID}`;
      const accessToken = '174c09a1-f0e2-449b-9748-9ccadc4cf082';

      const headers = {
        'accept': 'application/json',
        'authorization': `Bearer ${accessToken}`
      };

      const response = await fetch(url, {
        headers
      });


      const data = await response.json();

      if (typeof (data.generations_by_pk) === 'object') {
        // console.log("came here", data.generations_by_pk.generated_images)
        resolve({ success: true, data: data.generations_by_pk.generated_images })
      } else {
        // console.log("gone there")
        resolve({ success: false, msg: "Leonardo API issue" })
      }



    } catch (err) {
      console.log(JSON.stringify(err.message))
      resolve({ success: false, err, msg: "error, openAiImage" })
    }
  })
}

function openAiImage(prompt, plan, numofImg) {
  return new Promise(async (resolve) => {
    try {

      const api = await query(`SELECT * FROM apikeys`, [])

      console.log({
        keys: api[0].openai_keys
      })

      console.log({
        prompt: prompt,
        n: parseInt(numofImg) || 1,
        size: plan?.dalle_size || "256x256",
      })


      const configuration = new Configuration({
        apiKey: api[0].openai_keys,
      });

      const openai = new OpenAIApi(configuration);


      const response = await openai.createImage({
        prompt: prompt,
        n: parseInt(numofImg) || 1,
        size: plan?.dalle_size || "256x256",
      })


      const rec = response.data?.data

      resolve({ success: true, data: rec })

    } catch (err) {
      console.log(JSON.stringify(err.message))
      resolve({ success: false, err, msg: "error, openAiImage" })
    }
  })
}

function getWordCount(sentence) {
  // Remove leading and trailing whitespace
  sentence = sentence.trim();

  // Split the sentence by whitespace and count the resulting array length
  const words = sentence.split(/\s+/);
  return words.length;
}

function createPathAndFileIfNotExists(filePath) {
  return new Promise((resolve, reject) => {
    const directoryPath = path.dirname(filePath);

    fs.mkdir(directoryPath, { recursive: true }, (err) => {
      if (err && err.code !== 'EEXIST') {
        reject(err); // Reject with the error if directory creation fails
      } else {
        fs.writeFile(filePath, '[]', { flag: 'wx' }, (error) => {
          if (error && error.code !== 'EEXIST') {
            reject(error); // Reject with the error if file creation fails
          } else {
            resolve(); // Resolve if file is successfully created or already exists
          }
        });
      }
    });
  });
}

function pushObjectToArrayAndDeleteOld(filePath, newObject) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err); // Reject with the error if reading the file fails
        return;
      }

      let json;
      try {
        json = JSON.parse(data);
      } catch (error) {
        reject(error); // Reject if the file content is not valid JSON
        return;
      }

      if (!Array.isArray(json)) {
        reject(new Error('File does not contain an array')); // Reject if the JSON is not an array
        return;
      }

      json.push(newObject); // Push the new object into the array

      if (json.length > 30) {
        json = json.slice(-30); // Keep the last 30 objects
      }

      const updatedJson = JSON.stringify(json, null, 2);

      fs.writeFile(filePath, updatedJson, 'utf8', (error) => {
        if (error) {
          reject(error); // Reject with the error if writing to the file fails
        } else {
          resolve(); // Resolve if the object is successfully pushed and old objects are deleted
        }
      });
    });
  });
}


function readJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        const jsonData = JSON.parse(data);
        // const lastThreeElements = jsonData.slice(-3);
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    });
  });
}


function openAiText(filePath, question) {
  return new Promise(async (resolve, reject) => {
    try {
      await createPathAndFileIfNotExists(filePath)

      const pushQue = { role: "user", content: question }
      await pushObjectToArrayAndDeleteOld(filePath, pushQue)

      const api = await query(`SELECT * FROM apikeys`, [])
      const openAiApi = api[0].openai_keys

      const configuration = new Configuration({
        apiKey: openAiApi
      });

      const openai = new OpenAIApi(configuration);

      const data = await readJsonFile(filePath)


      const completion = await openai.createChatCompletion({
        model: process.env.OPENAIMODEL,
        messages: data,
      });

      console.log(JSON.stringify({ res: completion?.data }))

      const completion_text = completion?.data?.choices[0]?.message.content;

      console.log(JSON.stringify(completion_text))

      const pushAns = { role: "assistant", content: completion_text || "" }
      await pushObjectToArrayAndDeleteOld(filePath, pushAns)

      resolve({ reply: completion_text || "", success: true })

    } catch (err) {
      console.log(JSON.stringify(err))
      reject({ msg: "OpenAi error, openAiText", err, reply: "" })
    }
  })
}

function encodeObject(obj) {
  const jsonString = JSON.stringify(obj);
  const base64String = Buffer.from(jsonString).toString('base64');
  return base64String;
}

function decodeObject(encodedString) {
  const jsonString = Buffer.from(encodedString, 'base64').toString();
  const obj = JSON.parse(jsonString);
  return obj;
}

function removeFileIfExists(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        // File does not exist, resolve without doing anything
        resolve();
      } else {
        // File exists, attempt to remove it
        fs.unlink(filePath, (error) => {
          if (error) {
            reject(error);  // Reject with the error if deletion fails
          } else {
            resolve();  // Resolve if file is successfully removed
          }
        });
      }
    });
  });
}


function doesFileExist(filePath) {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function addDaysToToday(days) {
  const today = new Date();
  const targetDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');
  const seconds = String(targetDate.getSeconds()).padStart(2, '0');

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}


function updatePlan(uid, plan) {

  return new Promise(async (resolve, reject) => {
    try {

      const plann = JSON.parse(plan)

      if (plann.dalle_size === "250x250") {
        plann.dalle_size = "256x256"
        console.log("yao")
      }

      console.log({ tulli: plann.dalle_size })
      const days = addDaysToToday(plann.planexpire)

      await query(`UPDATE user SET plan = ?,
            planexpire =?,
            gpt_words_limit=?,
            dalle_limit=?,
            tts_words_limit=?
            WHERE uid = ?
            `, [
        JSON.stringify(plann),
        days,
        JSON.parse(plan).gpt_words_limit || 0,
        JSON.parse(plan).dalle_limit || 0,
        JSON.parse(plan).tts_words_limit || 0,
        uid
      ])
      resolve(true)
    } catch (err) {
      reject(err)
    }
  })
}

function daysDiff(dateString) {
  if (!dateString) return 0
  const targetDate = new Date(dateString);
  const currentDate = new Date();
  const timeDifference = targetDate.getTime() - currentDate.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  if (daysDifference < 0) {
    return 0;
  } else {
    return daysDifference;
  }
}


export { updatePlan, leonardoAiImage, decreaseGptLimit, createJsonFile, createJsonFileEmbed, deleteFileIfExists, sendRecoveryEmail, rzCapturePayment, createOrder, openAiText, readJsonFile, createBlogPost, postToWordpress, getAllCategory, returnPost, checkWpAuth, getUserPlan, downloadImages, encodeObject, openAiImage, getWordCount, removeFileIfExists, daysDiff, doesFileExist, decodeObject }