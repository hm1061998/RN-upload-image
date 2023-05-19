import React, { useMemo } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import FastImage from "react-native-fast-image";
import ImageViewer from "../ImageViewer";
import Icon from "../Icon";
// import Lightbox from 'react-native-lightbox-v2';

const Index = ({ data, onDelete, sizeImage, convertLinkImg, disabled }) => {
  const renderImage = useMemo(() => {
    return (
      <TouchableOpacity
        disabled={!data || disabled}
        onPress={() => {
          imgViewerRef.current.show([{ uri: data?.path || data?.uri }]);
        }}
      >
        <FastImage
          style={[styles.img, { width: sizeImage, height: sizeImage }]}
          source={{
            uri: data?.path || convertLinkImg(data?.uri),
          }}
        />
      </TouchableOpacity>
    );
  }, [data, sizeImage, disabled]);
  // console.log('render', getLinkImg(data?.path));
  return (
    <View style={[styles.boxImage, { width: sizeImage, height: sizeImage }]}>
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
          <Icon typr="Entypo" name="warning" size={20} color="red" />
        </View>
      ) : null}
      {renderImage}
      <ImageViewer ref={imgViewerRef} convertLinkImg={convertLinkImg} />
    </View>
  );
};

const styles = StyleSheet.create({
  boxImage: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 10,
    backgroundColor: "#F9F9F9",
    position: "relative",
  },
  img: {
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
});

export default React.memo(Index);
