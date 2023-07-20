"use strict";var S=Object.defineProperty;var $=Object.getOwnPropertyDescriptor;var H=Object.getOwnPropertyNames;var K=Object.prototype.hasOwnProperty;var P=(u,h)=>{for(var w in h)S(u,w,{get:h[w],enumerable:!0})},W=(u,h,w,b)=>{if(h&&
typeof h=="object"||typeof h=="function")for(let C of H(h))!K.call(u,C)&&C!==w&&
S(u,C,{get:()=>h[C],enumerable:!(b=$(h,C))||b.enumerable});return u};var z=u=>W(S({},"__esModule",{value:!0}),u);var _e={};P(_e,{JSONParseError:()=>N,parse:()=>le});module.exports=z(_e);class N extends Error{}
const L=["JSON value","end of input","first key in object","key in object","colo\
n","value in object","comma or closing brace for object","first value in array",
"value in array","comma or closing bracket for array"],q=/[^"\\\u0000-\u001f]*/y,
I=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,t="",B=[t,t,
t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,'"',t,t,t,t,t,t,
t,t,t,t,t,t,"/",t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,
t,t,t,t,t,t,t,t,t,t,t,t,"\\",t,t,t,t,t,"\b",t,t,t,"\f",t,t,t,t,t,t,t,`
`,t,t,t,"\r",t,"	"],y="",U=[],n=65536,F=new Uint32Array([n,n,n,n,n,n,n,n,n,n,n,n,
n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,0,4096,8192,
12288,16384,20480,24576,28672,32768,36864,n,n,n,n,n,n,n,40960,45056,49152,53248,
57344,61440,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,40960,45056,49152,
53248,57344,61440]),G=new Uint32Array([n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,
n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,0,256,512,768,1024,1280,1536,
1792,2048,2304,n,n,n,n,n,n,n,2560,2816,3072,3328,3584,3840,n,n,n,n,n,n,n,n,n,n,n,
n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,2560,2816,3072,3328,3584,3840]),M=new Uint32Array(
[n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,
n,n,n,n,n,n,n,n,0,16,32,48,64,80,96,112,128,144,n,n,n,n,n,n,n,160,176,192,208,224,
240,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,160,176,192,208,224,240]),
Q=new Uint32Array([n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,
n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,0,1,2,3,4,5,6,7,8,9,n,n,n,n,n,n,n,10,11,12,13,
14,15,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,n,10,11,12,13,14,15]);let x,
l,s,i,r,c,m,f;function k(u){return new N(u+`
At character `+l+" in JSON: "+x)}function A(){f="";e:for(;;){q.lastIndex=l,q.test(
x);const u=q.lastIndex;switch(u>l&&(f+=x.slice(l,u),l=u),s=x.charCodeAt(l++),s){case 34:
break e;case 92:if(s=x.charCodeAt(l++),s===117){const j=F[x.charCodeAt(l++)]+G[x.
charCodeAt(l++)]+M[x.charCodeAt(l++)]+Q[x.charCodeAt(l++)];if(j<65536){f+=String.
fromCharCode(j);continue}throw k("Invalid \\uXXXX escape in string")}const C=B[s];
if(C){f+=C;continue}const O=s>=0?"'\\"+String.fromCharCode(s)+"'":"end of input";
throw k("Invalid escape sequence "+O+" in string")}if(isNaN(s))throw k("Untermin\
ated string");const h=s===10?"newline":s===9?"tab":"control character",w=s.toString(
16),b="0000".slice(w.length)+w;throw k("Invalid unescaped "+h+" (\\u"+b+") in st\
ring")}}function E(){const u=l-1;if(I.lastIndex=u,!I.test(x))throw k("Unexpected\
 '"+String.fromCharCode(s)+"', expecting "+L[i]);l=I.lastIndex,s<102?f=+x.slice(
u,l):f=s===110?null:s===116}function o(){}function e(){throw new N(`Unexpected '${String.
fromCharCode(s)}', expecting ${L[i]}`)}function T(){return s===0&&e(),!0}function R(){
A(),m=f,i=4}function V(){A(),i=6}function X(){A(),i=9}function Y(){A(),i=1}function _(){
E(),i=6}function a(){E(),i=9}function d(){E(),i=1}function Z(){c[m]=f,i=3}function ee(){
c[c.length]=f,i=8}function ne(){i=5}function te(){v[r]=6,p[r]=c,g[r++]=m,c={},i=
2}function D(){v[r]=9,p[r]=c,g[r++]=y,c={},i=2}function oe(){v[r]=1,p[r]=U,g[r++]=
y,c={},i=2}function re(){c[m]=f,f=c,c=p[--r],m=g[r],i=v[r]}function ae(){f=c,c=p[--r],
m=g[r],i=v[r]}function ce(){v[r]=6,p[r]=c,g[r++]=m,c=[],i=7}function J(){v[r]=9,
p[r]=c,g[r++]=y,c=[],i=7}function ie(){v[r]=1,p[r]=U,g[r++]=y,c=[],i=7}function se(){
c[c.length]=f,f=c,c=p[--r],m=g[r],i=v[r]}function ue(){f=c,c=p[--r],m=g[r],i=v[r]}
const fe=[e,e,e,e,e,e,e,e,e,o,o,e,e,o,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,o,e,Y,
e,e,e,e,e,e,e,e,e,e,d,e,e,d,d,d,d,d,d,d,d,d,d,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,ie,e,e,e,e,e,e,e,e,e,e,d,e,e,e,e,e,e,e,d,e,e,e,e,
e,d,e,e,e,e,e,e,oe,e,e,e,e,T,e,e,e,e,e,e,e,e,o,o,e,e,o,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,o,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,o,o,e,e,o,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,o,e,R,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,ae,e,e,e,e,e,e,e,e,e,e,e,o,o,
e,e,o,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,o,e,R,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,o,o,e,e,o,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,o,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,ne,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,o,o,e,e,o,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,o,e,V,
e,e,e,e,e,e,e,e,e,e,_,e,e,_,_,_,_,_,_,_,_,_,_,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,ce,e,e,e,e,e,e,e,e,e,e,_,e,e,e,e,e,e,e,_,e,e,e,e,
e,_,e,e,e,e,e,e,te,e,e,e,e,e,e,e,e,e,e,e,e,e,o,o,e,e,o,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,o,e,e,e,e,e,e,e,e,e,e,e,Z,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,re,e,e,e,e,e,e,e,e,e,e,e,o,o,e,e,o,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,o,e,X,e,e,e,e,e,e,e,e,e,e,a,e,e,a,a,a,a,a,a,a,a,a,a,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,J,e,ue,e,e,e,e,e,
e,e,e,a,e,e,e,e,e,e,e,a,e,e,e,e,e,a,e,e,e,e,e,e,D,e,e,e,e,e,e,e,e,e,e,e,e,e,o,o,
e,e,o,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,o,e,X,e,e,e,e,e,e,e,e,e,e,a,e,e,a,a,a,
a,a,a,a,a,a,a,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
J,e,e,e,e,e,e,e,e,e,e,a,e,e,e,e,e,e,e,a,e,e,e,e,e,a,e,e,e,e,e,e,D,e,e,e,e,e,e,e,
e,e,e,e,e,e,o,o,e,e,o,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,o,e,e,e,e,e,e,e,e,e,e,
e,ee,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,se,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e];let p,g,v;function le(u){x=u,l=0,s=32,i=0,r=0,c=U,m=y,f=void 0,p=[],g=[],
v=[];do s=x.charCodeAt(l++);while(!fe[s|i<<7]());return f}
