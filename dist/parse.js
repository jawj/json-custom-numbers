"use strict";var x=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var b=Object.getOwnPropertyNames;var m=Object.prototype.hasOwnProperty;var j=(c,o)=>{for(var h in o)x(c,h,{get:o[h],enumerable:!0})},E=(c,o,h,a)=>{if(o&&
typeof o=="object"||typeof o=="function")for(let i of b(o))!m.call(c,i)&&i!==h&&
x(c,i,{get:()=>o[i],enumerable:!(a=S(o,i))||a.enumerable});return c};var L=c=>E(x({},"__esModule",{value:!0}),c);var D={};j(D,{JSONParseError:()=>I,parse:()=>N});module.exports=L(D);class I extends Error{}
const p=["JSON value","end of input","'}' or first key in object","key in object",
"':'","value in object","',' or '}' in object","']' or first value in array","va\
lue in array","',' or ']' in array"],$=/[^"\\\u0000-\u001f]*/y,y=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
n="",O=[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,'"',
n,n,n,n,n,n,n,n,n,n,n,n,"/",n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,
n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,"\\",n,n,n,n,n,"\b",n,n,n,"\f",n,n,n,n,n,n,n,
`
`,n,n,n,"\r",n,"	"],e=65536,R=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,4096,8192,12288,
16384,20480,24576,28672,32768,36864,e,e,e,e,e,e,e,40960,45056,49152,53248,57344,
61440,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,40960,45056,49152,53248,
57344,61440]),X=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,256,512,768,1024,1280,1536,1792,
2048,2304,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840]),v=new Uint32Array([e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,0,16,32,48,64,80,96,112,128,144,e,e,e,e,e,e,e,160,176,192,208,224,240,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,160,176,192,208,224,240]),J=new Uint32Array(
[e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,0,1,2,3,4,5,6,7,8,9,e,e,e,e,e,e,e,10,11,12,13,14,15,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,10,11,12,13,14,15]);function C(c,o=""){if(!(c>=
0))return"end of input";if(c>31&&c<127)return`'${o}${String.fromCharCode(c)}'`;if(c===
10)return"\\n";if(c===9)return"\\t";const h=c.toString(16),a="0000".slice(h.length)+
h;return(c>31?`'${o}${String.fromCharCode(c)}', `:"")+`\\u${a}`}function U(c,o){
const h=Object.keys(o),a=h.length;for(let i=0;i<a;i++){const s=h[i],t=c.call(o,s,
o[s]);t!==void 0?o[s]=t:delete o[s]}}function N(c,o,h){c=String(c),typeof o!="fu\
nction"&&(o=void 0);const a=[];let i=0,s,t=0,u=0,d,l,r;function f(g){return new I(
`${g}
At character ${i} in JSON: ${c}`)}e:for(;;){do s=c.charCodeAt(i++);while(s<33&&(s===
32||s===10||s===13||s===9));switch(s){case 44:switch(t){case 6:d[l]=r,t=3;continue;case 9:
d[l++]=r,t=8;continue;default:throw f(`Unexpected ',', expecting ${p[t]}`)}case 34:
r="";n:for(;;){$.lastIndex=i,$.test(c);const w=$.lastIndex;switch(w>i&&(r+=c.slice(
i,w),i=w),s=c.charCodeAt(i++),s){case 34:break n;case 92:if(s=c.charCodeAt(i++),
s===117){const A=R[c.charCodeAt(i++)]+X[c.charCodeAt(i++)]+v[c.charCodeAt(i++)]+
J[c.charCodeAt(i++)];if(A<65536){r+=String.fromCharCode(A);continue}throw f("Inv\
alid \\uXXXX escape in string")}const k=O[s];if(k){r+=k;continue}throw f(`Invali\
d escape sequence in string: ${C(s,"\\")}`)}throw s>=0?f(`Invalid unescaped ${C(
s)} in string`):f("Unterminated string")}switch(t){case 3:case 2:l=r,t=4;continue;case 5:
t=6;continue;case 8:case 7:t=9;continue;case 0:t=1;continue;default:throw f(`Une\
xpected '"', expecting ${p[t]}`)}case 58:if(t!==4)throw f(`Unexpected ':', expec\
ting ${p[t]}`);t=5;continue;case 123:switch(a[u++]=d,a[u++]=l,d={},t){case 5:a[u++]=
6,t=2;continue;case 8:case 7:a[u++]=9,t=2;continue;case 0:a[u++]=1,t=2;continue;default:
throw f(`Unexpected '{', expecting ${p[t]}`)}case 125:switch(t){case 6:d[l]=r,o!==
void 0&&U(o,d);case 2:r=d,t=a[--u],l=a[--u],d=a[--u];continue;default:throw f(`U\
nexpected '}', expecting ${p[t]}`)}case 91:switch(a[u++]=d,a[u++]=l,d=[],l=0,t){case 5:
a[u++]=6,t=7;continue;case 8:case 7:a[u++]=9,t=7;continue;case 0:a[u++]=1,t=7;continue;default:
throw f(`Unexpected '[', expecting ${p[t]}`)}case 93:switch(t){case 9:d[l]=r,o!==
void 0&&U(o,d);case 7:r=d,t=a[--u],l=a[--u],d=a[--u];continue;default:throw f(`U\
nexpected ']', expecting ${p[t]}`)}default:const g=i-1;if(y.lastIndex=g,!y.test(
c)){if(!(s>=0))break e;throw f(`Unexpected ${C(s)}, expecting ${p[t]}`)}if(i=y.lastIndex,
s<102){const w=c.slice(g,i);r=h!==void 0?h(w):+w}else r=s===110?null:s===116;switch(t){case 5:
t=6;continue;case 8:case 7:t=9;continue;case 0:t=1;continue;default:throw f(`Une\
xpected '${r}', expecting ${p[t]}`)}}}if(t!==1)throw f(`Unexpected end of input,\
 expecting ${p[t]}`);return o!==void 0&&(r={"":r},U(o,r),r=r[""]),r}
