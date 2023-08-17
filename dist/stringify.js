"use strict";var m=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var L=Object.getOwnPropertyNames;var P=Object.prototype.hasOwnProperty;var N=(t,i)=>m(t,"name",{value:i,configurable:!0});var T=(t,i)=>{for(var e in i)m(t,e,{get:i[e],enumerable:!0})},F=(t,i,e,h)=>{if(i&&
typeof i=="object"||typeof i=="function")for(let c of L(i))!P.call(t,c)&&c!==e&&
m(t,c,{get:()=>i[c],enumerable:!(h=K(i,c))||h.enumerable});return t};var V=t=>F(m({},"__esModule",{value:!0}),t);var C={};T(C,{stringify:()=>B});module.exports=V(C);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON stringifier that's intended to
 * precisely match native `JSON.stringify` behaviour but also allow for custom
 * stringifying of numbers.
 */const x=/["\\\u0000-\u001f]/,q=Object.prototype.hasOwnProperty;function B(t,i,e,h,c=5e4){
let a,p;i!==void 0&&(typeof i=="function"?a=i:Array.isArray(i)&&(p=i.map(k=>String(
k)))),e!==void 0&&(e=typeof e=="string"?e.slice(0,10):typeof e=="number"?"      \
    ".slice(0,e):void 0);const E=c*(e===void 0?5:6);let r,s={"":t},d=0,g=[""],w=!1,
S=1,f=[],n=0,y="",b=`
`,o,u=new Set([]);do{if(d===S){u.delete(s),e!==void 0&&(b=f[--n],y+=b),y+=g===void 0?
"]":"}",S=f[--n],w=f[--n],g=f[--n],d=f[--n],s=f[--n];continue}let k,O;g===void 0?
(r=String(d),t=s[d]):(r=g[d],t=s[r]);let l=typeof t;if(t&&l==="object"&&typeof t.
toJSON=="function"&&(t=t.toJSON(r),l=typeof t),a!==void 0&&(t=a.call(s,r,t),l=typeof t),
h===void 0||(o=h(r,t,l))===void 0)switch(l){case"string":o=x.test(t)?JSON.stringify(
t):'"'+t+'"';break;case"number":o=isFinite(t)?String(t):"null";break;case"boolea\
n":o=t===!0?"true":"false";break;case"object":if(t===null){o="null";break}if(Array.
isArray(t)){const j=t.length;j===0?o="[]":(o="[",k=void 0,O=j);break}const A=p===
void 0?Object.keys(t):p.filter(j=>q.call(t,j)),J=A.length;J===0?o="{}":(o="{",k=
A,O=J);break;case"bigint":throw new TypeError("Do not know how to serialize a Bi\
gInt");default:o=void 0}if(g===void 0?(d>0&&(y+=","),e!==void 0&&(y+=b),y+=o===void 0?
"null":o):o!==void 0&&(w?y+=",":w=!0,n>0&&(y+=e===void 0?(x.test(r)?JSON.stringify(
r):'"'+r+'"')+":":b+(x.test(r)?JSON.stringify(r):'"'+r+'"')+": "),y+=o),d++,O!==
void 0){if(f[n++]=s,f[n++]=d,f[n++]=g,f[n++]=w,f[n++]=S,e!==void 0&&(f[n++]=b,b+=
e),s=t,d=0,g=k,w=!1,S=O,n>E)throw new RangeError(`Maximum nesting depth exceeded\
 (current maximum is ${c})`);if(u.has(s))throw new TypeError("Cannot stringify c\
ircular structure");u.add(s)}}while(n!==0);return y||void 0}N(B,"stringify");
