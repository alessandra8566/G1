<?php
  try {
    require_once("./connectBooks.php");
    session_start();
    $no = $_SESSION["mem_no"];
    $song ="";
    $songs="";
    $to=""; 
    $tos="";
    $date_time=date('Y-m-d');
    switch ($_FILES['Song_img']['error']) {
        case 0;
          if (file_exists('../img') == false) {
            mkdir('img');
            if (file_exists('../img/activity') == false) {
              mkdir('activity');
              if (file_exists('../img/activity/collction-img') == false) {
                mkdir('collction-img');
              }
            }
          }
          $from = $_FILES['Song_img']['tmp_name'];
          $to = '../img/activity/collction-img/' . $_FILES['Song_img']['name'];
          if (copy($from, $to)) {
            echo "上傳成功";
            $tos = './img/activity/collction-img/' . $_FILES['Song_img']['name'];
            echo  $to;
          }
          break;
      }
      switch ($_FILES['entries_song']['error']) {
        case 0;
          if (file_exists('../music') == false) {
            mkdir('music');
          }
          $S_from = $_FILES['entries_song']['tmp_name'];
          $song = '../music/' . $_FILES['entries_song']['name'];
          if (copy($S_from, $song)) {
            echo "上傳成功";
            $songs = './music/' . $_FILES['entries_song']['name'];
            echo $songs;
          }
          break;
      }
    
    $sql = "INSERT INTO `entries`( `activity_no`, `mem_no`, `entries_name`, `vote_per`, `entries_song`, `introduction`, `entries_img`, `donate_acount`, `fav_total`)
      VALUES (:activity_no,:mem_no,:entries_name,:vote_per,:entries_song,:introduction,:entries_img,:donate_acount,:fav_total);";
    $formList = $pdo->prepare($sql);
    $formList->bindValue(':entries_name',$_POST['entries_name']);
    $formList->bindValue(':entries_song',$songs);
    $formList->bindValue(':introduction',$_POST['introduction']);
    $formList->bindValue(':entries_img',$tos);
    $formList->bindValue(':activity_no',$_POST['contestNowYear']);
    $formList->bindValue(':vote_per',0);
    $formList->bindValue(':donate_acount',0);
    $formList->bindValue(':fav_total',0);
    $formList->bindValue(':mem_no',$no);
    $formList->execute();

    $sql1= "INSERT INTO `total_station_music_library`(`song_date`, `song_idn`, `song_name`, `song_pic`, `mem_no`, `donate_acount`, `cat_no`, `fav_total`, `song_addr`, `song_hashtag`)  
     VALUES (:date_time,:introduction,:entries_name,:entries_img,:mem_no,:donate_acount,:cat_no,:fav_total,:entries_song,:song_hashtag);";
    $formList2 = $pdo->prepare($sql1);
    $formList2->bindValue(':date_time',$date_time);
    $formList2->bindValue(':introduction',$_POST['introduction']);
    $formList2->bindValue(':entries_name',$_POST['entries_name']);
    $formList2->bindValue(':entries_img',$tos);
    $formList2->bindValue(':mem_no',$no);
    $formList2->bindValue(':donate_acount',0);
    $formList2->bindValue(':cat_no',2);
    $formList2->bindValue(':fav_total',0);
    $formList2->bindValue(':entries_song',$songs);
    $formList2->bindValue(':song_hashtag',0);
    $formList2->execute();
    
  } catch (PDOException $e) {
    echo "例外行號:", $e->getLine(), "<br>";
    echo "錯誤訊息:", $e->getMessage(), "<br>";
};
