import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Platform, Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ConfirmSheet, type Found } from '@/components/ConfirmSheet';
import { IconBtn } from '@/components/IconBtn';
import { IncomingSheet } from '@/components/IncomingSheet';
import { QRCard } from '@/components/QRCard';
import { Radar, type RadarPeer } from '@/components/Radar';
import { Screen } from '@/components/Screen';
import { Sym, type SymName } from '@/components/Sym';
import { useCards } from '@/data/cards';
import { useAddContact } from '@/data/contacts';
import {
  createMyToken,
  parseToken,
  requestExchange,
  respondExchange,
  subscribeIncoming,
  subscribeRequest,
  type IncomingRequest,
} from '@/data/exchange';
import { useNearbyLobby } from '@/data/nearby';
import { isConfigured } from '@/lib/supabase';
import { cardForPeer, INCOMING, NEARBY, signCard, type Card } from '@/services/exchange';
import { contactIdFor, encodeLink, buildPayload, parseLink, verifyPayload } from '@/services/payload';
import { useUserId } from '@/state/auth';
import { useSettings } from '@/state/settings';
import { useUi } from '@/state/ui';
import { colors, fonts } from '@/theme';
import { useAccent } from '@/theme/useAccent';
import type { Contact, ExchangeMethod, Profile } from '@/types';

const METHODS: { id: ExchangeMethod; icon: SymName; label: string }[] = [
  { id: 'qr', icon: 'qr-code-2', label: 'QR' },
  { id: 'tap', icon: 'contactless', label: 'Tap' },
  { id: 'nearby', icon: 'sensors', label: 'Nearby' },
];

const OK = { verified: true, fresh: true };

