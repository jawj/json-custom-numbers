"use strict";var I=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var E=Object.getOwnPropertyNames;var H=Object.prototype.hasOwnProperty;var h=(n,o)=>I(n,"name",{value:o,configurable:!0});var K=(n,o)=>{for(var d in o)I(n,d,{get:o[d],enumerable:!0})},z=(n,o,d,u)=>{if(o&&
typeof o=="object"||typeof o=="function")for(let i of E(o))!H.call(n,i)&&i!==d&&
I(n,i,{get:()=>o[i],enumerable:!(u=q(o,i))||u.enumerable});return n};var B=n=>z(I({},"__esModule",{value:!0}),n);var L={};K(L,{JSONParseError:()=>v,parse:()=>G});module.exports=B(L);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */const N=class N extends Error{};h(N,"JSONParseError");let v=N;const R=/[^"\\\u0000-\u001f]*/y,
U=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,F=`........\
.........................."............./.......................................\
......\\......\b....\f........
....\r..	`.split("."),S=h(()=>new Uint32Array(103),"hlArr"),A=S(),w=S(),g=S(),y=S(),
m=65536;let t=0;for(;t<48;t++)A[t]=w[t]=g[t]=y[t]=m;for(;t<58;t++)A[t]=(w[t]=(g[t]=
(y[t]=t-48)<<4)<<4)<<4;for(;t<65;t++)A[t]=w[t]=g[t]=y[t]=m;for(;t<71;t++)A[t]=(w[t]=
(g[t]=(y[t]=t-55)<<4)<<4)<<4;for(;t<97;t++)A[t]=w[t]=g[t]=y[t]=m;for(;t<103;t++)
A[t]=(w[t]=(g[t]=(y[t]=t-87)<<4)<<4)<<4;function X(n,o=""){if(!(n>=0))return"end\
 of JSON input";if(n>31&&n<127)return`'${o}${String.fromCharCode(n)}'`;if(n===10)
return"\\n";if(n===9)return"\\t";const d=n.toString(16),u="0000".slice(d.length)+
d;return(n>31?`'${o}${String.fromCharCode(n)}', `:"")+`\\u${u}`}h(X,"chDesc");function J(n,o){
const d=Object.keys(o),u=d.length;for(let i=0;i<u;i++){const e=d[i],r=n.call(o,e,
o[e]);r!==void 0?o[e]=r:delete o[e]}}h(J,"revive");function G(n,o,d,u=1/0){typeof n!=
"string"&&(n=String(n)),typeof o!="function"&&(o=void 0);let i=0,e,r,l,c,f;function p(s){
throw new v(`${s}
At character ${i} in JSON: ${n}`)}h(p,"err");function k(){p(`JSON structure is t\
oo deeply nested (current max depth: ${u})`)}h(k,"tooDeep");function $(s){p(`Une\
xpected ${X(e)}, expecting ${s} ${l===!0?"in array":l===!1?"in object":"at top l\
evel"}`)}h($,"expected");function O(){const s=i-1;switch(U.lastIndex=s,U.test(n)!==
!0&&$("JSON value"),i=U.lastIndex,e){case 102:return!1;case 110:return null;case 116:
return!0;default:const C=n.slice(s,i);return d?d(C,c):+C}}h(O,"word");function b(){
let s="";for(;;){R.lastIndex=i,R.test(n);const a=R.lastIndex;switch(a>i&&(s+=n.slice(
i,a),i=a),e=n.charCodeAt(i++),e){case 34:return s;case 92:if(e=n.charCodeAt(i++),
e===117){const j=A[n.charCodeAt(i++)]+w[n.charCodeAt(i++)]+g[n.charCodeAt(i++)]+
y[n.charCodeAt(i++)];if(j<m){s+=String.fromCharCode(j);continue}p("Invalid \\uXXX\
X escape in string")}const C=F[e];if(C){s+=C;continue}p(`Invalid escape sequence\
 in string: ${X(e,"\\")}`);default:e>=0||p("Unterminated string"),p(`Invalid une\
scaped ${X(e)} in string`)}}}h(b,"string");e:{do e=n.charCodeAt(i++);while(e<=32&&
(e===32||e===10||e===13||e===9));switch(e){case 123:u===0&&k(),r={},c=void 0,l=!1;
break;case 91:u===0&&k(),r=[],c=0,l=!0;break;case 34:f=b();break e;default:f=O();
break e}const s=[];let a=0;const C=u+u-2;n:for(;;)if(l===!0)for(;;){do e=n.charCodeAt(
i++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===93){if(o!==void 0&&J(o,
r),f=r,a===0)break e;if(r=s[--a],c=s[--a],l=typeof c=="number",l===!0){r[c++]=f;
continue}else{r[c]=f;continue n}}if(c!==0){e!==44&&$("',' or ']' after value");do
e=n.charCodeAt(i++);while(e<=32&&(e===32||e===10||e===13||e===9))}switch(e){case 34:
r[c++]=b();continue;case 123:a===C&&k(),s[a++]=c,s[a++]=r,r={},c=void 0,l=!1;continue n;case 91:
a===C&&k(),s[a++]=c,s[a++]=r,r=[],c=0;continue;default:r[c++]=O()}}else for(;;){
do e=n.charCodeAt(i++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){
if(o!==void 0&&J(o,r),f=r,a===0)break e;if(r=s[--a],c=s[--a],l=typeof c=="number",
l===!0){r[c++]=f;continue n}else{r[c]=f;continue}}if(c!==void 0){e!==44&&$("',' \
or '}' after value");do e=n.charCodeAt(i++);while(e<=32&&(e===32||e===10||e===13||
e===9))}e!==34&&$("'}' or double-quoted key"),c=b();do e=n.charCodeAt(i++);while(e<=
32&&(e===32||e===10||e===13||e===9));e!==58&&$("':' after key");do e=n.charCodeAt(
i++);while(e<=32&&(e===32||e===10||e===13||e===9));switch(e){case 34:r[c]=b();continue;case 123:
a===C&&k(),s[a++]=c,s[a++]=r,r={},c=void 0;continue;case 91:a===C&&k(),s[a++]=c,
s[a++]=r,r=[],c=0,l=!0;continue n;default:r[c]=O()}}}do e=n.charCodeAt(i++);while(e<=
32&&(e===32||e===10||e===13||e===9));return e>=0&&p("Unexpected data after end o\
f JSON input"),o!==void 0&&(f={"":f},J(o,f),f=f[""]),f}h(G,"parse");
