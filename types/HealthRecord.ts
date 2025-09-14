export interface HealthRecord {
  [x: string]: any;
  id?: string;
  date: string;       // ISO string -> when the record was added
  note?: string;      // optional note from owner
  imageUrl: string;   // uploaded screenshot or camera image
}
