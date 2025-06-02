import request from "@/utils/request";
import requestForm from "@/utils/requestForm";

export function addAnswer(data) {
  return requestForm({
    url: "/answer",
    method: "post",
    data,
  });
}

export function getAnswers(questionID) {
  return request({
    url: `/answer?questionID=${questionID}`,
    method: "get",
  });
}

export function editAnswer(data, idAnswer) {
  return request({
    url: `/answer/${idAnswer}`,
    method: "put",
    data,
  });
}

export function deleteAnswer(data) {
  return request({
    url: `/answer/${data.idAnswer}`,
    method: "delete",
    data,
  });
}
