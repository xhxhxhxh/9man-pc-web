<template>
    <div class="users-container">
        <div class="avatar">
            <main>
                <img :src="$store.getters.userInfo | normalUrlEncode" alt="" class="user-avatar" title="修改头像" @click="changingAvatar = true">
                <div class="info">
                    <h1>{{$store.getters.username | normalUrlEncode}}</h1>
                    <div class="star">
                        <img src="./images/star.png" alt="">
                        <p>6</p>
                    </div>
                    <div class="medal">
                        <img src="./images/medal.png" alt="">
                        <p>8</p>
                    </div>
                </div>
            </main>
        </div>
        <div class="userInfo">
            <header>
                <span @click="mode = 0" :class="{selected: mode === 0}">基本信息</span>
                <span @click="mode = 1" :class="{selected: mode === 1}">安全信息</span>
            </header>
            <main v-show="mode === 0">
                <p class="name">
                    <span class="title">名称：</span>
                    <a-input :defaultValue="$store.getters.username | normalUrlEncode" v-if="isModifyingName" v-focus ref="username"/>
                    <span class="content" v-else>{{$store.getters.username | normalUrlEncode}}</span>
                </p>
                <p class="age">
                    <span class="title">年龄：</span>
                    <span class="content">22</span>
                </p>
                <p class="education">
                    <span class="title">学历：</span>
                    <span class="content">本科</span>
                </p>
                <a-button type="primary" class="modify" @click="isModifyingName = true" v-if="!isModifyingName">修改</a-button>
                <a-button type="primary" class="modify" @click="modifyUsername" v-else>保存</a-button>
            </main>
            <main v-show="mode === 1">
                <p class="telephone">
                    <span class="title">手机号：</span>
                    <span class="content">{{telephone}}</span>
                </p>
                <a-button type="primary" class="modifyPassword" @click="$router.push('/resetPassword')">修改密码</a-button>
            </main>
        </div>
        <a-modal
                title="上传头像"
                v-model="changingAvatar"
                @ok="uploadAvatar"
                okText="确定"
                cancelText="取消"
                class="changeAvatar"
                :maskClosable="maskClosable"
        >
            <div class="left" style="width: 310px; float: left;">
                <div class="left-box">
                    <div class="avatar_big" :style="{backgroundImage: `url(${cacheAvatar})`, transform: `scale(${scale / 100}) rotate(${rotate}deg)`,
                     backgroundPosition: -positionX + 'px' + ' ' + -positionY + 'px'}"
                         ref="avatarBig"></div>
                    <div class="selectedArea">
                        <div class="circle">
                            <div :style="{backgroundImage: `url(${cacheAvatar})`, transform: `scale(${scale / 100}) rotate(${rotate}deg)`,
                            backgroundPosition: -positionX + 'px' + ' ' + -positionY + 'px'}" @mousedown="moveAvatar"></div>
                        </div>
                    </div>
                </div>
                <div class="operate clearfix">
                    <div class="upload-avatar">
                        <span>上传头像</span>
                        <input type="file" @change="changeAvatar" accept="image/jpeg, image/jpg, image/png">
                    </div>
                    <div>
                        <img src="./images/reduce.png" alt="" @click="scaleAvatar(false)">
                        <img src="./images/increase.png" alt="" @click="scaleAvatar()">
                        <img src="./images/rotate.png" alt="" @click="rotateAvatar()">
                    </div>
                </div>
            </div>
            <div class="right" style="width: 100px; float: left; margin-left: 30px">
                <div class="avatar_small">
                    <div :style="{backgroundImage: `url(${cacheAvatar})`, transform: `scale(${scale / 100}) rotate(${rotate}deg)`,
                            backgroundPosition: -positionX / 3.1 + 'px' + ' ' + -positionY / 3.1 + 'px'}"></div>
                </div>
                <p>头像预览</p>
<!--                <img :src="newImage" alt="" ref="cutAvatar" width="100" height="100" style="object-fit: cover">-->
                <canvas :width="imgWidth" :height="imgHeight" style="display: none"></canvas>
            </div>
        </a-modal>
    </div>
</template>

