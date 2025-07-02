import { Request, Response } from "express";

export const getProvincesHandler = async (req: Request, res: Response) => {
  try {
    const IdnArea = await import("idn-area-data");
    const provinces = await IdnArea.getProvinces();
    return res.status(200).json(provinces);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error retrieving provinces" });
  }
};

export const getRegenciesHandler = async (req: Request, res: Response) => {
  try {
    const IdnArea = await import("idn-area-data");
    const { province_code } = req.params;
    if (!province_code) {
      return res.status(400).json({ message: "Province code is required" });
    }

    const allRegencies = await IdnArea.getRegencies();
    const filteredRegencies = allRegencies.filter(
      (regency: any) => regency.province_code === province_code
    );

    if (filteredRegencies.length === 0) {
      return res.status(404).json({ message: "No regencies found for this province code" });
    }

    return res.status(200).json(filteredRegencies);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error retrieving regencies" });
  }
};

export const getDistrictHandler = async (req: Request, res: Response) => {
  try {
    const IdnArea = await import("idn-area-data");
    const { regency_code } = req.params;
    if (!regency_code) {
      return res.status(400).json({ message: "Regency code is required" });
    }

    const allDistricts = await IdnArea.getDistricts();
    const filteredDistrict = allDistricts.filter(
      (district: any) => district.regency_code === regency_code
    );

    if (filteredDistrict.length === 0) {
      return res.status(404).json({ message: "No districts found for this regency code" });
    }

    return res.status(200).json(filteredDistrict);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error retrieving districts" });
  }
};

export const getVillagesHandler = async (req: Request, res: Response) => {
  try {
    const IdnArea = await import("idn-area-data");
    const { district_code } = req.params;
    if (!district_code) {
      return res.status(400).json({ message: "District code is required" });
    }

    const allVillages = await IdnArea.getVillages();
    const filteredVillages = allVillages.filter(
      (village: any) => village.district_code === district_code
    );

    if (filteredVillages.length === 0) {
      return res.status(404).json({ message: "No villages found for this district code" });
    }

    return res.status(200).json(filteredVillages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error retrieving villages" });
  }
};
