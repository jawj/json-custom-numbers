"use strict";var S=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var T=Object.getOwnPropertyNames;var X=Object.prototype.hasOwnProperty;var p=(n,o)=>S(n,"name",{value:o,configurable:!0});var j=(n,o)=>{for(var l in o)S(n,l,{get:o[l],enumerable:!0})},q=(n,o,l,d)=>{if(o&&
typeof o=="object"||typeof o=="function")for(let i of T(o))!X.call(n,i)&&i!==l&&
S(n,i,{get:()=>o[i],enumerable:!(d=R(o,i))||d.enumerable});return n};var H=n=>q(S({},"__esModule",{value:!0}),n);var W={};j(W,{parse:()=>P});module.exports=H(W);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */const U=/[^"\\\u0000-\u001f]*/y,v=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
N=/[ \n\t\r]*$/y,K=`.................................."............./...........\
..................................\\......\b....\f........
....\r..	`.split("."),I=p(()=>new Uint32Array(103),"hlArr"),y=I(),k=I(),w=I(),$=I();
let t=0;for(;t<48;t++)y[t]=k[t]=w[t]=$[t]=65536;for(;t<58;t++)y[t]=(k[t]=(w[t]=($[t]=
t-48)<<4)<<4)<<4;for(;t<65;t++)y[t]=k[t]=w[t]=$[t]=65536;for(;t<71;t++)y[t]=(k[t]=
(w[t]=($[t]=t-55)<<4)<<4)<<4;for(;t<97;t++)y[t]=k[t]=w[t]=$[t]=65536;for(;t<103;t++)
y[t]=(k[t]=(w[t]=($[t]=t-87)<<4)<<4)<<4;function E(n,o=""){if(!(n>=0))return"end\
 of JSON input";if(n>31&&n<127)return`'${o}${String.fromCharCode(n)}'`;if(n===10)
return"\\n";if(n===9)return"\\t";const l=n.toString(16),d="0000".slice(l.length)+
l;return(n>31?`'${o}${String.fromCharCode(n)}' or `:"")+`\\u${d}`}p(E,"chDesc");
function O(n,o){const l=Object.keys(o),d=l.length;for(let i=0;i<d;i++){const e=l[i],
r=n.call(o,e,o[e]);r!==void 0?o[e]=r:delete o[e]}}p(O,"revive");function L(n,o,l){
const d=l===!0?" in array":l===!1?" in object":"",i=n.slice(0,o),e=i.match(/[^\n]{0,69}$/)[0],
r=e.length<i.length?"..."+e:e,u=o-(i.length-r.length),c=n.slice(o),a=c.match(/[^\n]{0,5}/)[0],
g=a.length<c.length?a+"...":a,C=r+g,A=" ".repeat(u<1?0:u-1)+"^";return`${d}
At position ${o} in JSON:
${C}
${A}`}p(L,"errContext");function P(n,o,l,d=1/0){typeof n!="string"&&(n=String(n)),
typeof o!="function"&&(o=void 0);let i=0,e,r,u,c,a;function g(s){throw new SyntaxError(
s+L(n,i,u))}p(g,"err");function C(){g(`JSON structure too deeply nested (current\
 max depth: ${d})`)}p(C,"tooDeep");function A(s){g(`Unexpected ${E(e)}, expectin\
g ${s}`)}p(A,"expected");function m(){const s=i-1;switch(v.lastIndex=s,v.test(n)!==
!0&&A("JSON value"),i=v.lastIndex,e){case 102:return!1;case 110:return null;case 116:
return!0;default:const h=n.slice(s,i);return l?l.call(r,c,h):+h}}p(m,"word");function b(){
let s="";e:for(;;){U.lastIndex=i,U.test(n);const f=U.lastIndex;for(f>i&&(s+=n.slice(
i,f),i=f),e=n.charCodeAt(i++);;){switch(e){case 34:return s;case 92:if(e=n.charCodeAt(
i++),e===117){const J=y[n.charCodeAt(i++)]+k[n.charCodeAt(i++)]+w[n.charCodeAt(i++)]+
$[n.charCodeAt(i++)];if(J<65536){s+=String.fromCharCode(J);break}g("Invalid \\uXX\
XX escape in string")}const h=K[e];if(h!==""&&h!==void 0){s+=h;break}g(`Invalid \
escape sequence: ${E(e,"\\")} in string`);default:e>=0||g("Unterminated string"),
g(`Invalid unescaped ${E(e)} in string`)}if(e=n.charCodeAt(i),e!==92&&e!==34&&e>=
32)continue e;i++}}}p(b,"string");e:{do e=n.charCodeAt(i++);while(e<=32&&(e===32||
e===10||e===13||e===9));switch(e){case 123:d===0&&C(),r={},c=void 0,u=!1;break;case 91:
d===0&&C(),r=[],c=0,u=!0;break;case 34:a=b();break e;default:a=m();break e}const s=[];
let f=0;const h=d+d-2;n:for(;;)if(u===!0)for(;;){do e=n.charCodeAt(i++);while(e<=
32&&(e===32||e===10||e===13||e===9));if(e===93){if(o!==void 0&&O(o,r),a=r,f===0)
break e;if(r=s[--f],c=s[--f],u=typeof c=="number",u===!0){r[c++]=a;continue}else{
r[c]=a;continue n}}if(c!==0){e!==44&&A("',' or ']' after value");do e=n.charCodeAt(
i++);while(e<=32&&(e===32||e===10||e===13||e===9))}switch(e){case 34:r[c++]=b();
continue;case 123:f===h&&C(),s[f++]=c,s[f++]=r,r={},c=void 0,u=!1;continue n;case 91:
f===h&&C(),s[f++]=c,s[f++]=r,r=[],c=0;continue;default:r[c++]=m()}}else for(;;){
do e=n.charCodeAt(i++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){
if(o!==void 0&&O(o,r),a=r,f===0)break e;if(r=s[--f],c=s[--f],u=typeof c=="number",
u===!0){r[c++]=a;continue n}else{r[c]=a;continue}}if(c!==void 0){e!==44&&A("',' \
or '}' after value");do e=n.charCodeAt(i++);while(e<=32&&(e===32||e===10||e===13||
e===9))}e!==34&&A("'}' or double-quoted key"),c=b();do e=n.charCodeAt(i++);while(e<=
32&&(e===32||e===10||e===13||e===9));e!==58&&A("':' after key");do e=n.charCodeAt(
i++);while(e<=32&&(e===32||e===10||e===13||e===9));switch(e){case 34:r[c]=b();continue;case 123:
f===h&&C(),s[f++]=c,s[f++]=r,r={},c=void 0;continue;case 91:f===h&&C(),s[f++]=c,
s[f++]=r,r=[],c=0,u=!0;continue n;default:r[c]=m()}}}return N.lastIndex=i,N.test(
n)===!1&&g("Unexpected data after end of JSON input"),o!==void 0&&(a={"":a},O(o,
a),a=a[""]),a}p(P,"parse");
