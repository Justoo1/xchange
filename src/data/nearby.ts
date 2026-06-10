import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

/** A discoverable person in the Nearby lobby (cloud mode). */
export interface LobbyPeer {
  id: string;
  name: string;
  hue: number;
  title: string;
  /** The peer's single-use token to claim via requestExchange. */
  token: string;
}

export interface MyPresence {
  userId: string;
  name: string;
  hue: number;
  title: string;
  token: string;
}

/**
 * Realtime presence lobby for Nearby. Discoverable users (Privacy → presence)
 * broadcast a minimal card + a fresh single-use token; everyone sees everyone in
 * the lobby. A real deployment would scope the channel by coarse geohash; here
 * it's one shared room. Presence is ephemeral — you vanish when the sheet closes.
 */
export function useNearbyLobby(me: MyPresence | null): LobbyPeer[] {
  const [peers, setPeers] = useState<LobbyPeer[]>([]);

  useEffect(() => {
    if (!supabase || !me) {
      setPeers([]);
      return;
    }
    const channel = supabase.channel('nearby-lobby', { config: { presence: { key: me.userId } } });

    const sync = () => {
      const state = channel.presenceState<{ peer: LobbyPeer }>();
      const list: LobbyPeer[] = [];
      Object.entries(state).forEach(([key, metas]) => {
        if (key === me.userId) return; // skip self
        const meta = metas[0];
        if (meta?.peer) list.push(meta.peer);
      });
      setPeers(list);
    };

    channel
      .on('presence', { event: 'sync' }, sync)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            peer: { id: me.userId, name: me.name, hue: me.hue, title: me.title, token: me.token },
          });
        }
      });

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [me?.userId, me?.token, me?.name, me?.hue, me?.title]);

  return peers;
}
