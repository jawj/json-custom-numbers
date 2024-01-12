var E=Object.defineProperty;var T=Object.getOwnPropertySymbols;var F=Object.prototype.hasOwnProperty,V=Object.prototype.propertyIsEnumerable;var D=(t,e,i)=>e in t?E(t,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):
t[e]=i,u=(t,e)=>{for(var i in e||(e={}))F.call(e,i)&&D(t,i,e[i]);if(T)for(var i of T(
e))V.call(e,i)&&D(t,i,e[i]);return t};var K=(t,e)=>E(t,"name",{value:e,configurable:!0});/**
 * https://github.com/jawj/json-custom-numbers
 * @copyright Copyright (c) 2023 George MacKerron
 * @license MIT
 * 
 * This file implements a non-recursive JSON stringifier that's intended to
 * precisely match native `JSON.stringify` behaviour but also allow for custom
 * stringifying of numbers.
 */const x=/["\\\u0000-\u001f]/,q=Object.prototype.hasOwnProperty,z={maxDepth:5e4,
skipToJSON:!1};function C(t,e,i,j,g={}){typeof g=="number"&&(g={maxDepth:g}),g=u(
u({},z),g);const{maxDepth:J,skipToJSON:L}=g;let O,S;e!==void 0&&(typeof e=="func\
tion"?O=e:Array.isArray(e)&&(S=e.map(l=>String(l)))),i!==void 0&&(i=typeof i=="s\
tring"?i.slice(0,10):typeof i=="number"?"          ".slice(0,i):void 0);const P=J*
(i===void 0?5:6);let r,s={"":t},d=0,c=[""],h=!1,k=1,f=[],n=0,y="",b=`
`,o,p=new Set([]);do{if(d===k){p.delete(s),i!==void 0&&(b=f[--n],y+=b),y+=c===void 0?
"]":"}",k=f[--n],h=f[--n],c=f[--n],d=f[--n],s=f[--n];continue}let l,w;c===void 0?
(r=String(d),t=s[d]):(r=c[d],t=s[r]);let a=typeof t;if(L===!1&&t&&a==="object"&&
typeof t.toJSON=="function"&&(t=t.toJSON(r),a=typeof t),O!==void 0&&(t=O.call(s,
r,t),a=typeof t),j===void 0||(o=j(r,t,a))===void 0)switch(a){case"string":o=x.test(
t)?JSON.stringify(t):'"'+t+'"';break;case"number":o=isFinite(t)?String(t):"null";
break;case"boolean":o=t===!0?"true":"false";break;case"object":if(t===null){o="n\
ull";break}if(Array.isArray(t)){const m=t.length;m===0?o="[]":(o="[",l=void 0,w=
m);break}const N=S===void 0?Object.keys(t):S.filter(m=>q.call(t,m)),A=N.length;A===
0?o="{}":(o="{",l=N,w=A);break;case"bigint":throw new TypeError("Do not know how\
 to serialize a BigInt: please provide a custom serializer function");default:o=
void 0}if(c===void 0?(d>0&&(y+=","),i!==void 0&&(y+=b),y+=o===void 0?"null":o):o!==
void 0&&(h?y+=",":h=!0,n>0&&(y+=i===void 0?(x.test(r)?JSON.stringify(r):'"'+r+'"')+
":":b+(x.test(r)?JSON.stringify(r):'"'+r+'"')+": "),y+=o),d++,w!==void 0){if(f[n++]=
s,f[n++]=d,f[n++]=c,f[n++]=h,f[n++]=k,i!==void 0&&(f[n++]=b,b+=i),s=t,d=0,c=l,h=
!1,k=w,n>P)throw new RangeError(`Maximum nesting depth exceeded (current maximum\
 is ${J})`);if(p.has(s))throw new TypeError("Cannot stringify circular structure");
p.add(s)}}while(n!==0);return y||void 0}K(C,"stringify");export{C as stringify};
