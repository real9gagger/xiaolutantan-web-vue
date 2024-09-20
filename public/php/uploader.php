<?php
//成功返回
function ajax_success($result = array()) {
	$data = array();
    $data['data'] = $result;
    $data['code'] = 200;
    $data['msg'] = '操作成功';
    header('Content-Type:application/json; charset=utf-8');
    die(json_encode($data, JSON_UNESCAPED_UNICODE));
}

//失败返回
function ajax_error($msg = null) {
	$data = array();
    $data['data'] = null;
    $data['code'] = 0;
    $data['msg'] = ($msg ?: '操作失败');
    header('Content-Type:application/json; charset=utf-8');
    die(json_encode($data, JSON_UNESCAPED_UNICODE));
}

//获取文件新名称
function get_new_name($old_name){
    $dot_pos = strrpos($old_name, '.');
    if(!$dot_pos){//即使 === 0 也不行
        return null;
    }
    
    $file_ext = strtolower(substr($old_name, $dot_pos));
    if(!preg_match("/^\.(jpg|jpeg|png|bmp|gif)$/", $file_ext)){
        return null;
    }
    
    return md5(hrtime(true).$old_name) . $file_ext;
}

//旋转用户拍摄的照片
function image_rotation($file_path){
    $exif = exif_read_data($file_path);
    if($exif && $exif['Orientation'] && $exif['MimeType'] === 'image/jpeg'){
        switch ($exif['Orientation']){
            case 3: $degrees = 180; break;// Need to rotate 180 deg
            case 6: $degrees = -90; break;// Need to rotate 90 deg clockwise
            case 8: $degrees =  90; break;// Need to rotate 90 deg counter clockwise
            default: return null;
        }
        
        //只处理用户拍摄的照片，一般是JPG/JPEG格式！
        $image_source = imagecreatefromjpeg($file_path);
        $image_rotated = imagerotate($image_source, $degrees, 0);
        $res = imagejpeg($image_rotated, $file_path, 100);
        
        imagedestroy($image_source); //free up the memory
        imagedestroy($image_rotated); //free up the memory
        
        return $res;
    }
    
    return null;
}

//获取数据集
function get_data_set(){
    $path_dataset = dirname(__DIR__) . '/sharepics/dataset.json';
    return json_decode(file_get_contents($path_dataset), true);
}

//保存数据集
function save_data_set($new_data){
    $path_dataset = dirname(__DIR__) . '/sharepics/dataset.json';
    file_put_contents($path_dataset, json_encode($new_data, JSON_UNESCAPED_UNICODE));
}

//2024年9月11日：暂时使用文件来缓存数据
function get_cache($key){
    $md5key = md5($key);
    $path_cache = dirname(__DIR__) . "/sharepics/{$md5key}.cache";
    $dat_cache = json_decode(file_get_contents($path_cache), true);
    return $dat_cache;
}

//2024年9月11日：暂时使用文件来缓存数据
function set_cache($key, $dat){
    $md5key = md5($key);
    $path_cache = dirname(__DIR__) . "/sharepics/{$md5key}.cache";
    
    if(!$dat){
        unlink($path_cache);
    } else {
        file_put_contents($path_cache, json_encode($dat, JSON_UNESCAPED_UNICODE));
    }
}

