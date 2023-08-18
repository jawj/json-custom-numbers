"use strict";var S=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var T=Object.getOwnPropertyNames;var X=Object.prototype.hasOwnProperty;var h=(n,o)=>S(n,"name",{value:o,configurable:!0});var j=(n,o)=>{for(var l in o)S(n,l,{get:o[l],enumerable:!0})},q=(n,o,l,u)=>{if(o&&
typeof o=="object"||typeof o=="function")for(let i of T(o))!X.call(n,i)&&i!==l&&
S(n,i,{get:()=>o[i],enumerable:!(u=R(o,i))||u.enumerable});return n};var P=n=>q(S({},"__esModule",{value:!0}),n);var z={};j(z,{parse:()=>L});module.exports=P(z);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */const O=/[^"\\\u0000-\u001f]*/y,v=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
H=`.................................."............./............................\
.................\\......\b....\f........
....\r..	`.split("."),I=h(()=>new Uint32Array(103),"hlArr"),w=I(),y=I(),k=I(),$=I(),
m=65536;let t=0;for(;t<48;t++)w[t]=y[t]=k[t]=$[t]=m;for(;t<58;t++)w[t]=(y[t]=(k[t]=
($[t]=t-48)<<4)<<4)<<4;for(;t<65;t++)w[t]=y[t]=k[t]=$[t]=m;for(;t<71;t++)w[t]=(y[t]=
(k[t]=($[t]=t-55)<<4)<<4)<<4;for(;t<97;t++)w[t]=y[t]=k[t]=$[t]=m;for(;t<103;t++)
w[t]=(y[t]=(k[t]=($[t]=t-87)<<4)<<4)<<4;function E(n,o=""){if(!(n>=0))return"end\
 of JSON input";if(n>31&&n<127)return`'${o}${String.fromCharCode(n)}'`;if(n===10)
return"\\n";if(n===9)return"\\t";const l=n.toString(16),u="0000".slice(l.length)+
l;return(n>31?`'${o}${String.fromCharCode(n)}' or `:"")+`\\u${u}`}h(E,"chDesc");
function J(n,o){const l=Object.keys(o),u=l.length;for(let i=0;i<u;i++){const e=l[i],
r=n.call(o,e,o[e]);r!==void 0?o[e]=r:delete o[e]}}h(J,"revive");function K(n,o,l){
const u=l===!0?" in array":l===!1?" in object":"",i=n.slice(0,o),e=i.match(/[^\n]{0,69}$/)[0],
r=e.length<i.length?"..."+e:e,d=o-(i.length-r.length),c=n.slice(o),a=c.match(/[^\n]{0,5}/)[0],
C=a.length<c.length?a+"...":a,g=r+C,A=" ".repeat(d<1?0:d-1)+"^";return`${u}
At position ${o} in JSON:
${g}
${A}`}h(K,"errContext");function L(n,o,l,u=1/0){typeof n!="string"&&(n=String(n)),
typeof o!="function"&&(o=void 0);let i=0,e,r,d,c,a;function C(s){throw new SyntaxError(
s+K(n,i,d))}h(C,"err");function g(){C(`JSON structure too deeply nested (current\
 max depth: ${u})`)}h(g,"tooDeep");function A(s){C(`Unexpected ${E(e)}, expectin\
g ${s}`)}h(A,"expected");function U(){const s=i-1;switch(v.lastIndex=s,v.test(n)!==
!0&&A("JSON value"),i=v.lastIndex,e){case 102:return!1;case 110:return null;case 116:
return!0;default:const p=n.slice(s,i);return l?l(p,c):+p}}h(U,"word");function b(){
let s="";for(;;){O.lastIndex=i,O.test(n);const f=O.lastIndex;switch(f>i&&(s+=n.slice(
i,f),i=f),e=n.charCodeAt(i++),e){case 34:return s;case 92:if(e=n.charCodeAt(i++),
e===117){const N=w[n.charCodeAt(i++)]+y[n.charCodeAt(i++)]+k[n.charCodeAt(i++)]+
$[n.charCodeAt(i++)];if(N<m){s+=String.fromCharCode(N);continue}C("Invalid \\uXXX\
X escape in string")}const p=H[e];if(p){s+=p;continue}C(`Invalid escape sequence\
: ${E(e,"\\")} in string`);default:e>=0||C("Unterminated string"),C(`Invalid une\
scaped ${E(e)} in string`)}}}h(b,"string");e:{do e=n.charCodeAt(i++);while(e<=32&&
(e===32||e===10||e===13||e===9));switch(e){case 123:u===0&&g(),r={},c=void 0,d=!1;
break;case 91:u===0&&g(),r=[],c=0,d=!0;break;case 34:a=b();break e;default:a=U();
break e}const s=[];let f=0;const p=u+u-2;n:for(;;)if(d===!0)for(;;){do e=n.charCodeAt(
i++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===93){if(o!==void 0&&J(o,
r),a=r,f===0)break e;if(r=s[--f],c=s[--f],d=typeof c=="number",d===!0){r[c++]=a;
continue}else{r[c]=a;continue n}}if(c!==0){e!==44&&A("',' or ']' after value");do
e=n.charCodeAt(i++);while(e<=32&&(e===32||e===10||e===13||e===9))}switch(e){case 34:
r[c++]=b();continue;case 123:f===p&&g(),s[f++]=c,s[f++]=r,r={},c=void 0,d=!1;continue n;case 91:
f===p&&g(),s[f++]=c,s[f++]=r,r=[],c=0;continue;default:r[c++]=U()}}else for(;;){
do e=n.charCodeAt(i++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){
if(o!==void 0&&J(o,r),a=r,f===0)break e;if(r=s[--f],c=s[--f],d=typeof c=="number",
d===!0){r[c++]=a;continue n}else{r[c]=a;continue}}if(c!==void 0){e!==44&&A("',' \
or '}' after value");do e=n.charCodeAt(i++);while(e<=32&&(e===32||e===10||e===13||
e===9))}e!==34&&A("'}' or double-quoted key"),c=b();do e=n.charCodeAt(i++);while(e<=
32&&(e===32||e===10||e===13||e===9));e!==58&&A("':' after key");do e=n.charCodeAt(
i++);while(e<=32&&(e===32||e===10||e===13||e===9));switch(e){case 34:r[c]=b();continue;case 123:
f===p&&g(),s[f++]=c,s[f++]=r,r={},c=void 0;continue;case 91:f===p&&g(),s[f++]=c,
s[f++]=r,r=[],c=0,d=!0;continue n;default:r[c]=U()}}}do e=n.charCodeAt(i++);while(e<=
32&&(e===32||e===10||e===13||e===9));return e>=0&&C("Unexpected data after end o\
f JSON input"),o!==void 0&&(a={"":a},J(o,a),a=a[""]),a}h(L,"parse");
