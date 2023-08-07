"use strict";var k=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var j=Object.getOwnPropertyNames;var L=Object.prototype.hasOwnProperty;var O=(c,i)=>{for(var h in i)k(c,h,{get:i[h],enumerable:!0})},R=(c,i,h,w)=>{if(i&&
typeof i=="object"||typeof i=="function")for(let s of j(i))!L.call(c,s)&&s!==h&&
k(c,s,{get:()=>i[s],enumerable:!(w=E(i,s))||w.enumerable});return c};var X=c=>R(k({},"__esModule",{value:!0}),c);var q={};O(q,{JSONParseError:()=>S,parse:()=>P});module.exports=X(q);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive, state machine-based JSON parser that's
 * intended to precisely match native `JSON.parse` behaviour but also allow for
 * custom number parsing.
 */class S extends Error{}const l=["JSON value","end of input","'}' or first key\
 in object","key in object","':'","value in object","',' or '}' in object","']' \
or first value in array","value in array","',' or ']' in array"],y=/[^"\\\u0000-\u001f]*/y,
C=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,t="",v=[t,t,
t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,'"',t,t,t,t,t,t,
t,t,t,t,t,t,"/",t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,
t,t,t,t,t,t,t,t,t,t,t,t,"\\",t,t,t,t,t,"\b",t,t,t,"\f",t,t,t,t,t,t,t,`
`,t,t,t,"\r",t,"	"],e=65536,J=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,4096,8192,12288,
16384,20480,24576,28672,32768,36864,e,e,e,e,e,e,e,40960,45056,49152,53248,57344,
61440,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,40960,45056,49152,53248,
57344,61440]),N=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,256,512,768,1024,1280,1536,1792,
2048,2304,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840]),D=new Uint32Array([e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,0,16,32,48,64,80,96,112,128,144,e,e,e,e,e,e,e,160,176,192,208,224,240,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,160,176,192,208,224,240]),M=new Uint32Array(
[e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,0,1,2,3,4,5,6,7,8,9,e,e,e,e,e,e,e,10,11,12,13,14,15,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,10,11,12,13,14,15]),I="Maximum nesting d\
epth exceeded";function U(c,i=""){if(!(c>=0))return"end of input";if(c>31&&c<127)
return`'${i}${String.fromCharCode(c)}'`;if(c===10)return"\\n";if(c===9)return"\\t";
const h=c.toString(16),w="0000".slice(h.length)+h;return(c>31?`'${i}${String.fromCharCode(
c)}', `:"")+`\\u${w}`}function A(c,i){const h=Object.keys(i),w=h.length;for(let s=0;s<
w;s++){const g=h[s],o=c.call(i,g,i[g]);o!==void 0?i[g]=o:delete i[g]}}function P(c,i,h,w=1/0){
typeof c!="string"&&(c=String(c)),typeof i!="function"&&(i=void 0);const s=[],g=w*
3;let o=0,r,n=0,u=0,f,p,a;function d($){return new S(`${$}
At character ${o} in JSON: ${c}`)}e:for(;;){do r=c.charCodeAt(o++);while(r<33&&(r===
32||r===10||r===13||r===9));switch(r){case 44:switch(n){case 6:f[p]=a,n=3;continue;case 9:
f[p++]=a,n=8;continue;default:throw d(`Unexpected ',', expecting ${l[n]}`)}case 34:
a="";t:for(;;){y.lastIndex=o,y.test(c);const x=y.lastIndex;switch(x>o&&(a+=c.slice(
o,x),o=x),r=c.charCodeAt(o++),r){case 34:break t;case 92:if(r=c.charCodeAt(o++),
r===117){const m=J[c.charCodeAt(o++)]+N[c.charCodeAt(o++)]+D[c.charCodeAt(o++)]+
M[c.charCodeAt(o++)];if(m<e){a+=String.fromCharCode(m);continue}throw d("Invalid\
 \\uXXXX escape in string")}const b=v[r];if(b){a+=b;continue}throw d(`Invalid es\
cape sequence in string: ${U(r,"\\")}`)}throw r>=0?d(`Invalid unescaped ${U(r)} \
in string`):d("Unterminated string")}switch(n){case 3:case 2:p=a,n=4;continue;case 5:
n=6;continue;case 8:case 7:n=9;continue;case 0:n=1;continue;default:throw d(`Une\
xpected '"', expecting ${l[n]}`)}case 58:if(n!==4)throw d(`Unexpected ':', expec\
ting ${l[n]}`);n=5;continue;case 123:if(s[u++]=f,s[u++]=p,f={},u>g)throw d(I);switch(n){case 5:
s[u++]=6,n=2;continue;case 8:case 7:s[u++]=9,n=2;continue;case 0:s[u++]=1,n=2;continue;default:
throw d(`Unexpected '{', expecting ${l[n]}`)}case 125:switch(n){case 6:f[p]=a,i!==
void 0&&A(i,f);case 2:a=f,n=s[--u],p=s[--u],f=s[--u];continue;default:throw d(`U\
nexpected '}', expecting ${l[n]}`)}case 91:if(s[u++]=f,s[u++]=p,f=[],p=0,u>g)throw d(
I);switch(n){case 5:s[u++]=6,n=7;continue;case 8:case 7:s[u++]=9,n=7;continue;case 0:
s[u++]=1,n=7;continue;default:throw d(`Unexpected '[', expecting ${l[n]}`)}case 93:
switch(n){case 9:f[p]=a,i!==void 0&&A(i,f);case 7:a=f,n=s[--u],p=s[--u],f=s[--u];
continue;default:throw d(`Unexpected ']', expecting ${l[n]}`)}default:const $=o-
1;if(C.lastIndex=$,!C.test(c)){if(!(r>=0))break e;throw d(`Unexpected ${U(r)}, e\
xpecting ${l[n]}`)}switch(o=C.lastIndex,r){case 116:a=!0;break;case 102:a=!1;break;case 110:
a=null;break;default:const x=c.slice($,o);a=h!==void 0?h(x):+x}switch(n){case 5:
n=6;continue;case 8:case 7:n=9;continue;case 0:n=1;continue;default:throw d(`Une\
xpected '${a}', expecting ${l[n]}`)}}}if(n!==1)throw d(`Unexpected end of input,\
 expecting ${l[n]}`);return i!==void 0&&(a={"":a},A(i,a),a=a[""]),a}
