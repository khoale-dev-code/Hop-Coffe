import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../lib/firebase";

export const RESERVATION_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  DONE: "done",
};

function cleanText(value = "") {
  return String(value || "").trim();
}

function normalizePhone(phone = "") {
  return String(phone || "").replace(/\s+/g, "").trim();
}

export async function createReservation(shopId, payload) {
  if (!shopId) {
    throw new Error("Thiếu shopId để tạo đặt lịch.");
  }

  const customerName = cleanText(payload.customerName);
  const phone = normalizePhone(payload.phone);
  const guestCount = Number(payload.guestCount || 1);
  const reservationDate = cleanText(payload.reservationDate);
  const reservationTime = cleanText(payload.reservationTime);
  const note = cleanText(payload.note);

  if (!customerName) throw new Error("Vui lòng nhập họ tên.");
  if (!phone || phone.length < 8) throw new Error("Vui lòng nhập số điện thoại hợp lệ.");
  if (!Number.isFinite(guestCount) || guestCount < 1) throw new Error("Số lượng người phải lớn hơn 0.");
  if (!reservationDate) throw new Error("Vui lòng chọn ngày đặt.");
  if (!reservationTime) throw new Error("Vui lòng chọn giờ đặt.");

  const docRef = await addDoc(collection(db, "shops", shopId, "reservations"), {
    customerName,
    phone,
    guestCount,
    reservationDate,
    reservationTime,
    note,
    status: RESERVATION_STATUS.PENDING,
    source: "public-menu",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getReservations(shopId) {
  if (!shopId) return [];

  const reservationsQuery = query(
    collection(db, "shops", shopId, "reservations"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(reservationsQuery);

  return snapshot.docs.map((reservationDoc) => ({
    id: reservationDoc.id,
    ...reservationDoc.data(),
  }));
}

export async function updateReservationStatus(shopId, reservationId, status) {
  if (!shopId || !reservationId) {
    throw new Error("Thiếu thông tin đặt lịch.");
  }

  await updateDoc(doc(db, "shops", shopId, "reservations", reservationId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteReservation(shopId, reservationId) {
  if (!shopId || !reservationId) {
    throw new Error("Thiếu thông tin đặt lịch.");
  }

  await deleteDoc(doc(db, "shops", shopId, "reservations", reservationId));
}