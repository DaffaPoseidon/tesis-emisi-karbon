import { db } from "../drizzle/db.js";
import { ProjectCategoryTable } from "../drizzle/schema.js";
import { eq, like } from "drizzle-orm";

export const createProjectCategory = async (projectCategory: any): Promise<{ message: string }> => {
  if (!projectCategory || !projectCategory.kategori) {
    throw new Error("Category is required");
  }

  const categoryLower = projectCategory.kategori.toLowerCase();

  const existingCategories = await db.select({ kategori: ProjectCategoryTable.kategori }).from(ProjectCategoryTable).execute();

  const isCategoryExists = existingCategories.some((existingCategory) => existingCategory.kategori.toLowerCase() === categoryLower);

  if (isCategoryExists) {
    throw new Error("Category already exists");
  }

  await db
    .insert(ProjectCategoryTable)
    .values({ ...projectCategory })
    .execute();

  return { message: "Project Category successfully created" };
};

export const getAllProjectCategory = async (search?: string) => {
  const query = db.select().from(ProjectCategoryTable);

  if (search) {
    query.where(like(ProjectCategoryTable.kategori, `%${search}%`));
  }

  return await query.execute();
};

export async function getProjectCategoryById(id: string) {
  const projectCategory = await db.select().from(ProjectCategoryTable).where(eq(ProjectCategoryTable.id, id)).limit(1).execute();

  if (!projectCategory[0]) {
    throw new Error("Project Category not found");
  }

  return projectCategory[0];
}

export async function updateProjectCategoryById(projectCategory: any, id: string) {
  await getProjectCategoryById(id);
  await db
    .update(ProjectCategoryTable)
    .set({ ...projectCategory })
    .where(eq(ProjectCategoryTable.id, id))
    .execute();
}

export async function deleteProjectCategoryById(id: string) {
  await getProjectCategoryById(id);
  await db.delete(ProjectCategoryTable).where(eq(ProjectCategoryTable.id, id)).execute();
}
