import request from "@/utils/request";
// import requestForm from "@/utils/requestForm"; // Jika tidak digunakan, bisa dihapus

export function getCriteriaValue () {
  return request({
    url: `/criteria-value`,
    method: "get",
  });
}

export function getAllQuestionsByRPS(rpsID) {
  return request({
    url: `/criteria-value/questions?rpsID=${rpsID}`,
    method: "get",
  });
}

export function getQuestionsWithCriteriaValuesFromQuizAnnouncement(quizAnnouncementId) {
  return request({
    url: `/criteria-value/quizAnnouncement/${quizAnnouncementId}`,
    method: "get",
  });
}

export function getAllCriteriaValueByQuestion(questionId) {
  return request({
    url: `/criteria-value/question/${questionId}`,
    method: "get",
  });
}

export function addCriteriaValue(data, questionID) { // Tambahkan parameter questionID
  return request({
    url: `/criteria-value/${questionID}`, // URL kini mencakup questionID
    method: "post",
    headers: {
      'Content-Type': 'application/json'
    },
    data: data, // Axios akan otomatis men-*stringify* objek jika Content-Type adalah application/json
  });
}

export function getCriteriaValueById(criteriaValueId) {
  return request({
    url: `/criteria-value/${criteriaValueId}`,
    method: "get",
  });
}

export function editCriteriaValue(criteriaValueId, criteriaValueRequest) {
  return request({
    url: `/criteria-value/${criteriaValueId}`,
    method: "put",
    data: criteriaValueRequest,
  });
}

export function deleteCriteriavalue(id) { // Ubah parameter dari `data` menjadi `id`
  return request({
    url: `/criteria-value/${id}`, // Gunakan ID langsung di URL
    method: "delete",
    // Metode DELETE biasanya tidak memerlukan body.
  });
}