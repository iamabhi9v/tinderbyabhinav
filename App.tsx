import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Line, Polygon, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

// --- ICONS (React Native SVG) ---
const IconFlame = ({ size = 24, color = '#000' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path
      d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.3.5.8 1.8 2.9 2.8z"
      fill={color}
      stroke="none"
    />
  </Svg>
);
const IconStar = ({ size = 24, color = '#000', fill = 'none' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill={fill}
    />
  </Svg>
);
const IconX = ({ size = 24, color = '#000' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={4}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);
const IconHeart = ({ size = 24, color = '#000', fill = 'none' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={fill}
    />
  </Svg>
);
const IconRewind = ({ size = 24, color = '#000' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M1 4v6h6" />
    <Path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </Svg>
);
const IconMapPin = ({ size = 16, color = '#fff' }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);

// --- DATA TYPES ---
type Profile = {
  id: string;
  name: string;
  age: number;
  distance: number;
  images: string[];
  bio: string;
  isOnline: boolean;
  // Legacy support for fallback
  image?: string;
};

// History Item to track swipes for Rewind
type HistoryItem = {
  profile: Profile;
  action: 'left' | 'right';
};

const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: 'Esther',
    age: 30,
    distance: 24,
    images: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515041219749-89347f83291a?q=80&w=1000&auto=format&fit=crop',
    ],
    bio: 'Fitness enthusiast',
    isOnline: true,
  },
  {
    id: '2',
    name: 'Sarah',
    age: 24,
    distance: 12,
    images: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515041219749-89347f83291a?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1000&auto=format&fit=crop',
    ],
    bio: 'Adventure time!',
    isOnline: false,
  },
  {
    id: '3',
    name: 'Jessica',
    age: 28,
    distance: 5,
    images: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485217988980-11786ced9454?q=80&w=1000&auto=format&fit=crop',
    ],
    bio: 'Coffee addict',
    isOnline: true,
  },
  {
    id: '4',
    name: 'Emily',
    age: 26,
    distance: 30,
    images: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop',
    ],
    bio: 'Designer life',
    isOnline: false,
  },
];

// --- ATOMIC COMPONENTS ---

const ActionButton = ({ onPress, icon, color, size = 60 }: any) => (
  <TouchableOpacity
    activeOpacity={0.75}
    onPress={onPress}
    style={[
      styles.actionButton,
      { width: size, height: size, borderColor: color },
    ]}
  >
    {icon}
  </TouchableOpacity>
);

const OnlineBadge = ({ isOnline }: { isOnline: boolean }) => {
  if (!isOnline) return null;
  return (
    <View style={styles.onlineBadge}>
      <Text style={styles.onlineText}>ONLINE</Text>
    </View>
  );
};

const ProfileOverlay = ({ profile }: { profile: Profile }) => (
  <View style={styles.overlayContainer}>
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)', 'black']}
      style={styles.gradientOverlay}
    />
    <View style={styles.overlayContent}>
      <View style={styles.nameRow}>
        <Text style={styles.nameText}>{profile.name}</Text>
        <Text style={styles.ageText}>{profile.age}</Text>
      </View>
      <View style={styles.locationRow}>
        <IconMapPin size={14} color="#fff" />
        <Text style={styles.locationText}>{profile.distance} km away</Text>
      </View>
    </View>
  </View>
);

const Stamp = ({ type, opacity }: { type: 'LIKE' | 'NOPE'; opacity: any }) => {
  const isLike = type === 'LIKE';
  const color = isLike ? '#4ade80' : '#ef4444';
  return (
    <Animated.View
      style={[
        styles.stampContainer,
        {
          opacity,
          borderColor: color,
          transform: [{ rotate: isLike ? '-15deg' : '15deg' }],
          left: isLike ? 40 : undefined,
          right: !isLike ? 40 : undefined,
        },
      ]}
    >
      <Text style={[styles.stampText, { color }]}>{type}</Text>
    </Animated.View>
  );
};

// --- PHOTO PAGINATION ---
const PhotoPagination = ({
  count,
  currentIndex,
}: {
  count: number;
  currentIndex: number;
}) => {
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.paginationBar,
            {
              backgroundColor:
                i === currentIndex ? '#fff' : 'rgba(255,255,255,0.3)',
            },
          ]}
        />
      ))}
    </View>
  );
};

