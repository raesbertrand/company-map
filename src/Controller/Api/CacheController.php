<?php
use Curl\Curl;

class CacheController extends BaseController
{
    protected $cacheModel = null;
    public function __construct(){
        
        $this->cacheModel = new CacheModel();
    }
/**
* "/cache/list" Endpoint - Get list of cached calls
*/
    public function listAction()
    {
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();
        if (strtoupper($requestMethod) == 'GET') {
            try {
                $intLimit = 10;
                if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                    $intLimit = $arrQueryStringParams['limit'];
                }
                $arrCompanies = $this->cacheModel->getCaches($intLimit);
                $responseData = json_encode($arrCompanies);
            } catch (Error $e) {
                $strErrorDesc = $e->getMessage().'Something went wrong! Please contact support.';
                $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
            }
        } else {
            $strErrorDesc = 'Method not supported';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }
        // send output
        if (!$strErrorDesc) {
            $this->sendOutput(
                $responseData,
                array('Content-Type: application/json', 'HTTP/1.1 200 OK')
            );
        } else {
            $this->sendOutput(json_encode(array('error' => $strErrorDesc)), 
                array('Content-Type: application/json', $strErrorHeader)
            );
        }
    }

    
    public function fromCacheAction(){
        $strErrorHeader = null;
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];

        $arrQueryStringParams = $this->getQueryStringParams();

        $arrBodyString=file_get_contents('php://input');
        $arrBodyJson=json_decode($arrBodyString,TRUE);

        $responseData=null;
        
        $url=$arrBodyJson['url'];

        if (!isset($url)) {
            $strErrorDesc = 'Missing params';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }
        if (strtoupper($requestMethod) == 'GET') {
            try {
                $intLimit = 1;
                if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                    $intLimit = $arrQueryStringParams['limit'];
                }

                $arrCache = $this->cacheModel->searchCaches($url,$intLimit);
                if (!empty($arrCache)) {
                    $responseData = $arrCache[0]['result'];
                } else {
                    //cache is empty or two old
                    $this->cacheModel->cleanSourceCache($url); 
                   $datas=$this->getDatas($url);
                   $this->cacheModel->insertCache($url,$datas);
                   $responseData=$datas;
                }
            } catch (Error $e) {
                $strErrorDesc = $e->getMessage() . ' Something went wrong! Please contact support.';
                $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
            }
        } else {
            $strErrorDesc = 'Method not supported';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }
        
        $this->sendOutputManager( $responseData, $strErrorDesc, $strErrorHeader);
    }

    private function getDatas($url,$params=null,$headers=null){
        try {
            $verifypeer=1;
            if($_ENV['MODE']=='dev'){
                $verifypeer= 0;
            }
            
            $curl = new Curl(null, [CURLOPT_SSL_VERIFYPEER => $verifypeer]);

            $curl->get($url);
            return json_encode($curl->response);
        } catch (Error $e) {
            $strErrorDesc = $e->getMessage() . '[CURL] Something went wrong! Please contact support.';
            $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
            $this->sendOutputManager(null, $strErrorDesc,  $strErrorHeader);
        }
    }

}
