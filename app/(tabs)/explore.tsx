import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { FontAwesome } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const playlist = [
  {
    title: "Bài 1",
    uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    image: "https://picsum.photos/seed/song1/400/400",
  },
  {
    title: "Bài 2",
    uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    image: "https://picsum.photos/seed/song2/400/400",
  },
  {
    title: "Bài 3",
    uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    image: "https://picsum.photos/seed/song3/400/400",
  },
];

const ExploreScreen = () => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<Audio.AVPlaybackStatus | null>(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const insets = useSafeAreaInsets(); // 👈 lấy khoảng cách an toàn

  useEffect(() => {
    loadTrack(currentTrack);
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
    };
  }, [currentTrack]);

  const loadTrack = async (index: number) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: playlist[index].uri },
      { shouldPlay: true },
      (s) => setStatus(s)
    );

    soundRef.current = sound;
    setIsPlaying(true);
  };

  const handlePlayPause = async () => {
    if (!soundRef.current) return;

    const currentStatus = await soundRef.current.getStatusAsync();

    if (currentStatus.isLoaded) {
      if (currentStatus.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleNext = () => {
    if (currentTrack < playlist.length - 1) {
      setCurrentTrack(currentTrack + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTrack > 0) {
      setCurrentTrack(currentTrack - 1);
    }
  };

  const handleSeek = async (value: number) => {
    if (soundRef.current && status?.isLoaded) {
      await soundRef.current.setPositionAsync(value);
    }
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <ImageBackground
      source={{ uri: playlist[currentTrack].image }}
      style={styles.background}
    >
      <BlurView
        intensity={30}
        style={[styles.blurContainer, { paddingBottom: insets.bottom + 20 }]} // 👈 không che tab bar
      >
        <Image
          source={{ uri: playlist[currentTrack].image }}
          style={styles.image}
          resizeMode="cover"
        />

        <Text style={styles.title}>{playlist[currentTrack].title}</Text>

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={status?.isLoaded ? status.durationMillis || 1 : 1}
          value={status?.isLoaded ? status.positionMillis : 0}
          onSlidingComplete={handleSeek}
          minimumTrackTintColor="#1EB1FC"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#1EB1FC"
        />

        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {formatTime(status?.positionMillis || 0)}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(status?.durationMillis || 0)}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePrevious}>
            <FontAwesome name="backward" size={36} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn}>
            <FontAwesome
              name={isPlaying ? "pause" : "play"}
              size={40}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext}>
            <FontAwesome name="forward" size={36} color="white" />
          </TouchableOpacity>
        </View>
      </BlurView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
  },
  blurContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    justifyContent: "center",
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 16,
    alignSelf: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#fff",
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeText: {
    color: "#eee",
    fontSize: 14,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    alignItems: "center",
  },
  playBtn: {
    paddingHorizontal: 30,
  },
});

export default ExploreScreen;
