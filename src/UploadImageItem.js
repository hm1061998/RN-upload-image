import React, { useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "./components/Icon";
import FastImage from "react-native-fast-image";
import ImageViewer from "./components/ImageViewer";

const Index = ({ data, onDelete, disabled, convertLinkImg }) => {
  const imgViewerRef = useRef();
  const renderImage = useMemo(() => {
    return (
      <TouchableOpacity
        onPress={() => {
          imgViewerRef.current.show([{ uri: data?.path || data.uri }]);
        }}
      >
        <FastImage
          style={[styles.img]}
          source={{
            uri: data?.path || convertLinkImg(data?.uri),
          }}
        />
      </TouchableOpacity>
    );
  }, [data]);
  // console.log('render', getLinkImg(data?.path));
  return (
    <View style={[styles.boxImage]}>
      {data?.status !== "uploading" && !disabled && (
        <TouchableOpacity
          style={styles.delete}
          onPress={() => {
            if (onDelete) {
              onDelete(data);
            }
          }}
        >
          <Icon type="Ionicons" name="close-outline" size={13} color="#fff" />
        </TouchableOpacity>
      )}
      {data?.status === "uploading" ? (
        <View style={[styles.containerLoading]}>
          <ActivityIndicator size="small" color="blue" />
        </View>
      ) : null}
      {data?.status === "failed" ? (
        <View style={[styles.containerLoading]}>
          <Icon type="Entypo" name="warning" size={20} color="red" />
        </View>
      ) : null}
      {renderImage}
      <ImageViewer ref={imgViewerRef} convertLinkImg={convertLinkImg} />
    </View>
  );
};

const styles = StyleSheet.create({
  imageActive: {
    flex: 1,
    resizeMode: "contain",
    zIndex: 10,
  },
  boxImage: {
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    marginRight: 8,
    marginBottom: 10,
    backgroundColor: "#F9F9F9",
    position: "relative",
  },
  img: {
    width: 60,
    height: 60,
    borderRadius: 4,
    borderWidth: 0.7,
    borderColor: "#c7cad9",
  },
  containerLoading: {
    position: "absolute",
    zIndex: 10,
    backgroundColor: "#ffffffa6",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: "blue",
  },
  delete: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    backgroundColor: "gray",
    borderRadius: 100,
    zIndex: 11,
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayVideo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#00000063",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
});
export default React.memo(Index);
