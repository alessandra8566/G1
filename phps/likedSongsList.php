<?php
try {
  require_once("./connectBooks.php");
  session_start();

  $sql = "select tsml.song_no,tsml.song_name,tsml.song_pic,tsml.song_addr,mem2.mem_name
from `member` mem  join myfavorite mf on (mem.mem_no = mf.mem_no) join total_station_music_library tsml on (mf.song_no = tsml.song_no) join `member` mem2 on (mem2.mem_no=tsml.mem_no)
where mem.mem_no = :memNo
group by tsml.song_no
order by tsml.song_no asc";

  $allList = $pdo->prepare($sql);
  $allList->bindValue(':memNo', $_SESSION['mem_no']);
  $allList->execute();

  if ($allList->rowCount() == 0) {
    echo '[]';
  } else {
    $listRow = $allList->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($listRow);
  }
} catch (PDOException $e) {
  echo "例外行號:", $e->getLine(), "<br>";
  echo "錯誤訊息:", $e->getMessage(), "<br>";
};
