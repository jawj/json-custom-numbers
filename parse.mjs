var T=Object.defineProperty;var C=(t,a)=>T(t,"name",{value:a,configurable:!0});/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON parser that's intended to
 * precisely match native `JSON.parse` behaviour but also allow for custom
 * number parsing.
 */const v=/[^"\\\u0000-\u001f]*/y,D=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
J=/[ \n\t\r]*$/y,X=/^.{0,32}\n[ \t]/,h=/[ \n\t\r]*/y,j=`........................\
.........."............./.............................................\\......\b..\
..\f........
....\r..	`.split("."),x=C(()=>new Uint32Array(103),"hlArr"),k=x(),m=x(),w=x(),$=x();
let i=0;for(;i<48;i++)k[i]=m[i]=w[i]=$[i]=65536;for(;i<58;i++)k[i]=(m[i]=(w[i]=($[i]=
i-48)<<4)<<4)<<4;for(;i<65;i++)k[i]=m[i]=w[i]=$[i]=65536;for(;i<71;i++)k[i]=(m[i]=
(w[i]=($[i]=i-55)<<4)<<4)<<4;for(;i<97;i++)k[i]=m[i]=w[i]=$[i]=65536;for(;i<103;i++)
k[i]=(m[i]=(w[i]=($[i]=i-87)<<4)<<4)<<4;function O(t,a=""){if(!(t>=0))return"end\
 of JSON input";if(t>31&&t<127)return`'${a}${String.fromCharCode(t)}'`;if(t===10)
return"\\n";if(t===9)return"\\t";const p=t.toString(16),y="0000".slice(p.length)+
p;return(t>31?`'${a}${String.fromCharCode(t)}' or `:"")+`\\u${y}`}C(O,"chDesc");
function R(t,a){const p=Object.keys(a),y=p.length;for(let d=0;d<y;d++){const n=p[d],
e=t.call(a,n,a[n]);e!==void 0?a[n]=e:delete a[n]}}C(R,"revive");function q(t,a,p){
const y=p===!0?" in array":p===!1?" in object":"",d=t.slice(0,a),n=d.match(/[^\n]{0,69}$/)[0],
e=n.length<d.length?"..."+n:n,o=a-(d.length-e.length),u=t.slice(a),r=u.match(/[^\n]{0,5}/)[0],
c=r.length<u.length?r+"...":r,A=e+c,I=" ".repeat(o<1?0:o-1)+"^";return`${y}
At position ${a} in JSON:
${A}
${I}`}C(q,"errContext");const N={maxDepth:1/0};function K(t,a,p,y){var U;typeof t!=
"string"&&(t=String(t)),typeof a!="function"&&(a=void 0);const d=y===void 0?N.maxDepth:
typeof y=="number"?y:(U=y.maxDepth)!=null?U:N.maxDepth;let n=0,e,o,u,r,c;function A(l){
throw new SyntaxError(l+q(t,n,u))}C(A,"err");function I(){A(`JSON structure too \
deeply nested (current max depth: ${d})`)}C(I,"tooDeep");function b(l){A(`Unexpe\
cted ${O(e)}, expecting ${l}`)}C(b,"expected");function E(){const l=n-1;if(D.lastIndex=
l,D.test(t)!==!0&&b("JSON value"),n=D.lastIndex,e<102){const g=t.slice(l,n);return p?
p.call(o,r,g):+g}return e===110?null:e===116}C(E,"word");function S(){let l="";e:
for(;;){v.lastIndex=n,v.test(t);const f=v.lastIndex;for(f>n&&(l+=t.slice(n,f),n=
f),e=t.charCodeAt(n++);;){switch(e){case 34:return l;case 92:if(e=t.charCodeAt(n++),
e===117){const s=k[t.charCodeAt(n++)]+m[t.charCodeAt(n++)]+w[t.charCodeAt(n++)]+
$[t.charCodeAt(n++)];if(s<65536){l+=String.fromCharCode(s);break}A("Invalid \\uXX\
XX escape in string")}const g=j[e];if(g!==""&&g!==void 0){l+=g;break}A(`Invalid \
escape sequence: ${O(e,"\\")} in string`);default:e>=0||A("Unterminated string"),
A(`Invalid unescaped ${O(e)} in string`)}if(e=t.charCodeAt(n),e!==92&&e!==34)continue e;
n++}}}C(S,"string");e:{do e=t.charCodeAt(n++);while(e<=32&&(e===32||e===10||e===
13||e===9));switch(e){case 123:d===0&&I(),o={},r=void 0,u=!1;break;case 91:d===0&&
I(),o=[],r=0,u=!0;break;case 34:c=S();break e;default:c=E();break e}const l=d+d-
2,f=[],g=X.test(t);let s=0;t:for(;;)if(u===!0)for(;;){g===!0&&s>2&&(h.lastIndex=
n,h.test(t),n=h.lastIndex);do e=t.charCodeAt(n++);while(e<=32&&(e===32||e===10||
e===13||e===9));if(e===93){if(a!==void 0&&R(a,o),c=o,s===0)break e;if(o=f[--s],r=
f[--s],u=typeof r=="number",u===!0){o[r++]=c;continue}else{o[r]=c;continue t}}if(r!==
0){e!==44&&b("',' or ']' after value"),g===!0&&s>2&&(h.lastIndex=n,h.test(t),n=h.
lastIndex);do e=t.charCodeAt(n++);while(e<=32&&(e===32||e===10||e===13||e===9))}
switch(e){case 34:o[r++]=S();continue;case 123:s===l&&I(),f[s++]=r,f[s++]=o,o={},
r=void 0,u=!1;continue t;case 91:s===l&&I(),f[s++]=r,f[s++]=o,o=[],r=0;continue;default:
o[r++]=E()}}else for(;;){g===!0&&s>2&&(h.lastIndex=n,h.test(t),n=h.lastIndex);do
e=t.charCodeAt(n++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){if(a!==
void 0&&R(a,o),c=o,s===0)break e;if(o=f[--s],r=f[--s],u=typeof r=="number",u===!0){
o[r++]=c;continue t}else{o[r]=c;continue}}if(r!==void 0){e!==44&&b("',' or '}' a\
fter value"),g===!0&&s>2&&(h.lastIndex=n,h.test(t),n=h.lastIndex);do e=t.charCodeAt(
n++);while(e<=32&&(e===32||e===10||e===13||e===9))}e!==34&&b("'}' or double-quot\
ed key"),r=S();do e=t.charCodeAt(n++);while(e<=32&&(e===32||e===10||e===13||e===
9));e!==58&&b("':' after key");do e=t.charCodeAt(n++);while(e<=32&&(e===32||e===
10||e===13||e===9));switch(e){case 34:o[r]=S();continue;case 123:s===l&&I(),f[s++]=
r,f[s++]=o,o={},r=void 0;continue;case 91:s===l&&I(),f[s++]=r,f[s++]=o,o=[],r=0,
u=!0;continue t;default:o[r]=E()}}}return J.lastIndex=n,J.test(t)===!1&&A("Unexp\
ected data after end of JSON input"),a!==void 0&&(c={"":c},R(a,c),c=c[""]),c}C(K,
"parse");export{K as parse};
