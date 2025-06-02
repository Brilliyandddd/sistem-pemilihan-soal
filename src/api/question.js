import request from "@/utils/request";
import requestForm from "@/utils/requestForm";

// import axios from "axios";

// Your existing code goes here...
export function addQuestion(data) {
  return request({
    url: "/question",
    method: "post",
    data,
  });
}

export function getImage(data) {
  return request({
    url: "/question/image",
    method: "post",
    data,
  });
}

export function getQuestion(){
  return request({
    url: "/question",
    method: "get",
  });
}

export function getQuestions(rpsDetailID) {
  return request({
    url: `/question/${rpsDetailID}`,
    method: "get",
  });
}

export function getQuestionsByRPS(rpsID) {
  return request({
    url: `/question?rpsID=${rpsID}`,
    method: "get",
  });
}

export function getQuestionByIdPaged(questionId) {
  return request({
    url: `/question/${questionId}`,
    method: "get",
  });
}

export function editQuestion(data, idQuestion) {
  return request({
    url: `/question/${idQuestion}`,
    method: "put",
    data,
  });
}

export function deleteQuestion(data) {
  return request({
    url: `/question/${data.idQuestion}`,
    method: "delete",
    data,
  });
}

// Fungsi untuk mendapatkan daftar RPS
export function getRpsList() {
  return request({
    url: "/rps",
    method: "get",
  });
}

// Fungsi untuk mendapatkan RPS berdasarkan ID
export function getRpsById(rpsId) {
  return request({
    url: `/rps/${rpsId}`,
    method: "get",
  });
}

export const getRpsDetails = async (rpsId) => {
  try {
    const response = await request({
      url: `/rps-detail?rpsId=${rpsId}`,
      method: 'GET'
    });

    // Debugging: Log raw response
    console.log('Raw API Response:', response);

    // Handle potential response formats
    const content = Array.isArray(response.data) 
      ? response.data 
      : response.data?.content || response.data?.data || [];

    // Filter di frontend jika backend belum memfilter
    const filteredContent = content.filter(item => {
      // Cek beberapa kemungkinan struktur data
      const itemRpsId = item.rps?.idRps || item.rpsId || item.rps;
      return itemRpsId === rpsId;
    });

    console.log('Filtered Content:', filteredContent);

    return {
      ...response,
      data: {
        statusCode: 200,
        content: filteredContent
      }
    };
  } catch (error) {
    console.error('Error fetching RPS details:', error);
    return {
      data: {
        statusCode: 500,
        content: [],
        message: 'Failed to fetch RPS details'
      }
    };
  }
};