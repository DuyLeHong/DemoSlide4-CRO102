import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from "react-native";
import { Audio } from "expo-av";
import Slider from "@react-native-community/slider";
import { FontAwesome } from "@expo/vector-icons";

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
    <View style={styles.container}>
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
        <Text>{formatTime(status?.positionMillis || 0)}</Text>
        <Text>{formatTime(status?.durationMillis || 0)}</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePrevious}>
          <FontAwesome name="backward" size={36} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn}>
          <FontAwesome name={isPlaying ? "pause" : "play"} size={40} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext}>
          <FontAwesome name="forward" size={36} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: Dimensions.get("window").width - 40,
    height: 300,
    borderRadius: 16,
    marginBottom: 30,
    alignSelf: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40,
    alignItems: "center",
  },
  playBtn: {
    paddingHorizontal: 30,
  },
});

export default ExploreScreen;
