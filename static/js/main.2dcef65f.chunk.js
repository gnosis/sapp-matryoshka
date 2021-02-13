(this["webpackJsonpsapp-matryoshka"]=this["webpackJsonpsapp-matryoshka"]||[]).push([[0],{221:function(e,t,a){},274:function(e,t){},288:function(e,t,a){},321:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),c=a(24),s=a.n(c),o=(a(221),a(74)),u=a(5),i=a.n(u),l=a(73),b=a(59),p=a(26),d=a(116),f=a.n(d),j=a(191),x=(a(288),a(64)),h=a(130),v=a.n(h),O=a(22),m="0x2d8cE02dd1644A9238e08430CaeA15a609503140",w="0xc778417E063141139Fce010982780140Aa0cD5Ab",k=b.a.utils.parseEther("0.001"),g=["function approve(address _spender, uint256 _value) public returns (bool success)","function allowance(address _owner, address _spender) public view returns (uint256 remaining)","function balanceOf(address _owner) public view returns (uint256 balance)","event Approval(address indexed _owner, address indexed _spender, uint256 _value)"],y=new b.a.utils.Interface(g),C=function(){var e=Object(l.a)(i.a.mark((function e(t,a){var n,r,c,s;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n="https://safe-transaction.".concat(a,".gnosis.io/api/v1/safes/").concat(t,"/"),e.next=3,v.a.get(n);case 3:return r=e.sent,c="https://safe-transaction.".concat(a,".gnosis.io/api/v1/safes/").concat(t,"/multisig-transactions/?nonce=").concat(r.data.nonce),e.next=7,v.a.get(c);case 7:return s=e.sent,e.abrupt("return",{threshold:r.data.threshold,txs:s.data.results});case 9:case"end":return e.stop()}}),e)})));return function(t,a){return e.apply(this,arguments)}}(),T=function(e,t){console.log({safeTx:t});var a,n=new b.a.utils.Interface(["function execTransaction(address to, uint256 value, bytes data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, bytes signatures)"]).encodeFunctionData("execTransaction",[t.to,t.value,t.data||"0x",t.operation,t.safeTxGas,t.baseGas,t.gasPrice,t.gasToken,t.refundReceiver,(a=t.confirmations,a.sort((function(e,t){return e.owner.toLowerCase().localeCompare(t.owner.toLowerCase())})).reduce((function(e,t){return e+t.signature.slice(2)}),"0x"))]),r="0x"+n.slice(10);return{to:e,method:n.slice(0,10),methodData:r}},S=function(){var e=Object(d.useSafeAppsSDK)(),t=e.sdk,a=(e.connected,e.safe),r=Object(n.useCallback)(Object(l.a)(i.a.mark((function e(){return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.getSafeInfo();case 2:return e.abrupt("return",e.sent);case 3:case"end":return e.stop()}}),e)}))),[t]),c=Object(n.useState)(""),s=Object(o.a)(c,2),u=s[0],f=s[1],h=Object(n.useState)({capacity:p.a.from(0),level:p.a.from(0)}),S=Object(o.a)(h,2),A=S[0],E=S[1],F=Object(n.useState)(""),H=Object(o.a)(F,2),_=H[0],W=H[1],B=Object(n.useState)(-1),D=Object(o.a)(B,2),P=D[0],G=D[1],I=Object(n.useState)(1e9),L=Object(o.a)(I,2),M=L[0],z=L[1],N=Object(n.useState)(""),R=Object(o.a)(N,2),J=R[0],K=R[1],U=Object(n.useMemo)((function(){return new j.SafeAppsSdkProvider(a,t)}),[a,t]),Y=Object(n.useMemo)((function(){return new b.a.Contract(w,g,U)}),[U]),q=Object(n.useState)([]),Q=Object(o.a)(q,2),V=Q[0],X=Q[1],Z=Object(n.useCallback)(Object(l.a)(i.a.mark((function e(){var t,a,n,c,s;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,r();case 3:if(t=e.sent,f(t.safeAddress),"rinkeby"===(a=t.network.toLowerCase())){e.next=8;break}throw Error("Unsupported network ".concat(a));case 8:return e.next=10,C(t.safeAddress,a);case 10:n=e.sent,c=n.threshold,s=n.txs,X(s),z(c),e.next=20;break;case 17:e.prev=17,e.t0=e.catch(0),console.error(e.t0);case 20:case"end":return e.stop()}}),e,null,[[0,17]])}))),[r,U,X,z,f]),$=Object(n.useCallback)(Object(l.a)(i.a.mark((function e(){var t,a,n;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,r();case 3:return t=e.sent,e.next=6,Y.allowance(t.safeAddress,m);case 6:return a=e.sent,e.next=9,Y.balanceOf(t.safeAddress);case 9:n=e.sent,E({capacity:a,level:n}),e.next=16;break;case 13:e.prev=13,e.t0=e.catch(0),console.error(e.t0);case 16:case"end":return e.stop()}}),e,null,[[0,13]])}))),[r,U,Y,X,f]),ee=Object(n.useCallback)((function(){Z(),$()}),[Z,$]);Object(n.useEffect)((function(){ee()}),[ee]);var te=Object(n.useCallback)(function(){var e=Object(l.a)(i.a.mark((function e(a){var n;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,n=b.a.utils.parseEther(a),e.next=4,t.txs.send({txs:[{to:w,value:n.toString(),data:"0x"}]});case 4:e.next=9;break;case 6:e.prev=6,e.t0=e.catch(0),console.error(e.t0);case 9:case"end":return e.stop()}}),e,null,[[0,6]])})));return function(t){return e.apply(this,arguments)}}(),[t]),ae=Object(n.useCallback)(function(){var e=Object(l.a)(i.a.mark((function e(a){var n;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,n=b.a.utils.parseEther(a),e.next=4,t.txs.send({txs:[{to:w,value:"0",data:y.encodeFunctionData("approve",[m,n])}]});case 4:e.next=9;break;case 6:e.prev=6,e.t0=e.catch(0),console.error(e.t0);case 9:case"end":return e.stop()}}),e,null,[[0,6]])})));return function(t){return e.apply(this,arguments)}}(),[t]),ne=Object(n.useCallback)(function(){var e=Object(l.a)(i.a.mark((function e(t){var a,n,c;return i.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,G(t.nonce),e.next=4,r();case 4:return a=e.sent,n=T(a.safeAddress,t),"https://yacate-relay-rinkeby.herokuapp.com/v1/transactions/execute/generic",e.next=9,v.a.post("https://yacate-relay-rinkeby.herokuapp.com/v1/transactions/execute/generic",n);case 9:c=e.sent,console.log(c),e.next=17;break;case 13:e.prev=13,e.t0=e.catch(0),G(t.nonce-1),console.error(e.t0);case 17:case"end":return e.stop()}}),e,null,[[0,13]])})));return function(t){return e.apply(this,arguments)}}(),[r]),re=A.level.lte(A.capacity)?A.level:A.capacity;return Object(O.jsx)("div",{className:"App",children:Object(O.jsxs)("header",{className:"App-header",children:[Object(O.jsxs)("p",{children:["Next txs for ",u," ",Object(O.jsx)(x.Button,{size:"md",color:"primary",onClick:ee,children:"Reload"}),Object(O.jsx)("br",{}),Object(O.jsx)("br",{}),"You pay your transaction fees with WETH from your Safe. For that you need to set an allowance for ",m," for WETH (",w,"). At least 0.001 WETH for gas fees need to be available to use this Safe App!",Object(O.jsx)("br",{}),Object(O.jsx)("br",{}),"Max gas fees available: ",b.a.utils.formatEther(re)," WETH",Object(O.jsx)("br",{}),Object(O.jsx)("br",{}),Object(O.jsx)(x.TextField,{label:"Amount to wrap",value:_,onChange:function(e){return W(e.target.value)}}),Object(O.jsx)("br",{}),b.a.utils.formatEther(A.level)," WETH ",Object(O.jsx)(x.Button,{size:"md",color:"primary",onClick:function(){return te(_)},children:"Wrap Eth"}),Object(O.jsx)("br",{}),Object(O.jsx)(x.TextField,{label:"Max funds to allow for paying gas",value:J,onChange:function(e){return K(e.target.value)}}),Object(O.jsx)("br",{}),b.a.utils.formatEther(A.capacity)," WETH ",Object(O.jsx)(x.Button,{size:"md",color:"primary",onClick:function(){return ae(J)},children:"Set Gas Allowance"}),Object(O.jsx)("br",{})]}),V.map((function(e){return Object(O.jsxs)("div",{children:["Safe Tx Hash: ",e.safeTxHash,Object(O.jsx)("br",{}),"To: ",e.to,Object(O.jsx)("br",{}),"Nonce: ",e.nonce,Object(O.jsx)("br",{}),Object(O.jsx)(x.Button,{size:"md",color:"primary",onClick:function(){return ne(e)},disabled:M>e.confirmations.length||e.nonce<=P||re.lt(k),children:"Relay"}),Object(O.jsx)("hr",{})]})}))]})})},A=function(e){e&&e instanceof Function&&a.e(3).then(a.bind(null,383)).then((function(t){var a=t.getCLS,n=t.getFID,r=t.getFCP,c=t.getLCP,s=t.getTTFB;a(e),n(e),r(e),c(e),s(e)}))},E=a(148);s.a.render(Object(O.jsx)(r.a.StrictMode,{children:Object(O.jsx)(E.ThemeProvider,{theme:x.theme,children:Object(O.jsx)(f.a,{children:Object(O.jsx)(S,{})})})}),document.getElementById("root")),A()}},[[321,1,2]]]);
//# sourceMappingURL=main.2dcef65f.chunk.js.map