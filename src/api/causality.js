import request from "@/utils/request";

// Add new causality task
export function addCausality(data) {
  return request({
    url: "/causality",
    method: "post",
    data,
  });
}

// Get all causality tasks (with optional pagination params)
export function getCausality(params) {
  return request({
    url: "/causality",
    method: "get",
    params,
  });
}

// Get a single causality task by ID
export function getCausalityByID(idCausality) {
  return request({
    url: `/causality/${idCausality}`,
    method: "get",
  });
}

// Edit an existing causality task
export function editCausality(data, idCausality) {
  return request({
    url: `/causality/${idCausality}`,
    method: "put",
    data,
  });
}

// Delete a causality task by ID
export function deleteCausality(idCausality) {
  return request({
    url: `/causality/${idCausality}`,
    method: "delete",
  });
}

// --- New API functions for Causality Status and DEMATEL Calculation ---

// Update the status of a causality task
// Payload example: { status: "Completed" }
export function updateCausalityStatus(idCausality, data) {
  return request({
    url: `/causality/${idCausality}/status`,
    method: "put",
    data,
  });
}

// Trigger DEMATEL weight calculation for a causality task
export function calculateCausalityWeights(idCausality) {
  return request({
    url: `/causality/tasks/${idCausality}/calculate-weights`,
    method: "post",
  });
}

// --- API functions for Dosen Rating ---

// Get causality tasks assigned to a specific teacher
export function getTasksForTeacher(teacherId) {
  return request({
    url: `/causality/tasks/teacher/${teacherId}`,
    method: "get",
  });
}

// Get criteria pairs for a teacher to rate for a specific task
export function getCriteriaPairsToRate(taskId, teacherId) {
  return request({
    url: `/causality/tasks/${taskId}/pairs/${teacherId}`,
    method: "get",
  });
}

// Submit a single causality rating from a teacher
// Payload example: { causalityTaskId: "...", reviewerId: "...", influencingCriteriaId: "...", influencedCriteriaId: "...", ratingValue: 3 }
export function submitCausalityRating(data) {
  return request({
    url: "/causality/ratings",
    method: "post",
    data,
  });
}

// Get all ratings for a specific causality task (primarily for DEMATEL calculation backend)
export function getAllCausalityRatingsForTask(taskId) {
  return request({
    url: `/causality/tasks/${taskId}/ratings`,
    method: "get",
  });
}

// NEW: Fungsi untuk menyimpan bobot DEMATEL yang dihitung
// data: { causalityId: string, subjectId: string, weights: [{ criterionId: string, normalizedWeight: number }] }
export function saveDematelWeights(data) {
  return request({
    url: `/causality/dematel-weights`, // <-- Sesuaikan dengan endpoint API backend Anda
    method: "PUT", // Atau POST, tergantung implementasi backend Anda untuk update/create
    data: data,
  });
}

// NEW: Fungsi untuk mengambil bobot DEMATEL berdasarkan Subject ID (untuk TOPSIS)
export function getDematelWeightsBySubject(subjectId) {
  return request({
    url: `/causality/dematel-weights/by-subject/${subjectId}`, // <-- Sesuaikan dengan endpoint API backend Anda
    method: "GET",
  });
}