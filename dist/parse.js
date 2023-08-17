"use strict";var S=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var q=Object.getOwnPropertyNames;var H=Object.prototype.hasOwnProperty;var g=(n,i)=>S(n,"name",{value:i,configurable:!0});var K=(n,i)=>{for(var f in i)S(n,f,{get:i[f],enumerable:!0})},z=(n,i,f,h)=>{if(i&&
typeof i=="object"||typeof i=="function")for(let r of q(i))!H.call(n,r)&&r!==f&&
S(n,r,{get:()=>i[r],enumerable:!(h=N(i,r))||h.enumerable});return n};var B=n=>z(S({},"__esModule",{value:!0}),n);var G={};K(G,{JSONParseError:()=>v,parse:()=>F});module.exports=B(G);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */const E=class E extends Error{};g(E,"JSONParseError");let v=E;const O=/[^"\\\u0000-\u001f]*/y,
R=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,D=`........\
.........................."............./.......................................\
......\\......\b....\f........
....\r..	`.split("."),j=65536,w=new Uint32Array(103),y=new Uint32Array(103),A=new Uint32Array(
103),$=new Uint32Array(103);let t=0;for(;t<48;t++)w[t]=y[t]=A[t]=$[t]=j;for(;t<58;t++){
const n=t-48;w[t]=n<<12,y[t]=n<<8,A[t]=n<<4,$[t]=n}for(;t<65;t++)w[t]=y[t]=A[t]=
$[t]=j;for(;t<71;t++){const n=t-55;w[t]=n<<12,y[t]=n<<8,A[t]=n<<4,$[t]=n}for(;t<
97;t++)w[t]=y[t]=A[t]=$[t]=j;for(;t<103;t++){const n=t-87;w[t]=n<<12,y[t]=n<<8,A[t]=
n<<4,$[t]=n}function k(n,i=""){if(!(n>=0))return"end of JSON input";if(n>31&&n<127)
return`'${i}${String.fromCharCode(n)}'`;if(n===10)return"\\n";if(n===9)return"\\t";
const f=n.toString(16),h="0000".slice(f.length)+f;return(n>31?`'${i}${String.fromCharCode(
n)}', `:"")+`\\u${h}`}g(k,"chDesc");function X(n,i){const f=Object.keys(i),h=f.length;
for(let r=0;r<h;r++){const p=f[r],s=n.call(i,p,i[p]);s!==void 0?i[p]=s:delete i[p]}}
g(X,"reviveContainer");function F(n,i,f,h=1/0){typeof n!="string"&&(n=String(n)),
typeof i!="function"&&(i=void 0);const r=[],p=(h-1)*2;let s=0,c=0,e,a,u,o,d;function l(C){
throw new v(`${C}
At character ${c} in JSON: ${n}`)}g(l,"error");function m(){l(`JSON structure is\
 too deeply nested (current maximum depth: ${h})`)}g(m,"depthError");function x(){
const C=c-1;switch(R.lastIndex=C,R.test(n)||l(`Unexpected ${k(e)}, expecting JSO\
N value ${u===!0?"in array":u===!1?"in object":"at top level"}`),c=R.lastIndex,e){case 102:
return!1;case 110:return null;case 116:return!0;default:const b=n.slice(C,c);return f?
f(b,o):+b}}g(x,"word");function U(){let C="";for(;;){O.lastIndex=c,O.test(n);const I=O.
lastIndex;switch(I>c&&(C+=n.slice(c,I),c=I),e=n.charCodeAt(c++),e){case 34:return C;case 92:
if(e=n.charCodeAt(c++),e===117){const J=w[n.charCodeAt(c++)]+y[n.charCodeAt(c++)]+
A[n.charCodeAt(c++)]+$[n.charCodeAt(c++)];if(J<j){C+=String.fromCharCode(J);continue}
l("Invalid \\uXXXX escape in string")}const b=D[e];if(b){C+=b;continue}l(`Invali\
d escape sequence in string: ${k(e,"\\")}`);default:e>=0||l("Unterminated string"),
l(`Invalid unescaped ${k(e)} in string`)}}}g(U,"string");e:{do e=n.charCodeAt(c++);while(e<=
32&&(e===32||e===10||e===13||e===9));switch(e){case 123:a={},o=void 0,u=!1;break;case 91:
a=[],o=0,u=!0;break;case 34:d=U();break e;default:d=x();break e}n:for(;;)if(u)for(;;){
do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===93){
if(i!==void 0&&X(i,a),d=a,s===0)break e;a=r[--s],o=r[--s],u=typeof o=="number",a[u?
o++:o]=d;continue n}if(o!==0){e!==44&&l(`Unexpected ${k(e)}, expecting ',' or ']\
' after value in array`);do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===
13||e===9))}switch(e){case 34:a[o++]=U();continue;case 123:s===p&&m(),r[s++]=o,r[s++]=
a,a={},o=void 0,u=!1;continue n;case 91:s===p&&m(),r[s++]=o,r[s++]=a,a=[],o=0;continue;default:
a[o++]=x()}}else for(;;){do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===
13||e===9));if(e===125){if(i!==void 0&&X(i,a),d=a,s===0)break e;a=r[--s],o=r[--s],
u=typeof o=="number",a[u?o++:o]=d;continue n}if(o!==void 0){e!==44&&l(`Unexpecte\
d ${k(e)}, expecting ',' or '}' after value in object`);do e=n.charCodeAt(c++);while(e<=
32&&(e===32||e===10||e===13||e===9))}e!==34&&l(`Unexpected ${k(e)}, expecting '}\
' or double-quoted key in object`),o=U();do e=n.charCodeAt(c++);while(e<=32&&(e===
32||e===10||e===13||e===9));e!==58&&l(`Unexpected ${k(e)}, expecting ':' after k\
ey in object`);do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===13||e===
9));switch(e){case 34:a[o]=U();continue;case 123:s===p&&m(),r[s++]=o,r[s++]=a,a=
{},o=void 0;continue;case 91:s===p&&m(),r[s++]=o,r[s++]=a,a=[],o=0,u=!0;continue n;default:
a[o]=x()}}}do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===13||e===9));
return e>=0&&l("Unexpected data after end of JSON input"),i!==void 0&&(d={"":d},
X(i,d),d=d[""]),d}g(F,"parse");
