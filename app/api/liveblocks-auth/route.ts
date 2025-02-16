import { clerkClient, getAuth } from '@clerk/nextjs/server';
import { Liveblocks } from '@liveblocks/node';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

const ACCESS_LEVELS = {
  READ_ONLY: ['room:read', 'room:presence:write'],
  FULL_ACCESS: ['room:write', 'room:presence:write'],
  ADMIN: ['room:write', 'room:presence:write', 'room:recordings:write'],
} as const;

export async function POST(request: Request) {
  console.log('Received authentication request');

  const { userId } = getAuth(request as unknown as NextApiRequest);

  if (!userId) {
    console.error('Authentication failed: No user ID found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Parse the request body
    const body = await request.json();
    const room = body.room;

    if (!room) {
      console.error('Room is required');
      return NextResponse.json({ error: 'Room is required' }, { status: 400 });
    }

    console.log(`Processing auth request for room: ${room}`);

    // Create or get room
    const roomInstance = await liveblocks.getRoom(room).catch(async () => {
      console.log(`Room ${room} not found, creating new room`);
      return await liveblocks.createRoom(room, {
        defaultAccesses: [],
        usersAccesses: {
          userId: ['room:write'],
        },
      });
    });

    // Prepare session with user info
    const session = liveblocks.prepareSession(user.id, {
      userInfo: {
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          user.username ||
          'Anonymous',
        email: user.emailAddresses[0]?.emailAddress || '',
        avatar: user.imageUrl,
      },
    });

    // Grant access to the room
    session.allow(room, ACCESS_LEVELS.FULL_ACCESS);

    const { status, body: responseBody } = await session.authorize();
    console.log(
      `Authorization completed for room ${room} with status ${status}`,
    );

    return new Response(responseBody, { status });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication' },
      { status: 500 },
    );
  }
}
