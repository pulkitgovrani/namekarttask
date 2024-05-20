const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/scrape', async (req, res) => {
    const { username,companyName } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });
      
        // Wait for the follower count element to be visible
        await page.waitForSelector('header section ul li:nth-child(2) span');
      
        // Extract the follower count
        const followers = await page.evaluate(() => {
          const followersText = document.querySelector('header section ul li:nth-child(2) span').getAttribute('title');
          return followersText;
        });
      
        const profileData = await page.evaluate(() => {
            const followingsCount = document.querySelector('header section ul li:nth-child(3) span').textContent.replace(/,/g, '');
            const followersCount = document.querySelector('header section ul li:nth-child(2) span').getAttribute('title').replace(/,/g, '');
            const postsCount = document.querySelector('header section ul li:nth-child(1) span').textContent.replace(/,/g, '');
            const usernamePictureUrl = document.querySelector('header img').getAttribute('src');
            const bio = document.querySelector('header section div span') ? document.querySelector('header section div span').textContent : '';
            const bioUrl = document.querySelector('header section div a') ? document.querySelector('header section div a').getAttribute('href') : '';
            const bioUrlDisplay = document.querySelector('header section div a') ? document.querySelector('header section div a').textContent : '';

            const recentPosts = [];
            document.querySelectorAll('article div div div div a').forEach(post => {
                const postUrl = `https://www.instagram.com${post.getAttribute('href')}`;
                const postImage = post.querySelector('img').getAttribute('src');
                recentPosts.push({ url: postUrl, image: postImage });
            });
            console.log(`The user ${username} has ${followersCount} followers`);
            return {
                followings_count: followingsCount,
                followers_count: followersCount,
                posts_count: postsCount,
                username_picture_url: usernamePictureUrl,
                bio: bio,
                bio_url: bioUrl,
                bio_url_display: bioUrlDisplay,
                recent_posts: recentPosts
            };
        });
     
       // LinkedIn scraping
       //console.log("Is linkedinpage loaded");
       await page.goto(`https://www.linkedin.com/company/${companyName}/`, { waitUntil: 'networkidle2' });
  
       // Check if the company exists
       const isCompanyNotFound = await page.evaluate(() => {
           return document.title.includes('LinkedIn: Log In or Sign Up');
       });

       if (isCompanyNotFound) {
           await browser.close();
           return res.status(404).json({ error: 'LinkedIn company profile does not exist or requires login!' });
       }
       
       // Extract LinkedIn company data
       const linkedInData = await page.evaluate(() => {
           const employeesCountElement = document.querySelector('.org-top-card-summary-info-list__info-item');
           const employeesCount = employeesCountElement ? employeesCountElement.textContent.trim().split(' ')[0] : 'N/A';
           return {
               employees_count: employeesCount
           };
       });
        // Close the browser
        //await browser.close();
        console.log(linkedInData);
        res.json({ ...profileData, ...linkedInData });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while scraping data' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
