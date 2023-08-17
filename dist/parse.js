"use strict";var U=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var K=Object.getOwnPropertyNames;var z=Object.prototype.hasOwnProperty;var C=(n,i)=>U(n,"name",{value:i,configurable:!0});var B=(n,i)=>{for(var f in i)U(n,f,{get:i[f],enumerable:!0})},F=(n,i,f,d)=>{if(i&&
typeof i=="object"||typeof i=="function")for(let r of K(i))!z.call(n,r)&&r!==f&&
U(n,r,{get:()=>i[r],enumerable:!(d=H(i,r))||d.enumerable});return n};var G=n=>F(U({},"__esModule",{value:!0}),n);var Q={};B(Q,{JSONParseError:()=>O,parse:()=>M});module.exports=G(Q);/**
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
const f=n.toString(16),d="0000".slice(f.length)+f;return(n>31?`'${i}${String.fromCharCode(
n)}', `:"")+`\\u${d}`}C(J,"chDesc");function N(n,i){const f=Object.keys(i),d=f.length;
for(let r=0;r<d;r++){const p=f[r],s=n.call(i,p,i[p]);s!==void 0?i[p]=s:delete i[p]}}
C(N,"reviveContainer");function M(n,i,f,d=1/0){typeof n!="string"&&(n=String(n)),
typeof i!="function"&&(i=void 0);const r=[],p=d+d-2;let s=0,c=0,e,a,l,o,u;function w(h){
throw new O(`${h}
At character ${c} in JSON: ${n}`)}C(w,"err");function $(){w(`JSON structure is t\
oo deeply nested (current maximum depth: ${d})`)}C($,"tooDeep");function b(h){w(
`Unexpected ${J(e)}, expecting ${h} ${l===!0?"in array":l===!1?"in object":"at t\
op level"}`)}C(b,"expected");function R(){const h=c-1;switch(j.lastIndex=h,j.test(
n)||b("JSON value"),c=j.lastIndex,e){case 102:return!1;case 110:return null;case 116:
return!0;default:const I=n.slice(h,c);return f?f(I,o):+I}}C(R,"word");function S(){
let h="";for(;;){X.lastIndex=c,X.test(n);const m=X.lastIndex;switch(m>c&&(h+=n.slice(
c,m),c=m),e=n.charCodeAt(c++),e){case 34:return h;case 92:if(e=n.charCodeAt(c++),
e===117){const E=A[n.charCodeAt(c++)]+y[n.charCodeAt(c++)]+g[n.charCodeAt(c++)]+
k[n.charCodeAt(c++)];if(E<v){h+=String.fromCharCode(E);continue}w("Invalid \\uXXX\
X escape in string")}const I=L[e];if(I){h+=I;continue}w(`Invalid escape sequence\
 in string: ${J(e,"\\")}`);default:e>=0||w("Unterminated string"),w(`Invalid une\
scaped ${J(e)} in string`)}}}C(S,"string");e:{do e=n.charCodeAt(c++);while(e<=32&&
(e===32||e===10||e===13||e===9));switch(e){case 123:d===0&&$(),a={},o=void 0,l=!1;
break;case 91:d===0&&$(),a=[],o=0,l=!0;break;case 34:u=S();break e;default:u=R();
break e}n:for(;;)if(l)for(;;){do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||
e===13||e===9));if(e===93){if(i!==void 0&&N(i,a),u=a,s===0)break e;a=r[--s],o=r[--s],
l=typeof o=="number",a[l?o++:o]=u;continue n}if(o!==0){e!==44&&b("',' or ']' aft\
er value");do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===13||e===9))}
switch(e){case 34:a[o++]=S();continue;case 123:s===p&&$(),r[s++]=o,r[s++]=a,a={},
o=void 0,l=!1;continue n;case 91:s===p&&$(),r[s++]=o,r[s++]=a,a=[],o=0;continue;default:
a[o++]=R()}}else for(;;){do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===
13||e===9));if(e===125){if(i!==void 0&&N(i,a),u=a,s===0)break e;a=r[--s],o=r[--s],
l=typeof o=="number",a[l?o++:o]=u;continue n}if(o!==void 0){e!==44&&b("',' or '}\
' after value");do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===13||e===
9))}e!==34&&b("'}' or double-quoted key"),o=S();do e=n.charCodeAt(c++);while(e<=
32&&(e===32||e===10||e===13||e===9));e!==58&&b("':' after key");do e=n.charCodeAt(
c++);while(e<=32&&(e===32||e===10||e===13||e===9));switch(e){case 34:a[o]=S();continue;case 123:
s===p&&$(),r[s++]=o,r[s++]=a,a={},o=void 0;continue;case 91:s===p&&$(),r[s++]=o,
r[s++]=a,a=[],o=0,l=!0;continue n;default:a[o]=R()}}}do e=n.charCodeAt(c++);while(e<=
32&&(e===32||e===10||e===13||e===9));return e>=0&&w("Unexpected data after end o\
f JSON input"),i!==void 0&&(u={"":u},N(i,u),u=u[""]),u}C(M,"parse");
