interface ICreateLoanDTO {
  payer_id: string;
  receiver_id: string;
  value: number;
  type: string;
  fee?: number;
  limit_date?: Date;
  creator_id: string;
}

export { ICreateLoanDTO };
