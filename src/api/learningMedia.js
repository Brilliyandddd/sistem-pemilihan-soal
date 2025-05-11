import request from "@/utils/request";

export function addLearningMedia(data) {
  return request({
    url: "/learning-media",
    method: "post",
    data,
  });
}

export function getLearningMedias() {
  return request({
    url: "/learning-media",
    method: "get",
  });
}

export function getLearningMediasSoftware() {
  return request({
    url: "/learning-media?type=1",
    method: "get",
  });
}

export function getLearningMediasHardware() {
  return request({
    url: "/learning-media?type=2",
    method: "get",
  });
}

export function editLearningMedia(id, data) {
  return request({
    url: `/learning-media/${id}`,
    method: "put",
    data,
  });
}


export function deleteLearningMedia(id) {
  return request({
    url: `/learning-media/${id}`,
    method: "delete",
  });
}
