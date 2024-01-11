"use strict";var x=Object.defineProperty;var X=Object.getOwnPropertyDescriptor;var j=Object.getOwnPropertyNames;var q=Object.prototype.hasOwnProperty;var y=(t,r)=>x(t,"name",{value:r,configurable:!0});var H=(t,r)=>{for(var l in r)x(t,l,{get:r[l],enumerable:!0})},K=(t,r,l,h)=>{if(r&&
typeof r=="object"||typeof r=="function")for(let f of j(r))!q.call(t,f)&&f!==l&&
x(t,f,{get:()=>r[f],enumerable:!(h=X(r,f))||h.enumerable});return t};var L=t=>K(x({},"__esModule",{value:!0}),t);var F={};H(F,{parse:()=>B});module.exports=L(F);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */const D=/[^"\\\u0000-\u001f]*/y,O=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
N=/[ \n\t\r]*$/y,P=/^.{0,32}\n[ \t]/,g=/[ \n\t\r]*/y,W=`........................\
.........."............./.............................................\\......\b..\
..\f........
....\r..	`.split("."),E=y(()=>new Uint32Array(103),"hlArr"),k=E(),m=E(),w=E(),$=E();
let i=0;for(;i<48;i++)k[i]=m[i]=w[i]=$[i]=65536;for(;i<58;i++)k[i]=(m[i]=(w[i]=($[i]=
i-48)<<4)<<4)<<4;for(;i<65;i++)k[i]=m[i]=w[i]=$[i]=65536;for(;i<71;i++)k[i]=(m[i]=
(w[i]=($[i]=i-55)<<4)<<4)<<4;for(;i<97;i++)k[i]=m[i]=w[i]=$[i]=65536;for(;i<103;i++)
k[i]=(m[i]=(w[i]=($[i]=i-87)<<4)<<4)<<4;function R(t,r=""){if(!(t>=0))return"end\
 of JSON input";if(t>31&&t<127)return`'${r}${String.fromCharCode(t)}'`;if(t===10)
return"\\n";if(t===9)return"\\t";const l=t.toString(16),h="0000".slice(l.length)+
l;return(t>31?`'${r}${String.fromCharCode(t)}' or `:"")+`\\u${h}`}y(R,"chDesc");
function U(t,r){const l=Object.keys(r),h=l.length;for(let f=0;f<h;f++){const n=l[f],
e=t.call(r,n,r[n]);e!==void 0?r[n]=e:delete r[n]}}y(U,"revive");function z(t,r,l){
const h=l===!0?" in array":l===!1?" in object":"",f=t.slice(0,r),n=f.match(/[^\n]{0,69}$/)[0],
e=n.length<f.length?"..."+n:n,s=r-(f.length-e.length),p=t.slice(r),o=p.match(/[^\n]{0,5}/)[0],
d=o.length<p.length?o+"...":o,A=e+d,I=" ".repeat(s<1?0:s-1)+"^";return`${h}
At position ${r} in JSON:
${A}
${I}`}y(z,"errContext");const T={maxDepth:1/0};function B(t,r,l,h){var J;typeof t!=
"string"&&(t=String(t)),typeof r!="function"&&(r=void 0);const f=h===void 0?T.maxDepth:
typeof h=="number"?h:(J=h.maxDepth)!=null?J:T.maxDepth;let n=0,e,s,p,o,d;function A(u){
throw new SyntaxError(u+z(t,n,p))}y(A,"err");function I(){A(`JSON structure too \
deeply nested (current max depth: ${f})`)}y(I,"tooDeep");function b(u){A(`Unexpe\
cted ${R(e)}, expecting ${u}`)}y(b,"expected");function v(){const u=n-1;if(O.lastIndex=
u,O.test(t)!==!0&&b("JSON value"),n=O.lastIndex,e<102){const C=t.slice(u,n);return l?
l.call(s,o,C):+C}return e===110?null:e===116}y(v,"word");function S(){let u="";e:
for(;;){D.lastIndex=n,D.test(t);const c=D.lastIndex;for(c>n&&(u+=t.slice(n,c),n=
c),e=t.charCodeAt(n++);;){switch(e){case 34:return u;case 92:if(e=t.charCodeAt(n++),
e===117){const a=k[t.charCodeAt(n++)]+m[t.charCodeAt(n++)]+w[t.charCodeAt(n++)]+
$[t.charCodeAt(n++)];if(a<65536){u+=String.fromCharCode(a);break}A("Invalid \\uXX\
XX escape in string")}const C=W[e];if(C!==""&&C!==void 0){u+=C;break}A(`Invalid \
escape sequence: ${R(e,"\\")} in string`);default:e>=0||A("Unterminated string"),
A(`Invalid unescaped ${R(e)} in string`)}if(e=t.charCodeAt(n),e!==92&&e!==34)continue e;
n++}}}y(S,"string");e:{do e=t.charCodeAt(n++);while(e<=32&&(e===32||e===10||e===
13||e===9));switch(e){case 123:f===0&&I(),s={},o=void 0,p=!1;break;case 91:f===0&&
I(),s=[],o=0,p=!0;break;case 34:d=S();break e;default:d=v();break e}const u=f+f-
2,c=[],C=P.test(t);let a=0;t:for(;;)if(p===!0)for(;;){C===!0&&a>2&&(g.lastIndex=
n,g.test(t),n=g.lastIndex);do e=t.charCodeAt(n++);while(e<=32&&(e===32||e===10||
e===13||e===9));if(e===93){if(r!==void 0&&U(r,s),d=s,a===0)break e;if(s=c[--a],o=
c[--a],p=typeof o=="number",p===!0){s[o++]=d;continue}else{s[o]=d;continue t}}if(o!==
0){e!==44&&b("',' or ']' after value"),C===!0&&a>2&&(g.lastIndex=n,g.test(t),n=g.
lastIndex);do e=t.charCodeAt(n++);while(e<=32&&(e===32||e===10||e===13||e===9))}
switch(e){case 34:s[o++]=S();continue;case 123:a===u&&I(),c[a++]=o,c[a++]=s,s={},
o=void 0,p=!1;continue t;case 91:a===u&&I(),c[a++]=o,c[a++]=s,s=[],o=0;continue;default:
s[o++]=v()}}else for(;;){C===!0&&a>2&&(g.lastIndex=n,g.test(t),n=g.lastIndex);do
e=t.charCodeAt(n++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){if(r!==
void 0&&U(r,s),d=s,a===0)break e;if(s=c[--a],o=c[--a],p=typeof o=="number",p===!0){
s[o++]=d;continue t}else{s[o]=d;continue}}if(o!==void 0){e!==44&&b("',' or '}' a\
fter value"),C===!0&&a>2&&(g.lastIndex=n,g.test(t),n=g.lastIndex);do e=t.charCodeAt(
n++);while(e<=32&&(e===32||e===10||e===13||e===9))}e!==34&&b("'}' or double-quot\
ed key"),o=S();do e=t.charCodeAt(n++);while(e<=32&&(e===32||e===10||e===13||e===
9));e!==58&&b("':' after key");do e=t.charCodeAt(n++);while(e<=32&&(e===32||e===
10||e===13||e===9));switch(e){case 34:s[o]=S();continue;case 123:a===u&&I(),c[a++]=
o,c[a++]=s,s={},o=void 0;continue;case 91:a===u&&I(),c[a++]=o,c[a++]=s,s=[],o=0,
p=!0;continue t;default:s[o]=v()}}}return N.lastIndex=n,N.test(t)===!1&&A("Unexp\
ected data after end of JSON input"),r!==void 0&&(d={"":d},U(r,d),d=d[""]),d}y(B,
"parse");
