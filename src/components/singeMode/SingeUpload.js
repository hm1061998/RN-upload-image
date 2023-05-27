import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
} from "react";
import UploadImageItem from "./UploadImageItem";
import { TouchableOpacity, Platform, View, Text } from "react-native";
import PropTypes from "prop-types";
import uuid from "react-native-uuid";
import Icon from "../Icon";
// import * as ImageManipulator from 'expo-image-manipulator';
import MultipleImagePicker from "@baronha/react-native-multiple-image-picker";

const SingeUpload = ({
  configOption,
  configUrl,
  value,
  onChange,
  mediaType,
  onStartUpload,
  onEndUpload,
  sizeImage,
  icon,
  shape,
  convertLinkImg,
}) => {
  const [dataImage, setDataImage] = useState(value);

  useEffect(() => {
    setDataImage(value);
  }, [value]);

  // console.log({ value });

  const openPicker = useCallback(async () => {
    try {
      const options = {
        usedCameraButton: true,
        singleSelectedMode: true,
        doneTitle: "Xong",
        cancelTitle: "Hủy",
        maximumMessageTitle: "Thông báo",
        tapHereToChange: "Chạm vào đây để thay đổi",
        maximumMessage: "Bạn đã chọn số lượng phương tiện tối đa được phép",
        isPreview: true,
        mediaType,
      };

      const response = await MultipleImagePicker.openPicker(options);

      const check = response?.path?.match(/:/);
      let uriImage = response?.path;
      if (!check) {
        uriImage = `file://${uriImage}`;
      }

      const newItem = {
        id: uuid.v4(),
        localIdentifier: response?.localIdentifier,
        status: "uploading",
        path: uriImage,
        name: response?.fileName,
        type: response?.mime,
      };

      onStartUpload?.();
      setDataImage(newItem);
      uploadImage(newItem);
    } catch (e) {
      // console.log(e.code, e.message);
    }
  }, [mediaType, onStartUpload, uploadImage]);

  const createFormData = (photo, body = {}) => {
    const data = new FormData();
    data.append("file", {
      name: photo.name,
      type: photo.type,
      uri:
        Platform.OS === "ios" ? photo.path.replace("file://", "") : photo.path,
    });

    Object.keys(body).forEach((key) => {
      data.append(key, body[key]);
    });

    return data;
  };

  const uploadImage = useCallback(
    async (file) => {
      const fd = createFormData(file);
      // fd.append('file', file);
      const options = {
        ...configOption,
        body: fd,
      };

      // console.log('fd', fd);
      let newData;
      try {
        const response = await fetch(configUrl, options).then((_response) => {
          return _response.json();
        });

        // console.log({ response });

        if (response?.filename) {
          newData = {
            id: file.id,
            localIdentifier: file.localIdentifier,
            name: response?.filename,
            uri: response.path,
            type: response?.mimetype,
            status: "done",
          };
        } else {
          // Alert.alert('upload error:' + JSON.stringify(response));
          newData = {
            ...file,
            status: "failed",
          };
        }
      } catch (e) {
        newData = {
          ...file,
          status: "failed",
        };
      } finally {
        onChange?.(newData);
        onEndUpload?.(newData);

        setDataImage(newData);
      }
    },
    [configOption, configUrl, onChange, onEndUpload]
  );

  const renderData = useMemo(
    () => (
      <>
        {dataImage && (
          <UploadImageItem
            data={dataImage}
            sizeImage={sizeImage}
            convertLinkImg={convertLinkImg}
            onDelete={() => {
              setDataImage(null);
              onChange?.(null);
            }}
          />
        )}

        {!dataImage && (
          <TouchableOpacity activeOpacity={0.5} onPress={() => openPicker()}>
            <View
              style={[
                {
                  borderRadius: shape === "square" ? 4 : 9999,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F9F9F9",
                  borderWidth: 0.7,
                  borderColor: "#CACACA",
                  borderStyle: "dashed",
                  width: sizeImage,
                  height: sizeImage,
                },
              ]}
            >
              {icon ? (
                icon()
              ) : (
                <Icon type="FontAwesome" name="user" size={50} color={"gray"} />
              )}
            </View>

            <Text style={{ marginTop: 8, fontSize: 14, fontWeight: "500" }}>
              Thêm ảnh đại diện
            </Text>
          </TouchableOpacity>
        )}
      </>
    ),

    [dataImage, sizeImage, shape, icon, onChange, openPicker, convertLinkImg]
  );

  return renderData;
};

SingeUpload.defaultProps = {
  configOption: {
    headers: {
      "x-auth-key":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYmFuaGFuZyIsInVzZXJJZCI6IjE4OCIsInVzZXJHcm91cHNJZCI6IjIiLCJpYXQiOjE2Mzc4MjkxMzIsImV4cCI6MTYzNzkxNTUzMn0.oyfXKs857Ywv7Btysf3TzQVbURCvLcQdt6pgL2u19B0",
      "Content-Type": "multipart/form-data",
      "x-auth-project": "choso",
    },
    method: "POST",
  },
  configUrl: "https://imgchoso.vgasoft.vn/files/uploadHandler",
  maxLength: 3,
  mediaType: "image",
  isCheckSelected: false,
  sizeImage: 120,
};

SingeUpload.propTypes = {
  configOption: PropTypes.object,
  configUrl: PropTypes.string,
  onChange: PropTypes.func,
  maxLength: PropTypes.number,
  mediaType: PropTypes.oneOf(["all", "image", "video"]),
  isCheckSelected: PropTypes.bool,
  sizeImage: PropTypes.number,
  convertLinkImg: PropTypes.func,
};

const RootElement = (props, ref) => {
  return <SingeUpload {...props} innerRef={ref} />;
};
export default forwardRef(RootElement);
