import admin from "firebase-admin";
export const config = { schedule: "0 1 * * *" }; // daily at 08:00 WIB (01:00 UTC)
function dateJakarta(){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());}
function dayDiff(expiry,today){return Math.round((Date.parse(`${expiry}T00:00:00Z`)-Date.parse(`${today}T00:00:00Z`))/86400000);}
export default async () => {
 const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
 if(!raw){console.error("Missing FIREBASE_SERVICE_ACCOUNT_JSON");return new Response("Missing server credentials",{status:500});}
 try{
  const account=JSON.parse(raw); if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(account)});
  const db=admin.firestore(), today=dateJakarta();
  const [items,tokens]=await Promise.all([db.collection("kpReminderData").get(),db.collection("kpPushTokens").get()]);
  const byUid=new Map(); for(const d of tokens.docs){const v=d.data();if(v.uid&&v.token){if(!byUid.has(v.uid))byUid.set(v.uid,[]);byUid.get(v.uid).push({id:d.id,token:v.token});}}
  let sent=0;
  for(const doc of items.docs){const data=doc.data(),uid=data.uid||doc.id,devices=byUid.get(uid)||[];if(!devices.length||!Array.isArray(data.foods))continue;
   for(const food of data.foods){if(!food?.name||!food.expiry||["waste","compost"].includes(food.status))continue;
    const days=dayDiff(food.expiry,today),type=days===3?"H-3":days===1?"H-1":days===0?"H0":null;if(!type)continue;
    const sentRef=db.collection("kpReminderSent").doc(`${uid}_${String(food.id)}_${type}_${today}`);if((await sentRef.get()).exists)continue;
    const title=type==="H0"?"Hari ini tanggal kedaluwarsa":`Pengingat kedaluwarsa ${type}`;
    const body=type==="H0"?`${food.name} mencapai tanggal kedaluwarsa hari ini.`:`${food.name} akan kedaluwarsa dalam ${days} hari.`;
    const results=await Promise.allSettled(devices.map(d=>admin.messaging().send({token:d.token,notification:{title,body},data:{foodId:String(food.id),expiry:String(food.expiry),reminderType:type,url:"/"}})));
    const ok=results.filter(r=>r.status==="fulfilled").length;if(ok){await sentRef.set({uid,foodId:String(food.id),foodName:food.name,expiry:food.expiry,type,date:today,sentAt:admin.firestore.FieldValue.serverTimestamp(),successCount:ok});sent+=ok;}
    const invalid=results.map((r,i)=>({r,d:devices[i]})).filter(x=>x.r.status==="rejected"&&["messaging/registration-token-not-registered","messaging/invalid-registration-token"].includes(x.r.reason?.code));
    await Promise.all(invalid.map(x=>db.collection("kpPushTokens").doc(x.d.id).delete()));
   }
  }
  return new Response(JSON.stringify({ok:true,date:today,sent}),{status:200,headers:{"content-type":"application/json"}});
 }catch(e){console.error("Expiry reminder failed",e);return new Response("Expiry reminder failed; inspect function logs.",{status:500});}
};
