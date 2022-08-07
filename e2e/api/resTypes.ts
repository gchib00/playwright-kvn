export interface ValidPaymentRes {
  id: string;
  bankStatus: string;
  statusGroup: string;
  confirmLink: string;
}
export interface InvalidPaymentRes {
  error: {
    code: number;
    name: string;
    description: string;
  }
  data: string;
}