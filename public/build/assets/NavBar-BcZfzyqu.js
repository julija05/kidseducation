import{r as a,U as g,X as b,j as e,x as n}from"./app-ulhG1ZUU.js";/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),w=r=>r.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,s,o)=>o?o.toUpperCase():s.toLowerCase()),c=r=>{const t=w(r);return t.charAt(0).toUpperCase()+t.slice(1)},d=(...r)=>r.filter((t,s,o)=>!!t&&t.trim()!==""&&o.indexOf(t)===s).join(" ").trim();/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var N={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=a.forwardRef(({color:r="currentColor",size:t=24,strokeWidth:s=2,absoluteStrokeWidth:o,className:i="",children:l,iconNode:m,...p},u)=>a.createElement("svg",{ref:u,...N,width:t,height:t,stroke:r,strokeWidth:o?Number(s)*24/Number(t):s,className:d("lucide",i),...p},[...m.map(([h,f])=>a.createElement(h,f)),...Array.isArray(l)?l:[l]]));/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=(r,t)=>{const s=a.forwardRef(({className:o,...i},l)=>a.createElement(y,{ref:l,iconNode:t,className:d(`lucide-${j(c(r))}`,`lucide-${r}`,o),...i}));return s.displayName=c(r),s};/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["line",{x1:"4",x2:"20",y1:"12",y2:"12",key:"1e0a9i"}],["line",{x1:"4",x2:"20",y1:"6",y2:"6",key:"1owob3"}],["line",{x1:"4",x2:"20",y1:"18",y2:"18",key:"yk5zj1"}]],k=x("menu",v);/**
 * @license lucide-react v0.488.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],A=x("x",C),L=g.memo(()=>{const{auth:r}=b().props,[t,s]=a.useState(!1),o=()=>s(!t);return e.jsx("header",{className:"bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 shadow-lg sticky top-0 z-50",children:e.jsxs("div",{className:"container mx-auto px-4 py-4 flex justify-between items-center",children:[e.jsx(n,{href:route("landing.index"),className:"font-extrabold text-purple-800 drop-shadow-lg flex items-center space-x-2",children:e.jsx("span",{className:"text-lg md:text-2xl",children:" Abacoding"})}),!t&&e.jsx("button",{onClick:o,className:"md:hidden text-purple-800 focus:outline-none",children:e.jsx(k,{size:28})}),e.jsx("div",{className:`${t?"block":"hidden"} md:flex md:items-center md:w-auto md:space-x-6 mt-4 md:mt-0 w-full`,children:e.jsxs("nav",{className:"relative flex flex-col md:flex-row bg-white md:bg-transparent p-4 md:p-0 rounded-lg shadow-md md:shadow-none space-y-4 md:space-y-0 md:space-x-6 text-purple-800 font-medium text-lg",children:[e.jsx("button",{onClick:o,className:"absolute top-2 right-2 md:hidden text-purple-800",children:e.jsx(A,{size:24})}),e.jsx(n,{href:route("landing.index"),className:"hover:text-purple-600 transition",children:"Home"}),e.jsx(n,{href:route("programs.index"),className:"hover:text-purple-600 transition",children:"Programs"}),e.jsx(n,{href:route("about.index"),className:"hover:text-purple-600 transition",children:"About"}),e.jsx(n,{href:"",className:"hover:text-purple-600 transition",children:"News"}),e.jsx(n,{href:route("contact.index"),className:"hover:text-purple-600 transition",children:"Contact"}),r.user?e.jsx(n,{href:route("dashboard"),className:"hover:text-purple-600 transition",children:"Dashboard"}):e.jsx(e.Fragment,{children:e.jsx(n,{href:route("login"),className:"hover:text-purple-600 transition",children:"Log in"})})]})})]})})});export{L as N};
