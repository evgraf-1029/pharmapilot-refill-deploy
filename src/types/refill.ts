export type RefillStatus = "Pending" | "In Progress" | "Completed" | "Cancelled";

export interface RefillRecord {
  id: string;
  patientName: string;
  phn: string;
  phoneNumber: string;
  rxNum: string;
  medicationName: string;
  rxQty: string;
  rxNote: string;
  status: RefillStatus;
  createdAt: string;
}