//获取微信 Access Token 用于加密签名
function fetch_wx_access_token(){
    //算法参见：https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/Get_access_token.html
    
    //本地调试方式参见（测试 AppID 和密钥申请）：
    //https://developers.weixin.qq.com/community/develop/doc/00084c8365c3485d71d1d60a66b400
    //https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login
    
    $appId = 'wx646b627028cf2aef';//'wx4569df80bda178d0'; //小鹿坦坦小程序ID
    $appSecret = '84662fe1c50486714db3074c591e5ac4';//'280b9264680025e9c16dc4cc9bc3eba3'; //小鹿坦坦小程序密钥
    $cacheKey = 'wx_access_token_' . $appId;
    $cacheDat = get_cache($cacheKey);
    $nowTs = time();
    if($cacheDat && $cacheDat['expiresAfter'] > $nowTs){
        return $cacheDat;
    }
    
    $cHttp = curl_init("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={$appId}&secret={$appSecret}");
    
    curl_setopt($cHttp, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($cHttp, CURLOPT_TIMEOUT, 15);
    curl_setopt($cHttp, CURLOPT_HEADER, 0); //不要 http header 加快效率
    curl_setopt($cHttp, CURLOPT_SSL_VERIFYPEER, FALSE); // https 请求不验证证书和 hosts
    curl_setopt($cHttp, CURLOPT_SSL_VERIFYHOST, FALSE);
    
    $response = curl_exec($cHttp);
    $errormsg = curl_error($cHttp);
    
    curl_close($cHttp);
    
    $output = (!$errormsg ? json_decode($response, true) : array('errcode' => 12345, 'errmsg' => $errormsg));
    
    if(!$output['errcode']){
        $output['appId'] = $appId;
        $output['expiresAfter'] = ($nowTs + $output['expires_in']);
        set_cache($cacheKey, $output);
    }
    
    return $output;
}

//获取微信接口凭据
function fetch_wx_jsapi_ticket($accessToken, $appId){
    $cacheKey = 'wx_jsapi_ticket_' . $appId;
    $cacheDat = get_cache($cacheKey);
    $nowTs = time();
    if($cacheDat && $cacheDat['expiresAfter'] > $nowTs){
        return $cacheDat;
    }
    
    $cHttp = curl_init("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token={$accessToken}&type=jsapi");
    
    curl_setopt($cHttp, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($cHttp, CURLOPT_TIMEOUT, 15);
    curl_setopt($cHttp, CURLOPT_HEADER, 0); //不要 http header 加快效率
    curl_setopt($cHttp, CURLOPT_SSL_VERIFYPEER, FALSE); // https 请求不验证证书和 hosts
    curl_setopt($cHttp, CURLOPT_SSL_VERIFYHOST, FALSE);
    
    $response = curl_exec($cHttp);
    $errormsg = curl_error($cHttp);
    
    curl_close($cHttp);
    
    $output = (!$errormsg ? json_decode($response, true) : array('errcode' => 12345, 'errmsg' => $errormsg));
    
    if(!$output['errcode']){
        $output['expiresAfter'] = ($nowTs + $output['expires_in']);
        set_cache($cacheKey, $output);
    }
    
    return $output;
}

/* ======================================== 对外开放的的接口 ======================================== */
//上传一张图片
function upload_picture(){
    $my_file = $_FILES['my_file'];
    if(!$my_file){
        ajax_error('请先上传图片');
    }
    
    $new_name = get_new_name($my_file['name']);
    if(!$new_name){
        ajax_error('不支持的图片格式');
    } else if($_GET['is_test']==1){
        $new_name = ('test_pic_'.$new_name);
    }
    
    $root_dir = dirname(__DIR__);
    $path_original = '/sharepics/original/'; //原始图片所在的目录
    $path_thumbnail = '/sharepics/thumbnail/'; //原始图片的缩略图所在的目录
    
    $upload_result = move_uploaded_file($my_file['tmp_name'], $root_dir.$path_original.$new_name);
    if(!$upload_result){
        /* 如果没有权限，请在 linux 系统执行以下几个步骤：
        
        1、  运行PHP命令： <?php echo exec('whoami'); ?> 看看得到的用户名是什么，我得到的是 “apache”。
        2、  打开命令行工具运行两个命令：（“apache”为第一步得到的用户名，“/mnt/web3/xltt_web_vue” 是网站所在的目录）
                chown -R apache /mnt/web3/xltt_web_vue
                chmod -R 755 /mnt/web3/xltt_web_vue
        
        参见：https://stackoverflow.com/questions/8103860/move-uploaded-file-gives-failed-to-open-stream-permission-denied-error
        */
        ajax_error('上传文件失败：无权读写');
    } else {
        image_rotation($root_dir.$path_original.$new_name);
    }
    
    $image_info = getimagesize($root_dir.$path_original.$new_name);
    if(!$image_info){
        ajax_error('读取图片信息失败');
    }
    
    //保存缩略图
    $thumbnail_width = 200; //压缩宽度（像素）
    $thumbnail_height = floor($thumbnail_width * $image_info[1] / $image_info[0]); //高度根据比例缩小
    switch($image_info[2]){
        case IMAGETYPE_JPEG: 
            $src_pic = imagecreatefromjpeg($root_dir.$path_original.$new_name);
            $img_resized = imagescale($src_pic, $thumbnail_width, $thumbnail_height);
            imagejpeg($img_resized, $root_dir.$path_thumbnail.$new_name, 60);
            break;
        case IMAGETYPE_PNG: 
            $src_pic = imagecreatefrompng($root_dir.$path_original.$new_name);
            $img_resized = imagescale($src_pic, $thumbnail_width, $thumbnail_height);
            imagesavealpha($img_resized, true);
            imagepng($img_resized, $root_dir.$path_thumbnail.$new_name);
            break;
        case IMAGETYPE_GIF: 
            $src_pic = imagecreatefromgif($root_dir.$path_original.$new_name);
            //$img_resized = imagescale($src_pic, $thumbnail_width, $thumbnail_height); //无法保存背景透明色，弃用
            $img_resized = imagecreatetruecolor($thumbnail_width, $thumbnail_height);
            $transparent_bg = imagecolorallocatealpha($img_resized, 255, 255, 255, 127); //默认透明背景
            imagecolortransparent($img_resized, $transparent_bg);
            imagefill($img_resized, 0, 0, $transparent_bg);
            imagecopyresampled($img_resized, $src_pic, 0, 0, 0, 0, $thumbnail_width, $thumbnail_height, $image_info[0], $image_info[1]);
            imagegif($img_resized, $root_dir.$path_thumbnail.$new_name);
            break;
        case IMAGETYPE_BMP:
            $src_pic = imagecreatefrombmp($root_dir.$path_original.$new_name);
            $img_resized = imagescale($src_pic, $thumbnail_width, $thumbnail_height);
            imagebmp($img_resized, $root_dir.$path_thumbnail.$new_name);
            break;
    }
    
    if($src_pic){
        imagedestroy($src_pic);
    }
    if($img_resized){
        imagedestroy($img_resized);
    }
    
    $output_data = array(
        'id'            => intval($_GET['file_nth']),
        'description'   => $my_file['name'],
        'size'          => $my_file['size'],
        'picPath'       => substr($path_original, 1).$new_name, //不要开头的斜杠
        'thumbnailPath' => substr($path_thumbnail, 1).$new_name, //不要开头的斜杠
        'width'         => $image_info[0],
        'height'        => $image_info[1],
        'sort'          => 0,
        'longitude'     => 0,
        'latitude'      => 0,
        'mimeType'      => $image_info['mime'],
        'captureTime'   => date('Y/m/d H:i:s'), //拍摄时间戳（不准确）
        //'exifData'     => exif_read_data($root_dir.$path_thumbnail.$new_name)
    );
    
    ajax_success($output_data);
}

//保存用户分享额照片信息
function save_share_pics(){
    $posts = json_decode(file_get_contents('php://input'), true);
    if( !$posts['title'] || 
        !$posts['authorNickname'] ||
        !$posts['authorAvatarUrl'] ||
        !$posts['longitude'] ||
        !$posts['latitude'] || 
        !$posts['locationAddress'] ||
        !$posts['pictureList']){
        ajax_error('保存失败，数据不全');
    }
    
    $dat_list = get_data_set();
    $new_id = count($dat_list) + 1;
    
    $dat_list[] = array(
        'id'                => $new_id,
        'title'             => trim($posts['title']),
        'createTime'        => date('Y/m/d H:i:s'),
        'authorNickname'    => $posts['authorNickname'],
        'authorAvatarUrl'   => $posts['authorAvatarUrl'],
        'longitude'         => floatval($posts['longitude']),
        'latitude'          => floatval($posts['latitude']),
        'coordinateSystem'  => 'BD09', //经纬度坐标系系统类型：BD09、GCJ02、WGS84
        'locationAddress'   => $posts['locationAddress'],
        'pictureList'       => $posts['pictureList'],
        'status'            => 1, //1-有效，0-失效
        'likesCount'        => 0, //点赞数量
        'commentCount'      => 0, //评论数量
        'shareCount'        => 0, //分享次数
        'viewCount'         => 0, //查看次数
        'collectCount'      => 0  //收藏次数
    );
    
    save_data_set($dat_list);
    
    ajax_success($new_id);
}

//将我的帖子设为 “仅自己可见” 或 “全部人可见”
function toggle_my_post_status(){
    $posts = json_decode(file_get_contents('php://input'), true);
    $post_id = intval($posts['postId']);
    
    if($post_id){
        $post_index = -1;
        $dat_list = get_data_set();
        
        foreach($dat_list as $ix => $vx){
            if($vx['id'] === $post_id){
                $post_index = $ix;
                break;
            }
        }
        
        if($post_index >= 0){
            $dat_list[$post_index]['status'] = ($posts['newStatus'] == 1 ? 1 : 0);
            save_data_set($dat_list);
            ajax_success($post_index);
        }
    }
    
    ajax_error('无此帖子');
}

//删除我的帖子
function delete_my_post(){
    $posts = json_decode(file_get_contents('php://input'), true);
    $post_id = intval($posts['postId']);
    
    if($post_id){
        $post_index = -1;
        $dat_list = get_data_set();
        $root_dir = dirname(__DIR__) . '/';
        
        foreach($dat_list as $ix => $vx){
            if($vx['id'] === $post_id){
                $post_index = $ix;
                break;
            }
        }
        
        if($post_index >= 0){
            $subitems = array_splice($dat_list, $post_index, 1);
            
            save_data_set($dat_list);
            
            //删除关联的图片
            foreach($subitems[0]['pictureList'] as $pic){
                unlink($root_dir.$pic['picPath']);
                unlink($root_dir.$pic['thumbnailPath']);
            }
            
            ajax_success($post_index);
        }
    }
    
    ajax_error('无此帖子');
}

//更新帖子查看次数
function update_post_view_count(){
    $posts = json_decode(file_get_contents('php://input'), true);
    $post_id = intval($posts['postId']);
    
    if($post_id){
        $dat_list = get_data_set();
        $post_index = -1;
        
        foreach($dat_list as $ix => $vx){
            if($vx['id'] === $post_id){
                $post_index = $ix;
                break;
            }
        }
        
        if($post_index >= 0){
            //浏览次数 +1
            $dat_list[$post_index]['viewCount'] = ($dat_list[$post_index]['viewCount'] + 1);
            save_data_set($dat_list);
        }
    }
    
    ajax_success($post_id);
}

//生成微信签名
function generate_wx_signature(){
    
    //参见：https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62
    
    $posts = json_decode(file_get_contents('php://input'), true);
    
    if(!$posts['pageUrl']){
        ajax_error('参数不完整');
    }
    
    $tokenInfo = fetch_wx_access_token();
    if($tokenInfo['errcode']){
        ajax_error($tokenInfo['errmsg']);
    }
    
    $ticketInfo = fetch_wx_jsapi_ticket($tokenInfo['access_token'], $tokenInfo['appId']);
    if($ticketInfo['errcode']){
        ajax_error($ticketInfo['errmsg']);
    }
    
    //【！！！键名必须全部小写！！！】
    $params = array(
        'timestamp' => time(),
        'noncestr' => 'XLTT88888888',
        'jsapi_ticket' => $ticketInfo['ticket'],
        'url' => $posts['pageUrl']
    );
    
    ksort($params, SORT_STRING);
    
    $urlStr = urldecode(http_build_query($params));
    
    ajax_success(array(
        'signature' => sha1($urlStr),
        'appId' => $tokenInfo['appId'],
        'timestamp' => $params['timestamp'],
        'nonceStr' => $params['noncestr'],
    ));
}

//根据用户ID获取用户发布的帖子
function get_user_post_by_uid(){
    $userId = $_GET['userId'];
    $output = [];
    
    if($userId){
        $dat_list = get_data_set();
        
        foreach($dat_list as $vx){
            if($vx['authorNickname'] === $userId && $vx['status'] === 1){
                $output[] = $vx;
            }
        }
    }
    
    ajax_success($output);
}

//获取用户分享的帖子
function get_user_post_list(){
    $dat_list = get_data_set();
    
    //要求：获取 50 条浏览量最高的数据，30条最新发布的数据，20贴点赞最多的数据。需要去重，累计获取100条数据！
    //2024年9月5日 功能未完善，暂时返回所有的帖子吧
    ajax_success($dat_list);
}

//获取我分享的帖子
function get_my_post_list(){
    $dat_list = get_data_set();
    
    //要求：支持上滑加载更多数据
    //2024年9月5日 功能未完善，暂时返回所有的帖子吧
    ajax_success($dat_list);
}

//根据帖子ID获取帖子信息
function get_post_by_id(){
    $post_id = intval($_GET['postId']);
    $post_index = -1;
    
    if($post_id){
        $dat_list = get_data_set();
        
        foreach($dat_list as $ix => $vx){
            if($vx['id'] === $post_id){
                $post_index = $ix;
                break;
            }
        }
    }
    
    if($post_index >= 0){
        ajax_success($dat_list[$post_index]);
    } else {
        ajax_error('帖子不存在');
    }
}

//调用函数
$headers = getallheaders();

if($headers['Authorization'] !== 'Bearer Xltt-Token'){
    ajax_error('登录已超时');
}

$api_actions = [
    'upload_picture',
    'save_share_pics',
    'toggle_my_post_status',
    'delete_my_post',
    'update_post_view_count',
    'get_user_post_by_uid',
    'get_user_post_list',
    'get_my_post_list',
    'get_post_by_id',
    'generate_wx_signature',
];
$call_action = $_GET['action'];

if(in_array($call_action, $api_actions)){
    date_default_timezone_set('Asia/Shanghai');
    $call_action();
} else {
    ajax_error('未知的操作：'.$call_action);
}