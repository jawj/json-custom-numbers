"use strict";var A=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var O=Object.getOwnPropertyNames;var R=Object.prototype.hasOwnProperty;var X=(a,s)=>{for(var d in s)A(a,d,{get:s[d],enumerable:!0})},D=(a,s,d,m)=>{if(s&&
typeof s=="object"||typeof s=="function")for(let p of O(s))!R.call(a,p)&&p!==d&&
A(a,p,{get:()=>s[p],enumerable:!(m=L(s,p))||m.enumerable});return a};var J=a=>D(A({},"__esModule",{value:!0}),a);var V={};X(V,{JSONParseError:()=>U,parse:()=>T});module.exports=J(V);class U extends Error{}
const $={go:0,ok:1,firstokey:2,okey:3,ocolon:4,ovalue:5,ocomma:6,firstavalue:7,avalue:8,
acomma:9},B={tab:9,newline:10,cr:13,space:32,quote:34,comma:44,colon:58,opensquare:91,
closesquare:93,backslash:92,f:102,n:110,t:116,u:117,openbrace:123,closebrace:125},
H=["JSON value","end of input","first key in object","key in object","colon","va\
lue in object","comma or closing brace for object","first value in array","value\
 in array","comma or closing bracket for array"],q=/[^"\\\u0000-\u001f]*/y,E=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
o="",K=[o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,'"',
o,o,o,o,o,o,o,o,o,o,o,o,"/",o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,
o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,"\\",o,o,o,o,o,"\b",o,o,o,"\f",o,o,o,o,o,o,o,
`
`,o,o,o,"\r",o,"	"],g="",S=[],e=65536,P=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,4096,8192,
12288,16384,20480,24576,28672,32768,36864,e,e,e,e,e,e,e,40960,45056,49152,53248,
57344,61440,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,40960,45056,49152,
53248,57344,61440]),W=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,256,512,768,1024,1280,1536,
1792,2048,2304,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,2560,2816,3072,3328,3584,3840]),z=new Uint32Array(
[e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,0,16,32,48,64,80,96,112,128,144,e,e,e,e,e,e,e,160,176,192,208,224,
240,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,160,176,192,208,224,240]),
F=new Uint32Array([e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,
e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,0,1,2,3,4,5,6,7,8,9,e,e,e,e,e,e,e,10,11,12,13,
14,15,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,e,10,11,12,13,14,15]);let u,
l,c,n,t,r,x,i;function k(a){return new U(a+`
At character `+l+" in JSON: "+u)}function C(){i="";e:for(;;){q.lastIndex=l,q.test(
u);const a=q.lastIndex;switch(a>l&&(i+=u.slice(l,a),l=a),c=u.charCodeAt(l++),c){case 34:
break e;case 92:if(c=u.charCodeAt(l++),c===117){const w=P[u.charCodeAt(l++)]+W[u.
charCodeAt(l++)]+z[u.charCodeAt(l++)]+F[u.charCodeAt(l++)];if(w<65536){i+=String.
fromCharCode(w);continue}throw k("Invalid \\uXXXX escape in string")}const p=K[c];
if(p){i+=p;continue}const v=c>=0?"'\\"+String.fromCharCode(c)+"'":"end of input";
throw k("Invalid escape sequence "+v+" in string")}if(isNaN(c))throw k("Untermin\
ated string");const s=c===10?"newline":c===9?"tab":"control character",d=c.toString(
16),m="0000".slice(d.length)+d;throw k("Invalid unescaped "+s+" (\\u"+m+") in st\
ring")}}function N(){const a=l-1;if(E.lastIndex=a,!E.test(u))throw k("Unexpected\
 token '"+String.fromCharCode(c)+"' when expecting "+H[n]);l=E.lastIndex,c<102?i=
+u.slice(a,l):i=c===110?null:c===116}function G(){}function I(){throw new U(`Bad\
 character ${c}, state ${n}`)}function M(){return c===0&&I(),!0}const j={quote_x_okey_firstokey(){
C(),x=i,n=4},quote_x_ovalue(){C(),n=6},quote_x_avalue_firstavalue(){C(),n=9},quote_x_go(){
C(),n=1},word_x_ovalue(){N(),n=6},word_x_avalue_firstavalue(){N(),n=9},word_x_go(){
N(),n=1},comma_x_ocomma(){r[x]=i,n=3},comma_x_acomma(){r[r.length]=i,n=8},colon_x_ocolon(){
n=5},openbrace_x_ovalue(){h[t]=6,_[t]=r,f[t++]=x,r={},n=2},openbrace_x_avalue_firstavalue(){
h[t]=9,_[t]=r,f[t++]=g,r={},n=2},openbrace_x_go(){h[t]=1,_[t]=S,f[t++]=g,r={},n=
2},closebrace_x_ocomma(){r[x]=i,i=r,r=_[--t],x=f[t],n=h[t]},closebrace_x_firstokey(){
i=r,r=_[--t],x=f[t],n=h[t]},opensquare_x_ovalue(){h[t]=6,_[t]=r,f[t++]=x,r=[],n=
7},opensquare_x_avalue_firstavalue(){h[t]=9,_[t]=r,f[t++]=g,r=[],n=7},opensquare_x_go(){
h[t]=1,_[t]=S,f[t++]=g,r=[],n=7},closesquare_x_acomma(){r[r.length]=i,i=r,r=_[--t],
x=f[t],n=h[t]},closesquare_x_firstavalue(){i=r,r=_[--t],x=f[t],n=h[t]}},y=7,Q=(9<<
y)+125+1,b=new Array(Q).fill(I);b[NaN|1<<y]=M,[0,2,3,4,5,6,7,8,9].forEach(a=>{b[NaN|
a<<y]=I}),[32,9,13,10].forEach(a=>{[0,1,2,3,4,5,6,7,8,9].forEach(s=>{b[a|s<<y]=G})}),
Object.keys(j).forEach(a=>{const[s,d]=a.split("_x_"),m=d.split("_");(s==="word"?
[102,116,110,45,...new Array(10).fill(void 0).map((v,w)=>48+w)]:[s]).forEach(v=>m.
forEach(w=>b[(typeof v=="number"?v:B[v])|$[w]<<y]=j[a]))});let _,f,h;function T(a){
u=a,l=0,c=32,n=0,t=0,r=S,x=g,i=void 0,_=[],f=[],h=[];do c=u.charCodeAt(l++);while(!b[c|
n<<y]());return i}
