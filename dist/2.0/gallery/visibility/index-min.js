KISSY.add("brix/gallery/visibility/index",function(e,t){function i(){var t=this;e.one(/blur$/.test(o)?window:document).on(o,function(e){var i=e.type,a=e.originalEvent,r=a.toElement;if(!/^focus./.test(i)||void 0==r&&void 0==a.fromElement&&void 0==a.relatedTarget){var o=/^(?:blur|focusout)$/.test(i);s||(o?(document.hidden=!0,document.visibilityState="hidden"):(document.hidden=!1,document.visibilityState="visible")),t.fire(n&&document[n]||o?"hidden":"visible")}})}for(var a,n,r,s,o=("onfocusin"in document&&"hasFocus"in document?"focusin focusout":"focus blur"),l=["o","ms","moz","webkit",""];void 0!=(a=l.pop());)if(n=(a?a+"H":"h")+"idden",s="boolean"==typeof document[n]){r=(a?a+"V":"v")+"isibilityState",o=a+"visibilitychange";break}return s||(document.hidden=!1,document.visibilityState="visible",n="hidden",r="visibilityState"),i.isSupported=s,i.hidden=function(){return document[n]},i.visibilityState=function(){return document[r]},e.extend(i,t),i},{requires:["base","node"]});