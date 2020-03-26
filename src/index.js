import 'dotenv/config';
import request from'request';
import http from 'http';
import express from 'express';
import puppeteer from 'puppeteer'
import _ from 'lodash'

//puppeteer

let stooqUrl = 'https://stooq.pl/t/?i=59&v=0'

let bitbayUrl = 'https://bitbay.net/pl/kurs-walut'

let update_pairs = {};

(async function main() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const [page] = await browser.pages();

    await page.goto(stooqUrl);
    await page.exposeFunction('puppeteerMutationListener', puppeteerMutationListener);
    await page.exposeFunction('logMe', logMe)
    await page.evaluate(() => {
      const targets = document.querySelectorAll('#f13 span[id*=_c]');

      targets.forEach((target) => {
        puppeteerMutationListener(
          target.id.substr(3, 6).toUpperCase(),
          target.textContent,
        )
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation)=> {
          window.puppeteerMutationListener(
            mutation.target.id.substr(3, 6).toUpperCase(),
            mutation.addedNodes[0].textContent,
          );
        })
      });
      observer.observe(target,{ childList: true });
      })

    });
  } catch (err) {
    console.error(err);
  }
})();


(async function main2() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const [page] = await browser.pages();
    
    await page.goto(bitbayUrl);
    await page.exposeFunction('puppeteerMutationListener', puppeteerMutationListener);

    await page.evaluate(() => {
      const plneth = document.querySelector('.ETH-PLN .currency-table__price.number-format');
      const plnltc = document.querySelector('.LTC-PLN .currency-table__price.number-format');
      const plnxrp = document.querySelector('.XRP-PLN .currency-table__price.number-format');
      const plnbcc = document.querySelector('.BCC-PLN .currency-table__price.number-format');

      puppeteerMutationListener("PLNETH", 1 / parseFloat(plneth.textContent))
      puppeteerMutationListener("PLNLTC", 1 / parseFloat(plnltc.textContent))
      puppeteerMutationListener("PLNXRP", 1 / parseFloat(plnxrp.textContent))
      puppeteerMutationListener("PLNBCC", 1 / parseFloat(plnbcc.textContent))
      
      const observer = new MutationObserver(mutationsList => mutationsList.forEach(mutation => {
        window.puppeteerMutationListener("PLNETH", 1 / parseFloat(plneth.textContent))
        window.puppeteerMutationListener("PLNLTC", 1 / parseFloat(plnltc.textContent))
        window.puppeteerMutationListener("PLNXRP", 1 / parseFloat(plnxrp.textContent))
        window.puppeteerMutationListener("PLNBCC", 1 / parseFloat(plnbcc.textContent))
        }))
      observer.observe(plneth, { childList: true });
      
    })

  } catch (err) {
    console.error(err);
  }
})();


(async function main3() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const [page] = await browser.pages();
    
    await page.goto("https://pl.valutafx.com/PLN-AED.htm");
    await page.exposeFunction('puppeteerMutationListener', puppeteerMutationListener);

    await page.evaluate(() => {
      const plnaed = document.querySelector('.rate-value')

      puppeteerMutationListener("PLNAED", plnaed.textContent.replace(/,/g,'.'))
      
      const observer = new MutationObserver(mutationsList => mutationsList.forEach(mutation => {
        window.puppeteerMutationListener("PLNAED", plnaed.textContent.replace(/,/g,'.'))
        }))
      observer.observe(plnaed, { childList: true });
      
    })

  } catch (err) {
    console.error(err);
  }
})();

function logMe(id) {
  console.log('logged: ', id)
}

function puppeteerMutationListener(id, newv) {
  if (update_pairs.id) {
    update_pairs.id = newv
  } else { 
    update_pairs = {...update_pairs, [id]:newv}
  }
}


//server
let app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

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
