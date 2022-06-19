const fs = require('fs');
const https = require('https');
const XLSX = require("xlsx");

const options = {
          headers: {
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'
          }
        };
    
    
    
    const addressArray = [];  
    const wb = XLSX.readFile(`${__dirname}/Addresses.xlsx`);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const ss = XLSX.utils.decode_range(ws['!ref']);
    
    for (let i=5; i<=8; i++){        //ss.e.r        взял 4 объекта для примера                
        let addr = {};
        let cell = ws[XLSX.utils.encode_cell({r:i, c:1})];
        if (cell) {
            addr.street = cell.v;
            addr.cityStateZip = ws[XLSX.utils.encode_cell({r:i, c:2})].v;
            addr.rId = ws[XLSX.utils.encode_cell({r:i, c:6})].v;
            addr.zId = ws[XLSX.utils.encode_cell({r:i, c:8})].v;
            let state = addr.cityStateZip.match(/, ([A-Z]{2})/)[1];
            addr.urlR = 'https://www.redfin.com'+'/'+state+'/home/'+addr.rId;
            addr.urlZ = 'https://www.zillow.com/homes/'+addr.zId+'_zpid/';
            addr.rEst = '';
            addr.zEst = ['', ''];
            addressArray.push(addr);
    
        }
    }


main1()                                 //пробую по-всякому
//.then(function(result) {
//        finish(result);
 //   })
//.then((response) => {XLSX.writeFile(wb, `${__dirname}/Addresses1.xlsx`);})          <------ эту запись выходного файла никуда не могу присунуть
.catch((error)=>console.error(error));    

/*
(async () => {                                    и тут
        let response = await main1();
        console.log(response);
      })();
*/

//main();                                         и тут
async function main() {
        await main1();
        console.log('xxxxxxxxxxxxxx');
}

 function finish(res) {
//        await delay(100);
//        XLSX.writeFile(wb, `${__dirname}/Addresses1.xlsx`);
        console.log(res, 'Addresses1.xlsx ready');    
}

async function main1() {      // тут все асинк запросы и вычисления

   addressArray.forEach(async (addr) => {
        console.log(addr.urlR);
        addr.urlR = await reUrl(addr.urlR);
        await delay(60000*Math.random());                   // задержки, чтобы не спалиться на сервере
        console.log(addr.urlR);
        addr.rEst = await httpGet(addr.urlR);
        console.log(addr.rEst);
        await delay(60000*Math.random());
        addr.zEst = await httpGet(addr.urlZ);
        console.log(addr.zEst);
        console.log(JSON.stringify(addr));
        addToExcel(ws, addr);
   });

    
 //.then(() => XLSX.writeFile(wb, `${__dirname}/Addresses1.xlsx`)); 
// .then(() => console.log('xxxxxxxxxxxxxx'));

}    

function addToExcel(ws, addr) {
    let i = 2;
    while(i<=ss.e.r) {
        let cell = ws[XLSX.utils.encode_cell({r:i-1, c:6})];
        if(cell) {
                if (addr.rId==cell.v) {
                        let newVals = [addr.rEst,,addr.zEst[0],,addr.zEst[1]];                        
                        XLSX.utils.sheet_add_aoa(ws, [newVals], { origin: "K"+i });
                        return;
                }
        }
        i++;        
    }    
}



console.log('------------------');
//-----------------------------------


function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }


//-------------------------------------------------------------

async function reUrl (url) {
        return new Promise((resolve, reject) => {
            https.get(url, options, response => {
                if (response.statusCode==301) {
                        url = url.slice(0,22) + response.headers.location;
                        resolve(url); 
                }                    
            });
        });
    }
//---------------------------------------------
async function httpGet(url) {
        return new Promise((resolve, reject) => {
            https.get(url, options, response => {
                const method = url[12]; 
                response.setEncoding('utf8');
                let body = '';

                response.on('data', (chunk) => {                                
                        body += chunk;
//                        console.log(`BODY: ${chunk.slice(0, 20)}`); 
                }); 

                response.on('end', () => {
//                        console.log('No more data in response.');
                        parsed = parseBody(body, method);
                        resolve(parsed);                     
                });
            });
        });
    }
//---------------------------------------------

      
      function parseBody(body, method) {
        let s;
        let z=[];
          switch(method) {
              case 'r': 
                s = body.match(/value is (\$\d+,\d+(,\d+)*)/);
                if(s) return s[1];
              case 'z': 
                  s = body.match(/The Zestimate for this house is (\$\d+,\d+(,\d+)*)/);
                  if (!s) s = body.match(/Home Value: (\$\d+,\d+(,\d+)*)/); 
                  if (s) z[0] = s[1];
                  s = body.match(/The Rent Zestimate for this home is (\$\d+,\d+(,\d+)*)/);
                  if (s) z[1] = s[1];
                  if (z[0]||z[1]) return z;
          }

      }
      
