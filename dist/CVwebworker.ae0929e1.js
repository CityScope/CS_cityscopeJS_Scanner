parcelRequire=function(e,r,n,t){var i="function"==typeof parcelRequire&&parcelRequire,o="function"==typeof require&&require;function u(n,t){if(!r[n]){if(!e[n]){var f="function"==typeof parcelRequire&&parcelRequire;if(!t&&f)return f(n,!0);if(i)return i(n,!0);if(o&&"string"==typeof n)return o(n);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[n][1][r]||r};var l=r[n]=new u.Module(n);e[n][0].call(l.exports,p,l,l.exports,this)}return r[n].exports;function p(e){return u(p.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=r,u.parent=i,u.register=function(r,n){e[r]=[function(e,r){r.exports=n},{}]};for(var f=0;f<n.length;f++)u(n[f]);if(n.length){var c=u(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):t&&(this[t]=c)}return u}({"z4V5":[function(require,module,exports) {
var e;function a(a){for(var s=[],t=[],n=[],r=0;r<a.length;r++)avg_0=.21*a[r][0]+.72*a[r][1]+.07*a[r][2],avg_1=.21*a[r][3]+.72*a[r][4]+.07*a[r][5],avg_2=.21*a[r][6]+.72*a[r][7]+.07*a[r][8],avg=(avg_0+avg_1+avg_2)/3,avg>133?pixelCol=0:avg<123?pixelCol=1:pixelCol=2,s.push(pixelCol);n.push(function(a){for(var n=0;n<s.length;n+=16){for(var r=[],i=0;i<16;i++)r.push(a[n+i]);r=r.join("");var l=e.objects.codes.indexOf(r);-1!==l||r.includes("2")||(l=o(r)),t.push(l)}return t}(s),s),self.postMessage(n)}function o(a){for(var o=-1,s=0;s<a.length;s+=4){var t=a.slice(s)+a.slice(0,s);if(-1!==(o=e.objects.codes.indexOf(t)))return o}return o}self.addEventListener("message",function(o){"pixels"==o.data[0]?a(o.data[1]):"cityIOsetup"===o.data[0]&&(e=o.data[1],console.log("webWorker got settings for "+e.header.name))},!1);
},{}]},{},["z4V5"], null)
//# sourceMappingURL=https://cityscope.media.mit.edu/CS_cityscopeJS/CVwebworker.ae0929e1.map