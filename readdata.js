const fs = require('fs');
const https = require('https');
const XLSX = require("xlsx");

const options = {
          headers: {
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'
          }
        };
    
    
    //const baseUrl = 'https://www.redfin.com';
    
    //const sites = [{}];
    const addressArray = [];   //xparse(`${__dirname}/Addresses.xlsx`);
    const wb = XLSX.readFile(`${__dirname}/Addresses.xlsx`);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const ss = XLSX.utils.decode_range(ws['!ref']);
    
    for (let i=5; i<=8; i++){        //ss.e.r  
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
    //     console.log(JSON.stringify(addr));
        }
    }

//let sss = parseBody('kwdjo[dw] value is $354,588 f]-wf- huiohef', 'r');

//addressArray.forEach(addr => {
//        let s = reUrl(addr.urlR);
//        addr.urlR = s});


let searchIndex = 3;    

const addr = addressArray[searchIndex];

main1()
//.then(function(result) {
//        finish(result);
 //   })
//.then((response) => {XLSX.writeFile(wb, `${__dirname}/Addresses1.xlsx`);})
.catch((error)=>console.error(error));    

/*
(async () => {
        let response = await main1();
        console.log(response);
      })();
*/

//main();
async function main() {
        await main1();
        console.log('xxxxxxxxxxxxxx');
}

 function finish(res) {
//        await delay(100);
//        XLSX.writeFile(wb, `${__dirname}/Addresses1.xlsx`);
        console.log(res, 'Addresses1.xlsx ready');    
}

async function main1() {
//   (async() => {     
   addressArray.forEach(async (addr) => {
        console.log(addr.urlR);
        addr.urlR = await reUrl(addr.urlR);
        await delay(60000*Math.random());
        console.log(addr.urlR);
        addr.rEst = await httpGet(addr.urlR);
        console.log(addr.rEst);
        await delay(60000*Math.random());
        addr.zEst = await httpGet(addr.urlZ);
        console.log(addr.zEst);
        console.log(JSON.stringify(addr));
        addToExcel(ws, addr);
   });
//})()  

        setTimeout(function(){
        console.log('xxxxxxxxxxxxxx');      
//          resolve("done");
        }, 100);
    
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

function writeExcel(wb, fileName) {
 //       let wb = XLSX.utils.book_new(); 
 //       let ws = XLSX.utils.aoa_to_sheet(data); 
 //       XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
 return new Promise(resolve => setTimeout(() => {
        XLSX.writeFile(wb, fileName);
        console.log(`${fileName} ready`);
        resolve;}, 0));       
    }

//reUrl(addr.urlR).then(console.log);

console.log('------------------');
//-----------------------------------
function getget1(url) {
        
        let req = https.get(url, options, (res) => {
                let method = url[12]; 
                console.log('statusCode:', res.statusCode);
                console.log('url:', url);
                if (res.statusCode==301) {
                url = url.slice(0,22) + res.headers.location;
                } else if (res.statusCode==200) {
                                    console.log('statusCode:', res.statusCode);
                                    res.on('data', (chunk) => {
                                        let parsed = parseBody(chunk.toString(), method);
                                        
                                        console.log(`BODY: ${chunk.slice(0, 20)}`); 
                                        if(parsed) {
                                            console.log('Estimate: ', parsed);
                                            
                                            if(method=='r') {
                                                addressArray[searchIndex].rEst = parsed;
                                                url = addressArray[searchIndex].urlZ;
                                            } else {
                                                addressArray[searchIndex].zEst = parsed;
                                                if (searchIndex<addressArray.length) {
                                                        searchIndex++;
                                                        url = addressArray[searchIndex].urlR;
                                                } else {
                                                        console.log('end');
                                                        return;
                                                }        
                                            }

 //                                          req.destroy(); 
                                        }             
                                    });
                                    res.on('end', () => {
                                        console.log('No more data in response.');
                                        
                                        return ;
                                       
                                      });
                                }  else throw new Error("Unknown code");

  getget(url);
  

}).on('error', (e) => {
  console.error(e);
});}
//-------------------------------------

function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

function getget(url) {
        
        let req = https.get(url, options, (res) => {
                let method = url[12]; 
                console.log('url:', url);
                console.log('statusCode:', res.statusCode);
                if (res.statusCode==301) {
                url = url.slice(0,22) + res.headers.location;
                } else if (res.statusCode==200) {
                        let parsed;
                        let body = '';


                        if(method=='r') {
                                url = addressArray[searchIndex].urlZ;
                            } else {
                                searchIndex++;
                                if (searchIndex<addressArray.length) {
                                        url = addressArray[searchIndex].urlR;
                                } else {
                                        console.log('end');
                                        return;
                                }        
                            }


/*
                        res.on('data', (chunk) => {
                                
                                body += chunk;
                                console.log(`BODY: ${chunk.slice(0, 20)}`); 
                        });      
*/

        /*                
                        res.on('end', () => {
                                console.log('No more data in response.');
                                parsed = parseBody(body, method);

                                if (parsed) {
                                        if(method=='r') {
                                            url = addressArray[searchIndex].urlZ;
                                        } else {
                                            
                                            if (++searchIndex<addressArray.length) {
                                                    url = addressArray[searchIndex].urlR;
                                            } else {
                                                    console.log('end');
                                                    return;
                                            }        
                                        }
                                        getget(url);
                                    }  
                               
                              });
                                                   
                */                  
                                    
                                }  else throw new Error("Unknown code");

  getget(url);
  

}).on('error', (e) => {
  console.error(e);
});}

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
async function go(url){
        const method = url[12];    
      
          // if (method=="r") {
          //     https.get(url, options, (res) => {
          //         console.log('statusCode:', res.statusCode);
          //           if (res.statusCode==301) {
          //               console.log('New location:', res.headers.location);
          //               url = url.slice(0,22) + res.headers.location;
          //             } else throw new Error(`Redfin: Unknown code ${res.statusCode}`);
          //     });
          // }
      
          let req = https.get(url, options, (res) => {
      
          console.log('statusCode:', res.statusCode);
      
          if (res.statusCode==200) {
      //            console.log('statusCode:', res.statusCode);
                  res.on('data', (chunk) => {
                      let parsed = parseBody(chunk, method);
      //                body += chunk;
                      console.log(`BODY: ${chunk.slice(0, 20)}`); 
                      if(parsed) {
                          console.log('Estimate: ', parsed);
                          return parsed;  
                      }             
                  });
                  res.on('end', () => {
                      console.log('No more data in response.');
                      let parsed = parseBody(body, method);
                      console.log('Estimate: ', parsed);
                      return parsed;
      //                fs.writeFileSync(`${__dirname}/redfin1`, body);                
                    });
              }  else throw new Error("Unknown code");
      
      });
      
      req.on('error', (e) => {
        console.error(e);
      });
      //req.end();
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
      