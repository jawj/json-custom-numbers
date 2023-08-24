"use strict";var m=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var X=Object.getOwnPropertyNames;var j=Object.prototype.hasOwnProperty;var C=(n,o)=>m(n,"name",{value:o,configurable:!0});var q=(n,o)=>{for(var l in o)m(n,l,{get:o[l],enumerable:!0})},H=(n,o,l,u)=>{if(o&&
typeof o=="object"||typeof o=="function")for(let t of X(o))!j.call(n,t)&&t!==l&&
m(n,t,{get:()=>o[t],enumerable:!(u=T(o,t))||u.enumerable});return n};var K=n=>H(m({},"__esModule",{value:!0}),n);var B={};q(B,{parse:()=>z});module.exports=K(B);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */const U=/[^"\\\u0000-\u001f]*/y,v=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
N=/[ \n\t\r]*$/y,L=/^.{0,32}\n[ \t]/,p=/[ \n\t\r]*/y,P=`........................\
.........."............./.............................................\\......\b..\
..\f........
....\r..	`.split("."),E=C(()=>new Uint32Array(103),"hlArr"),k=E(),w=E(),$=E(),b=E();
let i=0;for(;i<48;i++)k[i]=w[i]=$[i]=b[i]=65536;for(;i<58;i++)k[i]=(w[i]=($[i]=(b[i]=
i-48)<<4)<<4)<<4;for(;i<65;i++)k[i]=w[i]=$[i]=b[i]=65536;for(;i<71;i++)k[i]=(w[i]=
($[i]=(b[i]=i-55)<<4)<<4)<<4;for(;i<97;i++)k[i]=w[i]=$[i]=b[i]=65536;for(;i<103;i++)
k[i]=(w[i]=($[i]=(b[i]=i-87)<<4)<<4)<<4;function O(n,o=""){if(!(n>=0))return"end\
 of JSON input";if(n>31&&n<127)return`'${o}${String.fromCharCode(n)}'`;if(n===10)
return"\\n";if(n===9)return"\\t";const l=n.toString(16),u="0000".slice(l.length)+
l;return(n>31?`'${o}${String.fromCharCode(n)}' or `:"")+`\\u${u}`}C(O,"chDesc");
function J(n,o){const l=Object.keys(o),u=l.length;for(let t=0;t<u;t++){const e=l[t],
r=n.call(o,e,o[e]);r!==void 0?o[e]=r:delete o[e]}}C(J,"revive");function W(n,o,l){
const u=l===!0?" in array":l===!1?" in object":"",t=n.slice(0,o),e=t.match(/[^\n]{0,69}$/)[0],
r=e.length<t.length?"..."+e:e,h=o-(t.length-r.length),s=n.slice(o),a=s.match(/[^\n]{0,5}/)[0],
A=a.length<s.length?a+"...":a,y=r+A,I=" ".repeat(h<1?0:h-1)+"^";return`${u}
At position ${o} in JSON:
${y}
${I}`}C(W,"errContext");function z(n,o,l,u=1/0){typeof n!="string"&&(n=String(n)),
typeof o!="function"&&(o=void 0);let t=0,e,r,h,s,a;function A(d){throw new SyntaxError(
d+W(n,t,h))}C(A,"err");function y(){A(`JSON structure too deeply nested (current\
 max depth: ${u})`)}C(y,"tooDeep");function I(d){A(`Unexpected ${O(e)}, expectin\
g ${d}`)}C(I,"expected");function R(){const d=t-1;if(v.lastIndex=d,v.test(n)!==!0&&
I("JSON value"),t=v.lastIndex,e<102){const g=n.slice(d,t);return l?l.call(r,s,g):
+g}return e===110?null:e===116}C(R,"word");function S(){let d="";e:for(;;){U.lastIndex=
t,U.test(n);const c=U.lastIndex;for(c>t&&(d+=n.slice(t,c),t=c),e=n.charCodeAt(t++);;){
switch(e){case 34:return d;case 92:if(e=n.charCodeAt(t++),e===117){const f=k[n.charCodeAt(
t++)]+w[n.charCodeAt(t++)]+$[n.charCodeAt(t++)]+b[n.charCodeAt(t++)];if(f<65536){
d+=String.fromCharCode(f);break}A("Invalid \\uXXXX escape in string")}const g=P[e];
if(g!==""&&g!==void 0){d+=g;break}A(`Invalid escape sequence: ${O(e,"\\")} in st\
ring`);default:e>=0||A("Unterminated string"),A(`Invalid unescaped ${O(e)} in st\
ring`)}if(e=n.charCodeAt(t),e!==92&&e!==34)continue e;t++}}}C(S,"string");e:{do e=
n.charCodeAt(t++);while(e<=32&&(e===32||e===10||e===13||e===9));switch(e){case 123:
u===0&&y(),r={},s=void 0,h=!1;break;case 91:u===0&&y(),r=[],s=0,h=!0;break;case 34:
a=S();break e;default:a=R();break e}const d=u+u-2,c=[],g=L.test(n);let f=0;n:for(;;)
if(h===!0)for(;;){g===!0&&f>2&&(p.lastIndex=t,p.test(n),t=p.lastIndex);do e=n.charCodeAt(
t++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===93){if(o!==void 0&&J(o,
r),a=r,f===0)break e;if(r=c[--f],s=c[--f],h=typeof s=="number",h===!0){r[s++]=a;
continue}else{r[s]=a;continue n}}if(s!==0){e!==44&&I("',' or ']' after value"),g===
!0&&f>2&&(p.lastIndex=t,p.test(n),t=p.lastIndex);do e=n.charCodeAt(t++);while(e<=
32&&(e===32||e===10||e===13||e===9))}switch(e){case 34:r[s++]=S();continue;case 123:
f===d&&y(),c[f++]=s,c[f++]=r,r={},s=void 0,h=!1;continue n;case 91:f===d&&y(),c[f++]=
s,c[f++]=r,r=[],s=0;continue;default:r[s++]=R()}}else for(;;){g===!0&&f>2&&(p.lastIndex=
t,p.test(n),t=p.lastIndex);do e=n.charCodeAt(t++);while(e<=32&&(e===32||e===10||
e===13||e===9));if(e===125){if(o!==void 0&&J(o,r),a=r,f===0)break e;if(r=c[--f],
s=c[--f],h=typeof s=="number",h===!0){r[s++]=a;continue n}else{r[s]=a;continue}}
if(s!==void 0){e!==44&&I("',' or '}' after value"),g===!0&&f>2&&(p.lastIndex=t,p.
test(n),t=p.lastIndex);do e=n.charCodeAt(t++);while(e<=32&&(e===32||e===10||e===
13||e===9))}e!==34&&I("'}' or double-quoted key"),s=S();do e=n.charCodeAt(t++);while(e<=
32&&(e===32||e===10||e===13||e===9));e!==58&&I("':' after key");do e=n.charCodeAt(
t++);while(e<=32&&(e===32||e===10||e===13||e===9));switch(e){case 34:r[s]=S();continue;case 123:
f===d&&y(),c[f++]=s,c[f++]=r,r={},s=void 0;continue;case 91:f===d&&y(),c[f++]=s,
c[f++]=r,r=[],s=0,h=!0;continue n;default:r[s]=R()}}}return N.lastIndex=t,N.test(
n)===!1&&A("Unexpected data after end of JSON input"),o!==void 0&&(a={"":a},J(o,
a),a=a[""]),a}C(z,"parse");
