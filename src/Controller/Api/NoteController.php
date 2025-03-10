<?php

class NoteController extends BaseController
{
    /**
     * "/notes/list" Endpoint - Get list of notes
     */
    public function listAction()
    {
        $strErrorDesc = '';
        $strErrorHeader = null;
        $requestMethod = $_SERVER["REQUEST_METHOD"];
        $arrQueryStringParams = $this->getQueryStringParams();
        if (strtoupper($requestMethod) == 'GET') {
            try {
                $noteModel = new NoteModel();
                $intLimit = 10;
                if (isset($arrQueryStringParams['limit']) && $arrQueryStringParams['limit']) {
                    $intLimit = $arrQueryStringParams['limit'];
                }
                $arrNotes = $noteModel->getNotes($intLimit);
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
     * "/note/search" Endpoint - Search notes
     */
    public function searchAction()
    {
        // send output
        $this->sendOutputManager($responseData, $strErrorDesc, $strErrorHeader);
    }

    private function insertNotesFromAPI($collection)
    {
        //var_dump($collection);

        return null;
    }
}
