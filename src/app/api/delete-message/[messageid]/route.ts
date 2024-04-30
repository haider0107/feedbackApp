import { User } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";
import { db } from "~/server/db";

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } },
) {
  try {
    const messageId = Number(params.messageid);
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !user) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    const deleteMessage = await db.message.delete({
      where: {
        id: messageId,
      },
    });

    console.log(deleteMessage);

    return Response.json(
      { message: "Message deleted", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return Response.json(
      { message: "Error deleting message", success: false },
      { status: 500 },
    );
  }
}
