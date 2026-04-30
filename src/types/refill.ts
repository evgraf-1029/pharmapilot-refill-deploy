export type RefillStatus = "pending" | "processing" | "ready" | "completed" | "cancelled";

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
  receivedAt: string;    // DynamoDB sort key — needed for status updates
  pharmacyId: string;    // DynamoDB partition key
}