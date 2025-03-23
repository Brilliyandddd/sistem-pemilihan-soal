import request from "@/utils/request";

export function addSubAssessmentCriteria(data) {
  return request({
    url: "/sub-assessment-criteria",
    method: "post",
    data,
  });
}

export function getSubAssessmentCriterias() {
  return request({
    url: "/sub-assessment-criteria",
    method: "get",
  });
}

export function editSubAssessmentCriteria(data, id) {
  return request({
    url: `/sub-assessment-criteria/${id}`,
    method: "put",
    data,
  });
}

export function deleteSubAssessmentCriteria(data) {
  return request({
    url: `/sub-assessment-criteria/${data.id}`,
    method: "delete",
    data,
  });
}
