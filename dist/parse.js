"use strict";var m=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var K=Object.getOwnPropertyNames;var z=Object.prototype.hasOwnProperty;var C=(n,i)=>m(n,"name",{value:i,configurable:!0});var B=(n,i)=>{for(var d in i)m(n,d,{get:i[d],enumerable:!0})},F=(n,i,d,u)=>{if(i&&
typeof i=="object"||typeof i=="function")for(let c of K(i))!z.call(n,c)&&c!==d&&
m(n,c,{get:()=>i[c],enumerable:!(u=H(i,c))||u.enumerable});return n};var G=n=>F(m({},"__esModule",{value:!0}),n);var Q={};B(Q,{JSONParseError:()=>O,parse:()=>M});module.exports=G(Q);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */const q=class q extends Error{};C(q,"JSONParseError");let O=q;const X=/[^"\\\u0000-\u001f]*/y,
j=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,L=`........\
.........................."............./.......................................\
......\\......\b....\f........
....\r..	`.split("."),v=65536,A=new Uint32Array(103),y=new Uint32Array(103),g=new Uint32Array(
103),k=new Uint32Array(103);let t=0;for(;t<48;t++)A[t]=y[t]=g[t]=k[t]=v;for(;t<58;t++){
const n=t-48;A[t]=n<<12,y[t]=n<<8,g[t]=n<<4,k[t]=n}for(;t<65;t++)A[t]=y[t]=g[t]=
k[t]=v;for(;t<71;t++){const n=t-55;A[t]=n<<12,y[t]=n<<8,g[t]=n<<4,k[t]=n}for(;t<
97;t++)A[t]=y[t]=g[t]=k[t]=v;for(;t<103;t++){const n=t-87;A[t]=n<<12,y[t]=n<<8,g[t]=
n<<4,k[t]=n}function J(n,i=""){if(!(n>=0))return"end of JSON input";if(n>31&&n<127)
return`'${i}${String.fromCharCode(n)}'`;if(n===10)return"\\n";if(n===9)return"\\t";
const d=n.toString(16),u="0000".slice(d.length)+d;return(n>31?`'${i}${String.fromCharCode(
n)}', `:"")+`\\u${u}`}C(J,"chDesc");function N(n,i){const d=Object.keys(i),u=d.length;
for(let c=0;c<u;c++){const p=d[c],s=n.call(i,p,i[p]);s!==void 0?i[p]=s:delete i[p]}}
C(N,"revive");function M(n,i,d,u=1/0){typeof n!="string"&&(n=String(n)),typeof i!=
"function"&&(i=void 0);const c=[],p=u+u-2;let s=0,a=0,e,r,l,o,f;function w(h){throw new O(
`${h}
At character ${a} in JSON: ${n}`)}C(w,"err");function $(){w(`JSON structure is t\
oo deeply nested (current max depth: ${u})`)}C($,"tooDeep");function b(h){w(`Une\
xpected ${J(e)}, expecting ${h} ${l===!0?"in array":l===!1?"in object":"at top l\
evel"}`)}C(b,"expected");function R(){const h=a-1;switch(j.lastIndex=h,j.test(n)||
b("JSON value"),a=j.lastIndex,e){case 102:return!1;case 110:return null;case 116:
return!0;default:const I=n.slice(h,a);return d?d(I,o):+I}}C(R,"word");function S(){
let h="";for(;;){X.lastIndex=a,X.test(n);const U=X.lastIndex;switch(U>a&&(h+=n.slice(
a,U),a=U),e=n.charCodeAt(a++),e){case 34:return h;case 92:if(e=n.charCodeAt(a++),
e===117){const E=A[n.charCodeAt(a++)]+y[n.charCodeAt(a++)]+g[n.charCodeAt(a++)]+
k[n.charCodeAt(a++)];if(E<v){h+=String.fromCharCode(E);continue}w("Invalid \\uXXX\
X escape in string")}const I=L[e];if(I){h+=I;continue}w(`Invalid escape sequence\
 in string: ${J(e,"\\")}`);default:e>=0||w("Unterminated string"),w(`Invalid une\
scaped ${J(e)} in string`)}}}C(S,"string");e:{do e=n.charCodeAt(a++);while(e<=32&&
(e===32||e===10||e===13||e===9));switch(e){case 123:u===0&&$(),r={},o=void 0,l=!1;
break;case 91:u===0&&$(),r=[],o=0,l=!0;break;case 34:f=S();break e;default:f=R();
break e}n:for(;;)if(l===!0)for(;;){do e=n.charCodeAt(a++);while(e<=32&&(e===32||
e===10||e===13||e===9));if(e===93){if(i!==void 0&&N(i,r),f=r,s===0)break e;if(r=
c[--s],o=c[--s],l=typeof o=="number",l===!0){r[o++]=f;continue}else{r[o]=f;continue n}}
if(o!==0){e!==44&&b("',' or ']' after value");do e=n.charCodeAt(a++);while(e<=32&&
(e===32||e===10||e===13||e===9))}switch(e){case 34:r[o++]=S();continue;case 123:
s===p&&$(),c[s++]=o,c[s++]=r,r={},o=void 0,l=!1;continue n;case 91:s===p&&$(),c[s++]=
o,c[s++]=r,r=[],o=0;continue;default:r[o++]=R()}}else for(;;){do e=n.charCodeAt(
a++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){if(i!==void 0&&N(
i,r),f=r,s===0)break e;if(r=c[--s],o=c[--s],l=typeof o=="number",l===!0){r[o++]=
f;continue n}else{r[o]=f;continue}}if(o!==void 0){e!==44&&b("',' or '}' after va\
lue");do e=n.charCodeAt(a++);while(e<=32&&(e===32||e===10||e===13||e===9))}e!==34&&
b("'}' or double-quoted key"),o=S();do e=n.charCodeAt(a++);while(e<=32&&(e===32||
e===10||e===13||e===9));e!==58&&b("':' after key");do e=n.charCodeAt(a++);while(e<=
32&&(e===32||e===10||e===13||e===9));switch(e){case 34:r[o]=S();continue;case 123:
s===p&&$(),c[s++]=o,c[s++]=r,r={},o=void 0;continue;case 91:s===p&&$(),c[s++]=o,
c[s++]=r,r=[],o=0,l=!0;continue n;default:r[o]=R()}}}do e=n.charCodeAt(a++);while(e<=
32&&(e===32||e===10||e===13||e===9));return e>=0&&w("Unexpected data after end o\
f JSON input"),i!==void 0&&(f={"":f},N(i,f),f=f[""]),f}C(M,"parse");
