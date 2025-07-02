import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TCity, TDisctrict, TProvince } from "~/types/api/indonesia-region";

export function useGetProvinces() {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const response = await httpClient.get<TProvince[]>("/wilayah/provinces");
      return response;
    },
  });
}

export function useGetCities(provinceId: string) {
  return useQuery({
    queryKey: ["cities", provinceId],
    queryFn: async () => {
      if (!provinceId) {
        return []; // Return an empty array if provinceId is not valid
      }
      const response = await httpClient.get<TCity[]>(`/wilayah/regencies/${provinceId}`);
      return response.data;
    },
  });
}

export function useGetDistricts(cityProvinceId: string) {
  return useQuery({
    queryKey: ["districts", cityProvinceId],
    queryFn: async () => {
      if (!cityProvinceId) {
        return []; // Return an empty array if cityProvinceId is not valid
      }
      const response = await httpClient.get<TDisctrict[]>(`/wilayah/districts/${cityProvinceId}`);
      return response.data;
    },
  });
}
