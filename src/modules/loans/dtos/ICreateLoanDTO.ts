interface ICreateLoanDTO {
  user_id: string;
  contact_id: string;
  value: number;
  type: string;
  limit_date?: Date;
}

export { ICreateLoanDTO };
