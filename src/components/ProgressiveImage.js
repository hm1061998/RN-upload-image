import React, { useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Image,
} from 'react-native';
import FastImage from 'react-native-fast-image';

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);
const AnimatedImage = Animated.createAnimatedComponent(Image);

const ProgressiveImage = ({
  source,
  style,
  thumbnailSource,
  loading,
  useRNImage,
  ...imageProps
}) => {
  const thumbnailAnimated = useRef(new Animated.Value(1));
  const imageAnimated = useRef(new Animated.Value(0));

  const ImageComponent = useMemo(
    () => (useRNImage ? AnimatedImage : AnimatedFastImage),
    [useRNImage],
  );

  // console.log('source', source);
  const handleThumbnailLoad = () => {
    Animated.timing(thumbnailAnimated.current, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };
  const onImageLoad = () => {
    Animated.timing(imageAnimated.current, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => {
      handleThumbnailLoad();
    });
  };

  const getStyleImage = type => {
    let _style = [styles.imageOverlay];

    if (type === 'thumbnails') {
      _style.shift();
      _style.push({ opacity: thumbnailAnimated.current });
    } else {
      _style.push({ opacity: imageAnimated.current });
    }
    if (style && Array.isArray(style)) {
      _style = [...style, ..._style];
    } else if (style && typeof style === 'object') {
      _style = [style, ..._style];
    }

    // console.log('style', _style);
    return _style;
  };

  return (
    <View>
      <Animated.Image
        source={thumbnailSource}
        style={getStyleImage('thumbnails')}
        // onLoad={handleThumbnailLoad}
      />
      {!!source && (
        <ImageComponent
          source={source}
          style={getStyleImage('image')}
          onLoad={onImageLoad}
          {...imageProps}
        />
      )}
      <View style={styles.loader}>
        <ActivityIndicator animating={loading} color={'blue'} size="small" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});

ProgressiveImage.defaultProps = {
  loading: false,
  thumbnailSource: require('../assets/9.jpg'),
};
export default React.memo(ProgressiveImage);
