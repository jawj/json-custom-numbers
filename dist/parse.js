"use strict";var k=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var E=Object.getOwnPropertyNames;var O=Object.prototype.hasOwnProperty;var R=(e,t)=>{for(var r in t)k(e,r,{get:t[r],enumerable:!0})},X=(e,t,r,c)=>{if(t&&
typeof t=="object"||typeof t=="function")for(let s of E(t))!O.call(e,s)&&s!==r&&
k(e,s,{get:()=>t[s],enumerable:!(c=j(t,s))||c.enumerable});return e};var v=e=>X(k({},"__esModule",{value:!0}),e);var D={};R(D,{JSONParseError:()=>S,parse:()=>N});module.exports=v(D);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive, state machine-based JSON parser that's
 * intended to precisely match native `JSON.parse` behaviour but also allow for
 * custom number parsing.
 */class S extends Error{}const p=["JSON value","end of input","'}' or first key\
 in object","key in object","':'","value in object","',' or '}' in object","']' \
or first value in array","value in array","',' or ']' in array"],w=/[^"\\\u0000-\u001f]*/y,
y=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,J=`........\
.........................."............./.......................................\
......\\......\b....\f........
....\r..	`.split("."),C=65536,$=[],I="Maximum nesting depth exceeded";for(let e=0;e<
4;e++){const t=$[e]=new Uint32Array(103),r=e<<2;let c=0;for(;c<48;c++)t[c]=C;for(;c<
58;c++)t[c]=c-48<<r;for(;c<65;c++)t[c]=C;for(;c<71;c++)t[c]=c-55<<r;for(;c<97;c++)
t[c]=C;for(;c<103;c++)t[c]=c-87<<r}function U(e,t=""){if(!(e>=0))return"end of i\
nput";if(e>31&&e<127)return`'${t}${String.fromCharCode(e)}'`;if(e===10)return"\\n";
if(e===9)return"\\t";const r=e.toString(16),c="0000".slice(r.length)+r;return(e>
31?`'${t}${String.fromCharCode(e)}', `:"")+`\\u${c}`}function b(e,t){const r=Object.
keys(t),c=r.length;for(let s=0;s<c;s++){const h=r[s],a=e.call(t,h,t[h]);a!==void 0?
t[h]=a:delete t[h]}}function N(e,t,r,c=1/0){typeof e!="string"&&(e=String(e)),typeof t!=
"function"&&(t=void 0);const s=[],h=c*3;let a=0,u=0,o,n=0,f,l,i;function d(x){throw new S(
`${x}
At character ${u} in JSON: ${e}`)}e:for(;;){do o=e.charCodeAt(u++);while(o<33&&(o===
32||o===10||o===13||o===9));switch(o){case 44:switch(n){case 6:f[l]=i,n=3;continue;case 9:
f[l++]=i,n=8;continue;default:d(`Unexpected ',', expecting ${p[n]}`)}case 34:i="";
n:for(;;){w.lastIndex=u,w.test(e);const g=w.lastIndex;switch(g>u&&(i+=e.slice(u,
g),u=g),o=e.charCodeAt(u++),o){case 34:break n;case 92:if(o=e.charCodeAt(u++),o===
117){const m=$[3][e.charCodeAt(u++)]+$[2][e.charCodeAt(u++)]+$[1][e.charCodeAt(u++)]+
$[0][e.charCodeAt(u++)];if(m<C){i+=String.fromCharCode(m);continue}d("Invalid \\u\
XXXX escape in string")}const A=J[o];if(A){i+=A;continue}d(`Invalid escape seque\
nce in string: ${U(o,"\\")}`)}o>=0||d("Unterminated string"),d(`Invalid unescape\
d ${U(o)} in string`)}switch(n){case 3:case 2:l=i,n=4;continue;case 5:n=6;continue;case 8:case 7:
n=9;continue;case 0:n=1;continue;default:d(`Unexpected '"', expecting ${p[n]}`)}case 58:
n!==4&&d(`Unexpected ':', expecting ${p[n]}`),n=5;continue;case 123:switch(s[a++]=
f,s[a++]=l,f={},a>h&&d(I),n){case 5:s[a++]=6,n=2;continue;case 8:case 7:s[a++]=9,
n=2;continue;case 0:s[a++]=1,n=2;continue;default:d(`Unexpected '{', expecting ${p[n]}`)}case 125:
switch(n){case 6:f[l]=i,t!==void 0&&b(t,f);case 2:i=f,n=s[--a],l=s[--a],f=s[--a];
continue;default:d(`Unexpected '}', expecting ${p[n]}`)}case 91:switch(s[a++]=f,
s[a++]=l,f=[],l=0,a>h&&d(I),n){case 5:s[a++]=6,n=7;continue;case 8:case 7:s[a++]=
9,n=7;continue;case 0:s[a++]=1,n=7;continue;default:d(`Unexpected '[', expecting\
 ${p[n]}`)}case 93:switch(n){case 9:f[l]=i,t!==void 0&&b(t,f);case 7:i=f,n=s[--a],
l=s[--a],f=s[--a];continue;default:d(`Unexpected ']', expecting ${p[n]}`)}default:
const x=u-1;if(y.lastIndex=x,!y.test(e)){if(!(o>=0))break e;d(`Unexpected ${U(o)}\
, expecting ${p[n]}`)}switch(u=y.lastIndex,o){case 116:i=!0;break;case 102:i=!1;
break;case 110:i=null;break;default:const g=e.slice(x,u);i=r!==void 0?r(g):+g}switch(n){case 5:
n=6;continue;case 8:case 7:n=9;continue;case 0:n=1;continue;default:d(`Unexpecte\
d '${i}', expecting ${p[n]}`)}}}return n!==1&&d(`Unexpected end of input, expect\
ing ${p[n]}`),t!==void 0&&(i={"":i},b(t,i),i=i[""]),i}
