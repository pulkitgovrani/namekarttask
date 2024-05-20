const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const app = express();
app.use(bodyParser.json());
app.use(cors());
const LINKEDIN_LOGIN_URL =
  "https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin";
const COMPANY_URL = "https://www.linkedin.com/company/";
const getEmailAndPassword = () => {
  return {
    email: "pulkitgovrani@gmail.com", // Replace with your LinkedIn email
    password: "useyourpassword", // Replace with your LinkedIn password
  };
};
app.post("/scrape", async (req, res) => {
  const { email, password } = getEmailAndPassword();
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2",
    });

    // Wait for the follower count element to be visible
    await page.waitForSelector("header section ul li:nth-child(2) span");

    // Extract the follower count
    /*const followers = await page.evaluate(() => {
          const followersText = document.querySelector('header section ul li:nth-child(2) span').getAttribute('title');
          return followersText;
        });*/

    const profileData = await page.evaluate(() => {
      const followingsCount = document
        .querySelector("header section ul li:nth-child(3) span")
        .textContent.replace(/,/g, "");
      const followersCount = document
        .querySelector("header section ul li:nth-child(2) span")
        .getAttribute("title")
        .replace(/,/g, "");
      const bio = document.querySelector("header section div span")
        ? document.querySelector("header section div span").textContent
        : "";

      return {
        followings_count: followingsCount,
        followers_count: followersCount,
        bio: bio,
      };
    });
    console.log(profileData);
    //res.json({...profileData});
    // LinkedIn scraping

    // Login to LinkedIn
    await page.goto(LINKEDIN_LOGIN_URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#username");
    await page.type("#username", email);
    await page.waitForSelector("#password");
    await page.type("#password", password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    // Navigate to the company page
    const companyPageUrl = `${COMPANY_URL}${username}/about`;
    await page.goto(companyPageUrl, { waitUntil: "domcontentloaded" });

    // Wait for the relevant content to load
    await page.waitForSelector(".application-outlet");

    // Extract the number of employees using Cheerio
    const content = await page.content();
    const $ = cheerio.load(content);
    const employeeCountText = $(`dt:contains("Company size")`)
      .next("dd")
      .text()
      .trim();
    const associatedEmployees = $(`dt:contains("Company size")`)
      .next("dd")
      .next("dd")
      .find("a")
      .text()
      .trim()
      .trim();
    console.log(`Number of employees at ${username}: ${employeeCountText}`);
    console.log(`Associated Employees at ${username}: ${associatedEmployees}`);
    await browser.close();
    res.json({ ...profileData,employeeCountText, associatedEmployees });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while scraping data" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
