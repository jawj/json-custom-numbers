"use strict";var O=Object.defineProperty;var A=Object.getOwnPropertyDescriptor;var v=Object.getOwnPropertyNames;var _=Object.prototype.hasOwnProperty;var I=(o,f)=>{for(var t in f)O(o,t,{get:f[t],enumerable:!0})},k=(o,f,t,e)=>{if(f&&
typeof f=="object"||typeof f=="function")for(let s of v(f))!_.call(o,s)&&s!==t&&
O(o,s,{get:()=>f[s],enumerable:!(e=A(f,s))||e.enumerable});return o};var E=o=>k(O({},"__esModule",{value:!0}),o);var R={};I(R,{stringify:()=>F});module.exports=E(R);let l,b,g,p;const h=/["\\\u0000-\u001f]/,
S="Do not know how to serialize a BigInt";function J(o,f){let t=f[o],e=typeof t;
t&&e==="object"&&typeof t.toJSON=="function"&&(t=t.toJSON(o)),t=g.call(f,o,t),e=
typeof t;let s;if(p&&(s=p(t,e))!==void 0)return s;switch(e){case"string":return h.
test(t)?JSON.stringify(t):'"'+t+'"';case"boolean":return t?"true":"false";case"o\
bject":if(!t)return"null";if(Array.isArray(t)){let i="[";const r=t.length;for(let n=0;n<
r;n++)n!==0&&(i+=","),i+=J(n,t)||"null";return i+"]"}let c="{";const u=Object.keys(
t),a=u.length;for(let i=0;i<a;i++){const r=u[i],n=J(r,t);n&&(i!==0&&(c+=","),c+=
(h.test(r)?JSON.stringify(r):'"'+r+'"')+":"+n)}return c+"}";case"number":return isFinite(
t)?String(t):"null";case"bigint":throw new TypeError(S)}}function N(o,f){let t=l,
e=f[o],s=typeof e;e&&s==="object"&&typeof e.toJSON=="function"&&(e=e.toJSON(o)),
e=g.call(f,o,e),s=typeof e;let c;if(p&&(c=p(e,s))!==void 0)return c;switch(s){case"\
string":return h.test(e)?JSON.stringify(e):'"'+e+'"';case"boolean":return e?"tru\
e":"false";case"object":if(!e)return"null";if(l+=b,Array.isArray(e)){const r=e.length;
if(r===0)return l=t,"[]";let n=`[
`+l;for(let y=0;y<r;y++)y!==0&&(n+=`,
`+l),n+=N(y,e)||"null";return n+=`
`+t+"]",l=t,n}const u=Object.keys(e),a=u.length;if(a===0)return l=t,"{}";let i=`\
{
`+l;for(let r=0;r<a;r++){const n=u[r],y=N(n,e);y&&(r!==0&&(i+=`,
`+l),i+=(h.test(n)?JSON.stringify(n):'"'+n+'"')+": "+y)}return i+=`
`+t+"}",l=t,i;case"number":return isFinite(e)?String(e):"null";case"bigint":throw new TypeError(
S)}}function w(o,f){let t=f[o],e=typeof t;t&&e==="object"&&typeof t.toJSON=="fun\
ction"&&(t=t.toJSON(o),e=typeof t);let s;if(p&&(s=p(t,e))!==void 0)return s;switch(e){case"\
string":return h.test(t)?JSON.stringify(t):'"'+t+'"';case"boolean":return t?"tru\
e":"false";case"object":if(!t)return"null";if(Array.isArray(t)){let i="[";const r=t.
length;for(let n=0;n<r;n++)n!==0&&(i+=","),i+=w(n,t)||"null";return i+"]"}let c="\
{",u=!1;const a=g.length;for(let i=0;i<a;i++){const r=g[i],n=w(r,t);n&&(u?c+=",":
u=!0,c+=(h.test(r)?JSON.stringify(r):'"'+r+'"')+":"+n)}return c+"}";case"number":
return isFinite(t)?String(t):"null";case"bigint":throw new TypeError(S)}}function d(o,f){
let t=l,e=f[o],s=typeof e;e&&s==="object"&&typeof e.toJSON=="function"&&(e=e.toJSON(
o),s=typeof e);let c;if(p&&(c=p(e,s))!==void 0)return c;switch(s){case"string":return h.
test(e)?JSON.stringify(e):'"'+e+'"';case"boolean":return e?"true":"false";case"o\
bject":if(!e)return"null";if(l+=b,Array.isArray(e)){const i=e.length;if(i===0)return l=
t,"[]";let r=`[
`+l;for(let n=0;n<i;n++)n!==0&&(r+=`,
`+l),r+=d(n,e)||"null";return r+=`
`+t+"]",l=t,r}let u;const a=g.length;for(let i=0;i<a;i++){const r=g[i],n=d(r,e);
n&&(u?u+=`,
`+l:u=`{
`+l,u+=(h.test(r)?JSON.stringify(r):'"'+r+'"')+": "+n)}return u?u+=`
`+t+"}":u="{}",l=t,u;case"number":return isFinite(e)?String(e):"null";case"bigin\
t":throw new TypeError(S)}}function m(o,f){let t=f[o],e=typeof t;t&&e==="object"&&
typeof t.toJSON=="function"&&(t=t.toJSON(o),e=typeof t);let s;if(p&&(s=p(t,e))!==
void 0)return s;switch(e){case"string":return h.test(t)?JSON.stringify(t):'"'+t+
'"';case"boolean":return t?"true":"false";case"object":if(!t)return"null";if(Array.
isArray(t)){let i="[";const r=t.length;for(let n=0;n<r;n++)n!==0&&(i+=","),i+=m(
n,t)||"null";return i+"]"}let c="{";const u=Object.keys(t),a=u.length;for(let i=0;i<
a;i++){const r=u[i],n=m(r,t);n&&(i!==0&&(c+=","),c+=(h.test(r)?JSON.stringify(r):
'"'+r+'"')+":"+n)}return c+"}";case"number":return isFinite(t)?String(t):"null";case"\
bigint":throw new TypeError(S)}}function j(o,f){let t=l,e=f[o],s=typeof e;e&&s===
"object"&&typeof e.toJSON=="function"&&(e=e.toJSON(o),s=typeof e);let c;if(p&&(c=
p(e,s))!==void 0)return c;switch(s){case"string":return h.test(e)?JSON.stringify(
e):'"'+e+'"';case"boolean":return e?"true":"false";case"object":if(!e)return"nul\
l";if(l+=b,Array.isArray(e)){const r=e.length;if(r===0)return l=t,"[]";let n=`[
`+l;for(let y=0;y<r;y++)y!==0&&(n+=`,
`+l),n+=j(y,e)||"null";return n+=`
`+t+"]",l=t,n}const u=Object.keys(e),a=u.length;if(a===0)return l=t,"{}";let i=`\
{
`+l;for(let r=0;r<a;r++){const n=u[r],y=j(n,e);y&&(r!==0&&(i+=`,
`+l),i+=(h.test(n)?JSON.stringify(n):'"'+n+'"')+": "+y)}return i+=`
`+t+"}",l=t,i;case"number":return isFinite(e)?String(e):"null";case"bigint":throw new TypeError(
S)}}function F(o,f,t,e){l="",b="";const s=typeof t;if(s==="number")for(let a=0;a<
t;a++)b+=" ";else s==="string"&&(b=t);g=f;const c=typeof g=="function",u=Array.isArray(
g);return u&&(g=g.filter(a=>typeof a=="string")),g&&!c&&!u&&(g=void 0),p=e,(b?g?
u?d:N:j:g?u?w:J:m)("",{"":o})}
