"use strict";var u=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var K=Object.getOwnPropertyNames;var L=Object.prototype.hasOwnProperty;var P=(t,e)=>{for(var i in e)u(t,i,{get:e[i],enumerable:!0})},T=(t,e,i,h)=>{if(e&&
typeof e=="object"||typeof e=="function")for(let c of K(e))!L.call(t,c)&&c!==i&&
u(t,c,{get:()=>e[c],enumerable:!(h=E(e,c))||h.enumerable});return t};var F=t=>T(u({},"__esModule",{value:!0}),t);var B={};P(B,{stringify:()=>q});module.exports=F(B);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON stringifier that's intended to
 * precisely match native `JSON.stringify` behaviour but also allow for custom
 * stringifying of numbers.
 */const x=/["\\\u0000-\u001f]/,V=Object.prototype.hasOwnProperty;function q(t,e,i,h,c=5e4){
let m,a;e!==void 0&&(typeof e=="function"?m=e:Array.isArray(e)&&(a=e.map(k=>String(
k)))),i!==void 0&&(i=typeof i=="string"?i.slice(0,10):typeof i=="number"?"      \
    ".slice(0,i):void 0);const N=c*(i===void 0?5:6);let r,s={"":t},d=0,g=[""],w=!1,
S=1,f=[],n=0,y="",b=`
`,o,p=new Set([]);do{if(d===S){p.delete(s),i!==void 0&&(b=f[--n],y+=b),y+=g===void 0?
"]":"}",S=f[--n],w=f[--n],g=f[--n],d=f[--n],s=f[--n];continue}let k,O;g===void 0?
(r=String(d),t=s[d]):(r=g[d],t=s[r]);let l=typeof t;if(t&&l==="object"&&typeof t.
toJSON=="function"&&(t=t.toJSON(r),l=typeof t),m!==void 0&&(t=m.call(s,r,t),l=typeof t),
h===void 0||(o=h(r,t,l))===void 0)switch(l){case"string":o=x.test(t)?JSON.stringify(
t):'"'+t+'"';break;case"number":o=isFinite(t)?String(t):"null";break;case"boolea\
n":o=t===!0?"true":"false";break;case"object":if(t===null){o="null";break}if(Array.
isArray(t)){const j=t.length;j===0?o="[]":(o="[",k=void 0,O=j);break}const A=a===
void 0?Object.keys(t):a.filter(j=>V.call(t,j)),J=A.length;J===0?o="{}":(o="{",k=
A,O=J);break;case"bigint":throw new TypeError("Do not know how to serialize a Bi\
gInt");default:o=void 0}if(g===void 0?(d>0&&(y+=","),i!==void 0&&(y+=b),y+=o===void 0?
"null":o):o!==void 0&&(w?y+=",":w=!0,n>0&&(y+=i===void 0?(x.test(r)?JSON.stringify(
r):'"'+r+'"')+":":b+(x.test(r)?JSON.stringify(r):'"'+r+'"')+": "),y+=o),d++,O!==
void 0){if(f[n++]=s,f[n++]=d,f[n++]=g,f[n++]=w,f[n++]=S,i!==void 0&&(f[n++]=b,b+=
i),s=t,d=0,g=k,w=!1,S=O,n>N)throw new RangeError(`Maximum nesting depth exceeded\
 (current maximum is ${c})`);if(p.has(s))throw new TypeError("Cannot stringify c\
ircular structure");p.add(s)}}while(n!==0);return y||void 0}
