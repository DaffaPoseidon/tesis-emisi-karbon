import { getContract } from "../main.js";

export async function getAllTransaction(search?: string) {
  try {
    const contract = await getContract();
    const allTransactions = await contract.getAllTransaction();

    let formattedTransactions = allTransactions.map((transaction: any) => ({
      idUser: transaction[0],
      namaUser: transaction[1],
      idProjek: transaction[2],
      judulProjek: transaction[3],
      ownerProjek: transaction[4],
      jumlahToken: transaction[5].toString(),
      totalNominal: transaction[6].toString(),
    }));

    if (search && search.trim()) {
      formattedTransactions = formattedTransactions.filter((transaction: any) => transaction.namaUser.toLowerCase().includes(search.toLowerCase()));
    }

    return formattedTransactions;
  } catch (error) {
    console.error("Error in fetching all transactions from blockchain:", error);
    throw error;
  }
}

export async function getTransactionByUserId(idUser: string) {
  try {
    const contract = await getContract();
    const userTransactions = await contract.getTransactionByUserId(idUser);

    if (!userTransactions.length) {
      const error = new Error("No transactions found for this user");
      (error as any).statusCode = 404;
      throw error;
    }

    const formattedTransactions = userTransactions.map((transaction: any) => ({
      idUser: transaction.idUser,
      namaUser: transaction.namaUser,
      idProjek: transaction.idProjek,
      judulProjek: transaction.judulProjek,
      ownerProjek: transaction.ownerProjek,
      jumlahToken: transaction.jumlahToken.toString(),
      totalNominal: transaction.totalNominal.toString(),
    }));

    return formattedTransactions;
  } catch (error) {
    console.error("Error in fetching transactions by user from blockchain:", error);
    throw error;
  }
}

export async function getTransactionByProjectId(idProjek: string) {
  try {
    const contract = await getContract();
    const projectTransactions = await contract.getTransactionByProjectId(idProjek);

    if (!projectTransactions.length) {
      const error = new Error("No transactions found for this project");
      (error as any).statusCode = 404;
      throw error;
    }

    const formattedTransactions = projectTransactions.map((transaction: any) => ({
      idUser: transaction.idUser,
      namaUser: transaction.namaUser,
      idProjek: transaction.idProjek,
      judulProjek: transaction.judulProjek,
      ownerProjek: transaction.ownerProjek,
      jumlahToken: transaction.jumlahToken.toString(),
      totalNominal: transaction.totalNominal.toString(),
    }));

    return formattedTransactions;
  } catch (error) {
    console.error("Error in fetching transactions by project from blockchain:", error);
    throw error;
  }
}
