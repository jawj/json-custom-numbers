"use strict";var A=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var U=Object.getOwnPropertyNames;var j=Object.prototype.hasOwnProperty;var m=(r,a)=>{for(var i in a)A(r,i,{get:a[i],enumerable:!0})},S=(r,a,i,l)=>{if(a&&
typeof a=="object"||typeof a=="function")for(let d of U(a))!j.call(r,d)&&d!==i&&
A(r,d,{get:()=>a[d],enumerable:!(l=I(a,d))||l.enumerable});return r};var N=r=>S(A({},"__esModule",{value:!0}),r);var q={};m(q,{JSONParseError:()=>k,parse:()=>P});module.exports=N(q);class k extends Error{}
let o,n,c,w,x;const g=/[^"\\\u0000-\u001f]*/y,b=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
t="",O=[t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,'"',
t,t,t,t,t,t,t,t,t,t,t,t,"/",t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,
t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,t,"\\",t,t,t,t,t,"\b",t,t,t,"\f",t,t,t,t,t,t,t,
`
`,t,t,t,"\r",t,"	"],e=65536,R=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,4096,8192,12288,
16384,20480,24576,28672,32768,36864,e,e,e,e,e,e,e,40960,45056,49152,53248,57344,
61440,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,40960,45056,49152,53248,
57344,61440]),L=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,256,512,768,1024,1280,1536,1792,
2048,2304,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840]),X=new Uint32Array([e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,0,16,32,48,64,80,96,112,128,144,e,e,e,e,e,e,e,160,176,192,208,224,240,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,160,176,192,208,224,240]),B=new Uint32Array(
[e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,0,1,2,3,4,5,6,7,8,9,e,e,e,e,e,e,e,10,11,12,13,14,15,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,10,11,12,13,14,15]);function s(r){throw new k(
r+`
At character `+o+" in JSON: "+c)}function u(r){return n>=0?"'"+(r||"")+String.fromCharCode(
n)+"'":"end of input"}function J(){const r=o-1;b.lastIndex=r,b.test(c)||s("Unexp\
ected character or end of input"),o=b.lastIndex;let a;if(n<102){const i=c.slice(
r,o);a=w?w(i):+i}else a=n===110?null:n===116;return n=c.charCodeAt(o++),a}function E(){
let r="";for(;;){g.lastIndex=o,g.test(c);const a=g.lastIndex;switch(a>o&&(r+=c.slice(
o,a),o=a),n=c.charCodeAt(o++),n){case 34:return n=c.charCodeAt(o++),r;case 92:if(n=
c.charCodeAt(o++),n===117){const h=R[c.charCodeAt(o++)]+L[c.charCodeAt(o++)]+X[c.
charCodeAt(o++)]+B[c.charCodeAt(o++)];if(h<65536){r+=String.fromCharCode(h);continue}
s("Invalid \\uXXXX escape in string")}const i=O[n];if(i){r+=i;continue}s("Invali\
d escape sequence "+u("\\")+" in string");default:isNaN(n)&&s("Unterminated stri\
ng");const l=n===10?"newline":n===9?"tab":"control character",d=n.toString(16),p="\
0000".slice(d.length)+d;s("Invalid unescaped "+l+" (\\u"+p+") in string")}}}function T(){
const r=[];let a=0;do n=c.charCodeAt(o++);while(n<33&&(n===32||n===10||n===13||n===
9));if(n===93)return n=c.charCodeAt(o++),r;for(;n>=0;){for(r[a++]=y();n<33&&(n===
32||n===10||n===13||n===9);)n=c.charCodeAt(o++);if(n===93)return n=c.charCodeAt(
o++),r;n!==44&&s("Expected ',' but got "+u()+" after array element");do n=c.charCodeAt(
o++);while(n<33&&(n===32||n===10||n===13||n===9))}s("Unterminated array")}function D(){
const r={};do n=c.charCodeAt(o++);while(n<33&&(n===32||n===10||n===13||n===9));if(n===
125)return n=c.charCodeAt(o++),r;for(;n===34;){const a=E();for(;n<33&&(n===32||n===
10||n===13||n===9);)n=c.charCodeAt(o++);for(n!==58&&s("Expected ':' but got "+u()+
" after key in object"),n=c.charCodeAt(o++),r[a]=y();n<33&&(n===32||n===10||n===
13||n===9);)n=c.charCodeAt(o++);if(n===125)return n=c.charCodeAt(o++),r;n!==44&&
s("Expected ',' or '}' but got "+u()+" after value in object");do n=c.charCodeAt(
o++);while(n<33&&(n===32||n===10||n===13||n===9))}s(`Expected '"' but got `+u()+
" in object")}function y(){for(;n<33&&(n===32||n===10||n===13||n===9);)n=c.charCodeAt(
o++);switch(n){case 34:return E();case 123:return D();case 91:return T();default:
return J()}}function P(r,a,i){globalThis.Buffer&&r instanceof globalThis.Buffer&&
(r=(x!=null?x:x=new TextDecoder).decode(r)),typeof r!="string"&&s("JSON must be \
a string or Buffer"),o=0,n=32,c=r,w=i;const l=y();for(;n<33&&(n===32||n===10||n===
13||n===9);)n=c.charCodeAt(o++);return n>=0&&s("Unexpected data at end of input"),
typeof a=="function"?function d(p,h){const f=p[h];if(f&&typeof f=="object"){for(const C in f)
if(Object.prototype.hasOwnProperty.call(f,C)){const v=d(f,C);v!==void 0?f[C]=v:delete f[C]}}
return a.call(p,h,f)}({"":l},""):l}
