import { ApiError } from "@/server/api/api-error";
import { jsonData, withApiHandler } from "@/server/api/handler";
import { requireApiAdmin } from "@/server/api/guards";
import { uploadMenuItemImage } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  return withApiHandler(async () => {
    await requireApiAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError(400, "Choose an image file to upload");
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await uploadMenuItemImage(buffer, file.type, file.name);
      return jsonData({ url });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to upload image";
      throw new ApiError(400, message);
    }
  });
}
