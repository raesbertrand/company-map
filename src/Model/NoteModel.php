<?php 
require_once PROJECT_ROOT_PATH . "/Model/Database.php";
class NoteModel extends Database
{
    public function getNotesForCompany($siret, $limit=10)
    {
        return $this->select("SELECT *, DATE_FORMAT(created_at, '%Y-%m-%dT%TZ') AS iso_date FROM company_notes WHERE siret=? ORDER BY created_at ASC LIMIT ?", ["ii", [$siret, $limit]]);
    }

    public function insertNote($siret, $note){
        return $this->insert("INSERT INTO company_notes (siret, note) VALUES(?,?)", ["is", [$siret, $note]]);
    }

    public function deleteNoteById($id){
        return $this->delete("DELETE FROM company_notes WHERE id=?",['i',[$id]]);
    }

    public function deleteNotesBySiret($siret){
        return $this->delete("DELETE FROM company_notes WHERE siret=?",['i',[$siret]]);
    }
}