
export const ESTOQUE = 'estoque';

export const ESTOQUE_JSON = 'estoqueJson';

export const PRICE_LIST = 'priceList';

export const FIREBIRD_PRICE_LIST = 'priceList';

export interface IProduct {
  CODIGO?: string;
  EAN13: string;
  DESCRICAO?: string;
  PRECO_VENDA?: string;
  QUANTIDATE?: string;
  MARCA?: string;
}