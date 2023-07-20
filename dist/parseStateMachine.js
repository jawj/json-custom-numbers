"use strict";var $=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var b=Object.getOwnPropertyNames;var m=Object.prototype.hasOwnProperty;var E=(c,r)=>{for(var u in r)$(c,u,{get:r[u],enumerable:!0})},j=(c,r,u,p)=>{if(r&&
typeof r=="object"||typeof r=="function")for(let i of b(r))!m.call(c,i)&&i!==u&&
$(c,i,{get:()=>r[i],enumerable:!(p=I(r,i))||p.enumerable});return c};var L=c=>j($({},"__esModule",{value:!0}),c);var q={};E(q,{JSONParseError:()=>v,parse:()=>D});module.exports=L(q);class v extends Error{}
const f=["JSON value","end of input","first key in object","key in object","':'",
"value in object","',' or '}' in object","first value in array","value in array",
"',' or ']' in array"],C=/[^"\\\u0000-\u001f]*/y,y=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
n="",R=[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,'"',
n,n,n,n,n,n,n,n,n,n,n,n,"/",n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,
n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,"\\",n,n,n,n,n,"\b",n,n,n,"\f",n,n,n,n,n,n,n,
`
`,n,n,n,"\r",n,"	"],g="",S=[],e=65536,X=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,4096,8192,
12288,16384,20480,24576,28672,32768,36864,e,e,e,e,e,e,e,40960,45056,49152,53248,
57344,61440,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,40960,45056,49152,
53248,57344,61440]),J=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,256,512,768,1024,1280,1536,
1792,2048,2304,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840]),N=new Uint32Array(
[e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,0,16,32,48,64,80,96,112,128,144,e,e,e,e,e,e,e,160,176,192,208,224,
240,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,160,176,192,208,224,240]),
O=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,1,2,3,4,5,6,7,8,9,e,e,e,e,e,e,e,10,11,12,13,
14,15,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,10,11,12,13,14,15]);function U(c,r=""){
if(!(c>=0))return"end of input";if(c>31&&c<127)return`'${r}${String.fromCharCode(
c)}'`;if(c===10)return"\\n";if(c===9)return"\\t";const u=c.toString(16),p="0000".
slice(u.length)+u;return(c>31?`'${r}${String.fromCharCode(c)}', `:"")+`\\u${p}`}
function D(c){const r=[],u=[],p=[];let i=0,s,t=0,a=0,o,l,d;function h(w){return new v(
`${w}
At character ${i} in JSON: ${c}`)}e:for(;;){do s=c.charCodeAt(i++);while(s<33&&(s===
32||s===10||s===13||s===9));switch(s){case 44:switch(t){case 6:o[l]=d,t=3;continue;case 9:
o[o.length]=d,t=8;continue;default:throw h(`Unexpected ',', expecting ${f[t]}`)}case 58:
switch(t){case 4:t=5;continue;default:throw h(`Unexpected ':', expecting ${f[t]}`)}case 34:
d="";n:for(;;){C.lastIndex=i,C.test(c);const x=C.lastIndex;switch(x>i&&(d+=c.slice(
i,x),i=x),s=c.charCodeAt(i++),s){case 34:break n;case 92:if(s=c.charCodeAt(i++),
s===117){const A=X[c.charCodeAt(i++)]+J[c.charCodeAt(i++)]+N[c.charCodeAt(i++)]+
O[c.charCodeAt(i++)];if(A<65536){d+=String.fromCharCode(A);continue}throw h("Inv\
alid \\uXXXX escape in string")}const k=R[s];if(k){d+=k;continue}throw h(`Invali\
d escape sequence in string: ${U(s,"\\")}`)}throw s>=0?h(`Invalid unescaped ${U(
s)} in string`):h("Unterminated string")}switch(t){case 3:case 2:l=d,t=4;continue;case 5:
t=6;continue;case 8:case 7:t=9;continue;case 0:t=1;continue;default:throw h(`Une\
xpected '"', expecting ${f[t]}`)}case 123:switch(t){case 5:p[a]=6,r[a]=o,u[a++]=
l,o={},t=2;continue;case 8:case 7:p[a]=9,r[a]=o,u[a++]=g,o={},t=2;continue;case 0:
p[a]=1,r[a]=S,u[a++]=g,o={},t=2;continue;default:throw h(`Unexpected '{', expect\
ing ${f[t]}`)}case 125:switch(t){case 6:o[l]=d;case 2:d=o,o=r[--a],l=u[a],t=p[a];
continue;default:throw h(`Unexpected '}', expecting ${f[t]}`)}case 91:switch(t){case 5:
p[a]=6,r[a]=o,u[a++]=l,o=[],t=7;continue;case 8:case 7:p[a]=9,r[a]=o,u[a++]=g,o=
[],t=7;continue;case 0:p[a]=1,r[a]=S,u[a++]=g,o=[],t=7;continue;default:throw h(
`Unexpected '[', expecting ${f[t]}`)}case 93:switch(t){case 9:o[o.length]=d;case 7:
d=o,o=r[--a],l=u[a],t=p[a];continue;default:throw h(`Unexpected ']', expecting ${f[t]}`)}default:
const w=i-1;if(y.lastIndex=w,!y.test(c)){if(!(s>=0))break e;throw h(`Unexpected ${U(
s)}, expecting ${f[t]}`)}switch(i=y.lastIndex,s<102?d=+c.slice(w,i):d=s===110?null:
s===116,t){case 5:t=6;continue;case 8:case 7:t=9;continue;case 0:t=1;continue;default:
throw h(`Unexpected '${d}', expecting ${f[t]}`)}}}if(t!==1)throw h(`Unexpected e\
nd of input, expecting ${f[t]}`);return d}
