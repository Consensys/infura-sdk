export interface OpenSeaTokenLevelStandard {
  name: string;
  description: string;
  image: string;
  attributes?: Attributes[];
  external_url?: string;
  animation_url?: string;
  background_color?: string;
  youtube_url?: string;
}

interface Attributes {
  display_type?: string;
  trait_type: string;
  value: number | string;
}

export interface ContractLevelMetadata {
  name: string;
  description: string;
  image: string;
  external_link?: string;
  seller_fee_basis_points?: string;
  fee_recipient?: string;
}
