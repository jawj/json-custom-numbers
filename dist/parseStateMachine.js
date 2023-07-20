"use strict";var k=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var j=Object.getOwnPropertyNames;var q=Object.prototype.hasOwnProperty;var L=(o,i)=>{for(var d in i)k(o,d,{get:i[d],enumerable:!0})},R=(o,i,d,l)=>{if(i&&
typeof i=="object"||typeof i=="function")for(let r of j(i))!q.call(o,r)&&r!==d&&
k(o,r,{get:()=>i[r],enumerable:!(l=N(i,r))||l.enumerable});return o};var X=o=>R(k({},"__esModule",{value:!0}),o);var z={};L(z,{JSONParseError:()=>v,parse:()=>P});module.exports=X(z);class v extends Error{}
const x=["JSON value","end of input","first key in object","key in object","colo\
n","value in object","comma or closing brace for object","first value in array",
"value in array","comma or closing bracket for array"],C=/[^"\\\u0000-\u001f]*/y,
y=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,n="",D=[n,n,
n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,'"',n,n,n,n,n,n,
n,n,n,n,n,n,"/",n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,
n,n,n,n,n,n,n,n,n,n,n,n,"\\",n,n,n,n,n,"\b",n,n,n,"\f",n,n,n,n,n,n,n,`
`,n,n,n,"\r",n,"	"],p="",U=[],e=65536,J=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,4096,8192,
12288,16384,20480,24576,28672,32768,36864,e,e,e,e,e,e,e,40960,45056,49152,53248,
57344,61440,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,40960,45056,49152,
53248,57344,61440]),O=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,256,512,768,1024,1280,1536,
1792,2048,2304,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840]),H=new Uint32Array(
[e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,0,16,32,48,64,80,96,112,128,144,e,e,e,e,e,e,e,160,176,192,208,224,
240,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,160,176,192,208,224,240]),
K=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,1,2,3,4,5,6,7,8,9,e,e,e,e,e,e,e,10,11,12,13,
14,15,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,10,11,12,13,14,15]);let u,
a,c,t,s,f,h;function P(o){const i=[],d=[],l=[];u=0,a=32,c=0,t=0,s=U,f=p,h=void 0;
function r(w){return new v(w+`
At character `+u+" in JSON: "+o)}e:for(;;){do a=o.charCodeAt(u++);while(a<33&&(a===
32||a===10||a===13||a===9));switch(a){case 44:switch(c){case 6:s[f]=h,c=3;continue;case 9:
s[s.length]=h,c=8;continue;default:throw r("Unexpected comma")}case 58:switch(c){case 4:
c=5;continue;default:throw r("Unexpected colon")}case 34:h="";n:for(;;){C.lastIndex=
u,C.test(o);const g=C.lastIndex;switch(g>u&&(h+=o.slice(u,g),u=g),a=o.charCodeAt(
u++),a){case 34:break n;case 92:if(a=o.charCodeAt(u++),a===117){const m=J[o.charCodeAt(
u++)]+O[o.charCodeAt(u++)]+H[o.charCodeAt(u++)]+K[o.charCodeAt(u++)];if(m<65536){
h+=String.fromCharCode(m);continue}throw r("Invalid \\uXXXX escape in string")}const A=D[a];
if(A){h+=A;continue}const E=a>=0?"'\\"+String.fromCharCode(a)+"'":"end of input";
throw r("Invalid escape sequence "+E+" in string")}if(isNaN(a))throw r("Untermin\
ated string");const S=a===10?"newline":a===9?"tab":"control character",b=a.toString(
16),I="0000".slice(b.length)+b;throw r("Invalid unescaped "+S+" (\\u"+I+") in st\
ring")}switch(c){case 3:case 2:f=h,c=4;continue;case 5:c=6;continue;case 8:case 7:
c=9;continue;case 0:c=1;continue;default:throw r("Unexpected quote")}case 123:switch(c){case 5:
l[t]=6,i[t]=s,d[t++]=f,s={},c=2;continue;case 8:case 7:l[t]=9,i[t]=s,d[t++]=p,s=
{},c=2;continue;case 0:l[t]=1,i[t]=U,d[t++]=p,s={},c=2;continue;default:throw r(
"Unexpected opening brace")}case 125:switch(c){case 6:s[f]=h;case 2:h=s,s=i[--t],
f=d[t],c=l[t];continue;default:throw r("Unexpected closing brace")}case 91:switch(c){case 5:
l[t]=6,i[t]=s,d[t++]=f,s=[],c=7;continue;case 8:case 7:l[t]=9,i[t]=s,d[t++]=p,s=
[],c=7;continue;case 0:l[t]=1,i[t]=U,d[t++]=p,s=[],c=7;continue;default:throw r(
"Unexpected opening square bracket")}case 93:switch(c){case 9:s[s.length]=h;case 7:
h=s,s=i[--t],f=d[t],c=l[t];continue;default:throw r("Unexpected closing square b\
racket")}default:if(!(a>=0))break e;const w=u-1;if(y.lastIndex=w,!y.test(o))throw r(
"Unexpected token '"+String.fromCharCode(a)+"' when expecting "+x[c]);switch(u=y.
lastIndex,a<102?h=+o.slice(w,u):h=a===110?null:a===116,c){case 5:c=6;continue;case 8:case 7:
c=9;continue;case 0:c=1;continue;default:throw r("Unexpected token '"+h+"' when \
expecting "+x[c])}}}if(c!==1)throw r("Unexpected end of input when expecting "+x[c]);
return h}
