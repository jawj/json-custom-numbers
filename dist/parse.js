"use strict";var C=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var k=Object.getOwnPropertyNames;var j=Object.prototype.hasOwnProperty;var m=(r,a)=>{for(var i in a)C(r,i,{get:a[i],enumerable:!0})},S=(r,a,i,d)=>{if(a&&
typeof a=="object"||typeof a=="function")for(let h of k(a))!j.call(r,h)&&h!==i&&
C(r,h,{get:()=>a[h],enumerable:!(d=I(a,h))||d.enumerable});return r};var N=r=>S(C({},"__esModule",{value:!0}),r);var F={};m(F,{JSONParseError:()=>E,parse:()=>B});module.exports=N(F);class E extends Error{}
let o,n,c,w,x;const g=/[^"\\\u0000-\u001f]*/y,y=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
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
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,160,176,192,208,224,240]),J=new Uint32Array(
[e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,0,1,2,3,4,5,6,7,8,9,e,e,e,e,e,e,e,10,11,12,13,14,15,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,10,11,12,13,14,15]);function s(r){throw new E(
r+`
At character `+o+" in JSON: "+c)}function f(r){return n>=0?"'"+(r||"")+String.fromCharCode(
n)+"'":"end of input"}function D(){let r;const a=o-1;y.lastIndex=a,y.test(c)||s(
"Unexpected character or end of input");const i=y.lastIndex;if(n<102){const d=c.
slice(a,i);r=w?w(d):+d}else r=n===110?null:n===116;return o=i,n=c.charCodeAt(o++),
r}function v(){let r="";for(;;){g.lastIndex=o,g.test(c);const a=g.lastIndex;switch(a>
o&&(r+=c.slice(o,a),o=a),n=c.charCodeAt(o++),n){case 34:return n=c.charCodeAt(o++),
r;case 92:if(n=c.charCodeAt(o++),n===117){const u=R[c.charCodeAt(o++)]+L[c.charCodeAt(
o++)]+X[c.charCodeAt(o++)]+J[c.charCodeAt(o++)];if(u<65536){r+=String.fromCharCode(
u);continue}s("Invalid \\uXXXX escape in string")}const i=O[n];if(i){r+=i;continue}
s("Invalid escape sequence "+f("\\")+" in string");default:isNaN(n)&&s("Untermin\
ated string");const d=n===10?"newline":n===9?"tab":"control character",h=n.toString(
16),p="0000".slice(h.length)+h;s("Invalid unescaped "+d+" (\\u"+p+") in string")}}}
function P(){const r=[];let a=0;do n=c.charCodeAt(o++);while(n<33&&(n===32||n===
10||n===13||n===9));if(n===93)return n=c.charCodeAt(o++),r;for(;n>=0;){for(r[a++]=
b();n<33&&(n===32||n===10||n===13||n===9);)n=c.charCodeAt(o++);if(n===93)return n=
c.charCodeAt(o++),r;n!==44&&s("Expected ',' but got "+f()+" after array element");
do n=c.charCodeAt(o++);while(n<33&&(n===32||n===10||n===13||n===9))}s("Untermina\
ted array")}function q(){const r={};do n=c.charCodeAt(o++);while(n<33&&(n===32||
n===10||n===13||n===9));if(n===125)return n=c.charCodeAt(o++),r;for(;n===34;){const a=v();
for(;n<33&&(n===32||n===10||n===13||n===9);)n=c.charCodeAt(o++);for(n!==58&&s("E\
xpected ':' but got "+f()+" after key in object"),n=c.charCodeAt(o++),r[a]=b();n<
33&&(n===32||n===10||n===13||n===9);)n=c.charCodeAt(o++);if(n===125)return n=c.charCodeAt(
o++),r;n!==44&&s("Expected ',' or '}' but got "+f()+" after value in object");do
n=c.charCodeAt(o++);while(n<33&&(n===32||n===10||n===13||n===9))}s(`Expected '"'\
 but got `+f()+" in object")}function b(){for(;n<33&&(n===32||n===10||n===13||n===
9);)n=c.charCodeAt(o++);switch(n){case 34:return v();case 123:return q();case 91:
return P();default:return D()}}function B(r,a,i){r instanceof Uint8Array&&(r=(x!=
null?x:x=new TextDecoder).decode(r)),typeof r!="string"&&s("JSON must be a strin\
g, Buffer or Uint8Array"),o=0,n=32,c=r,w=i;const d=b();for(;n<33&&(n===32||n===10||
n===13||n===9);)n=c.charCodeAt(o++);return n>=0&&s("Unexpected data at end of in\
put"),typeof a=="function"?function h(p,u){const l=p[u];if(l&&typeof l=="object"){
for(const A in l)if(Object.prototype.hasOwnProperty.call(l,A)){const U=h(l,A);U!==
void 0?l[A]=U:delete l[A]}}return a.call(p,u,l)}({"":d},""):d}
