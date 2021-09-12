interface IUpdateLoanDTO {
  id: string;
  user_id: string;
  contact_id: string;
  value: number;
  type: string;
  fee?: number;
  limit_date?: Date;
  closed_at?: Date;
  status: string;
}

export { IUpdateLoanDTO };
