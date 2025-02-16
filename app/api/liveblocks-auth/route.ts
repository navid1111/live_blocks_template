import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { Liveblocks } from '@liveblocks/node';
import { NextApiRequest } from 'next';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  // 1. Get authentication state from request (Server-side)
  const { userId } = getAuth(request as unknown as NextApiRequest);

  // 2. Check if user is authenticated
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  // 3. Identify user with Liveblocks
  const { status, body } = await liveblocks.identifyUser(
    {
      userId: userId,
      groupIds: [], // Add an empty array if no groups are needed
    },
    {
      userInfo: {
        // Add user metadata (optional)
        name: user.fullName, // Fetch from Clerk if needed
        email: user.emailAddresses,
      },
    },
  );

  return new Response(body, { status });
}
