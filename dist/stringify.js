"use strict";var J=Object.defineProperty;var K=Object.getOwnPropertyDescriptor;var L=Object.getOwnPropertyNames;var x=Object.prototype.hasOwnProperty;var T=(i,o)=>{for(var t in o)J(i,t,{get:o[t],enumerable:!0})},V=(i,o,t,h)=>{if(o&&
typeof o=="object"||typeof o=="function")for(let s of L(o))!x.call(i,s)&&s!==t&&
J(i,s,{get:()=>o[s],enumerable:!(h=K(o,s))||h.enumerable});return i};var m=i=>V(J({},"__esModule",{value:!0}),i);var D={};T(D,{stringify:()=>B});module.exports=m(D);const N=/["\\\u0000-\u001f]/,
z=Object.prototype.hasOwnProperty;function B(i,o,t,h){let s,j;o!==void 0&&(typeof o==
"function"?s=o:Array.isArray(o)&&(j=o)),t!==void 0&&(t=typeof t=="string"?t.slice(
0,10):typeof t=="number"?"          ".slice(0,t):void 0);let f,g={"":i},d=0,b=[""],
k=!1,w=1,r=[],n=0,y="",c=`
`,e;do{if(d===w){t!==void 0&&(c=r[--n],y+=c),y+=b===void 0?"]":"}",w=r[--n],k=r[--n],
b=r[--n],d=r[--n],g=r[--n];continue}let A,O;b===void 0?(f=String(d),i=g[d]):(f=b[d],
i=g[f]);let l=typeof i;if(i&&l==="object"&&typeof i.toJSON=="function"&&(i=i.toJSON(
f),l=typeof i),s!==void 0&&(i=s.call(g,f,i),l=typeof i),h===void 0||(e=h(f,i,l))===
void 0)switch(l){case"string":e=N.test(i)?JSON.stringify(i):'"'+i+'"';break;case"\
number":e=isFinite(i)?String(i):"null";break;case"boolean":e=i===!0?"true":"fals\
e";break;case"object":if(i===null){e="null";break}if(Array.isArray(i)){const S=i.
length;S===0?e="[]":(e="[",A=void 0,O=S);break}const p=j===void 0?Object.keys(i):
j.filter(S=>z.call(i,S)),F=p.length;F===0?e="{}":(e="{",A=p,O=F);break;case"bigi\
nt":throw new TypeError("Do not know how to serialize a BigInt");default:e=void 0}
b===void 0?(d>0&&(y+=","),t!==void 0&&(y+=c),y+=e===void 0?"null":e):e!==void 0&&
(k?y+=",":k=!0,n>0&&(y+=t===void 0?(N.test(f)?JSON.stringify(f):'"'+f+'"')+":":c+
(N.test(f)?JSON.stringify(f):'"'+f+'"')+": "),y+=e),d++,O!==void 0&&(r[n++]=g,r[n++]=
d,r[n++]=b,r[n++]=k,r[n++]=w,t!==void 0&&(r[n++]=c,c+=t),g=i,d=0,b=A,k=!1,w=O)}while(n!==
0);return y||void 0}
