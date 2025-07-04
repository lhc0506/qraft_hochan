export type ExchangeCode = 'SHENZHEN' | 'HONGKONG';

export type Exchange = ExchangeCode | 'ALL';

export type Disclosure = {
  id: string;
  date: string;
  secName: string;
  secCode: string;
  exchange: ExchangeCode;
  topics: string[];
  category: string;
  title: string;
  content: string;
  originalUrl?: string;
};
