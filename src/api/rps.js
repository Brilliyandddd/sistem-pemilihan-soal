import request from "@/utils/request";

// Fungsi untuk menambahkan RPS
export function addRPS(data) {
  return request({
    url: "/rps",
    method: "post",
    data,
  });
}

// Fungsi untuk mengimpor RPS dari file
export function importRPS(file) {
  const formData = new FormData();
  formData.append('file', file);

  return request({
    url: "/rps/import",
    method: "post",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// Fungsi untuk mendapatkan RPS
export function getRPS() {
  return request({
    url: "/rps",
    method: "get",
  });
}

// Fungsi untuk mengedit RPS
export function editRPS(idRps, data) {
  console.log("Mengirim permintaan edit RPS:", idRps, data);

  return request({
    url: `/rps/${idRps}`, // Pastikan endpoint ini sesuai dengan backend
    method: "put",
    data: data, // Kirim semua data termasuk idRps jika diperlukan
  }).catch((error) => {
    console.error("Error dari server:", error.response?.data || error.message);
    throw error;
  });
}

// Fungsi untuk mendapatkan RPS berdasarkan ID
export function getRPSById(rpsId) {
  return request({
    url: `/rps/${rpsId}`,
    method: "get",
  });
}

// Fungsi untuk menghapus RPS berdasarkan ID
export function deleteRPS(idRps) {
  if (!idRps) {
    console.error("ID RPS tidak ditemukan, permintaan DELETE dibatalkan.");
    return Promise.reject(new Error("ID RPS tidak valid."));
  }

  return request({
    url: `/rps/${idRps}`, // Gunakan ID langsung di URL
    method: "delete",
  });
}

// Menambahkan fungsi baru untuk mendapatkan mata kuliah (subjects)
export function getSubject() {
  return request({
    url: "/subject", // Ganti sesuai dengan endpoint yang sesuai untuk mata kuliah
    method: "get",
  });
}

export function getLecture() {
  return request({
    url: "/lecture",
    method: "get",
  });
}

export function getStudyProgram() {
  return request({
    url: "/study-program",  // Replace with the correct endpoint
    method: "get",
  });
}