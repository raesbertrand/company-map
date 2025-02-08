<?php
class CompanyController extends BaseController
{
    /**
     * "/company/list" Endpoint - Get list of companies
     */
    public function listAction()
    {
        $strErrorDesc = '';
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

    public function searchAction($lat, $long, $distance)
    {
        /* SELECT 
        -- stuff here
        , ( 6371000 * acos( cos( radians(45.815005) ) * cos( radians( stuff.lat ) ) * cos( radians( stuff.lng ) - radians(15.978501) ) + sin( radians(45.815005) ) * sin(radians(stuff.lat)) ) ) AS distance 
        FROM 
        stuff
        HAVING 
        distance < 500 */
        $sql = 'SELECT 
        * , ( 6371000 * acos( cos( radians(45.815005) ) * cos( radians( ' . $lat . ' ) ) * cos( radians( ' . $long . ' ) - radians(15.978501) ) + sin( radians(45.815005) ) * sin(radians(stuff.lat)) ) ) AS distance 
        FROM 
        company
        HAVING 
        distance < ' . $distance;


        $strErrorDesc = '';
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();

        if (!isset($arrQueryStringParams['lat']) || !isset($arrQueryStringParams['long']) || !isset($arrQueryStringParams['distance'])) {
            $strErrorDesc = 'Missing params';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }
        try {
            $companyModel = new CompanyModel();
            $intLimit = 10;
            if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                $intLimit = $arrQueryStringParams['limit'];
            }
            $arrCompanies = $companyModel->getCompanysAround($arrQueryStringParams['lat'],$arrQueryStringParams['long'],$arrQueryStringParams['distance']);
            $responseData = json_encode($arrCompanies);
        } catch (Error $e) {
            $strErrorDesc = $e->getMessage() . 'Something went wrong! Please contact support.';
            $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
        }

        // send output
        $this->companySendOutput($strErrorDesc, $responseData, $strErrorHeader);
    }

    function companySendOutput($strErrorDesc, $responseData, $strErrorHeader)
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
