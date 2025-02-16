'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { useUser } from '@clerk/nextjs';
import { useOthers, useSelf } from '@liveblocks/react';
import { useState } from 'react';

const RoomManager = () => {
  const others = useOthers();
  const self = useSelf();
  const { user, isLoaded } = useUser();
  const [roomName, setRoomName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createRoom = async () => {
    if (!roomName) {
      toast({
        title: 'Error',
        description: 'Room name is required',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/liveblocks-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: roomName }), // Changed from roomId to room
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      toast({
        title: 'Success',
        description: `Room "${roomName}" created successfully!`,
      });
      setRoomName('');
    } catch (error) {
      console.error('Room creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create room',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inviteUser = async () => {
    if (!inviteEmail.includes('@')) {
      Toast({
        title: 'Error',

        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/liveblocks/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          roomId: roomName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      Toast({
        title: 'Success',
      });
      setInviteEmail('');
    } catch (error) {
      console.error('Invitation error:', error);
      Toast({
        title: 'Error',

        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Room Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Room name"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={createRoom} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Create/Join'}
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Invite by email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={inviteUser} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Invite'}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Online Users ({others.length + 1})</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium">You: {user?.fullName}</span>
              </div>
              {others.map(({ connectionId, presence, info }) => (
                <div key={connectionId} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{info?.name || 'Anonymous'}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomManager;