export default function ExchangeScreen() {
  const router = useRouter();
  const accent = useAccent();
  const params = useLocalSearchParams<{ method?: string }>();
  const userId = useUserId();
  const { byKind } = useCards();
  const active = useUi((s) => s.active);
  const card = byKind[active];
  const defaultMethod = useSettings((s) => s.defaultMethod);
  const presence = useSettings((s) => s.privacy.presence);
  const addContact = useAddContact();

  const initial = (['qr', 'tap', 'nearby'].includes(params.method ?? '') ? params.method : defaultMethod) as ExchangeMethod;
  const [method, setMethod] = useState<ExchangeMethod>(initial);
  const [qrMode, setQrMode] = useState<'show' | 'scan'>('show');

  const [found, setFound] = useState<Found & { sourceUser?: string } | null>(null);
  const [waiting, setWaiting] = useState<{ name: string; hue: number; title: string } | null>(null);
  const [incoming, setIncoming] = useState<IncomingRequest | null>(null);
  const [approving, setApproving] = useState(false);

  // My shareable code: a single-use token (cloud) or a self-signed link (local).
  const [qrValue, setQrValue] = useState<string | null>(null);
  const [myToken, setMyToken] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (isConfigured) {
      if (!card.id) return;
      createMyToken(card, 'qr', 300)
        .then((t) => { if (alive) { setMyToken(t); setQrValue(`xchange://x?t=${encodeURIComponent(t)}`); } })
        .catch((e) => { console.error('[createMyToken] failed:', e?.message ?? e, e); });
    } else {
      buildPayload(card).then((p) => alive && setQrValue(encodeLink(p)));
    }
    return () => { alive = false; };
  }, [card]);

  // Sharer: listen for incoming requests to approve.
  useEffect(() => {
    if (!isConfigured || !userId) return;
    return subscribeIncoming(userId, setIncoming);
  }, [userId]);

  // ── present a found card for confirmation ──
  const presentLocal = useCallback(async (target: Card, m: ExchangeMethod) => {
    const payload = await signCard(target);
    const verification = await verifyPayload(payload, m !== 'qr');
    setFound({ card: payload.p, method: m, verification });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  }, []);

  // ── cloud: claim a token, wait for the sharer to approve ──
  const startRequest = useCallback(
    async (token: string, m: ExchangeMethod) => {
      try {
        const res = await requestExchange(token, card);
        setWaiting({ name: res.name, hue: res.hue, title: res.title });
        const stop = subscribeRequest(res.requestId, (r) => {
          stop();
          setWaiting(null);
          if (r.status === 'approved' && r.sharerCard) {
            setFound({ card: r.sharerCard, method: m, verification: OK, sourceUser: r.sharerCard.user_id });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          } else {
            Alert.alert('Declined', `${res.name} declined the exchange.`);
          }
        });
      } catch (e) {
        Alert.alert('Could not connect', e instanceof Error ? e.message : 'Try again.');
      }
    },
    [card],
  );

  const onScanData = useCallback(
    (data: string) => {
      if (isConfigured) {
        const token = parseToken(data);
        if (token) startRequest(token, 'qr');
      } else {
        const payload = parseLink(data);
        if (payload) presentLocal(payload.p, 'qr');
      }
    },
    [isConfigured, startRequest, presentLocal],
  );

  // ── sharer approves / declines ──
  const approve = async (ok: boolean) => {
    if (!incoming) return;
    setApproving(true);
    try {
      await respondExchange(incoming.id, ok);
      setIncoming(null);
      if (ok) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setApproving(false);
    }
  };

  // ── requester saves the received card with context ──
  const onSave = async (met: string, note: string) => {
    if (!found) return;
    const c = found.card;
    const id = await contactIdFor(c);
    const contact: Contact = {
      id, name: c.name, handle: c.handle, title: c.title, company: c.company,
      phone: c.phone, email: c.email, website: c.website, socials: c.socials,
      hue: c.hue, tagline: c.tagline, met, when: 'Now', note, fav: false,
      method: found.method, metAt: Date.now(), verified: found.verification.verified,
      sourceUser: found.sourceUser,
    };
    await addContact(contact);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setFound(null);
    router.replace('/people');
  };

  // ── nearby peers ──
  const lobby = useNearbyLobby(
    isConfigured && presence && myToken && userId
      ? { userId, name: card.name, hue: card.hue, title: card.title, token: myToken }
      : null,
  );
  const radarPeers: RadarPeer[] = isConfigured
    ? lobby.map((p) => ({ id: p.id, name: p.name, hue: p.hue, token: p.token }))
    : NEARBY.map((p) => ({ id: p.id, name: p.name, hue: p.hue, angle: p.angle, dist: p.dist }));

  const onConnectPeer = (peer: RadarPeer) => {
    if (isConfigured) {
      if (peer.token) startRequest(peer.token, 'nearby');
    } else {
      const fixture = NEARBY.find((p) => p.id === peer.id);
      if (fixture) presentLocal(cardForPeer(fixture), 'nearby');
    }
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flex: 1, backgroundColor: colors.scrimDark }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6 }}>
          <IconBtn icon="close" onPress={() => router.back()} />
          <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.text }}>Exchange</Text>
          <IconBtn icon="help" ghost color={colors.faint} size={20} />
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          {method === 'qr' ? (
            <QrMode card={card} value={qrValue} mode={qrMode} setMode={setQrMode} onScan={onScanData} demoFound={!isConfigured ? () => presentLocal(INCOMING, 'qr') : undefined} />
          ) : method === 'tap' ? (
            <TapMode demoFound={!isConfigured ? () => presentLocal(INCOMING, 'tap') : undefined} />
          ) : method === 'nearby' && isConfigured && !presence ? (
            <NearbyDisabled onOpen={() => router.push('/profile')} />
          ) : (
            <Radar peers={radarPeers} onConnect={onConnectPeer} />
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 26 }}>
          <View style={{ flexDirection: 'row', gap: 6, backgroundColor: colors.s1, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 6 }}>
            {METHODS.map((m) => {
              const on = method === m.id;
              return (
                <Pressable key={m.id} onPress={() => { setMethod(m.id); setQrMode('show'); }} style={{ flex: 1, alignItems: 'center', gap: 5, paddingVertical: 11, borderRadius: 13, backgroundColor: on ? accent.soft : 'transparent' }}>
                  <Sym name={m.icon} size={24} color={on ? accent.base : colors.dim} />
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12.5, color: on ? accent.base : colors.dim }}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* requester: waiting for approval */}
      <WaitingOverlay waiting={waiting} onCancel={() => setWaiting(null)} />

      {/* requester: confirm & save the received card */}
      <ConfirmSheet found={found} onCancel={() => setFound(null)} onSave={onSave} />

      {/* sharer: approve an incoming request */}
      <IncomingSheet request={incoming} busy={approving} onApprove={() => approve(true)} onDecline={() => approve(false)} />
    </Screen>
  );
}

