"use strict";var w=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var S=Object.getOwnPropertyNames;var I=Object.prototype.hasOwnProperty;var N=(c,a)=>{for(var t in a)w(c,t,{get:a[t],enumerable:!0})},q=(c,a,t,f)=>{if(a&&
typeof a=="object"||typeof a=="function")for(let d of S(a))!I.call(c,d)&&d!==t&&
w(c,d,{get:()=>a[d],enumerable:!(f=v(a,d))||f.enumerable});return c};var E=c=>q(w({},"__esModule",{value:!0}),c);var D={};N(D,{JSONParseError:()=>m,parse:()=>j});module.exports=E(D);class m extends Error{}
const u=Symbol("unfinished"),g=/[^"\\\u0000-\u001f]*/y,b=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
n="",L=[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,'"',
n,n,n,n,n,n,n,n,n,n,n,n,"/",n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,
n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,"\\",n,n,n,n,n,"\b",n,n,n,"\f",n,n,n,n,n,n,n,
`
`,n,n,n,"\r",n,"	"],e=65536,O=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,4096,8192,12288,
16384,20480,24576,28672,32768,36864,e,e,e,e,e,e,e,40960,45056,49152,53248,57344,
61440,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,40960,45056,49152,53248,
57344,61440]),R=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,256,512,768,1024,1280,1536,1792,
2048,2304,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840]),X=new Uint32Array([e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,0,16,32,48,64,80,96,112,128,144,e,e,e,e,e,e,e,160,176,192,208,224,240,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,160,176,192,208,224,240]),J=new Uint32Array(
[e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,0,1,2,3,4,5,6,7,8,9,e,e,e,e,e,e,e,10,11,12,13,14,15,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,10,11,12,13,14,15]);function j(c){let a=0,
t;const f=[],d=[];let s=0,h,i=0,r;function o(l){return new m(l+`
At character `+i+" in JSON: "+c)}function C(l){return r>=0?"'"+(l||"")+String.fromCharCode(
r)+"'":"end of input"}do{do r=c.charCodeAt(i++);while(r<33&&(r===32||r===10||r===
13||r===9));e:switch(r){case 34:if(t!==void 0&&t!==u)throw o("Unexpected quote");
for(t="";;){g.lastIndex=i,g.test(c);const p=g.lastIndex;switch(p>i&&(t+=c.slice(
i,p),i=p),r=c.charCodeAt(i++),r){case 34:break e;case 92:if(r=c.charCodeAt(i++),
r===117){const U=O[c.charCodeAt(i++)]+R[c.charCodeAt(i++)]+X[c.charCodeAt(i++)]+
J[c.charCodeAt(i++)];if(U<65536){t+=String.fromCharCode(U);continue}throw o("Inv\
alid \\uXXXX escape in string")}const x=L[r];if(x){t+=x;continue}throw o("Invali\
d escape sequence "+C("\\")+" in string")}if(isNaN(r))throw o("Unterminated stri\
ng");const A=r===10?"newline":r===9?"tab":"control character",k=r.toString(16),y="\
0000".slice(k.length)+k;throw o("Invalid unescaped "+A+" (\\u"+y+") in string")}case 44:
if(t===void 0||t===u)throw o("Unexpected comma (expecting value)");if(a===58){h[d[--s]]=
t,a=f[s],t=u;break}if(a===91){h.push(t),t=u;break}throw o("Unexpected comma");case 58:
if(a!==123)throw o("Unexpected colon");if(typeof t!="string")throw o("Object key\
 must be a string");f[s]=a,d[s++]=t,a=r,t=u;break;case 123:if(t!==void 0&&t!==u)
throw o("Unexpected opening brace");f[s]=a,d[s++]=h,h={},t=void 0,a=r;break;case 125:
if(t===u)throw o("Unexpected closing brace after comma or colon");if(a===58&&(h[d[--s]]=
t,a=f[s],t=void 0),t!==void 0)throw o("Unexpected closing brace after object key");
t=h,h=d[--s],a=f[s];break;case 91:if(t!==void 0&&t!==u)throw o("Unexpected openi\
ng square bracket");f[s]=a,d[s++]=h,h=[],t=void 0,a=r;break;case 93:if(a!==91)throw o(
"Unexpected closing square bracket");if(t===u)throw o("Unexpected closing square\
 bracket after comma");t!==void 0&&h.push(t),t=h,h=d[--s],a=f[s];break;default:if(t!==
void 0&&t!==u)throw o("Unexpected value");const l=i-1;if(b.lastIndex=l,!b.test(c))
throw o("Unexpected character or end of input");i=b.lastIndex,r<102?t=+c.slice(l,
i):t=r===110?null:r===116}}while(s!==0);do r=c.charCodeAt(i++);while(r<33&&(r===
32||r===10||r===13||r===9));if(!isNaN(r))throw o("Unexpected trailing data after\
 JSON value");return t}
