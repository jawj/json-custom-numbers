"use strict";var J=Object.defineProperty;var E=Object.getOwnPropertyDescriptor;var F=Object.getOwnPropertyNames;var K=Object.prototype.hasOwnProperty;var L=(t,e)=>{for(var i in e)J(t,i,{get:e[i],enumerable:!0})},P=(t,e,i,h)=>{if(e&&
typeof e=="object"||typeof e=="function")for(let c of F(e))!K.call(t,c)&&c!==i&&
J(t,c,{get:()=>e[c],enumerable:!(h=E(e,c))||h.enumerable});return t};var T=t=>P(J({},"__esModule",{value:!0}),t);var C={};L(C,{stringify:()=>B});module.exports=T(C);const N=/["\\\u0000-\u001f]/,
V=Object.prototype.hasOwnProperty;function B(t,e,i,h,c=5e4){let j,m;e!==void 0&&
(typeof e=="function"?j=e:Array.isArray(e)&&(m=e)),i!==void 0&&(i=typeof i=="str\
ing"?i.slice(0,10):typeof i=="number"?"          ".slice(0,i):void 0);const u=c*
(i===void 0?5:6);let r,s={"":t},d=0,g=[""],w=!1,l=1,f=[],n=0,y="",b=`
`,o,x=new Set([]);do{if(d===l){x.delete(s),i!==void 0&&(b=f[--n],y+=b),y+=g===void 0?
"]":"}",l=f[--n],w=f[--n],g=f[--n],d=f[--n],s=f[--n];continue}let A,O;g===void 0?
(r=String(d),t=s[d]):(r=g[d],t=s[r]);let k=typeof t;if(t&&k==="object"&&typeof t.
toJSON=="function"&&(t=t.toJSON(r),k=typeof t),j!==void 0&&(t=j.call(s,r,t),k=typeof t),
h===void 0||(o=h(r,t,k))===void 0)switch(k){case"string":o=N.test(t)?JSON.stringify(
t):'"'+t+'"';break;case"number":o=isFinite(t)?String(t):"null";break;case"boolea\
n":o=t===!0?"true":"false";break;case"object":if(t===null){o="null";break}if(Array.
isArray(t)){const S=t.length;S===0?o="[]":(o="[",A=void 0,O=S);break}const a=m===
void 0?Object.keys(t):m.filter(S=>V.call(t,S)),p=a.length;p===0?o="{}":(o="{",A=
a,O=p);break;case"bigint":throw new TypeError("Do not know how to serialize a Bi\
gInt");default:o=void 0}if(g===void 0?(d>0&&(y+=","),i!==void 0&&(y+=b),y+=o===void 0?
"null":o):o!==void 0&&(w?y+=",":w=!0,n>0&&(y+=i===void 0?(N.test(r)?JSON.stringify(
r):'"'+r+'"')+":":b+(N.test(r)?JSON.stringify(r):'"'+r+'"')+": "),y+=o),d++,O!==
void 0){if(f[n++]=s,f[n++]=d,f[n++]=g,f[n++]=w,f[n++]=l,i!==void 0&&(f[n++]=b,b+=
i),s=t,d=0,g=A,w=!1,l=O,n>u)throw new RangeError(`Maximum nesting depth exceeded\
 (current maximum is ${c})`);if(x.has(s))throw new TypeError("Cannot stringify c\
ircular structure");x.add(s)}}while(n!==0);return y||void 0}
