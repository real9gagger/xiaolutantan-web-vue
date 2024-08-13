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
    
    $root_dir = $_SERVER['DOCUMENT_ROOT'];
    $path_original = '/sharepics/original/'; //原始图片所在的目录
    $path_thumbnail = '/sharepics/thumbnail/'; //原始图片的缩略图所在的目录
    
    $upload_result = move_uploaded_file($my_file['tmp_name'], $root_dir.$path_original.$new_name);
    if(!$upload_result){
        ajax_error('上传文件失败');
    }
    
    $image_info = getimagesize($root_dir.$path_original.$new_name);
    if(!$image_info){
        ajax_error('读取图片信息失败');
    }
    
    //保存缩略图
    $thumbnail_width = 100; //压缩宽度（像素）
    $thumbnail_height = floor($thumbnail_width * $image_info[1] / $image_info[0]); //高度根据比例缩小
    switch($image_info[2]){
        case IMAGETYPE_JPEG: 
            $src_pic = imagecreatefromjpeg($root_dir.$path_original.$new_name);
            $img_resized = imagescale($src_pic, $thumbnail_width, $thumbnail_height);
            imagejpeg($img_resized, $root_dir.$path_thumbnail.$new_name);
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
        'picPath'       => $path_original.$new_name,
        'thumbnailPath' => $path_thumbnail.$new_name,
        'width'         => $image_info[0],
        'height'        => $image_info[1],
        'sort'          => 0,
        'longitude'     => 0,
        'latitude'      => 0,
        'mimeType'      => $image_info['mime'],
        'captureTime'   => date('Y/m/d H:i:s') //拍摄时间戳（不准确）
    );
    
    ajax_success($output_data);
}

//保存用户分享额照片信息
function save_share_pics(){
    $posts = json_decode(file_get_contents('php://input'), true);
    if( !$posts['title'] || 
        !$posts['longitude'] ||
        !$posts['latitude'] || 
        !$posts['locationAddress'] ||
        !$posts['pictureList']){
        ajax_error('保存失败，数据不全');
    }
    
    $path_dataset = $_SERVER['DOCUMENT_ROOT'] . '/sharepics/dataset.json';
    $dat_list = json_decode(file_get_contents($path_dataset), true);
    $new_id = count($dat_list) + 1;
    
    $dat_list[] = array(
        'id'                => $new_id,
        'title'             => trim($posts['title']),
        'createTime'        => date('Y/m/d H:i:s'),
        'authorNickname'    => '平平',
        'authorAvatarUrl'   => '',
        'longitude'         => floatval($posts['longitude']),
        'latitude'          => floatval($posts['latitude']),
        'locationAddress'   => $posts['locationAddress'],
        'pictureList'       => $posts['pictureList'],
        'likesCount'        => 0, //点赞数量
        'commentCount'      => 0, //评论数量
        'shareCount'        => 0, //分享次数
        'viewCount'         => 0 //查看次数
    );
    
    file_put_contents($path_dataset, json_encode($dat_list, JSON_UNESCAPED_UNICODE));
    
    ajax_success($new_id);
}

//调用函数
$call_action = $_GET['action'];
if(function_exists($call_action)){
    $call_action();
} else {
    ajax_error('未知的操作');
}