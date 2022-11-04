import React, { useImperativeHandle, forwardRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  StyleSheet,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import Icon from "./Icon";
import ProgressiveImage from "./ProgressiveImage";

const ImageView = ({ convertLinkImg }, ref) => {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [images, setImage] = useState([]);

  useImperativeHandle(ref, () => ({
    show: (imgs, indx) => {
      const newImages = imgs.map((item) => {
        const getImg = item.file || item.uri;
        const newItem = {
          url: convertLinkImg(getImg),
        };
        if (!getImg) {
          newItem.props = {
            source: item,
          };
        }
        return newItem;
      });

      setImage(newImages);
      setIndex(indx || 0);
      setVisible(true);
    },
  }));

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      onRequestClose={() => setVisible(false)}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ImageViewer
          imageUrls={images}
          saveToLocalByLongPress={false}
          enablePreload
          index={index}
          onSwipeDown={() => {
            setVisible(false);
          }}
          renderImage={(props) => <ProgressiveImage {...props} />}
          enableSwipeDown
          useNativeDriver
          loadingRender={() => <ActivityIndicator color="#fff" />}
          renderHeader={() => (
            <TouchableOpacity
              style={styles.header}
              onPress={() => {
                setVisible(false);
              }}
            >
              <Icon
                type="AntDesign"
                name="arrowleft"
                size={24}
                color={"#fff"}
              />
            </TouchableOpacity>
          )}
          renderIndicator={(currentIndex, allSize) => {
            if (allSize > 1) {
              // console.log('currentIndex', currentIndex);

              return (
                <View style={styles.indicator}>
                  {new Array(allSize).fill(0).map((item, index) => (
                    <View
                      key={`${index}`}
                      style={[
                        styles.indicatorItem,
                        {
                          backgroundColor:
                            currentIndex === index + 1 ? "blue" : "#fff",
                        },
                      ]}
                    />
                  ))}
                </View>
              );
            }
            return null;
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 40,
  },
  header: {
    position: "absolute",
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  indicator: {
    position: "absolute",
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    bottom: 40,
  },
  indicatorItem: {
    width: 10,
    height: 10,
    marginHorizontal: 5,
    borderRadius: 999,
    borderWidth: 0.7,
    borderColor: "white",
  },
});
export default forwardRef(ImageView);
