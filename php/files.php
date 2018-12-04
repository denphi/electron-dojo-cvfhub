<?php 
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);

	function getDirContents($path) {
	
		$rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));
		$files = [];
		$subpath_pos = strlen($path.DIRECTORY_SEPARATOR);
		foreach ($rii as $file)
			if (!$file->isDir())
				$files[] = [
					'path' => substr($file->getPathname(), $subpath_pos),
					'name' => $file->getBasename(),
					'size' => $file->getSize(),
					'extension' => $file->getExtension()
				];
		return $files;
	}


	function httpPost($url, $header)
	{
		$curl = curl_init($url);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, $header);
		$response = curl_exec($curl);
		curl_close($curl);
		return $response;
	}
	$_HEADERS = getallheaders();
	$_POST = json_decode(file_get_contents('php://input'), true);
	$Authorization = "";
	if (isset($_HEADERS['Authorization']))
		$Authorization = $_HEADERS['Authorization'];
	
	$jobschedulerId = "";
	if (isset($_POST['jobschedulerId']))
		$jobschedulerId = $_POST['jobschedulerId'];
	$jobChain = "";
	if (isset($_POST['jobChain']))
		$jobChain = str_replace("/", "_",$_POST['jobChain']);
	$historyId = "";
	if (isset($_POST['historyId']))
		$historyId = $_POST['historyId'];
	$orderId = "";
	if (isset($_POST['orderId']))
		$orderId = $_POST['orderId'];
	
	$header_auth = [
		"Authorization: " . $Authorization,
		"Accept: application/json",
		"Content-Type: application/json",
	];
	$url = "http://localhost/jobscheduler/joc/api/security/login";
	$json = json_decode(httpPost($url, $header_auth, []));
	
	if ($json->isAuthenticated){
		$header_token = [
			"x-access-token: " . $json->accessToken,
			"Accept: application/json",
			"Content-Type: application/json",
		];
		
		$url = "http://localhost/jobscheduler/joc/api/security/logout";
		$json = json_decode(httpPost($url, $header_token));
		$session_folder = $jobChain.",".$orderId;
		$dir = dirname(__FILE__) . DIRECTORY_SEPARATOR . "files" . DIRECTORY_SEPARATOR . $session_folder;
		if (file_exists($dir)){
			$response = [];
			$response['message'] = "ok";
			$response['files'] = getDirContents($dir);
			print(json_encode($response));
		}
		
	} else {
		print(json_encode($json));
	}
?>
