interface IUpdateLoanDTO {
  id: string;
  payer_id: string;
  receiver_id: string;
  value: number;
  type: string;
  fee?: number;
  limit_date?: Date;
  closed_at?: Date;
  status: string;
}

export { IUpdateLoanDTO };
