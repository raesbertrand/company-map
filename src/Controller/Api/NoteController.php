<?php

class NoteController extends BaseController
{
    protected $noteModel = null;
    public function __construct(){
        
        parent::__construct();
        $this->noteModel = new NoteModel();
    }

    /**
     * "/note/list" Endpoint - Get list of notes
     */
    public function listAction()
    {
        $strErrorDesc = '';
        $strErrorHeader = null;
        $responseData=null;
        
        $arrQueryStringParams = $this->getQueryStringParams();

        if (strtoupper($this->requestMethod) == 'GET') {
            try {
                $intLimit = 10;
                if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                    $intLimit = $arrQueryStringParams['limit'];
                }
                $arrNotes = $this->noteModel->getNotes($intLimit);
                $responseData = json_encode($arrNotes);
            } catch (Error $e) {
                $strErrorDesc = $e->getMessage() . 'Something went wrong! Please contact support.';
                $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
            }
        } else {
            $strErrorDesc = 'Method not supported';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }
        // send output
        $this->sendOutputManager($responseData, $strErrorDesc, $strErrorHeader);
    }


    /**
     * "/note/siret" Endpoint - Search notes for a specific company
     */
    public function siretAction()
    {
        $strErrorDesc = '';
        $strErrorHeader = null;
        $responseData=null;
        // $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();
        if (strtoupper($this->requestMethod) == 'GET' && isset($arrQueryStringParams['number'])) {
            try {
                $intLimit = 100;
                $siret=$arrQueryStringParams['number'];
                if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                    $intLimit = $arrQueryStringParams['limit'];
                } 
                
                $arrNotes = $this->noteModel->getNotesForCompany($siret, $intLimit);
                $responseData = json_encode($arrNotes);
            } catch (Error $e) {
                $strErrorDesc = $e->getMessage() . 'Something went wrong! Please contact support.';
                $strErrorHeader = 'HTTP/1.1 500 Internal Server Error';
            }
        } else {
            $strErrorDesc = 'Method not supported';
            $strErrorHeader = 'HTTP/1.1 422 Unprocessable Entity';
        }

        // send output
        $this->sendOutputManager($responseData, $strErrorDesc, $strErrorHeader);
    }
}
