import request from "@/utils/request";
// import requestForm from "@/utils/requestForm"; // Jika ini tidak digunakan, bisa dihapus

// Your existing code goes here...
export function addQuestion(payload) { // Mengganti 'data' menjadi 'payload' agar lebih jelas
  const formData = new FormData();

  for (const key in payload) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      const value = payload[key];

      if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
              value.forEach(item => {
                  if (item !== null && item !== undefined && item !== '') {
                      formData.append(key, item);
                  }
              });
          } else if (typeof value === 'boolean') {
              formData.append(key, value.toString());
          }
          else {
              formData.append(key, value);
          }
      }
    }
  }

  return request({
    url: "/question", // Ini akan memanggil @PostMapping tanpa /json
    method: "post",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
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

export function getQuestionsByRpsDetailId(rpsDetailId) {
  return request({
    url: `/question?rpsDetailId=${rpsDetailId}`,
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

// --- Perbaikan Opsi 1: Menghapus filter frontend di getRpsDetails ---
export const getRpsDetails = async (rpsId) => {
  try {
    const response = await request({
      url: `/rps-detail?rpsId=${rpsId}`, // Asumsi backend memfilter dengan benar
      method: 'GET'
    });

    console.log('Raw API Response (getRpsDetails):', response);

    const content = Array.isArray(response.data)
      ? response.data
      : response.data?.content || response.data?.data || [];

    // --- Filter Frontend Telah Dihapus di Sini ---
    // return {
    //   ...response,
    //   data: {
    //     statusCode: 200,
    //     content: content.filter(item => { /* ... filter logic ... */ })
    //   }
    // };

    // --- Langsung Kembalikan Konten dari API ---
    return {
      ...response,
      data: {
        statusCode: 200,
        content: content // Mengembalikan semua konten yang didapat dari API
      }
    };
    // --- Akhir Perubahan ---

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

export function submitQuestionCriteriaRating(payload, idQuestion) {
  return request({
    url: `/question/rating/${idQuestion}`,
    method: "put",
    data: payload,
  });
}