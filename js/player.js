 /* ---------------- 全域變數 ---------------- */
 var audio = $("#player audio")[0]; //撥放器
 let vol_s, vol_b, vol_drag = false,
   songTime, //目前播放歌曲時間
   playStatus = true, //撥放狀態-true:播放中
   playerAuto = true, //---- 是否要自動撥放
   nowPlaying = 0, //現在播放的歌索引值
   myPlaylist = phpGetListName = playerLiked = [], // 目前播放清單 | php抓來的清單 | 會員資料
   playerListName, //player清單名
   listLen = myPlaylist.length;
 var member = [];


 /* ---------------- player load ---------------- */
 window.addEventListener('load', function () {
   let xhr = new XMLHttpRequest();
   xhr.onload = () => {
     member = JSON.parse(xhr.responseText);
     if (member.mem_acct) {
       vm.mem_login = true;
     } else {
       vm.mem_login = false;
     }
   }
   xhr.open("get", "./phps/getLoginInfo.php", false);
   xhr.send(null);
   playerInit();

   //撥放器縮放
   $('#expand').click(function () {
     $('.player_b').addClass('open');
     $('.player_s').animate({
       bottom: '-70px'
     });
     //  ListTopInfo();
   });
   $('#closePlayer').click(function () {
     $('.player_b').removeClass('open');
     $('.player_s').animate({
       bottom: '0'
     });
   });

   //手機推移
   $('.left .pushBtn').click(function () {
     $('.left').css('height', '10%');
     $('.right').css('height', '90%');
     $('.right .pushBtn').show();
     $('.left .pushBtn').hide();
   });
   $('.right .pushBtn').click(function () {
     $('.left').css('height', '90%');
     $('.right').css('height', '10%');
     $('.left .pushBtn').show();
     $('.right .pushBtn').hide();
   });

   //selectbtn -- 跳燈箱
   $('#player .selectBtn').click(function () {
     $('#player .lightCover').show();
     $('#player #myAllList').show();
     getLightName();
   });
   $('#player #myAllList').click(function (e) {
     e.stopPropagation();
   });

   //歌單清單
   $('.closeLight').click(function () {
     $('.lightCover').hide();
     $('#player #myAllList').hide();
   });

   //顯示歌曲點愛心-s
   $('#player .info').on('click', '.heart', function () {
     let songName = $(this).siblings('.songInfo').find('.name').text();
     let playerInd = getPlayerSongIndex(songName);
     let favSongInd = myPlaylist[playerInd].song_no;
     if (!member['mem_no']) {
       alert('Please login!');
     } else {
       if ($(this).hasClass('becomeRed')) {
         $('#playerfavorStatus').val('gray');
         $(this).html('<img src="./img/collection/grayheart.png">').removeClass('becomeRed');
         $('#player .songInfo .heart').html('<img src="./img/collection/grayheart.png">');
       } else {
         $('#playerfavorStatus').val('red');
         $(this).html('<img src="./img/collection/redheart.png">').addClass('becomeRed');
         $('#player .songInfo .heart').html('<img src="./img/collection/redheart.png">');
       }
       playerFavorStatus(favSongInd);
     }
   });

   //顯示歌曲點愛心-b
   $('#player .songInfo').on('click', '.heart', function () {
     let songName = $(this).siblings('.listSongInfo').find('.name').text();
     let playerInd = getPlayerSongIndex(songName);
     if (!member['mem_no']) {
       alert('Please login!');
     } else {
      let favSongInd = myPlaylist[playerInd].song_no;
      console.log(playerInd);
       if ($(this).hasClass('becomeRed')) {
         $('#playerfavorStatus').val('gray');
         $(this).html('<img src="./img/collection/grayheart.png">').removeClass('becomeRed');
         $('#player .info .heart').html('<img src="./img/collection/grayheart.png">');
       } else {
         $('#playerfavorStatus').val('red');
         $(this).html('<img src="./img/collection/redheart.png">').addClass('becomeRed');
         $('#player .info .heart').html('<img src="./img/collection/redheart.png">');
       }
       playerFavorStatus(favSongInd);
     }
   });

   //播放清單點愛心
   $('#player .list').on('click', '.heart', function () {
     let songName = $(this).siblings('.listSongInfo').find('.name h4').text();
     let playerInd = getPlayerSongIndex(songName);
     let favSongInd = myPlaylist[playerInd].song_no;
     if (!member['mem_no']) {
       alert('Please login!');
     } else {
       if ($(this).hasClass('becomeRed')) {
         $('#playerfavorStatus').val('gray');
         $(this).html('<img src="./img/collection/grayheart.png">').removeClass('becomeRed');
         $('#player .info .heart').html('<img src="./img/collection/grayheart.png">');
         $('#player .songInfo .heart').html('<img src="./img/collection/grayheart.png">');
       } else {
         $('#playerfavorStatus').val('red');
         $(this).html('<img src="./img/collection/redheart.png">').addClass('becomeRed');
         $('#player .info .heart').html('<img src="./img/collection/redheart.png">');
         $('#player .songInfo .heart').html('<img src="./img/collection/redheart.png">');
       }
       playerFavorStatus(favSongInd);
     }
   });

   //點歌單撥放，左側專輯唱片動畫
   $(document).on('mouseover', '.songCover', function () {
     $(this).find('.listPlay').show();
   });
   $(document).on('mouseout', '.songCover', function () {
     $(this).find('.listPlay').hide();
   });

   //選擇播放歌單
   $('#myAllList ul').on('click', 'li', function () {
     playerListName = $(this).text();
     $(this).addClass('choose');
     $('#player #myAllList li').not(this).removeClass('choose');
     $('#player .list ul').addClass('chooseList');
     $('#plistName').val(playerListName);
   });

   $('#myAllList #mylistOK').click(function () { //----有bug
     if (playerListName == undefined) {
       myPlaylist = myPlaylist;
     } else {
       //  isPlaying(true);
       if (playerListName == 'Liked songs') {
         getLikedList();
       } else {
         if (!member['mem_no']) {
           showAllSongs();
         } else {
           getOtherPlayList();
         }
       }
     }
     ListTopInfo();
     $('.lightCover').hide();
     $('#player #myAllList').hide();
   });

   /* ---------------- 音樂播放器 ---------------- */

   //播放暫停按鈕 -- 音樂撥放/暫停
   $("#player .play").click(function () {
     isPlaying(playStatus);
   });

   //下一首按鈕 -- 切換下一首
   $("#player .next").click(function () {
     if (nowPlaying == listLen - 1) {
       nowPlaying = listLen - 1;
     } else {
       nowPlaying++;
     }
     $("#player audio").attr("src", myPlaylist[nowPlaying].song_addr);
     if (playStatus == true) {
       isPlaying(false);
     } else {
       isPlaying(true);
     }
     listStatus(myPlaylist[nowPlaying].song_name);
   });

   //上一首按鈕 -- 切換上一首
   $("#player .prev").click(function () {
     if (nowPlaying == 0) {
       nowPlaying = 0;
     } else {
       nowPlaying--;
     }
     $("#player audio").attr("src", myPlaylist[nowPlaying].song_addr);
     if (playStatus == true) {
       isPlaying(false);
     } else {
       isPlaying(true);
     }
     listStatus(myPlaylist[nowPlaying].song_name);
   });

   //停止按鈕 -- 音樂全數停止
   $("#player .stop").click(function () {
     audio.pause();
     audio.currentTime = 0;
     isPlaying(true);
     $("#player .songCover .listPlay").removeClass('nowlistening');
     $(".songs .listPlay").removeClass('nowlistening');
   });

   //循環播放 -- 單首ok
   $("#player .loop").click(function () {
     if ($(this).hasClass("becomeYel")) {
       $(this).removeClass("becomeYel");
       $("#player .rand").attr("disabled", false);
       audio.loop = false;
       autoChange(true);
     } else {
       $(this).addClass("becomeYel");
       $("#player .rand").attr("disabled", true);
       audio.loop = true;
       autoChange(false);
     }
   });

   //隨機播放 -- 清單隨機
   $("#player .rand").click(function () {
     if ($(this).hasClass("becomeYel")) {
       $(this).removeClass("becomeYel");
       $("#player .loop").attr("disabled", false);
       autoChange(true);
     } else {
       $(this).addClass("becomeYel");
       $("#player .loop").attr("disabled", true);
       autoChange(false);
     }
   });

   //maybe有靜音 volIcon
   $("#player .volicon").click(function () {
     if (audio.muted) {
       audio.muted = false;
       $(".player_s .volicon i").css('color', 'white');
       $(".player_b .volicon i").css('color', '#333');
       $(".volLine .volControl").css('background-color', '#f1c40f');
     } else {
       audio.muted = true;
       $(this).find('i').css('color', '#f1c40f');
       $(".volLine .volControl").css('background-color', 'white');
     }
   });
   $(".volLine").mousedown(function () {
     vol_drag = true;
   });
   $(document).mouseup(function (e) {
     if (vol_drag) {
       volPos(e.pageX);
     }
     vol_drag = false;
   });

   //clickBar -- 詳細(b)/簡易(s)
   $(".player_b .progressbar").click(function (e) {
     let progressBarSize_b = parseInt($(".player_b .progressbar").css("width"));
     let mouseX_b = e.clientX - $(".player_b .progressbar").offset().left;
     $(".player_b .progressbar .progress").css('width', `${mouseX_b}px`);

     let newTime_b = mouseX_b / (progressBarSize_b / audio.duration);
     audio.currentTime = newTime_b;
   });
   $(".player_s .progressbar").click(function (e) {
     let progressBarSize_s = parseInt($(".player_s .progressbar").css("width"));
     let mouseX_s = e.clientX - $(".player_s .progressbar").offset().left;
     $(".player_s .progressbar .progress").css('width', `${mouseX_s}px`);

     let newTime_s = mouseX_s / (progressBarSize_s / audio.duration);
     audio.currentTime = newTime_s;
   });

   //清單播放點擊
   $('#player').on('click', ".listPlay", function () {
     nowPlaying = $(this).parent().parent().index();
     $("#player .listPlay").not(this).removeClass("nowlistening").html('<img src="./img/library/coverPlay-s.png">');
     if ($(this).hasClass('nowlistening')) {
       if (playStatus) {
         $(this).html('<img src="./img/library/coverPlay-s.png">');
         isPlaying(true);
       } else {
         $(this).html('<img src="./img/library/coverPause-s.png">');
         isPlaying(false);
       }
     } else {
       $("#player audio").attr("src", myPlaylist[nowPlaying].song_addr);
       audio.load();
       $(this).html('<img src="./img/library/coverPause-s.png">');
       isPlaying(false);
       $(this).addClass("nowlistening");
     }
     listStatus(myPlaylist[nowPlaying].song_name);
   });
 });
 /* ---------------- load end ---------------- */

 //初始化
 function playerInit() {
   audio.volume = 0.5;
   if (member['mem_no']) {
     playerListName = 'Liked songs';
     if (localStorage['listName']) {
       playerListName = localStorage['listName'];
       getOtherPlayList();
     } else {
       getLikedList();
     }
   } else {
     showAllSongs();
   }
   isLocalHave();
   ListTopInfo();
 }

 //取得Light -- ListName
 function getLightName() {
   if (!member['mem_no']) {
     mylistInfo = JSON.parse('[{"plist_name":"Total songs","list_pic":"./img/library/list_pic_no.jpg"}]');
     lightListName(mylistInfo);
   } else {
     let xhr = new XMLHttpRequest();
     xhr.onload = function () {
       if (xhr.status == 200) {
         phpGetListName = JSON.parse(xhr.responseText);
         mylistInfo = phpGetListName;
         lightListName(mylistInfo);
       }
     };
     let url = "./phps/getListName.php";
     xhr.open("get", url, true);
     xhr.send(null);
   }
 }
 //取得Liked Songs
 function getLikedList() {
   let xhr = new XMLHttpRequest();
   xhr.onload = function () {
     if (xhr.status == 200) {
       myPlaylist = JSON.parse(xhr.responseText);
       playerLiked = myPlaylist;
       listLen = myPlaylist.length;
       createPlayerList(myPlaylist);
       if (myPlaylist.length == 0) {
         showAllSongs();
         $('.player_b .listCover img').attr('src', './img/library/list_pic_no.jpg');
         $('.player_b .listName h2').text('Total songs');
       }
     }
   };
   let url = "./phps/likedSongsList.php";
   xhr.open("get", url, false);
   xhr.send(null);
 }

 //取得all songs
 function showAllSongs() {
   let xhr = new XMLHttpRequest();
   xhr.onload = function () {
     if (xhr.status == 200) {
       myPlaylist = JSON.parse(xhr.responseText);
       listLen = myPlaylist.length;
       createPlayerList(myPlaylist);
       $('.player_b .listName span').text(`${listLen} songs`);
     }
   };
   let url = "./phps/allSongs.php";
   xhr.open("get", url, false);
   xhr.send(null);
 }

 //取得歌單列表 -- 
 function getOtherPlayList() {
   let xhr = new XMLHttpRequest();
   xhr.onload = function () {
     if (xhr.status == 200) {
       myPlaylist = JSON.parse(xhr.responseText);
       listLen = myPlaylist.length;
       createPlayerList(myPlaylist);
     }
   };
   let url = `./phps/showPlayList.php?plistName=${playerListName}`;
   xhr.open("GET", url, false);
   xhr.send(null);
 }
 //歌單資訊
 function ListTopInfo() {
   let listIndex = getPlayerListIndex(playerListName);
   if (member['mem_no']) {
     if (playerListName == 'Liked songs') {
       $('#player .heart').not('.list .heart').addClass('becomeRed');
       $('#player .heart img').not('.list .heart').attr('src', './img/collection/redheart.png');
       $('.player_b .listCover img').attr('src', './img/library/list_pic0.jpg');
       $('.player_b .listName h2').text('Liked songs');
     } else {
       if (listIndex != -1) {
         $('#player .heart').not('.list .heart').addClass('becomeRed');
         $('#player .heart img').not('.list .heart').attr('src', './img/collection/redheart.png');
         $('.player_b .listCover img').attr('src', myPlaylist[listIndex].list_pic);
         $('.player_b .listName h2').text(playerListName);
       } else {
         $('.player_b .listCover img').attr('src', './img/library/list_pic_no.jpg');
         $('.player_b .listName h2').text(playerListName);
       }
     }
   } else {
     $('.player_b .listCover img').attr('src', './img/library/list_pic_no.jpg');
     $('.player_b .listName h2').text('Total songs');
   }
   $('.player_b .listName span').text(`${listLen} songs`);
 }

 //創建歌單
 function createPlayerList(songlistbuild) {
   $('#player .list ul').text("");
   if (songlistbuild != "") {
     if (member['mem_no']) {
       for (let i = 0; i < songlistbuild.length; i++) {
         $('#player .list ul').append(`<li>
        <div class="songCover">
          <img src="${songlistbuild[i].song_pic}" alt="">
          <div class="listPlay"><img src="./img/library/coverPlay-s.png"></div>
        </div>
        <div class="listSongInfo">
          <div class="name">
            <h4><a href="./songinfo.html?song_no=${songlistbuild[i].song_no}">${songlistbuild[i].song_name}</a></h4>
            <p>${songlistbuild[i].mem_name}</p>
          </div>
        </div>
        <div class="heart becomeRed"><img src="./img/collection/redheart.png"></div>
        <div class="clearfix"></div>
      </li>`);
       }
     } else {
       for (let i = 0; i < songlistbuild.length; i++) {
         $('#player .list ul').append(`<li>
        <div class="songCover">
          <img src="${songlistbuild[i].song_pic}" alt="">
          <div class="listPlay"><img src="./img/library/coverPlay-s.png"></div>
        </div>
        <div class="listSongInfo">
          <div class="name">
            <h4><a href="./songinfo.html?song_no=${songlistbuild[i].song_no}">${songlistbuild[i].song_name}</a></h4>
            <p>${songlistbuild[i].mem_name}</p>
          </div>
        </div>
        <div class="heart"><img src="./img/collection/grayheart.png"></div>
        <div class="clearfix"></div>
      </li>`);
       }
     }
   } else {
     $('#player .list ul').append(`<li style="text-align:center;color:#aaa">No songs</li>`);
   }
 }

 //build lightbox -- allmylist
 function lightListName(ListInfo) {
   let ul;
   $('#myAllList ul').children().remove();
   ul = $('#myAllList ul');
   if (member['mem_no']) {
     ul.append(`<li class="chooseList">Liked songs</li>`);
     for (let i = 0; i < ListInfo.length; i++) {
       ul.append(`<li>${ListInfo[i].plist_name}</li>`);
     }
   } else {
     ul.append(`<li class="chooseList">Total songs</li>`);
   }
 }

 //localstorage
 function isLocalHave() {
   if (localStorage['listName']) {
     playerListName = localStorage['listName'];
     getOtherPlayList();
   }
   if (localStorage.length != 0) {
     if (localStorage["nowPlaying"] <= myPlaylist.length) {
       nowPlaying = localStorage["nowPlaying"];
       audio.currentTime = localStorage['songTime'];
     } else {
       nowPlaying = 0;
       audio.currentTime = localStorage['songTime'];
     }
   } else {
     nowPlaying = 0;
   }
   if (localStorage["playStatus"] == "true") {
     playStatus = false;
     $('#player audio').attr("autoplay", true);
   } else {
     $('#player audio').attr("autoplay", false);
     playStatus = true;
   }
   if (myPlaylist.length != 0) {
     $('#player audio').attr("src", myPlaylist[nowPlaying].song_addr);
   }
   audio.load();
   isPlaying(playStatus);
   setInterval(progressingShow, 100);
   listStatus(myPlaylist[nowPlaying].song_name);
 }

 //播放狀態控制 -- 如果沒有播放就讓他撥
 function isPlaying(isPlaying) {
   playerAuto = true;
   if (!isPlaying) {
     playAudio();
     $("#player .play").html('<i class="fas fa-pause"></i>');
     $(".listPlay.nowlistening").html('<img src="./img/library/coverPause-s.png">');
     $("#player .player_b .coverRec").animate({
       right: "-50%",
       opacity: "1"
     }, "fast", "swing").addClass("recRotate");
     playStatus = true;
     listStatus(myPlaylist[nowPlaying].song_name);
   } else {
     audio.pause();
     $("#player .play").html('<i class="fas fa-play"></i>');
     $(".listPlay.nowlistening").html('<img src="./img/library/coverPlay-s.png">');
     playStatus = false;
     listStatus(myPlaylist[nowPlaying].song_name);
     $("#player .player_b .coverRec").animate({
       right: "0%"
     }).removeClass("recRotate");
   }
   if (myPlaylist.length != 0) {
     $("#player .songInfo .name").text(myPlaylist[nowPlaying].song_name);
     $("#player .songInfo .creator").text(myPlaylist[nowPlaying].mem_name);
     $("#player .info img").not(".coverRec img").not(".heart img").attr("src", myPlaylist[nowPlaying].song_pic);
   }
 }

 //播放
 function playAudio() {
   audio.play();
 }

 //進度條 -- timer
 function progressingShow() {
   songTime = audio.currentTime;
   //存進localstorage
   localStorage.setItem("nowPlaying", nowPlaying);
   localStorage.setItem("songTime", songTime);
   localStorage.setItem("playStatus", playStatus);
   if (playerListName != 'Liked songs' && playerListName != 'Total songs' && playerListName != "" && playerListName != undefined) {
     localStorage.setItem("listName", playerListName);
   } else if (playerListName == 'Liked songs' || playerListName == 'Total songs') {
     localStorage.removeItem('listName');
   }

   let progressColor = (songTime / audio.duration) * 100;
   if (audio.ended) {
     if (!playerAuto) {
       autoChange(false);
       audio.currentTime = 0;
       isPlaying(true);
     } else {
       autoChange(true);
     }
   }
   // console.log(audio.duration); //歌曲總長秒數
   $("#player .progress").css("width", `${progressColor.toFixed(2)}%`);
   $("#player span.start").text(`${parseInt(songTime / 60)}:${parseInt(songTime % 60)}`);

   if (audio.duration == 'Infinity') {
     audio.currentTime = 1e101;
     audio.ontimeupdate = function () {
       this.ontimeupdate = () => {
         return;
       };
       audio.currentTime = 1e101;
       audio.currentTime = 0;
     }
     $("#player span.end").text(`${parseInt(audio.duration / 60)}:${parseInt(audio.duration % 60)}`);
   } else {
     $("#player span.end").text(`${parseInt(audio.duration / 60)}:${parseInt(audio.duration % 60)}`);
   }
   $("#player span.end").text(`${parseInt(audio.duration / 60)}:${parseInt(audio.duration % 60)}`);
   //順便同步音量
   $(".player_b .volLine .volControl").css('width', `${parseInt(audio.volume*100)}%`);
   $(".player_s .volLine .volControl").css('width', `${parseInt(audio.volume*100)}%`);
 }

 //自動換下一首
 function autoChange(autoStatus) {
   if (autoStatus) {
     //隨機撥放
     if ($("#player .rand").hasClass("becomeYel")) {
       let randNum = parseInt(Math.random() * (listLen));
       nowPlaying = randNum;
       $("#player audio").attr("src", myPlaylist[nowPlaying].song_addr);
       audio.load();
       isPlaying(false);
       listStatus(myPlaylist[nowPlaying].song_name);
     } else {
       if (nowPlaying == listLen - 1) {
         if (audio.ended) {
           audio.currentTime = 0;
           isPlaying(true);
         } else {
           isPlaying(false);
         }
       } else {
         if (audio.ended) {
           nowPlaying++;
           $("#player audio").attr("src", myPlaylist[nowPlaying].song_addr);
           audio.load();
           isPlaying(false);
           listStatus(myPlaylist[nowPlaying].song_name);
         }
       }
     }
   }
 }

 //清單播放狀態
 function listStatus(songName) {
   let length = $(`.player_b li h4`).length;
   for (let i = 0; i < length; i++) {
     $(`.player_b .listPlay`).removeClass("nowlistening");
     if (songName == $(`.player_b li:nth-child(${i+1}) h4`).text()) {
       $(`.player_b li:nth-of-type(${i+1}) .listPlay`).addClass("nowlistening");
       if (playStatus) {
         $(`.player_b li:nth-of-type(${i+1}) .listPlay`).html('<img src="./img/library/coverPause-s.png">');
       } else {
         $(`.player_b li:nth-of-type(${i+1}) .listPlay`).html('<img src="./img/library/coverPlay-s.png">');
       }
       break;
     }
   }
 }
 //  function listStatus() {
 //    $(`.player_b .listPlay`).removeClass("nowlistening");
 //    $(`.player_b li:nth-of-type(${nowPlaying+1}) .listPlay`).addClass("nowlistening");
 //    if (playStatus) {
 //      $(`.player_b li:nth-of-type(${nowPlaying+1}) .listPlay`).html('<img src="./img/library/coverPause-s.png">');
 //    } else {
 //      $(`.player_b li:nth-of-type(${nowPlaying+1}) .listPlay`).html('<img src="./img/library/coverPlay-s.png">');
 //    }
 //  }

 //音量控制
 function volPos(mousePos) {
   let vol_bwidth = $(".player_b .volLine").width();
   if ($("#player .player_b").hasClass("open")) {
     vol_b = mousePos - $(".player_b .volLine").offset().left;
     vol_b = parseInt((vol_b / 100) * 100);
     if (vol_bwidth == 100) {
       $(".player_b .volicon i").css('color', '#333');
       vol_b = parseInt((vol_b / 100) * 100);
       if (vol_b < 0) {
         vol_b = 0;
         $(".player_b .volicon i").css('color', '#f1c40f');
       } else if (vol_b > 100) {
         $(".player_b .volicon i").css('color', '#333');
         vol_b = 100;
       }
       audio.volume = vol_b / 100;
       $(".player_b .volLine .volControl").css('width', `${vol_b}%`);
     } else {
       vol_s = parseInt((vol_s / vol_bwidth) * 100);
       $(".player_b .volicon i").css('color', '#333');
       vol_b = parseInt((vol_b / vol_bwidth) * 100);
       if (vol_b < 0) {
         vol_b = 0;
         $(".player_b .volicon i").css('color', '#f1c40f');
       } else if (vol_b > 100) {
         $(".player_b .volicon i").css('color', '#333');
         vol_b = 100;
       }
       audio.volume = vol_b / 100;
       $(".player_b .volLine .volControl").css('width', `${vol_b}%`);
     }
   } else {
     vol_s = mousePos - $(".player_s .volLine").offset().left;
     vol_s = parseInt((vol_s / 100) * 100);
     $(".player_s .volicon i").css('color', 'white');
     if (vol_s < 0) {
       vol_s = 0;
       $(".player_s .volicon i").css('color', '#f1c40f');
     } else if (vol_s > 100) {
       $(".player_s .volicon i").css('color', 'white');
       vol_s = 100;
     }
     audio.volume = vol_s / 100;
     $(".player_s .volLine .volControl").css('width', `${vol_s}%`);
   }
 }

 //player歌曲索引值
 function getPlayerSongIndex(name) {
   let songName = [];
   for (let i = 0; i < myPlaylist.length; i++) {
     songName.push(myPlaylist[i].song_name);
   }
   let songind = songName.indexOf(name);
   return songind;
 }

 //抓清單索引值
 function getPlayerListIndex(name) {
   let listName = [];
   for (let i = 0; i < myPlaylist.length; i++) {
     listName.push(myPlaylist[i].plist_name);
   }
   let listind = listName.indexOf(name);
   return listind;
 }

 //收藏狀態
 function playerFavorStatus(favorSong) {
   console.log(favorSong);
   console.log($('#playerfavorStatus').val());
   let xhr = new XMLHttpRequest();
   xhr.onload = function () {
     if (xhr.status == 200) {
       if (xhr.responseText == 'Asuccess') {
         alert('Success to add');
       } else if (xhr.responseText == 'Dsuccess') {
         alert('Success to cancel');
       } else if (xhr.responseText == 'Afail') {
         alert('Fail to add');
       } else if (xhr.responseText == 'Dfail') {
         alert('Fail to cancel');
       }
     }
   };
   xhr.open("post", "./phps/LibraryHeart.php", true);
   xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
   let data_info = `favorStatus=${$('#playerfavorStatus').val()}&favorSong=${favorSong}`;
   xhr.send(data_info);
 }

 //撥放器愛心狀態
 function heartStatus(songName) {
   let heartNameArr = [];
   for (let i = 0; i < playerLiked.length; i++) {
     heartNameArr.push(playerLiked[i].song_name);
   }
   let heartInd = heartNameArr.indexOf(songName);
   if (heartInd !== -1) {
     $('.player_s .heart img').attr('src', './img/collection/redheart.png');
     $('.player_b .songInfo .heart img').attr('src', './img/collection/redheart.png');
   } else {
     $('.player_s .heart img').attr('src', './img/collection/grayheart.png');
     $('.player_b .songInfo .heart img').attr('src', './img/collection/grayheart.png');
   }
 }