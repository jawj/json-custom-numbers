"use strict";var I=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var q=Object.getOwnPropertyNames;var E=Object.prototype.hasOwnProperty;var C=(n,o)=>I(n,"name",{value:o,configurable:!0});var H=(n,o)=>{for(var d in o)I(n,d,{get:o[d],enumerable:!0})},K=(n,o,d,u)=>{if(o&&
typeof o=="object"||typeof o=="function")for(let i of q(o))!E.call(n,i)&&i!==d&&
I(n,i,{get:()=>o[i],enumerable:!(u=N(o,i))||u.enumerable});return n};var z=n=>K(I({},"__esModule",{value:!0}),n);var G={};H(G,{JSONParseError:()=>U,parse:()=>F});module.exports=z(G);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */const j=class j extends Error{};C(j,"JSONParseError");let U=j;const v=/[^"\\\u0000-\u001f]*/y,
O=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,B=`........\
.........................."............./.......................................\
......\\......\b....\f........
....\r..	`.split("."),S=65536,w=new Uint32Array(103),A=new Uint32Array(103),y=new Uint32Array(
103),g=new Uint32Array(103);let t=0;for(;t<48;t++)w[t]=A[t]=y[t]=g[t]=S;for(;t<58;t++){
const n=t-48;w[t]=n<<12,A[t]=n<<8,y[t]=n<<4,g[t]=n}for(;t<65;t++)w[t]=A[t]=y[t]=
g[t]=S;for(;t<71;t++){const n=t-55;w[t]=n<<12,A[t]=n<<8,y[t]=n<<4,g[t]=n}for(;t<
97;t++)w[t]=A[t]=y[t]=g[t]=S;for(;t<103;t++){const n=t-87;w[t]=n<<12,A[t]=n<<8,y[t]=
n<<4,g[t]=n}function R(n,o=""){if(!(n>=0))return"end of JSON input";if(n>31&&n<127)
return`'${o}${String.fromCharCode(n)}'`;if(n===10)return"\\n";if(n===9)return"\\t";
const d=n.toString(16),u="0000".slice(d.length)+d;return(n>31?`'${o}${String.fromCharCode(
n)}', `:"")+`\\u${u}`}C(R,"chDesc");function X(n,o){const d=Object.keys(o),u=d.length;
for(let i=0;i<u;i++){const e=d[i],r=n.call(o,e,o[e]);r!==void 0?o[e]=r:delete o[e]}}
C(X,"revive");function F(n,o,d,u=1/0){typeof n!="string"&&(n=String(n)),typeof o!=
"function"&&(o=void 0);let i=0,e,r,l,c,f;function p(s){throw new U(`${s}
At character ${i} in JSON: ${n}`)}C(p,"err");function k(){p(`JSON structure is t\
oo deeply nested (current max depth: ${u})`)}C(k,"tooDeep");function $(s){p(`Une\
xpected ${R(e)}, expecting ${s} ${l===!0?"in array":l===!1?"in object":"at top l\
evel"}`)}C($,"expected");function m(){const s=i-1;switch(O.lastIndex=s,O.test(n)||
$("JSON value"),i=O.lastIndex,e){case 102:return!1;case 110:return null;case 116:
return!0;default:const h=n.slice(s,i);return d?d(h,c):+h}}C(m,"word");function b(){
let s="";for(;;){v.lastIndex=i,v.test(n);const a=v.lastIndex;switch(a>i&&(s+=n.slice(
i,a),i=a),e=n.charCodeAt(i++),e){case 34:return s;case 92:if(e=n.charCodeAt(i++),
e===117){const J=w[n.charCodeAt(i++)]+A[n.charCodeAt(i++)]+y[n.charCodeAt(i++)]+
g[n.charCodeAt(i++)];if(J<S){s+=String.fromCharCode(J);continue}p("Invalid \\uXXX\
X escape in string")}const h=B[e];if(h){s+=h;continue}p(`Invalid escape sequence\
 in string: ${R(e,"\\")}`);default:e>=0||p("Unterminated string"),p(`Invalid une\
scaped ${R(e)} in string`)}}}C(b,"string");e:{do e=n.charCodeAt(i++);while(e<=32&&
(e===32||e===10||e===13||e===9));switch(e){case 123:u===0&&k(),r={},c=void 0,l=!1;
break;case 91:u===0&&k(),r=[],c=0,l=!0;break;case 34:f=b();break e;default:f=m();
break e}const s=[];let a=0;const h=u+u-2;n:for(;;)if(l===!0)for(;;){do e=n.charCodeAt(
i++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===93){if(o!==void 0&&X(o,
r),f=r,a===0)break e;if(r=s[--a],c=s[--a],l=typeof c=="number",l===!0){r[c++]=f;
continue}else{r[c]=f;continue n}}if(c!==0){e!==44&&$("',' or ']' after value");do
e=n.charCodeAt(i++);while(e<=32&&(e===32||e===10||e===13||e===9))}switch(e){case 34:
r[c++]=b();continue;case 123:a===h&&k(),s[a++]=c,s[a++]=r,r={},c=void 0,l=!1;continue n;case 91:
a===h&&k(),s[a++]=c,s[a++]=r,r=[],c=0;continue;default:r[c++]=m()}}else for(;;){
do e=n.charCodeAt(i++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){
if(o!==void 0&&X(o,r),f=r,a===0)break e;if(r=s[--a],c=s[--a],l=typeof c=="number",
l===!0){r[c++]=f;continue n}else{r[c]=f;continue}}if(c!==void 0){e!==44&&$("',' \
or '}' after value");do e=n.charCodeAt(i++);while(e<=32&&(e===32||e===10||e===13||
e===9))}e!==34&&$("'}' or double-quoted key"),c=b();do e=n.charCodeAt(i++);while(e<=
32&&(e===32||e===10||e===13||e===9));e!==58&&$("':' after key");do e=n.charCodeAt(
i++);while(e<=32&&(e===32||e===10||e===13||e===9));switch(e){case 34:r[c]=b();continue;case 123:
a===h&&k(),s[a++]=c,s[a++]=r,r={},c=void 0;continue;case 91:a===h&&k(),s[a++]=c,
s[a++]=r,r=[],c=0,l=!0;continue n;default:r[c]=m()}}}do e=n.charCodeAt(i++);while(e<=
32&&(e===32||e===10||e===13||e===9));return e>=0&&p("Unexpected data after end o\
f JSON input"),o!==void 0&&(f={"":f},X(o,f),f=f[""]),f}C(F,"parse");