<script>
    import common from '@/api/common';
    export default {
        name: "Users",
        data () {
            const userInfo = common.getLocalStorage('userInfo');
            return {
                id: common.getLocalStorage('id'),
                rootUrl: this.$store.state.rootUrl,
                telephone: userInfo.phone,
                mode: 0, //0 基本信息 1 安全信息
                isModifyingName: false,
                changingAvatar: false, //修改头像
                cacheAvatar: '',
                scale: 100, //图片缩放倍数
                rotate: 0,  //旋转度数
                baseSize: 310,
                imgWidth: '',
                imgHeight: '',
                multiple: 1 , // 背景图cover倍数
                positionX: 0,
                positionY: 0,
                maskClosable: false,
                newImage: '',
                loadingAvatar: false, //加载头像中
                uploadedAvatar: false, //已经上传了图片
                avatarSrc: '' // 新头像地址

            }
        },
        created () {
            this.cacheAvatarUrlEncode();
            this.getImgInfo();
        },
        methods: {
            // 缩放头像
            scaleAvatar (direction = true) {
                this.uploadedAvatar = true;
                if (direction) {
                    // direction为true时放大
                    this.scale >= 200? this.scale = 200: this.scale += 10
                } else {
                    this.scale <= 100? this.scale = 100: this.scale -= 10;
                    this.afterReduceAvatar()
                }
            },

            // 旋转头像
            rotateAvatar () {
                this.uploadedAvatar = true;
                this.rotate += 90;
                if (this.rotate === 360) {
                    this.rotate = 0
                }
            },

            //获取图片宽高
            getImgInfo () {
                const image = new Image();
                const _this = this;
                let [imgWidth, imgHeight] = [0, 0];
                image.onload = function () {
                    _this.imgWidth = imgWidth = this.width;
                    _this.imgHeight = imgHeight = this.height;
                    //计算cover倍数
                    const rectSize = 310; // 头像区域宽度
                    const multipleX = parseFloat((rectSize / imgWidth).toFixed(3));
                    const multipleY = parseFloat((rectSize / imgHeight).toFixed(3));
                    if (multipleX >= multipleY) {
                        _this.multiple = multipleX;
                        _this.positionY = imgHeight / 2 * multipleX - rectSize / 2;
                        _this.positionX = 0;
                    } else {
                        _this.multiple = multipleY;
                        _this.positionX = imgWidth / 2 * multipleY - rectSize / 2;
                        _this.positionY = 0;
                    }
                };
                image.src = this.cacheAvatar;
            },

            // 移动头像
            moveAvatar (e) {
                //取消点击
                e.preventDefault();
                const _this = this;
                const rectSize = 310; // 头像区域宽度
                const scale = this.scale / 100;
                const rotate = this.rotate;
                const quotientRotate = rotate / 90;
                let [maxDistanceLeftX, maxDistanceRightX, maxDistanceTopY, maxDistanceBottomY, endX, endY, moveDistanceX, moveDistanceY] = [0, 0, 0, 0, 0, 0, 0, 0];
                let [startX, startY, startPositionX, startPositionY] = [e.clientX, e.clientY, this.positionX, this.positionY];
                const [currentImgWidth, currentImgHeight] = [this.imgWidth * this.multiple, this.imgHeight * this.multiple];
                const offset = (rectSize - rectSize / scale) / 2; // 放大后的偏移
                maxDistanceLeftX = this.positionX + offset;
                maxDistanceRightX = currentImgWidth - maxDistanceLeftX - rectSize / scale;
                maxDistanceTopY = this.positionY + offset;
                maxDistanceBottomY = currentImgHeight - maxDistanceTopY - rectSize / scale;


                document.onmousemove = function (event) {
                    endX = event.clientX;
                    endY = event.clientY;
                    moveDistanceX = (startX - endX) / scale; // 左移为正
                    moveDistanceY = (startY - endY) / scale; // 上移为正

                    // 判断旋转
                    if (quotientRotate === 1 ) { // 旋转90度
                        [moveDistanceX, moveDistanceY] = [moveDistanceY, -moveDistanceX]
                    }else if (quotientRotate === 2) {// 旋转180度
                        [moveDistanceX, moveDistanceY] = [-moveDistanceX, -moveDistanceY]
                    }else if (quotientRotate === 3) {// 旋转270度
                        [moveDistanceX, moveDistanceY] = [-moveDistanceY, moveDistanceX]
                    }
                    if (moveDistanceX >= 0) {
                        moveDistanceX <= maxDistanceRightX? _this.positionX = startPositionX + moveDistanceX: _this.positionX = currentImgWidth - rectSize * (1 + scale) / (2 * scale)
                    } else {
                        -moveDistanceX <= maxDistanceLeftX? _this.positionX = startPositionX + moveDistanceX: _this.positionX = - offset
                    }
                    if (moveDistanceY >= 0) {
                        moveDistanceY <= maxDistanceBottomY? _this.positionY = startPositionY + moveDistanceY: _this.positionY = currentImgHeight - rectSize * (1 + scale) / (2 * scale)

                    } else {
                        -moveDistanceY <= maxDistanceTopY? _this.positionY = startPositionY + moveDistanceY: _this.positionY = - offset
                    }
                };
                document.onmouseup = function () {
                    document.onmousemove = null;
                    startX = endX;
                    startY = endY;
                }
            },

            // 缩小头像偏移
            afterReduceAvatar () {
                const rectSize = 310; // 头像区域宽度
                const scale = this.scale / 100;
                const [currentImgWidth, currentImgHeight] = [this.imgWidth * this.multiple, this.imgHeight * this.multiple];
                const minPosition = (rectSize - rectSize / scale) / 2;
                const maxPositionX = currentImgWidth - rectSize * (1 + scale) / (2 * scale);
                const maxPositionY = currentImgHeight - rectSize * (1 + scale) / (2 * scale);
                if (this.positionX <= - minPosition) {
                    this.positionX = - minPosition
                }
                if (this.positionX >= maxPositionX) {
                    this.positionX = maxPositionX
                }
                if (this.positionY <= - minPosition) {
                    this.positionY = - minPosition
                }
                if (this.positionY >= maxPositionY) {
                    this.positionY = maxPositionY
                }
            },

            //头像截取
            cutAvatar () {
                return new Promise((resolve,reject) => {
                    if (this.loadingAvatar) {
                        this.$message.warning('头像加载失败，请稍后再试！',3);
                        reject();
                        return;
                    }
                    if (!this.uploadedAvatar) {
                        this.changingAvatar = false; // 处理没有上传头像时点击确定的情况
                        reject();
                        return;
                    }
                    const _this = this;
                    const rotate = this.rotate;
                    const scale = this.scale / 100;
                    const multiple = this.multiple;
                    const rectSize = 310 / multiple; // 头像区域宽度
                    const rectSizeScale = rectSize / scale;
                    const offset = (rectSize - rectSizeScale) / 2;
                    let [startPositionX, startPositionY] = [this.positionX / multiple, this.positionY / multiple];
                    const avatarCanvas = document.querySelector('canvas');
                    const ctx = avatarCanvas.getContext('2d');
                    [ctx.canvas.width, ctx.canvas.height] = [rectSizeScale, rectSizeScale];

                    let canvasWidth = ctx.canvas.width;
                    let canvasHeight = ctx.canvas.height;
                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                    const image = new Image();
                    image.setAttribute("crossOrigin",'Anonymous'); //开启图片跨域
                    image.onload = function () {
                        // ctx.translate(canvasWidth / 2, canvasHeight / 2);
                        ctx.rotate(Math.PI * rotate / 180);
                        if (rotate === 0) {
                            ctx.drawImage(image, startPositionX + offset, startPositionY + offset, rectSizeScale, rectSizeScale, 0, 0, rectSizeScale, rectSizeScale);
                        }else if (rotate === 90) {
                            ctx.drawImage(image, startPositionX + offset, startPositionY + offset, rectSizeScale, rectSizeScale, 0, -canvasWidth, rectSizeScale, rectSizeScale);
                        }else if (rotate === 180) {
                            ctx.drawImage(image, startPositionX + offset, startPositionY + offset, rectSizeScale, rectSizeScale,  -canvasHeight,  -canvasWidth, rectSizeScale, rectSizeScale);
                        }else if (rotate === 270) {
                            ctx.drawImage(image, startPositionX + offset, startPositionY + offset, rectSizeScale, rectSizeScale, -canvasWidth, 0, rectSizeScale, rectSizeScale);
                        }

                        // _this.newImage = avatarCanvas.toDataURL();
                        resolve(avatarCanvas.toDataURL())
                    };
                    image.src = this.cacheAvatar;
                });



            },

            //上传头像
            uploadAvatar () {
                this.cutAvatar().then((avatar) => {
                    let data = new FormData();
                    data.append('files', this.imageTransformFile(avatar));
                    this.$axios.post(this.rootUrl + '/indexapp.php?c=Upload&a=UploadFileVue&id=' + this.id, data)
                        .then(res => {
                            let responseData = res.data;
                            if (responseData.code == 200) {
                                this.avatarSrc = responseData.imgprefix + responseData.image;
                                this.updateAvatar();
                            } else {
                                this.$message.error('头像上传失败，请稍后再试！')
                            }
                        })
                        .catch(err => {

                        })
                }).catch(function(err) {

                });
            },

            // 更新头像
            updateAvatar () {
                const params = {
                    id: this.id,
                    headimg: this.avatarSrc
                };
                this.$axios.get(this.rootUrl + '/indexapp.php?c=CTUser&a=updateUserInfo', {params})
                    .then(res => {
                        let data = res.data;
                        if (data.code == 200) {
                            this.$message.success('头像更新成功！');
                            this.$store.commit('updateUserInfo', this.avatarSrc);
                            this.cacheAvatar = this.avatarSrc;
                            this.uploadedAvatar = false;
                            this.changingAvatar = false;
                            this.getImgInfo();
                        } else {
                            this.$message.error('头像更新失败，请稍后再试！');
                        }
                    })
                    .catch(err => {

                    })
            },

            //更换头像
            changeAvatar (e) {
                const _this = this;
                const avatar = e.target;
                const reader = new FileReader();
                const file = avatar.files[0];
                //校验图片格式
                if (!file) return
                const fileType = file.type;
                if (fileType != 'image/png' && fileType != 'image/jpg' && fileType != 'image/jpeg') {
                    return this.$message.error('图片类型错误')
                }
                if (file.size > 1 * 1024 * 1024) {
                    return this.$message.error('图片大小不能超过1m')
                }
                reader.readAsDataURL(file);
                this.loadingAvatar = true;
                reader.onload = function () {
                    _this.cacheAvatar = this.result;
                    _this.loadingAvatar = false;
                    _this.uploadedAvatar = true;
                    _this.getImgInfo()
                };
            },

            //图片base64转file
            imageTransformFile (url) {
                //将base64转换为blob
                 function dataURLtoBlob(dataurl) {
                    let arr = dataurl.split(','),
                        mime = arr[0].match(/:(.*?);/)[1],
                        bstr = atob(arr[1]),
                        n = bstr.length,
                        u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    return new Blob([u8arr], { type: mime });
                }
                //将blob转换为file
                function blobToFile(theBlob, fileName){
                    theBlob.lastModifiedDate = new Date();
                    theBlob.name = fileName;
                    return theBlob;
                }
                //调用
                const blob = dataURLtoBlob(url);
                return blobToFile(blob, 'avatar');

            },

            //修改名字
            modifyUsername () {
                const username = this.$refs.username.$el.value;
                if (username.length === 0) {
                    return this.$message.warning('请输入要修改的名称');
                }
                const params = {
                    id: this.id,
                    uname: username
                };
                this.$axios.get(this.rootUrl + '/indexapp.php?c=CTUser&a=updateUserInfo', {params})
                    .then(res => {
                        let data = res.data;
                        if (data.code == 200) {
                            this.$message.success('名称修改成功！');
                            this.$store.commit('updateUsername', username);
                            this.isModifyingName = false;
                        } else {
                            this.$message.error('名称修改失败，请稍后再试！');
                        }
                    })
                    .catch(err => {

                    })

            },

            // 转码cacheAvatar
            cacheAvatarUrlEncode () {
                const cacheAvatar = this.$store.getters.userInfo;
                this.cacheAvatar = decodeURIComponent(cacheAvatar);
            }

        },
        filters: {
            // 一般url转码
            normalUrlEncode (value) {
                return decodeURIComponent(value);
            },
        }
    }
