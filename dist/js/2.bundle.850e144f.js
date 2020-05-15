(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{113:function(e,t,s){"use strict";s.d(t,"a",(function(){return a})),s.d(t,"b",(function(){return n}));var a=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"live-container-student"},[a("div",{ref:"moveStar",staticClass:"move-star"},[a("img",{staticClass:"star",attrs:{src:s(163),alt:""}})]),e._v(" "),a("div",{directives:[{name:"show",rawName:"v-show",value:e.showAnimateStar,expression:"showAnimateStar"}],ref:"animateStar",staticClass:"animate-star"},[a("img",{staticClass:"star",attrs:{src:e.animateStarSrc,alt:""}})]),e._v(" "),a("div",{staticClass:"alert"},[e.alertVisible?a("a-alert",{attrs:{message:e.alertMessage,type:"success"}}):e._e()],1),e._v(" "),a("main",{ref:"main",staticClass:"clearFix"},[a("div",{ref:"mainLeft",staticClass:"main-left"},[a("div",{directives:[{name:"show",rawName:"v-show",value:"game"===e.mode,expression:"mode === 'game'"}],staticClass:"courseware-area"},[a("iframe",{ref:"iframe",attrs:{src:e.iframeSrc,name:"iframe",allow:"autoplay"}}),e._v(" "),a("iframe",{staticStyle:{display:"none"},attrs:{src:e.iframeSrcCache,allow:"autoplay"}})]),e._v(" "),a("div",{directives:[{name:"show",rawName:"v-show",value:"video"===e.mode,expression:"mode === 'video'"}],ref:"video-area",staticClass:"video-area"},[a("video",{ref:"video-play",attrs:{src:"",preload:"auto"},on:{ended:e.videoEnded}})]),e._v(" "),a("div",{ref:"drawArea",staticClass:"draw-area"},[a("div",{ref:"drawArea",class:{mouseStyle:"FREE_DRAWING"===e.shape},attrs:{id:"tui-image-editor"}})]),e._v(" "),a("div",{ref:"wrapper",staticClass:"wrapper"})]),e._v(" "),a("div",{staticClass:"main-right"},[a("div",{staticClass:"teacher-area"},[a("div",{staticClass:"classroom"},[a("button",{on:{click:e.leaveRoom}},[e._v("离开教室")]),e._v(" "),a("button",[e._v(e._s(e.className+"《"+e.coursewareName+"》"))])]),e._v(" "),a("TeacherVideo",{attrs:{rtcRoom:e.rtcRoom,teacherName:e.teacherName,peerIdList:e.peerIdList,role:"student",stream:e.streamObj[e.teacherId],teacherId:e.teacherId,teacherConnect:e.teacherConnect}})],1)]),e._v(" "),a("div",{staticClass:"main-bottom"},[a("div",{staticClass:"students-area"},e._l(e.studentList,(function(t){return a("StudentVideo",{key:t.uid,ref:t.uid,refInFor:!0,attrs:{id:t.uid,rtcRoom:e.rtcRoom,studentName:t.uname,stream:e.streamObj[t.uid],info:t,role:"student",studentId:e.studentId,roleInfo:e.roleInfoObj[t.uid]},on:{award:e.award,addStar:e.addStar}})})),1),e._v(" "),e._m(0)])])])},n=[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"placeholder"},[t("img",{attrs:{src:s(164),alt:""}})])}];a._withStripped=!0},220:function(e,t){},344:function(e,t,s){"use strict";s.r(t);var a=s(72),n=s.n(a);for(var o in a)"default"!==o&&function(e){s.d(t,e,(function(){return a[e]}))}(o);var r=s(113),i=s(9),d=!1;var c=function(e){d||s(220)},u=Object(i.a)(n.a,r.a,r.b,!1,c,null,null);u.options.__file="src\\views\\live\\LiveForStudent.vue",t.default=u.exports},72:function(e,t,s){Object.defineProperty(t,"__esModule",{value:!0});var a=f(s(57)),n=f(s(82)),o=f(s(44)),r=f(s(45)),i=f(s(8));s(83),s(133);var d=f(s(134)),c=f(s(135)),u=f(s(92)),l=f(s(149)),m=f(s(150));function f(e){return e&&e.__esModule?e:{default:e}}var v=s(151),h=i.default.createFromIconfontCN({scriptUrl:"//at.alicdn.com/t/font_1543360_6pq73ac4jna.js"}),p={"menu.normalIcon.path":"/svg/icon-d.svg","menu.activeIcon.path":"/svg/icon-b.svg","menu.disabledIcon.path":"/svg/icon-a.svg","menu.hoverIcon.path":"/svg/icon-c.svg","submenu.normalIcon.path":"/svg/icon-d.svg","submenu.activeIcon.path":"/svg/icon-b.svg"};t.default={name:"Live",data:function(){return{mode:"game",firstLoad:!0,didMounted:!1,didJoinedRoom:!1,alertVisible:!1,alertMessage:"",showAnimateStar:!1,animateStarSrc:c.default,startStarAnimate:!1,role:"2",coursewareResource:[],gameListIndex:[],gameIndex:0,resourceIndex:0,iframeSrc:"",iframeSrcCache:"",coursewareName:"",progress:0,imageEditor:null,shape:"NORMAL",strokeWidth:6,strokeColor:"#ff0000",lineIdObj:{},rtcRoom:null,peerIdList:[],roleInfoObj:{},studentNameObj:{},teacherId:"",studentId:"",studentList:[],studentIdIndexObj:{},studentIdList:[],className:"",roomId:"",teacherName:"",teacherConnect:!1,streamObj:{},operating:!1}},components:{IconFont:h,TeacherVideo:l.default,StudentVideo:m.default},computed:{stageStatus:function(){return this.$store.state.liveBroadcast.stageStatusSortByStage}},watch:{stageStatus:function(e){var t=e.length;if(1===t){var s=document.querySelector("#studentVideo"+e[0]),a=this.studentIdIndexObj[e[0]];s.classList.add("oneStudentOnStage"),s.classList.remove("moreStudentOnStage"),s.style.left=(-513*a+113)/100+"rem",s.style.top="-8rem"}else t>1&&e.forEach((function(e){document.querySelector("#studentVideo"+e).classList.add("moreStudentOnStage")}));if(2===t){var n=document.querySelector("#studentVideo"+e[0]),o=document.querySelector("#studentVideo"+e[1]),r=this.studentIdIndexObj[e[0]],i=this.studentIdIndexObj[e[1]];n.style.left=(-513*r+115)/100+"rem",o.style.top=n.style.top="-6.04rem",o.style.left=(-513*i+635)/100+"rem"}if(3===t){var d=document.querySelector("#studentVideo"+e[0]),c=document.querySelector("#studentVideo"+e[1]),u=document.querySelector("#studentVideo"+e[2]),l=this.studentIdIndexObj[e[0]],m=this.studentIdIndexObj[e[1]],f=this.studentIdIndexObj[e[2]];d.style.left=(-513*l+375)/100+"rem",d.style.top="-7.99rem",c.style.top=u.style.top="-4.09rem",c.style.left=(-513*m+115)/100+"rem",u.style.left=(-513*f+635)/100+"rem"}if(4===t){var v=document.querySelector("#studentVideo"+e[0]),h=document.querySelector("#studentVideo"+e[1]),p=document.querySelector("#studentVideo"+e[2]),g=document.querySelector("#studentVideo"+e[3]),I=this.studentIdIndexObj[e[0]],S=this.studentIdIndexObj[e[1]],w=this.studentIdIndexObj[e[2]],y=this.studentIdIndexObj[e[3]];v.style.left=(-513*I+115)/100+"rem",h.style.left=(-513*S+635)/100+"rem",p.style.left=(-513*w+115)/100+"rem",g.style.left=(-513*y+635)/100+"rem",v.style.top=h.style.top="-7.99rem",p.style.top=g.style.top="-4.09rem"}}},created:function(){this.init()},mounted:function(){this.didMounted=!0,this.initDrawingBoard(),this.stopMouseEventPropagation(),this.didJoinedRoom&&this.getMessage()},methods:{init:function(){var e=this;return(0,r.default)(o.default.mark((function t(){return o.default.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e.$store.commit("readLiveBroadcastDataFromLocalStorage"),e.resize(),t.next=4,e.queryClassInfo();case 4:e.initRtcRoom(),e.getCoursewareInfo(e.$route.params.coursewareId);case 6:case"end":return t.stop()}}),t,e)})))()},resize:function(){var e=this,t=window.innerWidth;document.documentElement.style.fontSize=t/2213*100+"px",this.strokeWidth=parseInt(t/2213*6),window.onresize=function(){var t=window.innerWidth;e.strokeWidth=parseInt(t/2213*6),document.documentElement.style.fontSize=t/2213*100+"px",e.imageEditor.resizeCanvasDimension({width:t/2213*1271,height:t/2213*783})}},initRtcRoom:function(){var e=this,t=u.default.getInstance(),s=this.$route.params.roomId,a=this.role=this.$route.params.role,o=this.$route.params.studentId,r={name:this.$route.params.name,headUrl:"",role:a};this.studentId=o,this.roomId=s;var i=this.teacherId=this.$route.params.teacherId;this.className=this.$route.params.classname,t.on("message-notify-receive",(function(t,s){if(console.log(s),"live_sync"===s.event){var a=s.data;e.resourceIndex=a.sync.page,e.changeAnimate(!0);var n=a.isAllOperate,o=a.operateId;n?(e.setAlert({visiable:!0,message:"你可以操作游戏了"}),e.setPointerEvents(!0)):a.isSingleOperate&&(o===e.studentId?(e.operating=!0,e.setPointerEvents(!0),e.setAlert({visiable:!0,message:"你可以操作游戏了"})):(e.operating=!1,e.setAlert({visiable:!0,message:"学生 "+e.studentNameObj[o]+" 正在操作游戏"})));var r=a.singleVideoArr;e.$nextTick((function(){var e=this;r&&r.forEach((function(t){var s=t,a=document.querySelector("#studentVideo"+s).parentElement;e.$store.commit("setStageStatus",{id:s,status:1}),a.classList.add("onStage")}))}));var i=a.sync.isplay,d=a.sync.value?a.sync.value:0,c=e.$refs["video-play"];c.oncanplay=function(){c.oncanplay=null,c.currentTime=d*c.duration,i&&(c.play(),e.controlAudio(!1))}}})),t.joinRoom("www.9mankid.com",3210,s,o,r),this.rtcRoom=t,this.didJoinedRoom=!0,this.didMounted&&this.getMessage(),t.on("user-joined",(function(s){console.log("用户进入："+s),void 0===e.studentIdIndexObj[s]&&s!==i||(e.$set(e.streamObj,s,null),s===o&&(t.getAllRoomUser().forEach((function(t){var s=t._peerId;s!==i&&e.peerIdList.push(s)})),t.requestRoomInfo("user_sort",{}),t.requestRoomInfo("ai_role_info",{}),t.requestRoomInfo("room_config",{manager:i}),e.$set(e.studentList[e.studentIdIndexObj[s]],"joinRoom",!0),e.$set(e.studentList[e.studentIdIndexObj[s]],"isconnect",!0)),e.peerIdList.includes(s)||s===i||e.peerIdList.push(s))})),t.on("user-peer-connected",(function(s){if(console.log("用户连接："+s),void 0!==e.studentIdIndexObj[s]||s===i)if(s!==e.teacherId){t.requestRoomInfo("user_sort",{});var a=document.querySelector("#studentVideo"+s).parentElement;e.$set(e.studentList[e.studentIdIndexObj[s]],"joinRoom",!0),e.$set(e.studentList[e.studentIdIndexObj[s]],"isconnect",!0),a.classList.contains("onStage")&&e.$nextTick((function(){a.classList.add("onStage")}))}else e.teacherConnect=!0})),t.on("user-leaved",(function(s){if(console.log("用户离开："+s,e.peerIdList.indexOf(s)),void 0!==e.studentIdIndexObj[s]||s===i){var a=e.peerIdList.indexOf(s);if(-1!==a)e.$set(e.studentList[e.studentIdIndexObj[s]],"isconnect",!1),e.peerIdList.splice(a,1),e.$store.commit("setPeerIdList",e.peerIdList),e.$store.commit("resetStatus",s),document.querySelector("#studentVideo"+s).style="";else e.teacherConnect=!1,t.changeAISyncStatus(1),t.changeAIControl(s),e.operating&&(e.$message.warning("你不能再操作游戏了",5),e.operating=!1),e.setPointerEvents(!1),e.setAlert({visiable:!1,message:""}),e.studentList.forEach((function(e){if(e.isconnect){var t=e.uid,s=document.querySelector("#studentVideo"+t).parentElement;s.classList.contains("onStage")&&(s.classList.remove("onStage"),s.children[0].style.top="",s.children[0].style.left="")}})),e.$store.commit("setStageStatusSortByStage",[]),e.$refs["video-play"].pause(),e.controlAudio(!0)}})),t.on("media-receive",(function(t,s){e.$set(e.streamObj,t,s)})),t.on("ai-action-notify",(function(t,s){var a=s.data,n=s.event;"ai_role"===n?a.available&&e.$set(e.roleInfoObj,a.peerId,{src:a.midpath+a.path}):"ai_role_clear"===n&&(e.roleInfoObj={})})),t.on("room-info-notify",(function(t,s){if(console.log(t,s),"user_sort"===t){var a=s.list;if((0,n.default)(e.studentIdList)===(0,n.default)(a))return;var o={},r={},i=[];e.studentList.forEach((function(e,t){r[e.uid]=t}));for(var d=0;d<a.length;d++){var c=a[d];void 0!==r[c]?(o[c]=d,i[d]=e.studentList[r[c]],delete r[c]):(a.splice(d,1),d--)}var u=a.length;if(u<e.studentList.length)for(var l in r)i[u]=e.studentList[r[l]],o[l]=u,u++;e.studentIdList=a,e.$store.commit("setStudentIdList",a),e.studentList=i,e.studentIdIndexObj=o}else if("ai_role_info"===t){var m=s.list,f={};m.forEach((function(e){var t=e.midpath+e.path;f[e.peerId]={src:t}})),e.roleInfoObj=f}})),window.onbeforeunload=function(){t.leaveRoom()}},leaveRoom:function(){var e=this.rtcRoom;this.$confirm({title:"确定要退出房间吗?",content:"",centered:!0,onOk:function(){e.leaveRoom(),localStorage.removeItem("9manLiveBroadcast"),window.close()},onCancel:function(){}})},getCoursewareInfo:function(e){var t=this,s={courseware_no:e};this.$axios.get(this.$store.state.apiUrl+"/v1/courseware/queryCoursewareDetail",{params:s}).then((function(e){var s=e.data;if(200===s.code){t.coursewareName=s.data.data.name,t.coursewareResource=s.data.data.courseware_resource;var a=[];t.coursewareResource.forEach((function(e,t){2===e.type&&a.push(t)})),t.gameListIndex=a,t.changeAnimate(!0)}})).catch((function(e){console.log(e)}))},queryClassInfo:function(){var e=this,t={id:this.$route.params.classId};return this.$axios.get(this.$store.state.apiUrl+"/v1/classRoom/queryClassRoomInfo",{params:t}).then((function(t){var s=t.data;if(200===s.code){var a=s.data.data.student_list,n=s.data.data.history_list,o={},r=e.$store.state.liveBroadcast.liveBroadcastData.studentIdList;n.forEach((function(e){o[e.uid]=e})),a.forEach((function(t,s){e.studentNameObj[t.uid]=t.uname,e.studentIdIndexObj[t.uid]=s,t.star=o[t.uid].star?o[t.uid].star:0,r.includes(t.uid)?t.joinRoom=!0:t.joinRoom=!1,t.isconnect=!1})),e.studentList=a,e.teacherName=s.data.data.teacher_name}})).catch((function(){}))},initDrawingBoard:function(){var e=this.$refs.mainLeft,t=e.offsetWidth,s=e.offsetHeight,a=new v(document.querySelector("#tui-image-editor"),{includeUI:{loadImage:{path:d.default,name:"SampleImage"},theme:p,initMenu:"filter",menuBarPosition:"bottom"},cssMaxWidth:t,cssMaxHeight:s,selectionStyle:{cornerSize:0,rotatingPointOffset:0,borderColor:"#000"}});this.imageEditor=a},stopMouseEventPropagation:function(){var e=document.querySelector(".live-container-student");e.onmousedown=function(e){e.stopPropagation()},e.onmousemove=function(e){e.stopPropagation()},e.onmouseup=function(e){e.stopPropagation()}},sendEventToIframe:function(){var e=this.$refs.wrapper,t=this.$refs.iframe,s=this;e.onmousedown=function(e){if("game"===s.mode){var a=t.contentWindow.document.querySelector("#gameCanvas"),n={screenX:e.screenX,screenY:e.screenY,clientX:e.layerX,clientY:e.layerY},o=document.createEvent("MouseEvents");o.initMouseEvent("mousedown",!0,!0,document.defaultView,0,n.screenX,n.screenY,n.clientX,n.clientY,!1,!1,!1,!1,0,null),a.dispatchEvent(o),document.onmousemove=function(e){var t={screenX:e.screenX,screenY:e.screenY,clientX:e.layerX,clientY:e.layerY};o.initMouseEvent("mousemove",!0,!0,document.defaultView,0,t.screenX,t.screenY,t.clientX,t.clientY,!1,!1,!1,!1,0,null),a.dispatchEvent(o)},document.onmouseup=function(e){var t={screenX:e.screenX,screenY:e.screenY,clientX:e.layerX,clientY:e.layerY};o.initMouseEvent("mouseup",!0,!0,document.defaultView,0,t.screenX,t.screenY,t.clientX,t.clientY,!1,!1,!1,!1,0,null),a.dispatchEvent(o),document.onmousemove=null,document.onmouseup=null}}}},setPointerEvents:function(e){if("4"!==this.role){var t=this.$refs.drawArea,s=this.$refs.wrapper;e?(t.style.pointerEvents="none",s.style.pointerEvents="none"):(t.style.pointerEvents="auto",s.style.pointerEvents="auto")}},drawByShape:function(){"FREE_DRAWING"===this.shape&&this.drawCurve()},drawCurve:function(){this.imageEditor.startDrawingMode("FREE_DRAWING",{width:this.strokeWidth,color:this.strokeColor})},stopDrawing:function(){var e=this.imageEditor;e.stopDrawingMode(),e.changeCursor("default")},eraser:function(){var e=this.imageEditor;"NORMAL"!==this.shape&&this.stopDrawing(),e.removeActiveObject()},clearAll:function(){var e=this.imageEditor;e.clearObjects(),e._graphics._canvas.deactivateAll(),e._graphics._canvas.renderAll()},changeDrawStatus:function(e){this.shape=e,"FREE_DRAWING"===e?this.drawByShape():"NORMAL"===e?this.stopDrawing():"DELETE"===e&&this.eraser()},setAlert:function(e){this.alertVisible=e.visiable,this.alertMessage=e.message},videoEnded:function(e){e.target.currentTime=0,this.controlAudio(!0)},changeAnimate:function(){var e=this,t=this.coursewareResource[this.resourceIndex],s=t.type,a=t.url,n=this.$store.state.resourceUrl;this.gameCache();var o=this.$refs["video-play"];o.pause(),this.controlAudio(!0),1===s?(this.mode="video",o.src=n+"/"+a,this.clearAll(),o.oncanplay=function(){o.oncanplay=null,o.currentTime=e.progress*o.duration}):2===s&&(this.mode="game",this.iframeSrc=n+"/"+a+"&roomId="+this.roomId+"&peerId="+this.studentId,this.clearAll())},gameCache:function(){var e=this.$store.state.resourceUrl,t=this.resourceIndex,s=this.gameListIndex,a=this.gameIndex=this.searchInsert(s,t),n=s[a],o=s[a+1];n===t?o&&(this.iframeSrcCache=e+"/"+this.coursewareResource[o].url.replace("start","load")+"&roomId="+this.roomId+"&peerId="+this.teacherId+"&manager=1"):this.iframeSrcCache=e+"/"+this.coursewareResource[n].url.replace("start","load")+"&roomId="+this.roomId+"&peerId="+this.teacherId+"&manager=1"},searchInsert:function(e,t){var s=e.length-1,a=0;if(t>e[s])return 0;if(t<=e[a])return 0;for(;a<=s;){var n=Math.floor((a+s)/2);if(n===a)return a+1;if(t>e[n])a=n;else{if(!(t<e[n]))return n;s=n}}},controlAudio:function(e){try{e?this.rtcRoom.openAudio(this.studentId):this.rtcRoom.closeAudio(this.studentId)}catch(e){console.log(e)}},award:function(){var e=this;if(!this.startStarAnimate){this.startStarAnimate=!0;var t=document.querySelector("#studentVideo"+this.studentId+" .star img"),s=window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0,a=t.getBoundingClientRect(),n=a.height,o=a.width,r=a.bottom,i=a.right-o/2,d=r-n/2,u=this.$refs.moveStar,l=this;u.classList.add("move"),u.classList.remove("scale"),setTimeout((function(){l.animateStarSrc=c.default,e.showAnimateStar=!0}),500),setTimeout((function(){e.showAnimateStar=!1,e.animateStarSrc="",u.style.left=i+"px",u.style.bottom=document.querySelector(".live-container-student").offsetHeight-d-s+"px",u.style.transform="translate(-50%, 50%) scale(0) rotate(3600deg)",u.addEventListener("transitionend",m)}),2e3)}function m(){u.removeEventListener("transitionend",m),u.classList.remove("move"),u.classList.add("scale"),l.addStar({id:l.studentId}),setTimeout((function(){l.startStarAnimate=!1,u.style.left="",u.style.bottom="",u.style.transform=""}),300)}},addStar:function(e){var t=e.id,s=this.studentList[this.studentIdIndexObj[t]].star+1;this.$set(this.studentList[this.studentIdIndexObj[t]],"star",s)},getMessage:function(){var e=this,t=document.querySelector(".upper-canvas"),s=document.querySelector("#tui-image-editor"),n=this.$refs.main,o=this.$refs["video-play"],r=this.lineIdObj,i=document.createEvent("MouseEvents"),d=null,c=0,u=[];this.rtcRoom.on("message-receive",(function(l){var m=l.event,f=l.data;switch(console.log(l),m){case"show_content_change":e.resourceIndex=f.sync.page,e.progress=f.sync.value,e.changeAnimate();break;case"media_controll":f.isplay?(o.play(),e.controlAudio(!1)):(o.pause(),e.controlAudio(!0));break;case"player_seek_to_value":var v=f.value;o.currentTime=v*o.duration;break;case"add_line":d=f.pointlist,e.drawCurve();var h=n.getBoundingClientRect(),p=h.left,g=h.top;if(r[f.lineId])for(;c<d.length;c++){var I=e.getDrawBoardSize(f,s);i.initMouseEvent("mousemove",!0,!0,document.defaultView,0,0,0,d[c][0]*I.canvasScale-I.scrollLeft+p,d[c][1]*I.canvasScale-I.scrollTop+g,!1,!1,!1,!1,0,null),document.dispatchEvent(i)}else{var S=e.getDrawBoardSize(f,s);i.initMouseEvent("mousedown",!0,!0,document.defaultView,0,0,0,d[c][0]*S.canvasScale-S.scrollLeft+p,d[c][1]*S.canvasScale-S.scrollTop+g,!1,!1,!1,!1,0,null),t.dispatchEvent(i),r[f.lineId]=!0,c++,e.drawCurve()}if(f.finished){c--;var w=e.getDrawBoardSize(f,s);i.initMouseEvent("mouseup",!0,!0,document.defaultView,0,0,0,d[c][0]*w.canvasScale-w.scrollLeft+p,d[c][1]*w.canvasScale-w.scrollTop+g,!1,!1,!1,!1,0,null),document.dispatchEvent(i),c=0;var y=e.imageEditor._graphics._objects,b=(0,a.default)(y);r[f.lineId]=parseInt(b[b.length-1]),e.imageEditor.stopDrawingMode(),e.drawCurve()}break;case"select_line":e.stopDrawing();var E=e.getDrawBoardSize(f,s),_=f.startPoint;i.initMouseEvent(f.action,!0,!0,document.defaultView,0,0,0,_[0]*E.canvasScale-E.scrollLeft,_[1]*E.canvasScale-E.scrollTop,!1,!1,!1,!1,0,null),"mousedown"===f.action?t.dispatchEvent(i):document.dispatchEvent(i);break;case"delete_line":if("web"===f.source)e.imageEditor.removeActiveObject();else{var L=u.length,O=0;!function t(){O<L&&e.imageEditor.removeObject(r[u[O]]).then((function(){O++,t()}))}()}break;case"delete_line_choose_add":if("web"!==f.source){u=f.lineIds;var A=e.imageEditor._graphics._objects;e.imageEditor._graphics.setActiveObject(A[r[u[0]]])}break;case"delete_line_choose_cancel":"web"!==f.source&&(e.imageEditor._graphics._canvas.deactivateAll(),e.imageEditor._graphics._canvas.renderAll());break;case"single_operations":var j=f.peerId;if(!j){e.operating&&(e.$message.warning("你不能再操作游戏了",5),e.operating=!1),e.setPointerEvents(!1),e.setAlert({visiable:!1,message:""});break}j===e.studentId?(e.operating=!0,e.setPointerEvents(!0),e.setAlert({visiable:!0,message:"你可以操作游戏了"})):(e.operating=!1,e.setPointerEvents(!1),e.setAlert({visiable:!0,message:"学生 "+e.studentNameObj[j]+" 正在操作游戏"}));break;case"all_operations":var $=f.operations;if(e.operating=$,$)e.setAlert({visiable:!0,message:"你可以操作游戏了"}),e.setPointerEvents(!0);else e.$refs.iframe.src=e.iframeSrc,e.operating=!1,e.setPointerEvents(!1),e.setAlert({visiable:!1,message:""}),e.$message.warning("你不能再操作游戏了",5);break;case"single_video":var x=f.peerId,R=f.appear,C=document.querySelector("#studentVideo"+x).parentElement;e.$store.commit("setStageStatus",{id:x,status:R?1:2}),R?C.classList.add("onStage"):(C.classList.remove("onStage"),C.children[0].style.top="",C.children[0].style.left="");break;case"all_video":var q=f.video;e.studentList.forEach((function(e){if(e.isconnect){var t=e.uid,s=document.querySelector("#studentVideo"+t).parentElement;q?s.classList.add("onStage"):(s.classList.remove("onStage"),s.children[0].style.top="",s.children[0].style.left="")}})),q?e.$store.commit("setStageStatusSortByStage",e.peerIdList):e.$store.commit("setStageStatusSortByStage",[]);break;case"single_award":f.peerId===e.studentId?e.award():e.$refs[f.peerId][0].starAnimate();break;case"all_award":e.peerIdList.forEach((function(t){t===e.studentId?e.award():e.$refs[t][0].starAnimate()}))}}))},getDrawBoardSize:function(e,t){return{scrollLeft:window.pageXOffset||document.documentElement.scrollLeft||document.body.scrollLeft||0,scrollTop:window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0,canvasScale:t.offsetWidth/e.hbsize[0]}}}}}}]);