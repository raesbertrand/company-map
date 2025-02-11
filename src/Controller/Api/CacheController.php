<?php
use Curl\Curl;

class CacheController extends BaseController
{
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
                $cacheModel = new CacheModel();
                $intLimit = 10;
                if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                    $intLimit = $arrQueryStringParams['limit'];
                }
                $arrCompanies = $cacheModel->getCaches($intLimit);
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
        $responseData=null;

        $url=$arrQueryStringParams['url'];
        if (!isset($url)) {
            $strErrorDesc = 'Missing params';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }
        if (strtoupper($requestMethod) == 'GET') {
            try {
                $cacheModel = new CacheModel();
                $intLimit = 1;
                if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                    $intLimit = $arrQueryStringParams['limit'];
                }

                $arrCache = $cacheModel->searchCaches('url='.$url,$intLimit);
                $responseData = json_encode($arrCache);

                /*if (!empty($arrCache)) {
                    $responseData = json_encode($arrCache);
                } else {
                    //cache is empty
                    try {
                        $curl = new Curl(null, [CURLOPT_SSL_VERIFYPEER => 0]);    
                        $curl->get($url);
                        var_dump($curl);
                        $insert=$cacheModel->insert('INSERT INTO api_cache VALUES (?,?,?)', [$url,$curl->response]);
                        $responseData = json_encode($insert);
                    } catch (Error $e) {
                        $strErrorDesc = $e->getMessage() . 'Something went wrong! Please contact support.';
                        $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
                    }
                }*/
            } catch (Error $e) {
                $strErrorDesc = $e->getMessage() . ' Something went wrong! Please contact support.';
                $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
            }
        } else {
            $strErrorDesc = 'Method not supported';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }
       // var_dump($strErrorDesc);
        // send output
        $this->sendOutputManager($strErrorDesc, $responseData, $strErrorHeader);
    }

}