// ── QR mode ───────────────────────────────────────────
function QrMode({
  card, value, mode, setMode, onScan, demoFound,
}: {
  card: Profile;
  value: string | null;
  mode: 'show' | 'scan';
  setMode: (m: 'show' | 'scan') => void;
  onScan: (data: string) => void;
  demoFound?: () => void;
}) {
  const accent = useAccent();
  const [permission, requestPermission] = useCameraPermissions();
  const last = useRef('');

  // Local demo: auto-find a contact a moment after opening the scanner.
  useEffect(() => {
    if (mode !== 'scan' || !demoFound) return;
    const t = setTimeout(demoFound, 2400);
    return () => clearTimeout(t);
  }, [mode, demoFound]);

  if (mode === 'scan') {
    return (
      <View style={{ width: '100%', alignItems: 'center' }}>
        <View style={{ width: 252, height: 252, borderRadius: 28, overflow: 'hidden', backgroundColor: '#16181e' }}>
          {permission?.granted ? (
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => {
                if (data === last.current) return;
                last.current = data;
                onScan(data);
                setTimeout(() => (last.current = ''), 1500);
              }}
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <Text style={{ color: colors.dim, fontFamily: fonts.body, textAlign: 'center', marginBottom: 12 }}>Camera access is needed to scan.</Text>
              <Pressable onPress={requestPermission}><Text style={{ color: accent.base, fontFamily: fonts.bodyBold }}>Grant access</Text></Pressable>
            </View>
          )}
          {permission?.granted ? (
            <View pointerEvents="none" style={{ position: 'absolute', top: 18, left: 18, right: 18, bottom: 18 }}>
              <Corner s={{ top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 }} c={accent.base} />
              <Corner s={{ top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 }} c={accent.base} />
              <Corner s={{ bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 }} c={accent.base} />
              <Corner s={{ bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 }} c={accent.base} />
            </View>
          ) : null}
        </View>
        <Text style={{ fontFamily: fonts.bodyBold, fontSize: 17, color: colors.text, marginTop: 26 }}>Point at their QR</Text>
        <Button variant="ghost" icon="qr-code-2" label="Show my code" compact style={{ marginTop: 22 }} onPress={() => setMode('show')} />
      </View>
    );
  }

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 28, padding: 18 }}>
        <QRCard value={value} size={224} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 22 }}>
        <Avatar name={card.name} hue={card.hue} size={38} />
        <View>
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text }}>{card.name}</Text>
          <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 13 }}>{card.handle} · sharing {card.label}</Text>
        </View>
      </View>
      <Button variant="ghost" icon="photo-camera" label="Scan instead" compact style={{ marginTop: 22 }} onPress={() => setMode('scan')} />
    </View>
  );
}

function Corner({ s, c }: { s: object; c: string }) {
  return <View style={[{ position: 'absolute', width: 30, height: 30, borderColor: c }, s]} />;
}

// ── Tap mode ──────────────────────────────────────────
function TapMode({ demoFound }: { demoFound?: () => void }) {
  const accent = useAccent();
  useEffect(() => {
    if (!demoFound) return;
    const t = setTimeout(demoFound, 2600);
    return () => clearTimeout(t);
  }, [demoFound]);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
        {[0, 1, 2].map((i) => <PulseRing key={i} delay={i * 800} color={accent.line} />)}
        <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: accent.soft, borderWidth: 1, borderColor: accent.line, alignItems: 'center', justifyContent: 'center' }}>
          <Sym name="contactless" size={62} color={accent.base} />
        </View>
      </View>
      <View style={{ marginTop: 30, alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.text }}>Hold phones together</Text>
        <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 14.5, marginTop: 6, textAlign: 'center', maxWidth: 260 }}>
          {demoFound ? "Touch the backs of your phones. We'll do the rest." : 'NFC tap needs a dev build — use QR or Nearby for now.'}
        </Text>
      </View>
    </View>
  );
}

function PulseRing({ delay, color }: { delay: number; color: string }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    // react-native-web doesn't loop with the native driver — drive on JS on web.
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 2400, delay, easing: Easing.out(Easing.ease), useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [v, delay]);
  return (
    <Animated.View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 1.5, borderColor: color, opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }) }] }} />
  );
}

function NearbyDisabled({ onOpen }: { onOpen: () => void }) {
  return (
    <View style={{ alignItems: 'center', gap: 16, paddingHorizontal: 10 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.s2, alignItems: 'center', justifyContent: 'center' }}>
        <Sym name="sensors-off" size={26} color={colors.dim} />
      </View>
      <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.text }}>Nearby is off</Text>
      <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
        Turn on “Discoverable on Nearby” so people around you can find your card. You're only visible while this screen is open.
      </Text>
      <Button label="Open Privacy settings" icon="sensors" compact onPress={onOpen} />
    </View>
  );
}

// ── requester waiting overlay ──
function WaitingOverlay({ waiting, onCancel }: { waiting: { name: string; hue: number; title: string } | null; onCancel: () => void }) {
  if (!waiting) return null;
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.scrimDark, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
      <Avatar name={waiting.name} hue={waiting.hue} size={84} ring />
      <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text, marginTop: 16 }}>Waiting for {waiting.name.split(' ')[0]}…</Text>
      <Text style={{ color: colors.dim, fontFamily: fonts.body, fontSize: 14, marginTop: 6, textAlign: 'center' }}>They need to approve the exchange on their phone.</Text>
      <Button label="Cancel" variant="ghost" compact style={{ marginTop: 22 }} onPress={onCancel} />
    </View>
  );
}
