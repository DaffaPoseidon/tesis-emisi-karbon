export type TProvince = {
  code: string;
  name: string;
};

export type TCity = {
  code: string;
  province_code: string;
  name: string;
};

export type TDisctrict = {
  code: string;
  regency_code: string;
  name: string;
};

export type TKelurahan = {
  code: string;
  district_code: string;
  name: string;
};