</script>

<style lang="less">
    .changeAvatar {
        width:500px;
        height:578px;
        .ant-modal-content {
            border-radius:10px;
            .ant-modal-header {
                border-radius:10px 10px 0 0;
                border-bottom: 1px solid rgba(153,153,153,.5);
                .ant-modal-title {
                    color: #333333;
                }
            }
            .ant-modal-body {
                height: 400px;
                padding: 30px;
                .left-box {
                    height: 310px;
                    width: 310px;
                    position: relative;
                    overflow: hidden;
                }
                .avatar_big {
                    height: 310px;
                    width: 310px;
                    background-repeat: no-repeat;
                    background-size: cover;
                }
                .selectedArea {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    left: 0;
                    top: 0;
                    background-color: rgba(0, 0, 0, .2);
                    .circle {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        overflow: hidden;
                        > div {
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                            background-repeat: no-repeat;
                            background-size: cover;
                            cursor: pointer;
                        }
                    }
                }
                .operate {
                    margin-top: 17px;
                    position: relative;
                    .upload-avatar {
                        position: relative;
                        font-size: 16px;
                        color: #666;
                        float: left;

                        > input {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 64px;
                            height: 24px;
                            opacity: 0;
                            cursor: pointer;
                            font-size: 0;
                        }
                    }
                    > div {
                        position: absolute;
                        top: 0;
                        right: 0;
                        font-size: 0;
                        img {
                            width: 24px;
                            height: 24px;
                            cursor: pointer;
                            &:nth-child(2) {
                                margin: 0 16px;
                            }
                        }
                    }
                }
               .right {
                   .avatar_small {
                       width: 100px;
                       height: 100px;
                       border-radius: 50%;
                       overflow: hidden;
                       border: 1px solid #ccc;
                       > div {
                           width: 100%;
                           height: 100%;
                           border-radius: 50%;
                           background-repeat: no-repeat;
                           background-size: cover;
                           cursor: pointer;
                       }
                   }
                   p {
                       font-size: 16px;
                       color: #333;
                       text-align: center;
                       margin-top: 19px;
                   }
               }
            }
            .ant-modal-footer {
                border-top: 1px solid rgba(153,153,153,.5);
                padding-top: 36px;
                padding-bottom: 42px;
                div {
                    text-align: center;
                    button {
                        width:160px;
                        height:46px;
                        border-radius:8px;
                        font-size: 18px;
                        text-shadow: unset;
                        &:first-of-type {
                            margin-right: 40px;
                        }
                    }
                }
            }
        }

    }
    .users-container {
        height: 100%;
        background-color: #fafafa;
        .avatar {
            height: 460px;
            background-color: #fff;
            main {
                width: 1200px;
                margin: 0 auto;
                height: 100%;
                position: relative;
                overflow: hidden;
                .user-avatar {
                    width:160px;
                    height:160px;
                    border-radius:50%;
                    object-fit: cover;
                    position: absolute;
                    top: 129px;
                    left: 238px;
                    cursor: pointer;
                }
                .info {
                    margin: 122px 0 0 628px;
                    color: #333;
                    h1 {
                        font-size:36px;
                        font-weight:600;
                        margin-bottom: 53px;
                    }
                    .star {
                        float: left;
                        margin-right: 93px;
                        img {
                            width: 45px;
                            height: 42px;
                        }
                        p {
                            font-size:36px;
                            text-align: center;
                            margin-top: 23px;
                        }
                    }
                    .medal {
                        float: left;
                        img {
                            width: 35px;
                            height: 45px;
                        }
                        p {
                            font-size:36px;
                            text-align: center;
                            margin-top: 20px;
                        }
                    }
                }
            }
        }
        .userInfo {
            width:1200px;
            height:360px;
            background:rgba(255,255,255,1);
            border-radius:10px;
            margin: 30px auto 0;
            header {
                height: 70px;
                border-bottom: 4px solid #fafafa;
                span {
                    display: inline-block;
                    width: 80px;
                    height: 100%;
                    text-align: center;
                    line-height: 66px;
                    font-size: 16px;
                    color: #666;
                    margin-left: 100px;
                    cursor: pointer;
                    &.selected {
                        color: #333;
                        position: relative;
                        font-weight: bold;
                        &::before {
                            content: '';
                            width:80px;
                            height:6px;
                            background:rgba(252,201,58,1);
                            position: absolute;
                            left: 0;
                            bottom: -5px;
                        }
                    }
                }
            }
            main {
                padding: 56px 0 0 103px;
                position: relative;
                p {
                    margin-bottom: 31px;
                    height: 44px;
                    line-height: 44px;
                    .title {
                        font-size: 12px;
                        color: #666;
                    }
                    .content {
                        font-size:16px;
                        color:rgba(51,51,51,1);
                        margin-left: 94px;
                    }
                }
                .name {
                    display: flex;
                    align-items: center;
                    input {
                        width:202px;
                        height:44px;
                        line-height: 48px;
                        border-radius:5px;
                        margin-left: 72px;
                        font-size:16px;
                        color:rgba(51,51,51,1);
                        padding-left: 21px;
                    }
                }
                .telephone {
                    .content {
                        margin-left: 29px;
                    }
                }
                .modify {
                    width:120px;
                    height:40px;
                    border-radius:6px;
                    font-size:16px;
                    color:rgba(51,51,51,1);
                    position: absolute;
                    top: 58px;
                    right: 76px;
                }
                .modifyPassword {
                    width:120px;
                    height:40px;
                    border-radius:10px;
                    font-size:16px;
                    color:rgba(51,51,51,1);
                    position: absolute;
                    top: 141px;
                    left: 104px;
                }
            }
        }
    }
</style>
