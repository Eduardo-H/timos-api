interface ICreateLoanDTO {
  user_id: string;
  contact_id: string;
  value: number;
  type: string;
  fee?: number;
  limit_date?: Date;
}

export { ICreateLoanDTO };
