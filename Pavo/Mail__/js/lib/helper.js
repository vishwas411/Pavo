let EXT_helper=new function(){this.callApi=((e,t,i=!1)=>new Promise(o=>{chrome.storage.local.get(["ukey"],({ukey:s})=>{$.ajax({url:"https://waste.email/api/"+e,type:"POST",contentType:"application/json; charset=utf-8",dataType:"json",data:JSON.stringify({ukey:s,...t}),success:t=>{if(t&&t.success)return o(t);i||EXT_helper.showNotification("Warning: "+e+" "+JSON.stringify(t))},error:t=>{i||EXT_helper.showNotification("Error: "+e+" "+JSON.stringify(t))}})})})),this.showNotification=(e=>{chrome.notifications.create(null,{title:chrome.i18n.getMessage("name"),message:String(e),type:"basic",iconUrl:"img/icon2.png"})}),this.getLocalStorage=(e=>new Promise(t=>{chrome.storage.local.get([e],i=>{t(i[e])})})),this.setLocalStorage=((e,t)=>new Promise(i=>{chrome.storage.local.set({[e]:t},i)}))};