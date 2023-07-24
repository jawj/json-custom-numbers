"use strict";var g=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var v=Object.getOwnPropertyNames;var I=Object.prototype.hasOwnProperty;var b=(c,r)=>{for(var u in r)g(c,u,{get:r[u],enumerable:!0})},m=(c,r,u,f)=>{if(r&&
typeof r=="object"||typeof r=="function")for(let i of v(r))!I.call(c,i)&&i!==u&&
g(c,i,{get:()=>r[i],enumerable:!(f=S(r,i))||f.enumerable});return c};var E=c=>m(g({},"__esModule",{value:!0}),c);var O={};b(O,{JSONParseError:()=>A,parse:()=>N});module.exports=E(O);class A extends Error{}
const l=["JSON value","end of input","'}' or first key in object","key in object",
"':'","value in object","',' or '}' in object","']' or first value in array","va\
lue in array","',' or ']' in array"],$=/[^"\\\u0000-\u001f]*/y,C=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
n="",j=[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,'"',
n,n,n,n,n,n,n,n,n,n,n,n,"/",n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,
n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,"\\",n,n,n,n,n,"\b",n,n,n,"\f",n,n,n,n,n,n,n,
`
`,n,n,n,"\r",n,"	"],e=65536,L=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,4096,8192,12288,
16384,20480,24576,28672,32768,36864,e,e,e,e,e,e,e,40960,45056,49152,53248,57344,
61440,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,40960,45056,49152,53248,
57344,61440]),R=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,256,512,768,1024,1280,1536,1792,
2048,2304,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840]),X=new Uint32Array([e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,0,16,32,48,64,80,96,112,128,144,e,e,e,e,e,e,e,160,176,192,208,224,240,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,160,176,192,208,224,240]),J=new Uint32Array(
[e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,0,1,2,3,4,5,6,7,8,9,e,e,e,e,e,e,e,10,11,12,13,14,15,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,10,11,12,13,14,15]);function U(c,r=""){if(!(c>=
0))return"end of input";if(c>31&&c<127)return`'${r}${String.fromCharCode(c)}'`;if(c===
10)return"\\n";if(c===9)return"\\t";const u=c.toString(16),f="0000".slice(u.length)+
u;return(c>31?`'${r}${String.fromCharCode(c)}', `:"")+`\\u${f}`}function N(c){const r=[],
u=[],f=[];let i=0,s,t=0,a=0,o,d,h;function p(w){return new A(`${w}
At character ${i} in JSON: ${c}`)}e:for(;;){do s=c.charCodeAt(i++);while(s<33&&(s===
32||s===10||s===13||s===9));switch(s){case 44:switch(t){case 6:o[d]=h,t=3;continue;case 9:
o[d++]=h,t=8;continue;default:throw p(`Unexpected ',', expecting ${l[t]}`)}case 34:
h="";n:for(;;){$.lastIndex=i,$.test(c);const x=$.lastIndex;switch(x>i&&(h+=c.slice(
i,x),i=x),s=c.charCodeAt(i++),s){case 34:break n;case 92:if(s=c.charCodeAt(i++),
s===117){const y=L[c.charCodeAt(i++)]+R[c.charCodeAt(i++)]+X[c.charCodeAt(i++)]+
J[c.charCodeAt(i++)];if(y<65536){h+=String.fromCharCode(y);continue}throw p("Inv\
alid \\uXXXX escape in string")}const k=j[s];if(k){h+=k;continue}throw p(`Invali\
d escape sequence in string: ${U(s,"\\")}`)}throw s>=0?p(`Invalid unescaped ${U(
s)} in string`):p("Unterminated string")}switch(t){case 3:case 2:d=h,t=4;continue;case 5:
t=6;continue;case 8:case 7:t=9;continue;case 0:t=1;continue;default:throw p(`Une\
xpected '"', expecting ${l[t]}`)}case 58:if(t!==4)throw p(`Unexpected ':', expec\
ting ${l[t]}`);t=5;continue;case 123:switch(t){case 5:f[a]=6,r[a]=o,u[a++]=d,o={},
t=2;continue;case 8:case 7:f[a]=9,r[a]=o,u[a++]=d,o={},t=2;continue;case 0:f[a]=
1,r[a]=o,u[a++]=d,o={},t=2;continue;default:throw p(`Unexpected '{', expecting ${l[t]}`)}case 125:
switch(t){case 6:o[d]=h;case 2:h=o,o=r[--a],d=u[a],t=f[a];continue;default:throw p(
`Unexpected '}', expecting ${l[t]}`)}case 91:switch(t){case 5:f[a]=6,r[a]=o,u[a++]=
d,o=[],d=0,t=7;continue;case 8:case 7:f[a]=9,r[a]=o,u[a++]=d,o=[],d=0,t=7;continue;case 0:
f[a]=1,r[a]=o,u[a++]=d,o=[],d=0,t=7;continue;default:throw p(`Unexpected '[', ex\
pecting ${l[t]}`)}case 93:switch(t){case 9:o[d]=h;case 7:h=o,o=r[--a],d=u[a],t=f[a];
continue;default:throw p(`Unexpected ']', expecting ${l[t]}`)}default:const w=i-
1;if(C.lastIndex=w,!C.test(c)){if(!(s>=0))break e;throw p(`Unexpected ${U(s)}, e\
xpecting ${l[t]}`)}switch(i=C.lastIndex,s<102?h=+c.slice(w,i):h=s===110?null:s===
116,t){case 5:t=6;continue;case 8:case 7:t=9;continue;case 0:t=1;continue;default:
throw p(`Unexpected '${h}', expecting ${l[t]}`)}}}if(t!==1)throw p(`Unexpected e\
nd of input, expecting ${l[t]}`);return h}
