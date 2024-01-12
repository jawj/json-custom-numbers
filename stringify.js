"use strict";var w=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var q=Object.getOwnPropertyNames,D=Object.getOwnPropertySymbols;var K=Object.prototype.hasOwnProperty,z=Object.prototype.propertyIsEnumerable;var E=(t,i,e)=>i in t?w(t,i,{enumerable:!0,configurable:!0,writable:!0,value:e}):
t[i]=e,j=(t,i)=>{for(var e in i||(i={}))K.call(i,e)&&E(t,e,i[e]);if(D)for(var e of D(
i))z.call(i,e)&&E(t,e,i[e]);return t};var L=(t,i)=>w(t,"name",{value:i,configurable:!0});var B=(t,i)=>{for(var e in i)w(t,e,{get:i[e],enumerable:!0})},C=(t,i,e,h)=>{if(i&&
typeof i=="object"||typeof i=="function")for(let r of q(i))!K.call(t,r)&&r!==e&&
w(t,r,{get:()=>i[r],enumerable:!(h=V(i,r))||h.enumerable});return t};var I=t=>C(w({},"__esModule",{value:!0}),t);var G={};B(G,{stringify:()=>$});module.exports=I(G);/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON stringifier that's intended to
 * precisely match native `JSON.stringify` behaviour but also allow for custom
 * stringifying of numbers.
 */const J=/["\\\u0000-\u001f]/,M=Object.prototype.hasOwnProperty,R={maxDepth:5e4,
skipToJSON:!1};function $(t,i,e,h,r={}){typeof r=="number"&&(r={maxDepth:r}),r=j(
j({},R),r);const{maxDepth:N,skipToJSON:P}=r;let p,u;i!==void 0&&(typeof i=="func\
tion"?p=i:Array.isArray(i)&&(u=i.map(a=>String(a)))),e!==void 0&&(e=typeof e=="s\
tring"?e.slice(0,10):typeof e=="number"?"          ".slice(0,e):void 0);const F=N*
(e===void 0?5:6);let f,d={"":t},y=0,g=[""],l=!1,m=1,s=[],n=0,c="",b=`
`,o,x=new Set([]);do{if(y===m){x.delete(d),e!==void 0&&(b=s[--n],c+=b),c+=g===void 0?
"]":"}",m=s[--n],l=s[--n],g=s[--n],y=s[--n],d=s[--n];continue}let a,O;g===void 0?
(f=String(y),t=d[y]):(f=g[y],t=d[f]);let k=typeof t;if(P===!1&&t&&k==="object"&&
typeof t.toJSON=="function"&&(t=t.toJSON(f),k=typeof t),p!==void 0&&(t=p.call(d,
f,t),k=typeof t),h===void 0||(o=h(f,t,k))===void 0)switch(k){case"string":o=J.test(
t)?JSON.stringify(t):'"'+t+'"';break;case"number":o=isFinite(t)?String(t):"null";
break;case"boolean":o=t===!0?"true":"false";break;case"object":if(t===null){o="n\
ull";break}if(Array.isArray(t)){const S=t.length;S===0?o="[]":(o="[",a=void 0,O=
S);break}const A=u===void 0?Object.keys(t):u.filter(S=>M.call(t,S)),T=A.length;T===
0?o="{}":(o="{",a=A,O=T);break;case"bigint":throw new TypeError("Do not know how\
 to serialize a BigInt: please provide a custom serializer function");default:o=
void 0}if(g===void 0?(y>0&&(c+=","),e!==void 0&&(c+=b),c+=o===void 0?"null":o):o!==
void 0&&(l?c+=",":l=!0,n>0&&(c+=e===void 0?(J.test(f)?JSON.stringify(f):'"'+f+'"')+
":":b+(J.test(f)?JSON.stringify(f):'"'+f+'"')+": "),c+=o),y++,O!==void 0){if(s[n++]=
d,s[n++]=y,s[n++]=g,s[n++]=l,s[n++]=m,e!==void 0&&(s[n++]=b,b+=e),d=t,y=0,g=a,l=
!1,m=O,n>F)throw new RangeError(`Maximum nesting depth exceeded (current maximum\
 is ${N})`);if(x.has(d))throw new TypeError("Cannot stringify circular structure");
x.add(d)}}while(n!==0);return c||void 0}L($,"stringify");
