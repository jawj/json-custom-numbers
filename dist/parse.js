"use strict";var b=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var x=Object.getOwnPropertyNames;var E=Object.prototype.hasOwnProperty;var C=(n,t)=>b(n,"name",{value:t,configurable:!0});var J=(n,t)=>{for(var f in t)b(n,f,{get:t[f],enumerable:!0})},N=(n,t,f,i)=>{if(t&&
typeof t=="object"||typeof t=="function")for(let r of x(t))!E.call(n,r)&&r!==f&&
b(n,r,{get:()=>t[r],enumerable:!(i=X(t,r))||i.enumerable});return n};var q=n=>N(b({},"__esModule",{value:!0}),n);var L={};J(L,{JSONParseError:()=>I,parse:()=>K});module.exports=q(L);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */const O=class O extends Error{};C(O,"JSONParseError");let I=O;const U=/[^"\\\u0000-\u001f]*/y,
j=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,H=`........\
.........................."............./.......................................\
......\\......\b....\f........
....\r..	`.split("."),m=65536,y=[];for(let n=0;n<4;n++){const t=y[n]=new Uint32Array(
103),f=n<<2;let i=0;for(;i<48;i++)t[i]=m;for(;i<58;i++)t[i]=i-48<<f;for(;i<65;i++)
t[i]=m;for(;i<71;i++)t[i]=i-55<<f;for(;i<97;i++)t[i]=m;for(;i<103;i++)t[i]=i-87<<
f}function g(n,t=""){if(!(n>=0))return"end of JSON input";if(n>31&&n<127)return`\
'${t}${String.fromCharCode(n)}'`;if(n===10)return"\\n";if(n===9)return"\\t";const f=n.
toString(16),i="0000".slice(f.length)+f;return(n>31?`'${t}${String.fromCharCode(
n)}', `:"")+`\\u${i}`}C(g,"chDesc");function v(n,t){const f=Object.keys(t),i=f.length;
for(let r=0;r<i;r++){const h=f[r],s=n.call(t,h,t[h]);s!==void 0?t[h]=s:delete t[h]}}
C(v,"reviveContainer");function K(n,t,f,i=1/0){typeof n!="string"&&(n=String(n)),
typeof t!="function"&&(t=void 0);const r=[],h=(i-1)*2;let s=0,c=0,e,a,u,o,d;function l(p){
throw new I(`${p}
At character ${c} in JSON: ${n}`)}C(l,"error");function A(){l(`JSON structure is\
 too deeply nested (current maximum depth: ${i})`)}C(A,"depthError");function S(){
const p=c-1;switch(j.lastIndex=p,j.test(n)||l(`Unexpected ${g(e)}, expecting JSO\
N value ${u===!0?"in array":u===!1?"in object":"at top level"}`),c=j.lastIndex,e){case 102:
return!1;case 110:return null;case 116:return!0;default:const w=n.slice(p,c);return f?
f(w,o):+w}}C(S,"word");function k(){let p="";for(;;){U.lastIndex=c,U.test(n);const $=U.
lastIndex;switch($>c&&(p+=n.slice(c,$),c=$),e=n.charCodeAt(c++),e){case 34:return p;case 92:
if(e=n.charCodeAt(c++),e===117){const R=y[3][n.charCodeAt(c++)]+y[2][n.charCodeAt(
c++)]+y[1][n.charCodeAt(c++)]+y[0][n.charCodeAt(c++)];if(R<m){p+=String.fromCharCode(
R);continue}l("Invalid \\uXXXX escape in string")}const w=H[e];if(w){p+=w;continue}
l(`Invalid escape sequence in string: ${g(e,"\\")}`);default:e>=0||l("Unterminat\
ed string"),l(`Invalid unescaped ${g(e)} in string`)}}}C(k,"string");e:{do e=n.charCodeAt(
c++);while(e<=32&&(e===32||e===10||e===13||e===9));switch(e){case 123:a={},o=void 0,
u=!1;break;case 91:a=[],o=0,u=!0;break;case 34:d=k();break e;default:d=S();break e}
n:for(;;)if(u)for(;;){do e=n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===13||
e===9));if(e===93){if(t!==void 0&&v(t,a),d=a,s===0)break e;a=r[--s],o=r[--s],u=typeof o==
"number",a[u?o++:o]=d;continue n}if(o!==0){e!==44&&l(`Unexpected ${g(e)}, expect\
ing ',' or ']' after value in array`);do e=n.charCodeAt(c++);while(e<=32&&(e===32||
e===10||e===13||e===9))}switch(e){case 34:a[o++]=k();continue;case 123:s===h&&A(),
r[s++]=o,r[s++]=a,a={},o=void 0,u=!1;continue n;case 91:s===h&&A(),r[s++]=o,r[s++]=
a,a=[],o=0;continue;default:a[o++]=S()}}else for(;;){do e=n.charCodeAt(c++);while(e<=
32&&(e===32||e===10||e===13||e===9));if(e===125){if(t!==void 0&&v(t,a),d=a,s===0)
break e;a=r[--s],o=r[--s],u=typeof o=="number",a[u?o++:o]=d;continue n}if(o!==void 0){
e!==44&&l(`Unexpected ${g(e)}, expecting ',' or '}' after value in object`);do e=
n.charCodeAt(c++);while(e<=32&&(e===32||e===10||e===13||e===9))}e!==34&&l(`Unexp\
ected ${g(e)}, expecting '}' or double-quoted key in object`),o=k();do e=n.charCodeAt(
c++);while(e<=32&&(e===32||e===10||e===13||e===9));e!==58&&l(`Unexpected ${g(e)}\
, expecting ':' after key in object`);do e=n.charCodeAt(c++);while(e<=32&&(e===32||
e===10||e===13||e===9));switch(e){case 34:a[o]=k();continue;case 123:s===h&&A(),
r[s++]=o,r[s++]=a,a={},o=void 0;continue;case 91:s===h&&A(),r[s++]=o,r[s++]=a,a=
[],o=0,u=!0;continue n;default:a[o]=S()}}}do e=n.charCodeAt(c++);while(e<=32&&(e===
32||e===10||e===13||e===9));return e>=0&&l("Unexpected data after end of JSON in\
put"),t!==void 0&&(d={"":d},v(t,d),d=d[""]),d}C(K,"parse");