// --- CARD ORGANISM ---
const Card = ({
  profile,
  panHandlers,
  style,
  renderStamps,
  likeOpacity,
  nopeOpacity,
  isTopCard,
}: any) => {
  const [imageIndex, setImageIndex] = useState(0);

  // FIX: Safety Check for images
  // If 'profile.images' is undefined (old state), fall back to [profile.image]
  const images =
    profile.images && profile.images.length > 0
      ? profile.images
      : [profile.image || 'https://via.placeholder.com/400'];

  const handleNextImage = () => {
    if (imageIndex < images.length - 1) {
      setImageIndex(prev => prev + 1);
    }
  };

  const handlePrevImage = () => {
    if (imageIndex > 0) {
      setImageIndex(prev => prev - 1);
    }
  };

  return (
    <Animated.View style={[styles.card, style]} {...panHandlers}>
      {/* Image Display */}
      <Image source={{ uri: images[imageIndex] }} style={styles.cardImage} />

      {/* Pagination Bars */}
      <PhotoPagination count={images.length} currentIndex={imageIndex} />

      {/* Touch Zones - Active only on Top Card */}
      {isTopCard && (
        <View style={styles.touchOverlay}>
          <Pressable style={styles.leftTouch} onPress={handlePrevImage} />
          <Pressable style={styles.rightTouch} onPress={handleNextImage} />
        </View>
      )}

      <OnlineBadge isOnline={profile.isOnline} />

      {renderStamps && (
        <>
          <Stamp type="LIKE" opacity={likeOpacity} />
          <Stamp type="NOPE" opacity={nopeOpacity} />
        </>
      )}
      <ProfileOverlay profile={profile} />
    </Animated.View>
  );
};

