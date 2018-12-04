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

	$file = "";
	if (isset($_POST['file']))
		$file = $_POST['file'];
	
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
		$full_file = dirname(__FILE__) . DIRECTORY_SEPARATOR . "files" . DIRECTORY_SEPARATOR . $session_folder . DIRECTORY_SEPARATOR . $file;
		if (file_exists($full_file)) {
			header('Content-Description: File Transfer');
			header('Content-Type: application/octet-stream');
			header('Content-Disposition: attachment; filename="'.basename($full_file).'"');
			header('Expires: 0');
			header('Cache-Control: must-revalidate');
			header('Pragma: public');
			header('Content-Length: ' . filesize($full_file));
			readfile($full_file);
			exit;
		}		
	} else {
		print(json_encode($json));
	}
?>
