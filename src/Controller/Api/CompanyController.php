<?php
use Curl\Curl;

class CompanyController extends BaseController
{
    /**
     * "/company/list" Endpoint - Get list of companies
     */
    public function listAction()
    {
        $strErrorDesc = '';
        $strErrorHeader = null;
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();

        if (strtoupper($requestMethod) == 'GET') {
            try {
                $companyModel = new CompanyModel();
                $intLimit = 10;
                if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                    $intLimit = $arrQueryStringParams['limit'];
                }
                $arrCompanies = $companyModel->getCompanies($intLimit);
                $responseData = json_encode($arrCompanies);
            } catch (Error $e) {
                $strErrorDesc = $e->getMessage() . 'Something went wrong! Please contact support.';
                $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
            }
        } else {
            $strErrorDesc = 'Method not supported';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }
        // send output
        $this->companySendOutput($strErrorDesc, $responseData, $strErrorHeader);
    }


    /**
     * "/company/search" Endpoint - Search companies
     */
    public function searchAction()
    {
        /* SELECT 
        -- stuff here
        , ( 6371000 * acos( cos( radians(45.815005) ) * cos( radians( stuff.lat ) ) * cos( radians( stuff.lng ) - radians(15.978501) ) + sin( radians(45.815005) ) * sin(radians(stuff.lat)) ) ) AS distance 
        FROM 
        stuff
        HAVING 
        distance < 500 */

        $strErrorHeader = null;
        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();

        $lat = $arrQueryStringParams['lat'];
        $long = $arrQueryStringParams['long'];
        $radius = $arrQueryStringParams['radius'];

        if (!isset($lat) || !isset($long) || !isset($radius)) {
            $strErrorDesc = 'Missing params';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }
        try {
            $companyModel = new CompanyModel();
            $intLimit = 10;
            if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                $intLimit = $arrQueryStringParams['limit'];
            }
            $arrCompanies = $companyModel->getCompanysAround($arrQueryStringParams['lat'], $arrQueryStringParams['long'], $arrQueryStringParams['radius']);
            if (!empty($arrCompanies)) {
                $responseData = json_encode($arrCompanies);
            } else {
                //cache is empty
                $dataURI = $_ENV['COMPANY_API'] . $_ENV['COMPANY_GEO_LOC_ENDPOINT'];
                $dataParams = http_build_query($arrQueryStringParams);
                try {
                    $curl = new Curl(null, [CURLOPT_SSL_VERIFYPEER => 0]);

                    $curl->get($dataURI . '?' . $dataParams);
                    $this->insertCompaniesFromAPI($curl->response->results);
                    $arrCompanies = $companyModel->getCompanysAround($arrQueryStringParams['lat'], $arrQueryStringParams['long'], $arrQueryStringParams['radius']);
                    $responseData = json_encode($arrCompanies);
                } catch (Error $e) {
                    $strErrorDesc = $e->getMessage() . 'Something went wrong! Please contact support.';
                    $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
                }
            }
        } catch (Error $e) {
            $strErrorDesc = $e->getMessage() . 'Something went wrong! Please contact support.';
            $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
        }

        // send output
        $this->companySendOutput($strErrorDesc, $responseData, $strErrorHeader);
    }

    private function insertCompaniesFromAPI($collection)
    {
        //var_dump($collection);

        return null;
    }

    private function companySendOutput($strErrorDesc, $responseData, $strErrorHeader = null)
    {
        // send output
        if (!$strErrorDesc) {
            $this->sendOutput(
                $responseData,
                array('Content-Type: application/json', 'HTTP/1.1 200 OK')
            );
        } else {
            $this->sendOutput(
                json_encode(array('error' => $strErrorDesc)),
                array('Content-Type: application/json', $strErrorHeader)
            );
        }
    }
}
