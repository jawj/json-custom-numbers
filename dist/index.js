"use strict";var A=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var v=Object.getOwnPropertyNames;var O=Object.prototype.hasOwnProperty;var B=(e,c)=>{for(var i in c)A(e,i,{get:c[i],enumerable:!0})},C=(e,c,i,s)=>{if(c&&typeof c=="object"||typeof c=="function")for(let l of v(c))!O.call(e,l)&&l!==i&&A(e,l,{get:()=>c[l],enumerable:!(s=m(c,l))||s.enumerable});return e};var E=e=>C(A({},"__esModule",{value:!0}),e);var U={};B(U,{JSONParseError:()=>w,default:()=>R});module.exports=E(U);var n=0,t=" ",r="",g=!1,x,I={'"':'"',"\\":"\\","/":"/",b:"\b",f:"\f",n:`
`,r:"\r",t:"	"},j=/[\n\t\u0000-\u001f]/,p=/true|false|null|-?(0|[1-9][0-9]*)([.][0-9]+)?([eE][-+]?[0-9]+)?/y,w=class extends Error{};function a(e){throw new w(`${e}
At character ${n} in JSON: ${r}`)}function S(){let e;p.lastIndex=n-1,p.test(r)||a("Unexpected value");let{lastIndex:i}=p;if(t<"f"){let s=r.slice(n-1,i);e=x?x(s):+s}else e=t==="t"?!0:t==="f"?!1:null;return t=r.charAt(i),n=i+1,e}function k(){let e="";for(;;){let c=r.indexOf('"',n);if(c===-1&&a("Unterminated string"),c===n)return n=c+1,t=r.charAt(n++),e;let i=r.slice(n,c),s=i.indexOf("\\");if(s===-1)return!g&&j.test(i)&&a("Bad character in string"),e+=i,n=c+1,t=r.charAt(n++),e;{i=i.slice(0,s),!g&&j.test(i)&&a("Bad character in string"),e+=i,n+=s+1,t=r.charAt(n++);let l=I[t];if(l)e+=l;else if(t==="u"){let f=0;for(let h=0;h<4;h+=1){let u=parseInt(t=r.charAt(n++),16);isFinite(u)||a("Bad unicode escape in string"),f=f*16+u}e+=String.fromCharCode(f)}else a("Bad escape sequence in string: '\\"+t+"'")}}}function $(){let e=[],c=0;do t=r.charAt(n++);while(t<=" "&&(t===" "||t===`
`||t==="\r"||t==="	"));if(t==="]")return t=r.charAt(n++),e;for(;t;){for(e[c++]=b();t<=" "&&(t===" "||t===`
`||t==="\r"||t==="	");)t=r.charAt(n++);if(t==="]")return t=r.charAt(n++),e;t!==","&&a("Expected ',', got '"+t+"' between array elements");do t=r.charAt(n++);while(t<=" "&&(t===" "||t===`
`||t==="\r"||t==="	"))}a("Array ends with '[' or ','")}function F(){let e={};do t=r.charAt(n++);while(t<=" "&&(t===" "||t===`
`||t==="\r"||t==="	"));if(t==="}")return t=r.charAt(n++),e;for(;t;){let c=k();for(;t<=" "&&(t===" "||t===`
`||t==="\r"||t==="	");)t=r.charAt(n++);for(t!==":"&&a("Expected ':', got '"+t+"' between object key and value"),t=r.charAt(n++),e[c]=b();t<=" "&&(t===" "||t===`
`||t==="\r"||t==="	");)t=r.charAt(n++);if(t==="}")return t=r.charAt(n++),e;t!==","&&a("Expected ',', got '"+t+"' between items in object");do t=r.charAt(n++);while(t<=" "&&(t===" "||t===`
`||t==="\r"||t==="	"))}a("Object ends with '{' or ','")}function b(){for(;t<=" "&&(t===" "||t===`
`||t==="\r"||t==="	");)t=r.charAt(n++);switch(t){case'"':return k();case"{":return F();case"[":return $();default:return S()}}function R(e,c,i,s){typeof e!="string"&&a("JSON source is not a string"),n=0,t=" ",r=e,g=s,x=i;let l=b();for(;t<=" "&&(t===" "||t===`
`||t==="\r"||t==="	");)t=r.charAt(n++);return t&&a("Additional data at end"),typeof c=="function"?function f(h,u){let o=h[u];if(o&&typeof o=="object"){for(let d in o)if(Object.prototype.hasOwnProperty.call(o,d)){let y=f(o,d);y!==void 0?o[d]=y:delete o[d]}}return c.call(h,u,o)}({"":l},""):l}
