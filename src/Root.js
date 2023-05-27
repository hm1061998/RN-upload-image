import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import UploadImageItem from "./UploadImageItem";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Text,
} from "react-native";
import PropTypes from "prop-types";
import Icon from "./components/Icon";
// import * as ImageManipulator from 'expo-image-manipulator';
import MultipleImagePicker from "@baronha/react-native-multiple-image-picker";
import _ from "lodash";

// const MAX_RESIZE_IMAGES = 640;
const UploadImage = forwardRef(
  (
    {
      configOption,
      configUrl,
      values,
      onChange,
      maxLength,
      mediaType,
      onStartUpload,
      onEndUpload,
      isCheckSelected,
      autoUpload,
      disabled,
      convertLinkImg,
    },
    ref
  ) => {
    const [dataListImage, setDataListImage] = useState(values);
    const [localFiles, setLocalFiles] = useState([]);
    // const [error, setError] = useState([]);

    useImperativeHandle(ref, () => ({
      handleUpload: async () => {
        const getArrWaiting = dataListImage
          .filter((item) => item.status === "waiting")
          .map((item) => ({ ...item, status: "uploading" }));
        setDataListImage((prev) =>
          prev.map((item) => {
            if (item.status === "waiting") {
              return { ...item, status: "uploading" };
            }
            return item;
          })
        );
        onStartUpload?.();
        await onUpload(getArrWaiting);
      },
    }));

    useEffect(() => {
      setDataListImage(values);
    }, [values]);

    const openPicker = useCallback(async () => {
      try {
        const options = {
          selectedAssets: localFiles,
          usedCameraButton: true,
          singleSelectedMode: false,
          doneTitle: "Xong",
          cancelTitle: "Hủy",
          maximumMessageTitle: "Thông báo",
          tapHereToChange: "Chạm vào đây để thay đổi",
          maximumMessage: "Bạn đã chọn số lượng phương tiện tối đa được phép",
          isPreview: false,
          maxSelectedAssets: isCheckSelected
            ? maxLength
            : maxLength - dataListImage.length,
          mediaType,
        };
        if (!isCheckSelected) {
          delete options.selectedAssets;
        }
        const response = await MultipleImagePicker.openPicker(options);
        // setError([]);
        const newList = _.uniqBy(
          [...localFiles, ...response],
          "localIdentifier"
        );
        saveListImage(newList);
        if (isCheckSelected) {
          setLocalFiles(newList);
        }
      } catch (e) {
        // console.log(e.code, e.message);
      }
    }, [
      localFiles,
      dataListImage,
      saveListImage,
      maxLength,
      mediaType,
      isCheckSelected,
    ]);

    const saveListImage = useCallback(
      async (rec) => {
        if (rec?.length > 0) {
          if (onStartUpload && autoUpload) {
            onStartUpload();
          }

          let listImg = await Promise.all(
            rec.map(async (item, _index) => {
              // let uriImage = await new Promise(resolve => {
              //   const check = item.path?.match(/:/);
              //   let uri = item.path;
              //   if (!check) {
              //     uri = `file://${uri}`;
              //   }
              //   if (item.width > MAX_RESIZE_IMAGES) {
              //     ImageManipulator.manipulateAsync(
              //       uri,
              //       [{ resize: { width: MAX_RESIZE_IMAGES } }],
              //       {
              //         compress: 0.5,
              //         format: ImageManipulator.SaveFormat.JPEG,
              //       },
              //     ).then(res => resolve(res.uri));
              //   } else {
              //     resolve(uri);
              //   }
              // });

              const check = item.path?.match(/:/);
              let uriImage = item.path;
              if (!check) {
                uriImage = `file://${uriImage}`;
              }

              const newItem = {
                id: `${new Date().getTime() + _index}`,
                localIdentifier: item.localIdentifier,
                status: autoUpload ? "uploading" : "waiting",
                path: uriImage,
                name: item.fileName,
                type: item.mime,
              };

              return newItem;
            })
          );

          const newList = [...dataListImage];
          const arrId = newList.map((item) => item.localIdentifier);
          listImg = listImg.filter(
            (item) => !arrId.includes(item.localIdentifier)
          );
          newList.push(...listImg);
          setDataListImage(newList);

          if (autoUpload) {
            onUpload(listImg);
          }
        }
      },

      [autoUpload, dataListImage, onStartUpload, onUpload]
    );

    const onUpload = useCallback(
      async (arr) => {
        // console.log('run');
        const response = await new Promise.all(arr.map((e) => uploadImage(e)));
        // const filterArr = response.filter(item => item.status === 'done');
        if (onChange) {
          const newData = autoUpload
            ? [...dataListImage, ...response]
            : response;
          onChange(newData);
        }
        if (onEndUpload) {
          onEndUpload(response);
        }
      },
      [onEndUpload, uploadImage, onChange, dataListImage, autoUpload]
    );

    const createFormData = (photo, body = {}) => {
      const data = new FormData();
      data.append("file", {
        name: photo.name,
        type: photo.type,
        uri:
          Platform.OS === "ios"
            ? photo.path.replace("file://", "")
            : photo.path,
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
        }
        setDataListImage((prev) => {
          return prev.map((e) => {
            if (e.id === file.id) {
              return newData;
            }
            return e;
          });
        });

        return newData;
      },
      [configOption, configUrl]
    );

    const renderData = useMemo(
      () => (
        <>
          {dataListImage?.length > 0 &&
            dataListImage.map((item) => (
              <UploadImageItem
                key={`key-image-${item.id}`}
                data={item}
                onDelete={(rec) => {
                  const newData = dataListImage.filter((e) => e.id !== rec.id);
                  setDataListImage(newData);
                  if (isCheckSelected) {
                    setLocalFiles((prev) =>
                      prev.filter(
                        (e) => e.localIdentifier !== rec.localIdentifier
                      )
                    );
                  }

                  if (onChange) {
                    onChange(newData);
                  }
                }}
                disabled={disabled}
                convertLinkImg={convertLinkImg}
              />
            ))}

          {dataListImage?.length < maxLength && !disabled && (
            <TouchableOpacity
              style={[styles.formBoxImage, styles.boxDashed]}
              activeOpacity={0.5}
              onPress={() => openPicker()}
            >
              <Icon type="AntDesign" name="camerao" size={24} color="black" />
            </TouchableOpacity>
          )}
        </>
      ),

      [
        dataListImage,
        onChange,
        maxLength,
        openPicker,
        isCheckSelected,
        disabled,
        convertLinkImg,
      ]
    );

    return <View style={[styles.row, styles.formList]}>{renderData}</View>;
  }
);

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  formList: {
    alignItems: "center",
    flexWrap: "wrap",
  },
  formBoxImage: {
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    marginRight: 8,
    backgroundColor: "#F9F9F9",
    overflow: "hidden",
  },
  formImg: {
    width: 60,
    height: 60,
  },
  boxDashed: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CACACA",
    borderStyle: "dashed",
  },
});

UploadImage.defaultProps = {
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
  values: [],
  maxLength: 3,
  mediaType: "all",
  isCheckSelected: false,
  autoUpload: true,
  disabled: false,
  convertLinkImg: (link) => link,
};

UploadImage.propTypes = {
  configOption: PropTypes.object,
  configUrl: PropTypes.string,
  values: PropTypes.array,
  onChange: PropTypes.func,
  convertLinkImg: PropTypes.func,
  maxLength: PropTypes.number,
  mediaType: PropTypes.oneOf(["all", "image", "video"]),
  isCheckSelected: PropTypes.bool,
  autoUpload: PropTypes.bool,
  disabled: PropTypes.bool,
};
export default React.memo(UploadImage);
