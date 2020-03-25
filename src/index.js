import 'dotenv/config';
import request from'request';
import http from 'http';
import express from 'express';
import puppeteer from 'puppeteer'
import _ from 'lodash'

//puppeteer

let stooqUrl = 'https://stooq.pl/t/?i=59&v=0';

let update_pairs = {};

(async function main() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const [page] = await browser.pages();
    await page.goto(stooqUrl);

    page.exposeFunction('puppeteerMutationListener', puppeteerMutationListener);

    await page.evaluate(() => {
      //const target = document.querySelector('#f13 span[id*=_c]')
      const targets = document.querySelectorAll('#f13 span[id*=_c]');
      targets.forEach((target) => {
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation)=> {
          window.puppeteerMutationListener(
            mutation.target.id.substr(3, 6).toUpperCase(),
            mutation.addedNodes[0].textContent,
          );
        })
      });
      
        observer.observe(
          target,
          { childList: true },
      );
      
      })

    });
  } catch (err) {
    console.error(err);
  }
})();

function puppeteerMutationListener(id, newv) {
  if (update_pairs.id) {
    update_pairs.id = newv
  } else { 
    update_pairs = {...update_pairs, [id]:newv}
  }
}


//server
let app = express();
app.server = http.createServer(app);

app.get("/", (req, res) => {
  console.log("Working: ");
  console.log("req: ", req);
  res.send("working!");
});

app.get("/mainpairs.json", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(update_pairs));
});



app.server.listen(3301, () => {
  console.log(`Started on port ${app.server.address().port}`);
});
