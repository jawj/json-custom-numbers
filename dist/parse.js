"use strict";var S=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var J=Object.getOwnPropertyNames;var N=Object.prototype.hasOwnProperty;var E=(r,a)=>{for(var d in a)S(r,d,{get:a[d],enumerable:!0})},R=(r,a,d,i)=>{if(a&&
typeof a=="object"||typeof a=="function")for(let c of J(a))!N.call(r,c)&&c!==d&&
S(r,c,{get:()=>a[c],enumerable:!(i=j(a,c))||i.enumerable});return r};var X=r=>R(S({},"__esModule",{value:!0}),r);var D={};E(D,{JSONParseError:()=>O,parse:()=>P});module.exports=X(D);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */class O extends Error{}const m=/[^"\\\u0000-\u001f]*/y,I=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
q=`.................................."............./............................\
.................\\......\b....\f........
....\r..	`.split("."),y=65536,b=[];for(let r=0;r<4;r++){const a=b[r]=new Uint32Array(
103),d=r<<2;let i=0;for(;i<48;i++)a[i]=y;for(;i<58;i++)a[i]=i-48<<d;for(;i<65;i++)
a[i]=y;for(;i<71;i++)a[i]=i-55<<d;for(;i<97;i++)a[i]=y;for(;i<103;i++)a[i]=i-87<<
d}function p(r,a=""){if(!(r>=0))return"end of JSON input";if(r>31&&r<127)return`\
'${a}${String.fromCharCode(r)}'`;if(r===10)return"\\n";if(r===9)return"\\t";const d=r.
toString(16),i="0000".slice(d.length)+d;return(r>31?`'${a}${String.fromCharCode(
r)}', `:"")+`\\u${i}`}function U(r,a){const d=Object.keys(a),i=d.length;for(let c=0;c<
i;c++){const A=d[c],s=r.call(a,A,a[A]);s!==void 0?a[A]=s:delete a[A]}}function P(r,a,d,i=1/0){
typeof r!="string"&&(r=String(r)),typeof a!="function"&&(a=void 0);const c=[],A=(i-
1)*2;let s=0,o=0,e,t,f,n,l;function u(h){throw new O(`${h}
At character ${o} in JSON: ${r}`)}function v(){return f===!0?"in array":f===!1?"\
in object":"at top level"}function $(){e>=0||u(`Unexpected end of JSON input ${v()}`);
const h=o-1;I.lastIndex=h,I.test(r)||u(`Unexpected ${p(e)}, expecting JSON value\
 ${v()}`),o=I.lastIndex;let C;switch(e){case 102:C=!1;break;case 110:C=null;break;case 116:
C=!0;break;default:const k=r.slice(h,o);C=d?d(k):+k}return e=r.charCodeAt(o++),C}
function w(){let h="";for(;;){m.lastIndex=o,m.test(r);const g=m.lastIndex;switch(g>
o&&(h+=r.slice(o,g),o=g),e=r.charCodeAt(o++),e){case 34:return e=r.charCodeAt(o++),
h;case 92:if(e=r.charCodeAt(o++),e===117){const k=b[3][r.charCodeAt(o++)]+b[2][r.
charCodeAt(o++)]+b[1][r.charCodeAt(o++)]+b[0][r.charCodeAt(o++)];if(k<y){h+=String.
fromCharCode(k);continue}u("Invalid \\uXXXX escape in string")}const C=q[e];if(C){
h+=C;continue}u(`Invalid escape sequence in string: ${p(e,"\\")}`);default:e>=0||
u("Unterminated string"),u(`Invalid unescaped ${p(e)} in string`)}}}e:{do e=r.charCodeAt(
o++);while(e<=32&&(e===32||e===10||e===13||e===9));switch(e){case 123:t={},n=void 0,
f=!1;break;case 91:t=[],n=0,f=!0;break;case 34:l=w();break e;default:l=$();break e}
do e=r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||e===9));o:for(;;){if(f)
r:for(;;){if(e===93){do e=r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||
e===9));if(a!==void 0&&U(a,t),l=t,s===0)break e;t=c[--s],n=c[--s],f=typeof n=="n\
umber",t[f?n++:n]=l;continue o}if(n!==0){e!==44&&u(`Unexpected ${p(e)}, expectin\
g ',' or ']' after value in array`);do e=r.charCodeAt(o++);while(e<=32&&(e===32||
e===10||e===13||e===9))}switch(e){case 34:t[n++]=w();break;case 123:do e=r.charCodeAt(
o++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){t[n++]={},e=r.charCodeAt(
o++);break}else{c[s++]=n,c[s++]=t,t={},n=void 0,f=!1;break r}case 91:do e=r.charCodeAt(
o++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===93){t[n++]=[],e=r.charCodeAt(
o++);break}else{c[s++]=n,c[s++]=t,t=[],n=0,f=!0;break r}default:t[n++]=$()}for(;e<=
32&&(e===32||e===10||e===13||e===9);)e=r.charCodeAt(o++)}else r:for(;;){if(e===125){
do e=r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||e===9));if(a!==void 0&&
U(a,t),l=t,s===0)break e;t=c[--s],n=c[--s],f=typeof n=="number",t[f?n++:n]=l;continue o}
if(n!==void 0){e!==44&&u(`Unexpected ${p(e)}, expecting ',' or '}' after value i\
n object`);do e=r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||e===9))}
for(e!==34&&u(`Unexpected ${p(e)}, expecting '}' or double-quoted key in object`),
n=w();e<=32&&(e===32||e===10||e===13||e===9);)e=r.charCodeAt(o++);e!==58&&u(`Une\
xpected ${p(e)}, expecting ':' after key in object`);do e=r.charCodeAt(o++);while(e<=
32&&(e===32||e===10||e===13||e===9));switch(e){case 34:t[n]=w();break;case 123:do
e=r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){t[n]=
{},e=r.charCodeAt(o++);break}else{c[s++]=n,c[s++]=t,t={},n=void 0,f=!1;break r}case 91:
do e=r.charCodeAt(o++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===93){
t[n]=[],e=r.charCodeAt(o++);break}else{c[s++]=n,c[s++]=t,t=[],n=0,f=!0;break r}default:
t[n]=$()}for(;e<=32&&(e===32||e===10||e===13||e===9);)e=r.charCodeAt(o++)}s>A&&u(
`Structure too deeply nested (maximum is set to ${i})`)}}for(;e<=32&&(e===32||e===
10||e===13||e===9);)e=r.charCodeAt(o++);return e>=0&&u("Unexpected data after en\
d of JSON input"),a!==void 0&&(l={"":l},U(a,l),l=l[""]),l}
