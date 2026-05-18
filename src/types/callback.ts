export type CallBackStatus = "pending" | "called" | "completed" | "cancelled";

export interface CallBackRecord {
  id:             string;
  patientName:    string;
  phn:            string;
  phoneNumber:    string;
  rxNum:          string;
  medicationName: string;
  timeToCallBack: string;
  rxNote:         string;
  status:         CallBackStatus;
  receivedAt:     string;
  receivedAtDisplay: string;
  pharmacyId:     string;
}
