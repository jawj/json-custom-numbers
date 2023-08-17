"use strict";var S=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var J=Object.getOwnPropertyNames;var N=Object.prototype.hasOwnProperty;var E=(n,t)=>{for(var f in t)S(n,f,{get:t[f],enumerable:!0})},x=(n,t,f,o)=>{if(t&&
typeof t=="object"||typeof t=="function")for(let i of J(t))!N.call(n,i)&&i!==f&&
S(n,i,{get:()=>t[i],enumerable:!(o=v(t,i))||o.enumerable});return n};var R=n=>x(S({},"__esModule",{value:!0}),n);var P={};E(P,{JSONParseError:()=>j,parse:()=>q});module.exports=R(P);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */class j extends Error{}const m=/[^"\\\u0000-\u001f]*/y,I=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
X=`.................................."............./............................\
.................\\......\b....\f........
....\r..	`.split("."),k=65536,y=[];for(let n=0;n<4;n++){const t=y[n]=new Uint32Array(
103),f=n<<2;let o=0;for(;o<48;o++)t[o]=k;for(;o<58;o++)t[o]=o-48<<f;for(;o<65;o++)
t[o]=k;for(;o<71;o++)t[o]=o-55<<f;for(;o<97;o++)t[o]=k;for(;o<103;o++)t[o]=o-87<<
f}function C(n,t=""){if(!(n>=0))return"end of JSON input";if(n>31&&n<127)return`\
'${t}${String.fromCharCode(n)}'`;if(n===10)return"\\n";if(n===9)return"\\t";const f=n.
toString(16),o="0000".slice(f.length)+f;return(n>31?`'${t}${String.fromCharCode(
n)}', `:"")+`\\u${o}`}function U(n,t){const f=Object.keys(t),o=f.length;for(let i=0;i<
o;i++){const h=f[i],s=n.call(t,h,t[h]);s!==void 0?t[h]=s:delete t[h]}}function q(n,t,f,o=1/0){
typeof n!="string"&&(n=String(n)),typeof t!="function"&&(t=void 0);const i=[],h=(o-
1)*2;let s=0,c=0,e,a,d,r,u;function l(p){throw new j(`${p}
At character ${c} in JSON: ${n}`)}function w(){l(`JSON structure is too deeply n\
ested (current maximum depth: ${o})`)}function b(){e>=0||l(`Unexpected end of JS\
ON input ${d===!0?"in array":d===!1?"in object":"at top level"}`);const p=c-1;switch(I.
lastIndex=p,I.test(n)||l(`Unexpected ${C(e)}, expecting JSON value ${d===!0?"in \
array":d===!1?"in object":"at top level"}`),c=I.lastIndex,e){case 102:return!1;case 110:
return null;case 116:return!0;default:const g=n.slice(p,c);return f?f(g,r):+g}}function A(){
let p="";for(;;){m.lastIndex=c,m.test(n);const $=m.lastIndex;switch($>c&&(p+=n.slice(
c,$),c=$),e=n.charCodeAt(c++),e){case 34:return p;case 92:if(e=n.charCodeAt(c++),
e===117){const O=y[3][n.charCodeAt(c++)]+y[2][n.charCodeAt(c++)]+y[1][n.charCodeAt(
c++)]+y[0][n.charCodeAt(c++)];if(O<k){p+=String.fromCharCode(O);continue}l("Inva\
lid \\uXXXX escape in string")}const g=X[e];if(g){p+=g;continue}l(`Invalid escap\
e sequence in string: ${C(e,"\\")}`);default:e>=0||l("Unterminated string"),l(`I\
nvalid unescaped ${C(e)} in string`)}}}e:{do e=n.charCodeAt(c++);while(e<=32&&(e===
32||e===10||e===13||e===9));switch(e){case 123:a={},r=void 0,d=!1;break;case 91:
a=[],r=0,d=!0;break;case 34:u=A();break e;default:u=b();break e}n:for(;;)if(d)for(;;){
do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===93){
if(t!==void 0&&U(t,a),u=a,s===0)break e;a=i[--s],r=i[--s],d=typeof r=="number",a[d?
r++:r]=u;continue n}if(r!==0){e!==44&&l(`Unexpected ${C(e)}, expecting ',' or ']\
' after value in array`);do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===
13||e===9))}switch(e){case 34:a[r++]=A();continue;case 123:s===h&&w(),i[s++]=r,i[s++]=
a,a={},r=void 0,d=!1;continue n;case 91:s===h&&w(),i[s++]=r,i[s++]=a,a=[],r=0;continue;default:
a[r++]=b()}}else for(;;){do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===
13||e===9));if(e===125){if(t!==void 0&&U(t,a),u=a,s===0)break e;a=i[--s],r=i[--s],
d=typeof r=="number",a[d?r++:r]=u;continue n}if(r!==void 0){e!==44&&l(`Unexpecte\
d ${C(e)}, expecting ',' or '}' after value in object`);do e=n.charCodeAt(c++);while(e<=
32&&(e===32||e===10||e===13||e===9))}e!==34&&l(`Unexpected ${C(e)}, expecting '}\
' or double-quoted key in object`),r=A();do e=n.charCodeAt(c++);while(e<=32&&(e===
32||e===10||e===13||e===9));e!==58&&l(`Unexpected ${C(e)}, expecting ':' after k\
ey in object`);do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===13||e===
9));switch(e){case 34:a[r]=A();continue;case 123:s===h&&w(),i[s++]=r,i[s++]=a,a=
{},r=void 0;continue;case 91:s===h&&w(),i[s++]=r,i[s++]=a,a=[],r=0,d=!0;continue n;default:
a[r]=b()}}}do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===13||e===9));
return e>=0&&l("Unexpected data after end of JSON input"),t!==void 0&&(u={"":u},
U(t,u),u=u[""]),u}
