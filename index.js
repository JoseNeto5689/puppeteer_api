const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

const puppeteer = require("puppeteer")

dotenv.config()

const port = process.env.PORT || 3000

const app = express()
app.use(express.json())

app.get("/", (req, res) => {
  res.send("...")
})

app.get("/link/?query", async (req, res) => {
  let browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });
  const {query} = req.params
  const baseUrl = "https://music.youtube.com/search?q=" + query
  const [page] = await browser.pages();
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
  await page.setUserAgent(ua);
  await page.goto(baseUrl, {waitUntil: "domcontentloaded"});
  /*
  const element = await page.waitForSelector("#yDmH0d > c-wiz > div > div > div > div.v2Yske > div.CqMh6b > div.qqtRac > div.KZ9vpc > form:nth-child(3) > div > div > button > div.VfPpkd-RLmnJb")
      await element.evaluate(b => b.click())
  */
  let pos = 1

  while(true) {
    const text = await page.waitForSelector("#chips > ytmusic-chip-cloud-chip-renderer:nth-child(" + pos +") > div > a > yt-formatted-string")
    const textContent = await text?.evaluate(el => el.innerText);
    if(textContent === "Músicas" || textContent === "Música" || textContent === "Musics" || textContent === "Songs") {
      break
    }
    pos++
  }

  await Promise.all([
    page.waitForNavigation(),
    page.click('#chips > ytmusic-chip-cloud-chip-renderer:nth-child('+ pos +') > div')
  ])

  const link = await page.waitForSelector("#contents > ytmusic-responsive-list-item-renderer:nth-child(1) > div.flex-columns.style-scope.ytmusic-responsive-list-item-renderer > div.title-column.style-scope.ytmusic-responsive-list-item-renderer > yt-formatted-string > a")

  const fullLink = await link?.evaluate(el => el.href);

  res.json({msg: fullLink})
})

app.get("/recommendation/?id", async (req, res) => {
  let browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  });
  const baseUrl = "https://music.youtube.com/watch?v=" + req.params.id
  const [page] = await browser.pages();
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36";
  await page.setUserAgent(ua);
  await page.goto(baseUrl, {waitUntil: "domcontentloaded"});
  
  /*
  const element = await page.waitForSelector("#yDmH0d > c-wiz > div > div > div > div.v2Yske > div.CqMh6b > div.qqtRac > div.KZ9vpc > form:nth-child(3) > div > div > button > div.VfPpkd-RLmnJb")
  await element.evaluate(b => b.click())
  */

  /*
  const button = await page.waitForSelector("#tabsContent > tp-yt-paper-tab:nth-child(4)")
  await button.evaluate(b => b.click())
  const link = await page.waitForSelector("#items > ytmusic-responsive-list-item-renderer:nth-child(1) > div.flex-columns.style-scope.ytmusic-responsive-list-item-renderer > div.title-column.style-scope.ytmusic-responsive-list-item-renderer > yt-formatted-string > a")
  const fullTitle = await link?.evaluate(el => el.href);
  */

  const button = await page.waitForSelector("#automix-contents > ytmusic-player-queue-item:nth-child(1) #play-button > div > yt-icon")

  await Promise.all([
    button.evaluate(el => el.click())
  ])

  let fullTitle = await page.url();

  await browser.close();

  fullTitle = fullTitle.split("&list=")[0]

  res.json({msg: fullTitle})
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})