class y extends Error{}let e,t,n,u;const b=/[\n\t\u0000-\u001f]/,d=/true|false|null|-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?/y,C=["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",'"',"","","","","","","","","","","","","/","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","\\","","","","","","\b","","","","\f","","","","","","","",`
`,"","","","\r","","	"],j=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,4097,8193,12289,16385,20481,24577,28673,32769,36865,0,0,0,0,0,0,0,40961,45057,49153,53249,57345,61441,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40961,45057,49153,53249,57345,61441],E=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,257,513,769,1025,1281,1537,1793,2049,2305,0,0,0,0,0,0,0,2561,2817,3073,3329,3585,3841,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2561,2817,3073,3329,3585,3841],I=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,17,33,49,65,81,97,113,129,145,0,0,0,0,0,0,0,161,177,193,209,225,241,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,161,177,193,209,225,241],O=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,0,0,0,0,0,0,0,11,12,13,14,15,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,13,14,15,16];function i(r){throw new y(`${r}
At character ${e} in JSON: ${n}`)}function k(){let r;d.lastIndex=e-1,d.test(n)||i("Unexpected value");const{lastIndex:c}=d;if(t<"f"){const a=n.slice(e-1,c);r=u?u(a):+a}else r=t==="t"?!0:t==="f"?!1:null;return e=c,t=n.charAt(e++),r}function f(){i("Invalid \\uXXXX escape in string")}function g(){i("Invalid character in string")}function v(){let r="";for(;;){const c=n.indexOf('"',e);if(c===-1&&i("Unterminated string"),c===e)return e=c+1,t=n.charAt(e++),r;let a=n.slice(e,c);const s=a.indexOf("\\");if(s===-1)return b.test(a)&&g(),r+=a,e=c+1,t=n.charAt(e++),r;{s>0&&(a=a.slice(0,s),b.test(a)&&g(),r+=a),e+=s+1;let l=n.charCodeAt(e++);r+=l===117?String.fromCharCode((j[n.charCodeAt(e++)]||f())+(E[n.charCodeAt(e++)]||f())+(I[n.charCodeAt(e++)]||f())+(O[n.charCodeAt(e++)]||f())-4):C[l]||i("Invalid escape in string")}}}function m(){const r=[];let c=0;do t=n.charAt(e++);while(t<"!"&&(t===" "||t===`
`||t==="\r"||t==="	"));if(t==="]")return t=n.charAt(e++),r;for(;t;){for(r[c++]=A();t<"!"&&(t===" "||t===`
`||t==="\r"||t==="	");)t=n.charAt(e++);if(t==="]")return t=n.charAt(e++),r;t!==","&&i("Expected ',', got '"+t+"' between array elements");do t=n.charAt(e++);while(t<"!"&&(t===" "||t===`
`||t==="\r"||t==="	"))}i("Invalid array")}function S(){const r={};do t=n.charAt(e++);while(t<"!"&&(t===" "||t===`
`||t==="\r"||t==="	"));if(t==="}")return t=n.charAt(e++),r;for(;t==='"';){const c=v();for(;t<"!"&&(t===" "||t===`
`||t==="\r"||t==="	");)t=n.charAt(e++);for(t!==":"&&i("Expected ':', got '"+t+"' between key and value in object"),t=n.charAt(e++),r[c]=A();t<"!"&&(t===" "||t===`
`||t==="\r"||t==="	");)t=n.charAt(e++);if(t==="}")return t=n.charAt(e++),r;t!==","&&i("Expected ',', got '"+t+"' between items in object");do t=n.charAt(e++);while(t<"!"&&(t===" "||t===`
`||t==="\r"||t==="	"))}i("Invalid object")}function A(){for(;t<"!"&&(t===" "||t===`
`||t==="\r"||t==="	");)t=n.charAt(e++);switch(t){case'"':return v();case"{":return S();case"[":return m();default:return k()}}function U(r,c,a){typeof r!="string"&&i("JSON source is not a string"),e=0,t=" ",n=r,u=a;const s=A();for(;t<"!"&&(t===" "||t===`
`||t==="\r"||t==="	");)t=n.charAt(e++);return t&&i("Unexpected data at end"),typeof c=="function"?function l(w,x){const o=w[x];if(o&&typeof o=="object"){for(const h in o)if(Object.prototype.hasOwnProperty.call(o,h)){const p=l(o,h);p!==void 0?o[h]=p:delete o[h]}}return c.call(w,x,o)}({"":s},""):s}export{y as JSONParseError,U as parse};
