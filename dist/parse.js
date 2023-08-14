"use strict";var $=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var O=Object.getOwnPropertyNames;var J=Object.prototype.hasOwnProperty;var N=(r,a)=>{for(var d in a)$(r,d,{get:a[d],enumerable:!0})},R=(r,a,d,i)=>{if(a&&
typeof a=="object"||typeof a=="function")for(let c of O(a))!J.call(r,c)&&c!==d&&
$(r,c,{get:()=>a[c],enumerable:!(i=v(a,c))||i.enumerable});return r};var U=r=>R($({},"__esModule",{value:!0}),r);var q={};N(q,{JSONParseError:()=>j,parse:()=>P});module.exports=U(q);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */class j extends Error{}const S=/[^"\\\u0000-\u001f]*/y,E=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
X=`.................................."............./............................\
.................\\......\b....\f........
....\r..	`.split("."),y=65536,p=[];for(let r=0;r<4;r++){const a=p[r]=new Uint32Array(
103),d=r<<2;let i=0;for(;i<48;i++)a[i]=y;for(;i<58;i++)a[i]=i-48<<d;for(;i<65;i++)
a[i]=y;for(;i<71;i++)a[i]=i-55<<d;for(;i<97;i++)a[i]=y;for(;i<103;i++)a[i]=i-87<<
d}function b(r,a=""){if(!(r>=0))return"end of input";if(r>31&&r<127)return`'${a}${String.
fromCharCode(r)}'`;if(r===10)return"\\n";if(r===9)return"\\t";const d=r.toString(
16),i="0000".slice(d.length)+d;return(r>31?`'${a}${String.fromCharCode(r)}', `:"")+
`\\u${i}`}function I(r,a){const d=Object.keys(a),i=d.length;for(let c=0;c<i;c++){
const A=d[c],s=r.call(a,A,a[A]);s!==void 0?a[A]=s:delete a[A]}}function P(r,a,d,i=1/0){
typeof r!="string"&&(r=String(r)),typeof a!="function"&&(a=void 0);const c=[],A=(i-
1)*2;let s=0,o=0,e,n,u,t,f;function l(h){throw new j(`${h}
At character ${o} in JSON: ${r}`)}function m(){e>=0||l("Premature end of JSON da\
ta");const h=o-1;E.lastIndex=h,E.test(r)||l(`Unexpected ${b(e)}, expecting numbe\
r, true, false or null`),o=E.lastIndex;let C;switch(e){case 102:C=!1;break;case 110:
C=null;break;case 116:C=!0;break;default:const k=r.slice(h,o);C=d?d(k):+k}return e=
r.charCodeAt(o++),C}function w(){let h="";for(;;){S.lastIndex=o,S.test(r);const g=S.
lastIndex;switch(g>o&&(h+=r.slice(o,g),o=g),e=r.charCodeAt(o++),e){case 34:return e=
r.charCodeAt(o++),h;case 92:if(e=r.charCodeAt(o++),e===117){const k=p[3][r.charCodeAt(
o++)]+p[2][r.charCodeAt(o++)]+p[1][r.charCodeAt(o++)]+p[0][r.charCodeAt(o++)];if(k<
y){h+=String.fromCharCode(k);continue}l("Invalid \\uXXXX escape in string")}const C=X[e];
if(C){h+=C;continue}l(`Invalid escape sequence in string: ${b(e,"\\")}`);default:
e>=0||l("Unterminated string"),l(`Invalid unescaped ${b(e)} in string`)}}}e:{do e=
r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||e===9));switch(e){case 123:
n={},t=void 0,u=!1;break;case 91:n=[],t=0,u=!0;break;case 34:f=w();break e;default:
f=m();break e}do e=r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||e===9));
o:for(;;){if(u)r:for(;;){if(e===93){do e=r.charCodeAt(o++);while(e<=32&&(e===32||
e===10||e===13||e===9));if(a!==void 0&&I(a,n),f=n,s===0)break e;n=c[--s],t=c[--s],
u=typeof t=="number",n[u?t++:t]=f;continue o}if(t!==0){e!==44&&l("Expected ',' o\
r ']' but got "+b(e)+" after value in array");do e=r.charCodeAt(o++);while(e<=32&&
(e===32||e===10||e===13||e===9))}switch(e){case 34:n[t++]=w();break;case 123:do e=
r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){n[t++]=
{},e=r.charCodeAt(o++);break}else{c[s++]=t,c[s++]=n,n={},t=void 0,u=!1;break r}case 91:
do e=r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===93){
n[t++]=[],e=r.charCodeAt(o++);break}else{c[s++]=t,c[s++]=n,n=[],t=0,u=!0;break r}default:
n[t++]=m()}for(;e<=32&&(e===32||e===10||e===13||e===9);)e=r.charCodeAt(o++)}else
r:for(;;){if(e===125){do e=r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||
e===9));if(a!==void 0&&I(a,n),f=n,s===0)break e;n=c[--s],t=c[--s],u=typeof t=="n\
umber",n[u?t++:t]=f;continue o}if(t!==void 0){e!==44&&l("Expected ',' or '}' but\
 got "+b(e)+" after value in object");do e=r.charCodeAt(o++);while(e<=32&&(e===32||
e===10||e===13||e===9))}for(e!==34&&l(`Expected '"' but got `+b(e)+" in object"),
t=w();e<=32&&(e===32||e===10||e===13||e===9);)e=r.charCodeAt(o++);e!==58&&l("Exp\
ected ':' but got "+b(e)+" after key in object");do e=r.charCodeAt(o++);while(e<=
32&&(e===32||e===10||e===13||e===9));switch(e){case 34:n[t]=w();break;case 123:do
e=r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){n[t]=
{},e=r.charCodeAt(o++);break}else{c[s++]=t,c[s++]=n,n={},t=void 0,u=!1;break r}case 91:
do e=r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===93){
n[t]=[],e=r.charCodeAt(o++);break}else{c[s++]=t,c[s++]=n,n=[],t=0,u=!0;break r}default:
n[t]=m()}for(;e<=32&&(e===32||e===10||e===13||e===9);)e=r.charCodeAt(o++)}s>A&&l(
`Structure too deeply nested (current maximum is ${i})`)}}for(;e<=32&&(e===32||e===
10||e===13||e===9);)e=r.charCodeAt(o++);return e>=0&&l("Unexpected data after en\
d of JSON"),a!==void 0&&(f={"":f},I(a,f),f=f[""]),f}
