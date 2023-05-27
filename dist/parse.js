"use strict";var p=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var m=Object.getOwnPropertyNames;var I=Object.prototype.hasOwnProperty;var U=(n,c)=>{for(var i in c)p(n,i,{get:c[i],enumerable:!0})},S=(n,c,i,s)=>{if(c&&typeof c=="object"||typeof c=="function")for(let d of m(c))!I.call(n,d)&&d!==i&&p(n,d,{get:()=>c[d],enumerable:!(s=j(c,d))||s.enumerable});return n};var N=n=>S(p({},"__esModule",{value:!0}),n);var F={};U(F,{JSONParseError:()=>k,parse:()=>B});module.exports=N(F);class k extends Error{}let r,t,o,C,A;const x=/[^"\\\n\t\u0000-\u001f]*/y,w=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,e="",O=[e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,'"',e,e,e,e,e,e,e,e,e,e,e,e,"/",e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,"\\",e,e,e,e,e,"\b",e,e,e,"\f",e,e,e,e,e,e,e,`
`,e,e,e,"\r",e,"	"],R=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,4097,8193,12289,16385,20481,24577,28673,32769,36865,0,0,0,0,0,0,0,40961,45057,49153,53249,57345,61441,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40961,45057,49153,53249,57345,61441],L=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,257,513,769,1025,1281,1537,1793,2049,2305,0,0,0,0,0,0,0,2561,2817,3073,3329,3585,3841,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2561,2817,3073,3329,3585,3841],X=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,17,33,49,65,81,97,113,129,145,0,0,0,0,0,0,0,161,177,193,209,225,241,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,161,177,193,209,225,241],J=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,0,0,0,0,0,0,0,11,12,13,14,15,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,12,13,14,15,16];function a(n){throw new k(n+`
At character `+r+" in JSON: "+o)}function u(n){return t>=0?"'"+(n||"")+String.fromCharCode(t)+"'":"end of input"}function D(){let n;const c=r-1;w.lastIndex=c,w.test(o)||a("Unexpected character or end of input");const{lastIndex:i}=w;if(t<102){const s=o.slice(c,i);n=C?C(s):+s}else n=t===110?null:t===116;return r=i,t=o.charCodeAt(r++),n}function f(){a("Invalid \\uXXXX escape in string")}function E(){let n="";for(;;){x.lastIndex=r,x.test(o);const{lastIndex:c}=x;switch(c>r&&(n+=o.slice(r,c),r=c),t=o.charCodeAt(r++),t){case 34:return t=o.charCodeAt(r++),n;case 92:t=o.charCodeAt(r++),n+=t===117?String.fromCharCode((R[o.charCodeAt(r++)]||f())+(L[o.charCodeAt(r++)]||f())+(X[o.charCodeAt(r++)]||f())+(J[o.charCodeAt(r++)]||f())-4):O[t]||a("Invalid escape sequence "+u("\\")+" in string");continue;default:isNaN(t)&&a("Unterminated string");const i=t===10?"newline":t===9?"tab":"control character",s=t.toString(16),d="0000".slice(s.length)+s;a("Invalid unescaped "+i+" (\\u"+d+") in string")}}}function P(){const n=[];let c=0;do t=o.charCodeAt(r++);while(t<33&&(t===32||t===10||t===13||t===9));if(t===93)return t=o.charCodeAt(r++),n;for(;t>=0;){for(n[c++]=g();t<33&&(t===32||t===10||t===13||t===9);)t=o.charCodeAt(r++);if(t===93)return t=o.charCodeAt(r++),n;t!==44&&a("Expected ',' but got "+u()+" after array element");do t=o.charCodeAt(r++);while(t<33&&(t===32||t===10||t===13||t===9))}a("Unterminated array")}function q(){const n={};do t=o.charCodeAt(r++);while(t<33&&(t===32||t===10||t===13||t===9));if(t===125)return t=o.charCodeAt(r++),n;for(;t===34;){const c=E();for(;t<33&&(t===32||t===10||t===13||t===9);)t=o.charCodeAt(r++);for(t!==58&&a("Expected ':' but got "+u()+" after key in object"),t=o.charCodeAt(r++),n[c]=g();t<33&&(t===32||t===10||t===13||t===9);)t=o.charCodeAt(r++);if(t===125)return t=o.charCodeAt(r++),n;t!==44&&a("Expected ',' but got "+u()+" after value in object");do t=o.charCodeAt(r++);while(t<33&&(t===32||t===10||t===13||t===9))}a(`Expected '"' but got `+u()+" in object")}function g(){for(;t<33&&(t===32||t===10||t===13||t===9);)t=o.charCodeAt(r++);switch(t){case 34:return E();case 123:return q();case 91:return P();default:return D()}}function B(n,c,i){n instanceof Uint8Array&&(n=(A!=null?A:A=new TextDecoder).decode(n)),typeof n!="string"&&a("JSON must be a string, Buffer or Uint8Array"),r=0,t=32,o=n,C=i;const s=g();for(;t<33&&(t===32||t===10||t===13||t===9);)t=o.charCodeAt(r++);return t>=0&&a("Unexpected data at end of input"),typeof c=="function"?function d(b,y){const l=b[y];if(l&&typeof l=="object"){for(const h in l)if(Object.prototype.hasOwnProperty.call(l,h)){const v=d(l,h);v!==void 0?l[h]=v:delete l[h]}}return c.call(b,y,l)}({"":s},""):s}
