const fs = require('fs');
const https = require('https');
const XLSX = require("xlsx");

const options = {
          headers: {
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'
          }
        };
 
    const wb = XLSX.readFile(`${__dirname}/Addresses&urls.xlsx`);
    const ws = wb.Sheets[wb.SheetNames[0]];
    ws["!cols"] = [{wch: 3}, {wch: 25}, {wch: 25},{wch: 7},{wch: 7}, {wch: 11},{wch: 11}, {wch: 8}];
    const ss = XLSX.utils.decode_range(ws['!ref']);
    const addressArray = XLSX.utils.sheet_to_json(ws, {header:"A"}).slice(12,14);
    const outputFilename = __dirname+'/Report' + formatDate()+'.xlsx';
    XLSX.utils.sheet_add_aoa(ws, [['R est', 'Z est', 'Z rent']], { origin: "F1" });


main()
.catch((error)=>console.error(error));  
console.log('------------------');

async function main() {
   
   for await (const addr of addressArray) {
        console.log(addr.F);                    // urlR
        await delay(60000*Math.random());
        addr.rEst = await httpGet(addr.F);
        console.log(addr.rEst);
        await delay(60000*Math.random());
        addr.zEst = await httpGet(addr.G);       // urlZ
        console.log(addr.zEst);
        console.log(JSON.stringify(addr));
   }
    writeReport();
    console.log('xxxxxxxxxxxxxx');      
}    

function writeReport() {
    for (const addr of addressArray) {
        let i = 1;
        while( i<=ss.e.r) {
            let cell = ws[XLSX.utils.encode_cell({r:i, c:1})];         //
            if ((cell) && (addr.B==cell.v)) {                   // street
                        
                let newVals = [addr.rEst, addr.zEst[0],addr.zEst[1]];                        
                XLSX.utils.sheet_add_aoa(ws, [newVals], 
                            { origin: XLSX.utils.encode_cell({r:i, c:5}) });

                for (let j=0; j<3; j++) {
                    let c = ws[XLSX.utils.encode_cell({r:i, c:5+j})]; 
                    if (c.v.slice(0, 1)=='$') {
                        c.v = +c.v.replace(/\$|,/g, "");
                        c.z = '$ #,###';
                        c.t = 'n';
                    }
                }
                i = ss.e.r;        
            }            
            i++;        
        }    
    }   
    XLSX.writeFile(wb, outputFilename);    
}

/*
{"A":7,"B":"3048 Yankee Clipper Drive","C":"Las Vegas, NV  89117",
"F":"https://www.redfin.com/NV/Las-Vegas/3048-Yankee-Clipper-Dr-89117/home/29533798",
"G":"https://www.zillow.com/homes/7115964_zpid/","rEst":"$495,955","zEst":["$519,700","$2,122"]}
*/


function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
//          return null;
      }

function formatDate() {      
      return (new Date()).toJSON().slice(0,10);
}
      