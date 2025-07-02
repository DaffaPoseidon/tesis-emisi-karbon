import { db } from "../drizzle/db.js";
import { HistoryProjectTable, ProjectTable, SignatureAdminTable, UserTable } from "../drizzle/schema.js";
import { desc, eq } from "drizzle-orm";
import { getContract } from "../main.js";

export const createAgreementLetter = async (data: any) => {
  try {
    const contract = await getContract();

    // Check if project exists
    const project = await db.select().from(ProjectTable).where(eq(ProjectTable.id, data.id_projek)).execute();
    if (project.length === 0) {
      throw new Error("Project not found");
    }

    // Get project owner details
    const projectOwner = await db.select().from(UserTable).where(eq(UserTable.id, project[0].id_user)).execute();
    if (projectOwner.length === 0) {
      throw new Error("User associated with the project not found");
    }

    // Get admin user details
    const admin = await db.select().from(UserTable).where(eq(UserTable.role, "ADMIN")).execute();
    if (admin.length === 0) {
      throw new Error("Admin user not found");
    }

    // Get the latest admin signature
    const adminSignature = await db.select().from(SignatureAdminTable).where(eq(SignatureAdminTable.id_user, admin[0].id)).orderBy(desc(SignatureAdminTable.created_at)).limit(1).execute();
    if (adminSignature.length === 0) {
      throw new Error("Admin signature not found");
    }

    // Ensure all values are strings and handle null/undefined values
    const params = {
      idProjek: data.id_projek || "",
      idUser: projectOwner[0].id || "",
      namaProyek: project[0].judul || "",
      namaPetugas: admin[0].nama || "",
      alamatPetugas: admin[0].alamat || "",
      namaPemilikProyek: projectOwner[0].nama || "",
      nik: projectOwner[0].nik || "",
      noHp: projectOwner[0].no_hp || "",
      alamat: projectOwner[0].alamat || "",
      adminSignature: adminSignature[0].signature || "",
      ownerSignature: data.tanda_tangan || "",
      nominalDisetujui: project[0].nominal_disetujui || 0,
    };

    // Create agreement letter with both signatures
    const transaction = await contract.createAgreementLetter(
      params.idProjek,
      params.idUser,
      params.namaProyek,
      params.namaPetugas,
      params.alamatPetugas,
      params.namaPemilikProyek,
      params.nik,
      params.noHp,
      params.alamat,
      params.adminSignature,
      params.ownerSignature,
      BigInt(params.nominalDisetujui) // Convert to BigInt for Solidity uint256
    );

    await transaction.wait();

    // Create history entries
    await db
      .insert(HistoryProjectTable)
      .values([
        {
          id_projek: data.id_projek,
          history: "Kontrak Perjanjian",
          keterangan: "Kontrak perjanjian sudah ditandatangani oleh pemilik proyek dan admin",
          status: "SUCCESS",
        },
        {
          id_projek: data.id_projek,
          history: "Proses Penggalangan Penyertaan Modal",
          keterangan: "Menunggu proyek dipublish",
          status: "PENDING",
        },
      ])
      .execute();

    return {
      status: "success",
      message: "Agreement letter created successfully",
      data: {
        projectId: params.idProjek,
        adminSignature: params.adminSignature,
        ownerSignature: params.ownerSignature,
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    console.error("Error creating agreement letter:", error);
    throw error;  // Re-throw error for controller to handle it
  }
};


function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toISOString();
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return timestamp;
  }
}

export async function getAllAgreementLetter(search?: string) {
  let agreementLetter;
  try {
    const contract = await getContract();
    const agreements = await contract.getAllAgreement();
    
    agreementLetter = agreements.map((agreement: any) => ({
      idProjek: agreement.idProjek,
      idUser: agreement.idUser,
      namaProyek: agreement.namaProyek,
      namaPetugas: agreement.namaPetugas,
      alamatPetugas: agreement.alamatPetugas,
      namaPemilikProyek: agreement.namaPemilikProyek,
      nik: agreement.nik,
      noHp: agreement.noHp,
      alamat: agreement.alamat,
      signature: agreement.signature,
      tandaTangan: agreement.tandaTangan,
      nominalDisetujui: agreement.nominalDisetujui.toString(),
      createdAt: formatTimestamp(agreement.createdAt.toString()),
    }));

    // Cek apakah tidak ada agreement letter
    if (agreementLetter.length === 0) {
      const error = new Error("No agreement letters found");
      (error as any).statusCode = 404;  // Set statusCode untuk error
      throw error;  // Lempar error untuk ditangkap di controller
    }
  } catch (error) {
    console.error("Error fetching agreements:", error);
    throw error;  // Re-throw error agar bisa ditangkap di controller
  }

  // Filter berdasarkan search query jika ada
  if (search) {
    agreementLetter = agreementLetter.filter((agreement: any) => agreement.namaPemilikProyek.toLowerCase().includes(search.toLowerCase()));
  }

  return agreementLetter;
}


export async function getAgreementByProjectId(idProjek: string) {
  let projectAgreements;
  try {
    const contract = await getContract();
    projectAgreements = await contract.getAgreementByProjectId(idProjek);

    projectAgreements = projectAgreements.map((agreement: any) => ({
      idProjek: agreement.idProjek,
      idUser: agreement.idUser,
      namaProyek: agreement.namaProyek,
      namaPetugas: agreement.namaPetugas,
      alamatPetugas: agreement.alamatPetugas,
      namaPemilikProyek: agreement.namaPemilikProyek,
      nik: agreement.nik,
      noHp: agreement.noHp,
      alamat: agreement.alamat,
      signature: agreement.signature,
      tandaTangan: agreement.tandaTangan,
      nominalDisetujui: agreement.nominalDisetujui.toString(),
      createdAt: formatTimestamp(agreement.createdAt.toString()),
    }));
  } catch (error) {
    console.error("Error fetching agreements by project ID:", error);
    throw new Error("Error fetching agreements from the smart contract");
  }

  if (projectAgreements.length === 0) {
    const error = new Error("No agreements found for this project ID");
    (error as any).statusCode = 404;
    throw error;
  }

  return projectAgreements;
}
