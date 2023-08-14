"use strict";class j extends Error{}const E=/[^"\\\u0000-\u001f]*/y,I=/-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?|true|false|null/y,
v=`.................................."............./............................\
.................\\......\b....\f........
....\r..	`.split("."),m=65536,k=[],N="Maximum nesting depth exceeded";for(let o=0;o<
4;o++){const c=k[o]=new Uint32Array(103),f=o<<2;let i=0;for(;i<48;i++)c[i]=m;for(;i<
58;i++)c[i]=i-48<<f;for(;i<65;i++)c[i]=m;for(;i<71;i++)c[i]=i-55<<f;for(;i<97;i++)
c[i]=m;for(;i<103;i++)c[i]=i-87<<f}function C(o,c=""){if(!(o>=0))return"end of i\
nput";if(o>31&&o<127)return`'${c}${String.fromCharCode(o)}'`;if(o===10)return"\\n";
if(o===9)return"\\t";const f=o.toString(16),i="0000".slice(f.length)+f;return(o>
31?`'${c}${String.fromCharCode(o)}', `:"")+`\\u${i}`}function S(o,c){const f=Object.
keys(c),i=f.length;for(let s=0;s<i;s++){const A=f[s],t=o.call(c,A,c[A]);t!==void 0?
c[A]=t:delete c[A]}}function p(o,c,f,i=1/0){typeof o!="string"&&(o=String(o)),typeof c!=
"function"&&(c=void 0);const s=[],A=i*2;let t=0,r=0,e,a,l,n,d;function u(h){throw new j(
`${h}
At character ${r} in JSON: ${o}`)}function $(){const h=r-1;I.lastIndex=h,I.test(
o)||u(`Unexpected ${C(e)}, expecting number, true, false or null`),r=I.lastIndex;
let b;if(e<102){const g=o.slice(h,r);b=f?f(g):+g}else b=e===110?null:e===116;return e=
o.charCodeAt(r++),b}function w(){let h="";for(;;){E.lastIndex=r,E.test(o);const y=E.
lastIndex;switch(y>r&&(h+=o.slice(r,y),r=y),e=o.charCodeAt(r++),e){case 34:return e=
o.charCodeAt(r++),h;case 92:if(e=o.charCodeAt(r++),e===117){const g=k[3][o.charCodeAt(
r++)]+k[2][o.charCodeAt(r++)]+k[1][o.charCodeAt(r++)]+k[0][o.charCodeAt(r++)];if(g<
m){d+=String.fromCharCode(g);continue}u("Invalid \\uXXXX escape in string")}const b=v[e];
if(b){d+=b;continue}u(`Invalid escape sequence in string: ${C(e,"\\")}`);default:
e>=0||u("Unterminated string"),u(`Invalid unescaped ${C(e)} in string`)}}}o:{do e=
o.charCodeAt(r++);while(e<=32&&(e===32||e===10||e===13||e===9));e:switch(e){case 123:
do e=o.charCodeAt(r++);while(e<=32&&(e===32||e===10||e===13||e===9));if(e===125){
d={};break o}else{a={},l=!1;break e}case 91:do e=o.charCodeAt(r++);while(e<=32&&
(e===32||e===10||e===13||e===9));if(e===93){d=[];break o}else{a=[],l=!0;break e}case 34:
d=w();break o;default:d=$();break o}e:for(;!isNaN(e);)if(t>A&&u(`Structure too d\
eeply nested (current maximum is ${i})`),l)for(;;){if(e===93){if(c!==void 0&&S(c,
a),d=a,t===0)break o;a=s[--t],n=s[--t],l=typeof n=="number",a[l?n++:n]=d;do e=o.
charCodeAt(r++);while(e<=32&&(e===32||e===10||e===13||e===9));continue e}if(n>0){
e!==44&&u("Expected ',' or ']' but got "+C(e)+" after value in array");do e=o.charCodeAt(
r++);while(e<=32&&(e===32||e===10||e===13||e===9))}switch(e){case 34:a[n++]=w();
break;case 123:do e=o.charCodeAt(r++);while(e<=32&&(e===32||e===10||e===13||e===
9));if(e===125){a[n++]={},e=o.charCodeAt(r++);break}else{s[t++]=n,s[t++]=a,a={},
n=void 0,l=!1;continue e}case 91:do e=o.charCodeAt(r++);while(e<=32&&(e===32||e===
10||e===13||e===9));if(e===93){a[n++]=[],e=o.charCodeAt(r++);break}else{s[t++]=n,
s[t++]=a,a=[],n=0,l=!0;continue e}default:a[n++]=$()}for(;e<=32&&(e===32||e===10||
e===13||e===9);)e=o.charCodeAt(r++)}else for(;;){if(e===125){if(c!==void 0&&S(c,
a),d=a,t===0)break o;a=s[--t],n=s[--t],l=typeof n=="number",a[l?n++:n]=d;do e=o.
charCodeAt(r++);while(e<=32&&(e===32||e===10||e===13||e===9));continue e}if(n!==
void 0){e!==44&&u("Expected ',' or '}' but got "+C(e)+" after value in object");
do e=o.charCodeAt(r++);while(e<=32&&(e===32||e===10||e===13||e===9))}for(e!==34&&
u(`Expected '"' but got `+C(e)+" in object"),n=w();e<=32&&(e===32||e===10||e===13||
e===9);)e=o.charCodeAt(r++);e!==58&&u("Expected ':' but got "+C(e)+" after key i\
n object");do e=o.charCodeAt(r++);while(e<=32&&(e===32||e===10||e===13||e===9));
switch(e){case 34:a[n]=w();break;case 123:do e=o.charCodeAt(r++);while(e<=32&&(e===
32||e===10||e===13||e===9));if(e===125){a[n]={},e=o.charCodeAt(r++);break}else{s[t++]=
n,s[t++]=a,a={},n=void 0,l=!1;continue e}case 91:do e=o.charCodeAt(r++);while(e<=
32&&(e===32||e===10||e===13||e===9));if(e===93){a[n]=[],e=o.charCodeAt(r++);break}else{
s[t++]=n,s[t++]=a,a=[],n=0,l=!0;continue e}default:a[n]=$()}for(;e<=32&&(e===32||
e===10||e===13||e===9);)e=o.charCodeAt(r++)}}return c!==void 0&&(d={"":d},S(c,d),
d=d[""]),d}console.log(p(' { "a": 1 , "b": 2 , "c": [false, true, {}, [ [ ], [],\
 ["x"] ], { } ] , "d" : { "e": 1, "x": { "bloop": "y" } } , "f" : true, "g": {},\
 "goodbye" : [], "arr": [1, 2 ,3] } ')),console.log(p('"ciao"')),console.log(p("\
8")),console.log(p(" [ ] ")),console.log(p("{}"));
