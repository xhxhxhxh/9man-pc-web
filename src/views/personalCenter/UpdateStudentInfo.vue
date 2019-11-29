<template>
    <div class="update-student-info-container">
        <header>
            <h1 class="title">
                <div class="line"></div>
                <span>修改资料</span>
            </h1>
        </header>
        <main>
            <div class="update-info">
                <div class="avatar">
                    <img :src="avatarSrc" alt="">
                    <a-button @click="changingAvatar = true">上传头像</a-button>
                </div>
                <div class="modify-info">
                    <div class="name">
                        <span>小名:</span>
                        <div>
                            <a-input v-model="kidName" class="kid-name"></a-input>
                        </div>
                    </div>
                    <div class="sex">
                        <span>性别:</span>
                        <div>
                            <a-radio-group v-model="sex">
                                <a-radio value="1">男孩</a-radio>
                                <a-radio value="2">女孩</a-radio>
                            </a-radio-group>
                        </div>
                    </div>
                    <div class="birth">
                        <span>生日:</span>
                        <div>
                            <a-date-picker v-model="birth" class="kid-birth"/>
                        </div>
                    </div>
                </div>
            </div>
            <div class="submit">
                <a-button @click="$router.push('/personalCenter')">取消</a-button>
                <a-button type="primary" @click="updateKidInfo(null)">确认修改</a-button>
            </div>
        </main>
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
    import defaultAvatar from './images/avatar.png';
    import common from '@/api/common';
    import moment from 'moment';
    export default {
        name: "UpdateStudentInfo",
        data () {
            const kidsInfo = common.getLocalStorage('kidsInfo')[0];
            return {
                rootUrl: this.$store.state.apiUrl,
                resourceUrl: this.$store.state.resourceUrl + '/',
                kidName: kidsInfo.uname,
                sex: kidsInfo.sex? kidsInfo.sex.toString(): '1',
                birth: kidsInfo.birth? moment(kidsInfo.birth): null,
                kidId: this.$route.params.kidId,
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
                avatarSrc: '', // 新头像地址
                avatarName: ''
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
                    const avatarName = this.avatarName? this.avatarName: 'avatar.png'
                    data.append('file', this.imageTransformFile(avatar), avatarName);
                    this.$axios.post(this.rootUrl + '/v1/child/uploadHeadimg', data)
                        .then(res => {
                            let responseData = res.data;
                            if (responseData.code === 200) {
                                const newAvatarSrc = responseData.data.data;
                                this.updateKidInfo(newAvatarSrc);
                            } else {
                                this.$message.error('头像上传失败，请稍后再试！')
                            }
                        })
                        .catch(err => {

                        })
                }).catch(function(err) {

                });
            },

            // 更新孩子信息
            updateKidInfo (newAvatarSrc) {
                const id = this.kidId;
                const params = {
                    id,
                };

                if (newAvatarSrc) {
                    Object.assign(params, {headimg: newAvatarSrc})
                } else {
                    if (!this.kidName || !this.birth) {
                        if (!this.kidName) {
                            const kidName = document.querySelector('.kid-name');
                            kidName.classList.add('shake', 'animated');
                            setTimeout(function () {
                                kidName.classList.remove('shake', 'animated');
                            }, 1000)
                        }
                        if (!this.birth) {
                            const kidBirth = document.querySelector('.kid-birth');
                            kidBirth.classList.add('shake', 'animated');
                            setTimeout(function () {
                                kidBirth.classList.remove('shake', 'animated');
                            }, 1000)
                        }
                        return
                    } else {
                        Object.assign(params, {uname: this.kidName});
                        Object.assign(params, {sex: this.sex });
                        Object.assign(params, {birth: this.birth.format('YYYY-MM-DD')})
                    }
                }
                this.$axios.post(this.rootUrl + '/v1/child/updateChild', params)
                    .then(res => {
                        let data = res.data;
                        if (data.code === 200) {
                            if (newAvatarSrc) {
                                this.$message.success('头像更新成功！');
                                this.$store.commit('setKidAvatar', {id, img: newAvatarSrc});
                                this.avatarSrc = this.resourceUrl + newAvatarSrc;
                                this.cacheAvatar = this.avatarSrc;
                                this.uploadedAvatar = false;
                                this.changingAvatar = false;
                                this.getImgInfo();
                            }else {
                                this.$message.success('信息修改成功！');
                                const kidInfo = this.$store.state.kidsInfo.kidsInfo.filter(item => item.id == this.kidId)[0];
                                kidInfo.uname = this.kidName;
                                kidInfo.sex = this.sex;
                                kidInfo.birth = this.birth.format('YYYY-MM-DD');
                                this.$store.commit('setKidsInfo', [...this.$store.state.kidsInfo.kidsInfo]);
                            }

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
                this.avatarName = file.name;
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

            // 转码cacheAvatar
            cacheAvatarUrlEncode () {
                const userInfo = this.$store.getters.getKidsInfo;
                const cacheAvatar = userInfo.filter(item => item.id == this.kidId)[0]['headimg'];
                this.cacheAvatar = cacheAvatar? this.resourceUrl + cacheAvatar: defaultAvatar;
                this.avatarSrc = this.cacheAvatar;
                // this.cacheAvatar = decodeURIComponent(cacheAvatar);
            }

        },
    }
</script>

<style lang="less">
    @import "../../less/index.less";
    .update-student-info-container {
        background:rgba(255,255,255,1);
        border-radius:6px;
        overflow: hidden;
        .title {
            height: 46px;
            border-bottom: 1px solid #F4F5F7;
            padding-left: 17px;
            font-size:16px;
            font-weight:normal;
            color:rgba(67,67,67,1);
            margin-bottom: 0;
            span {
                line-height: 45px;
                vertical-align: top;
            }
            .line {
                display: inline-block;
                width:4px;
                height:25px;
                background:@themeColor;
                border-radius:2px;
                margin: 10px 10px 0 0;
                vertical-align: top;
            }
        }
        main {
            height: 434px;
            overflow: hidden;
            .update-info {
                display: flex;
                justify-content: center;
                margin-top: 45px;
                .avatar {
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    display: flex;
                    width: 130px;
                    height: 142px;
                    margin-right: 30px;
                    img {
                        width: 92px;
                        height: 92px;
                        border-radius: 50%;
                        display: block;
                    }
                    button {
                        margin-top: 15px;
                        width:130px;
                        height:35px;
                        background:@themeColor;
                        border-radius:18px;
                        font-size:14px;
                        color:rgba(255,255,255,1);
                        border:1px solid @themeColor;
                    }
                }
                .modify-info {
                    width: 300px;
                    > div {
                        height: 35px;
                        display: flex;
                        margin-bottom: 20px;
                        > span {
                            font-size:14px;
                            display: inline-block;
                            height: 35px;
                            color:rgba(67,67,67,1);
                            margin-right: 50px;
                            vertical-align: top;
                            line-height: 35px;
                        }
                        div {
                            display: inline-block;
                            height: 100%;
                            flex: 1;
                            input {
                                border:1px solid rgba(210,210,210,1);
                                border-radius:10px;
                                text-align: center;
                                color:rgba(67,67,67,1);
                                &:hover {
                                    border-color: @themeColor;
                                }
                                &:focus {
                                    border-color: @themeColor;
                                }
                                &.shake {
                                    border-color: @themeColor;
                                    box-shadow: 0 0 0 2px rgba(248, 84, 21, 0.2);
                                }
                            }
                            .ant-calendar-picker {
                                width: 100%;
                                > div {
                                    width: 100%;
                                }
                                .ant-calendar-picker-input {
                                    text-align: center;
                                    color:rgba(67,67,67,1);
                                }
                                &.shake {
                                    .ant-calendar-picker-input {
                                        border-color: @themeColor;
                                        box-shadow: 0 0 0 2px rgba(248, 84, 21, 0.2);
                                    }

                                 }
                            }
                            .ant-radio-group {
                                line-height: 35px;
                                label {
                                    margin-right: 30px;
                                }
                            }
                        }
                    }
                }
            }
        }
        .submit {
            text-align: center;
            margin-top: 130px;
            button {
                width:130px;
                height:40px;
                border-radius:10px;
                margin-right: 60px;
                font-size: 16px;
                &:first-of-type {
                    border:1px solid @themeColor;
                    color: @themeColor;
                }
                &:last-of-type {
                    background-color: @themeColor;
                    color: #fff;
                }
            }
        }
    }
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
</style>