// --- MAIN APP ---
export default function App() {
  const [deck, setDeck] = useState<Profile[]>(MOCK_PROFILES);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'match' | 'liked'>('match');
  const [likedList, setLikedList] = useState<Profile[]>([]);

  // Refs for Animation & Logic
  const position = useRef(new Animated.ValueXY()).current;
  const isSwiping = useRef(false);
  const deckRef = useRef(deck);

  useEffect(() => {
    deckRef.current = deck;
  }, [deck]);

  const panResponder = useRef(
    PanResponder.create({
      // Allow child touches (pressable images) to claim responder first
      onStartShouldSetPanResponder: () => false,

      // Claim responder only if the gesture is a Swipe (movement > 10)
      onMoveShouldSetPanResponder: (_, gesture) => {
        return Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10;
      },

      onPanResponderMove: (_, gesture) => {
        if (isSwiping.current) return;
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (isSwiping.current) return;
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    }),
  ).current;

  const forceSwipe = (direction: 'right' | 'left') => {
    if (isSwiping.current) return;
    isSwiping.current = true;

    const x = direction === 'right' ? width + 100 : -width - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const currentDeck = deckRef.current;

    if (currentDeck.length === 0) {
      isSwiping.current = false;
      return;
    }

    const item = currentDeck[currentDeck.length - 1];
    const remaining = currentDeck.slice(0, currentDeck.length - 1);

    setDeck(remaining);
    setHistory(prev => [...prev, { profile: item, action: direction }]);
    position.setValue({ x: 0, y: 0 });

    if (direction === 'right') {
      setLikedList(prev => {
        if (prev.find(p => p.id === item.id)) return prev;
        return [item, ...prev];
      });
    }

    isSwiping.current = false;
  };

  const handleRewind = () => {
    if (history.length === 0) return;
    const lastItem = history[history.length - 1];
    if (lastItem.action === 'right') return;

    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    setDeck(prev => [...prev, lastItem.profile]);
  };

  const handleStartOver = () => {
    setDeck(MOCK_PROFILES);
    setHistory([]);
    setLikedList([]);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false,
    }).start();
  };

  // Interpolations
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });
  const likeOpacity = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const nopeOpacity = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const nextCardOpacity = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.96, 1],
    extrapolate: 'clamp',
  });
  const nextCardScale = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.96, 1],
    extrapolate: 'clamp',
  });

  const renderCards = () => {
    if (deck.length === 0)
      return (
        <View style={styles.noMoreCards}>
          <IconFlame size={60} color="#ff4458" />
          <Text style={styles.noMoreText}>No more profiles</Text>
          <TouchableOpacity onPress={handleStartOver} style={styles.refreshBtn}>
            <Text style={styles.refreshBtnText}>Start Again</Text>
          </TouchableOpacity>
        </View>
      );

    return deck.map((item, index) => {
      const isTopCard = index === deck.length - 1;
      const isNextCard = index === deck.length - 2;

      if (!isTopCard && !isNextCard) return null;

      if (isTopCard) {
        return (
          <Card
            key={item.id}
            profile={item}
            panHandlers={panResponder.panHandlers}
            renderStamps={true}
            likeOpacity={likeOpacity}
            nopeOpacity={nopeOpacity}
            isTopCard={true}
            style={{
              zIndex: 10,
              transform: [
                { rotate: rotate },
                ...position.getTranslateTransform(),
              ],
            }}
          />
        );
      }
      return (
        <Card
          key={item.id}
          profile={item}
          isTopCard={false}
          style={{
            zIndex: 0,
            opacity: nextCardOpacity,
            transform: [{ scale: nextCardScale }],
          }}
        />
      );
    });
  };

  const canRewind =
    history.length > 0 && history[history.length - 1].action === 'left';
  const rewindColor = canRewind ? '#f59e0b' : '#d1d5db';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {activeTab === 'match' && (
        <View style={styles.header}>
          <IconFlame size={35} color="#ff4458" />
          <Text style={styles.headerLogoText}>tinder</Text>
        </View>
      )}
      <View style={styles.container}>
        {activeTab === 'match' ? (
          <View style={styles.cardStack}>{renderCards()}</View>
        ) : (
          <View style={styles.likedContainer}>
            <Text style={styles.headerTitle}>Liked Opponents</Text>
            <View style={styles.grid}>
              {likedList.map((p, index) => {
                // FIX: Ensure we have an image to show
                const thumb = (p.images && p.images[0]) || p.image || '';
                return (
                  <View key={`${p.id}_${index}`} style={styles.gridItem}>
                    <Image source={{ uri: thumb }} style={styles.gridImage} />
                    <View style={styles.gridOverlay}>
                      <Text style={styles.gridName}>{p.name}</Text>
                    </View>
                  </View>
                );
              })}
              {likedList.length === 0 && (
                <Text style={styles.emptyText}>No likes yet.</Text>
              )}
            </View>
          </View>
        )}
      </View>
      {activeTab === 'match' && deck.length > 0 && (
        <View style={styles.actionRow}>
          <View style={{ top: 7 }}>
            <ActionButton
              icon={<IconRewind size={28} color={rewindColor} />}
              color={rewindColor}
              size={50}
              onPress={canRewind ? handleRewind : undefined}
            />
          </View>
          <ActionButton
            icon={<IconX size={40} color="#ef4444" />}
            color="#ef4444"
            size={65}
            onPress={() => forceSwipe('left')}
          />
          <ActionButton
            icon={<IconHeart size={36} color="#22c55e" fill="#22c55e" />}
            color="#22c55e"
            size={65}
            onPress={() => forceSwipe('right')}
          />
        </View>
      )}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => setActiveTab('match')}
          style={styles.navItem}
        >
          <IconFlame
            size={32}
            color={activeTab === 'match' ? '#ff4458' : '#d1d5db'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('liked')}
          style={styles.navItem}
        >
          <IconStar
            size={28}
            color={activeTab === 'liked' ? '#fbbf24' : '#d1d5db'}
            fill={activeTab === 'liked' ? '#fbbf24' : 'none'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  headerLogoText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#ff4458',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  container: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  cardStack: { flex: 1, position: 'relative', marginBottom: 20 },
  noMoreCards: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noMoreText: { fontSize: 20, color: '#333', fontWeight: '600', marginTop: 20 },
  refreshBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ff4458',
  },
  refreshBtnText: { color: '#ff4458', fontWeight: 'bold' },
  card: {
    position: 'absolute',
    height: '95%',
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: { flex: 1, resizeMode: 'cover' },

  // --- PAGINATION STYLES ---
  paginationContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    height: 4,
    zIndex: 20,
  },
  paginationBar: {
    flex: 1,
    borderRadius: 2,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // --- TOUCH ZONES STYLES ---
  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 15,
  },
  leftTouch: {
    flex: 1,
  },
  rightTouch: {
    flex: 1,
  },

  onlineBadge: {
    position: 'absolute',
    bottom: 120,
    left: 15,
    backgroundColor: '#dffbe2',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dffbe2',
    zIndex: 999,
  },
  onlineText: {
    color: '#285c44',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    justifyContent: 'flex-end',
    padding: 20,
    zIndex: 20,
    pointerEvents: 'none',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContent: { marginBottom: 30 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  nameText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  ageText: { fontSize: 24, color: 'white', fontWeight: 'normal' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '500',
  },
  stampContainer: {
    position: 'absolute',
    top: 50,
    borderWidth: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 999,
  },
  stampText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
    gap: 20,
    position: 'absolute',
    bottom: 72,
    zIndex: 999,
    elevation: 5,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 60,
    alignSelf: 'center',
    bottom: 20,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 10 },
  navLabel: {
    position: 'absolute',
    bottom: -5,
    fontSize: 10,
    color: '#ff4458',
    fontWeight: 'bold',
  },
  likedContainer: { flex: 1 },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    paddingHorizontal: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    aspectRatio: 0.75,
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gridImage: { width: '100%', height: '100%' },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  gridName: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  emptyText: {
    textAlign: 'center',
    width: '100%',
    marginTop: 50,
    color: '#999',
    fontSize: 16,
  },
});
